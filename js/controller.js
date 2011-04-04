var cb = {};
var _QUEUE = new musicQueue();
var skip;
var playerstate = 2;

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
      _QUEUE.init(d.queue);
      skip = d.timestamp - d.queue[0].startplay;      
      if (loggedIn) {
        player().rdio_play(_QUEUE.getNext().key);
      } else {
        updateQueue();
      }

    }
  });
}

// Get the latest queue from the server and pass it on to the JS:Queue object for processing.
function updateQueue() {
  $.ajax({
    url: '/controller.php',
    dataType: 'json',
    data: 'r=getQueue',
    success: function(d) {
      _QUEUE.updateQueue(d.queue);
      if (window.fluid) { 
        window.fluid.dockBadge = _QUEUE.length();
      }
      refreshQueueDisplay();      
    }
  });
  
  return true;
}


///////////////////////////////////////////
// Rdio SWF callback function assignments
///////////////////////////////////////////
cb.ready = function() {
  player().rdio_clearQueue();
  getQueue();
}

cb.playingTrackChanged = function(newTrack) {
  $('#nowplaying #song #song_title').html(newTrack.name);
  $('#nowplaying #song #song_artist').html(newTrack.artist);
  $('#nowplaying #album #song_album').html(newTrack.album);
  $('#nowplaying').css('background', 'url('+_QUEUE.q[0].artistIcon+') top right no-repeat #dfdfdf');

}


cb.playStateChanged = function(state) {
  if (state==1) { // PLAY
    if (playerstate!=1) {
      if (skip>0) {
        player().rdio_seek(skip);
        skip = -1;
      }  

      updateQueue();
      playerstate=1;
    }
  } else
  if (state==2) { // STOP
    if (playerstate!=2) {
      playerstate=2;
      player().rdio_play(_QUEUE.getNext().key);
    }
  }
}

cb.playingSomewhereElse = function() {
  alert("Sorry, you're streaming Rdio somewhere else");
}

cb.positionChanged = function(pos) {
  $('#progress #slider').css('width', parseInt($('#progress').width()*(pos/_QUEUE.currentTrack().duration))+'px');
  $('#progress #time_current').html(parseInt(pos/60)+':'+('0'+parseInt(pos%60)).substr(-2,2));
  $('#progress #time_total').html(parseInt(_QUEUE.currentTrack().duration/60)+':'+('0'+parseInt(_QUEUE.currentTrack().duration%60)).substr(-2,2))
}

$(document).ready(function() {

  $('#collection .header').click(function() {
    $('#collection #browser').slideToggle();
  });
  

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
