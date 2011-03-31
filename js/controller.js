var cb = {};
var _QUEUE = new musicQueue();
var skip;
var position;

// Gets the latest queue from the server and passes it on to the JS:Queue object
// May be redundant with the existance of the updateQueue function.
// Consider combining in the future.
function getQueue() {
  $.ajax({
    url: '/controller.php',
    dataType: 'json',
    data: 'r=getQueue',
    async: false,
    success: function(d) {
      skip = d.timestamp - d.queue[0].startplay;
      _QUEUE.init(d.queue);
      loadQueue();
    }
  });
}

// Function is called iteratively and loads a track at a time into the Rdio SWF object
function loadQueue() {
  if (!_QUEUE.EOF()) {
    // queueing up a track
    player().rdio_queue(_QUEUE.getNext().key);
  } else {
    if (loggedin) {
      player().rdio_play();
    }
    refreshQueueDisplay();
  }
}

// Get the latest queue from the server and pass it on to the JS:Queue object for processing.
function updateQueue(currentlyPlaying) {
  $.ajax({
    url: '/controller.php',
    dataType: 'json',
    data: 'r=getQueue',
    async: false,
    success: function(d) {
      _QUEUE.updateQueue(d.queue, currentlyPlaying);
      loadQueue();
    }
  });
}

// UI Function: Loads up the contents of the JS:Queue object into the user interface
function refreshQueueDisplay() {
  $('#queue').empty();
  $.each(_QUEUE.q, function(i, track) {
    $t = $('<div></div>').addClass('track').css('background-image', 'url('+track.icon+')');
    $title = $('<div></div>').addClass('title');
    $track = $('<div></div>').addClass('trackname').html(track.name);
    $artist = $('<div></div>').addClass('artist').html(track.artist);
    $title.append($track).append($artist);
    
    if (track.user != null) {
      $userpic = $('<img>').addClass('userpic').attr('src', track.user.icon).attr('width', '14').attr('height', '14');
      $username = $('<div></div>').addClass('username').html('Requested by '+track.user.username);
      $user = $('<div></div>').addClass('user').append($userpic).append($username);
      $t.append($user);
    }
    $t.append($title);

    $('#queue').append($t);
//    $('#queue').append('<div class="track">'+track.name+' - '+track.album.artist.name+'</div>');
  })
}

// Rdio SWF callback function assignments
cb.ready = function() {
  player().rdio_clearQueue();
  getQueue();
}

cb.playingTrackChanged = function(newTrack) {
  $('#nowplaying #song #song_title').html(newTrack.name);
  $('#nowplaying #song #song_artist').html(newTrack.artist);
  $('#nowplaying #album #song_album').html(newTrack.album);
  $('#nowplaying').css('background', 'url('+_QUEUE.q[0].artistIcon+') top right no-repeat #dfdfdf');

  // only call this on track changes after initial page load
  if (skip<0) {
    updateQueue(newTrack);
  }
}


cb.playStateChanged = function(state) {
  if ((state == 1) && (skip>=0)) {
    player().rdio_seek(skip);  
    skip = -1;
  }
}

cb.playingSourceChanged = function(playingSource) {
  loadQueue();  
}

cb.playingSomewhereElse = function() {
  alert("Sorry, you're streaming Rdio somewhere else");
}

cb.queueChanged = function(newQueue) {
  loadQueue();
}

cb.positionChanged = function(pos) {
  $('#progress #slider').css('width', parseInt($('#progress').width()*(pos/_QUEUE.q[0].duration))+'px');
//  $('#time').html(parseInt(pos/60)+':'+('0'+parseInt(pos%60)).substr(-2,2)+' / '+parseInt(_QUEUE.q[0].duration/60)+':'+('0'+parseInt(_QUEUE.q[0].duration%60)).substr(-2,2));
}

$(document).ready(function() {
  
  function bind() {
  
    $('li.album').unbind();
/*
    $('li.album[class!="closed"]').unbind().click(function() {
      $(this).addClass('closed').children('ul').remove();
      bind();
    });
*/
    $('li.album.closed').click(function() {
      node = $(this);
  
      $.ajax({
        url: '/data.php',
        dataType: 'json',
        data: 'a='+$(this).attr('id'),
        async: false,
        success: function(d) {
  
          trackNode = $('<ul>');
          for (i=0; i<d.length; i++) {
            track = $('<li class="track" id="'+d[i].key+'" value="'+d[i].trackNum+'">'+d[i].name+'</li>');
            if (!d[i].canStream) track.addClass('unstreamable');
            trackNode.append(track);
          }
          node.append(trackNode).removeClass('closed');
          bind();
        }      
      });
    });
  
  
    $('li.artist').unbind();
/*
    $('li.artist[class!="closed"]').not('.album').unbind().click(function() {
      $(this).addClass('closed').children('ul').remove();
      bind();
    });
*/
    $('li.artist.closed').unbind().click(function() {
      node = $(this);
  
      $.ajax({
        url: '/data.php',
        dataType: 'json',
        data: 'r='+$(this).attr('id'),
        async: false,
        success: function(d) {
  
          albumNode = $('<ul>');
          for (i=0; i<d.length; i++) {
            albumNode.append($('<li class="album closed" id="'+d[i].key+'">'+d[i].name+'</li>'));
          }
          node.append(albumNode).removeClass('closed');
          bind();
        }      
      });
    });
    
    
    $('li.track').unbind().click(function() {
      node = $(this);
  
      $.ajax({
        url: '/controller.php',
        dataType: 'json',
        data: 'r=queue&key='+$(this).attr('id'),
        async: false,
        success: function(d) {  
          getQueue();
        }      
      });
    });    
  }

  var flashvars = {
    'playbackToken': playbackToken,
    'domain': domain,
    'listener': 'cb'
    };
  var params = {
    'allowScriptAccess': 'always'
  };
  var attributes = {};
  swfobject.embedSWF(api_swf, 'api_swf', 1, 1, '9.0.0', 'expressInstall.swf', flashvars, params, attributes);
  bind();
})

function player() {
  return $('#api_swf').get(0);
}
