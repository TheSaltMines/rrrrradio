var cb = {};
var _QUEUE = new musicQueue();
var skip;

cb.ready = function() {
  player().rdio_clearQueue();

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

cb.playingTrackChanged = function(newTrack) {
  // only call this on track changes after initial page load
  if (skip<0) {
    alert('playing track changed');
    updateQueue();
  }
}

function loadQueue() {
  if (!_QUEUE.EOF()) {
    // queueing up a track
    player().rdio_queue(_QUEUE.getNext().key);
  } else {
    player().rdio_play();
  }
}

function updateQueue() {
  $.ajax({
    url: '/controller.php',
    dataType: 'json',
    data: 'r=getQueue',
    async: false,
    success: function(d) {
      _QUEUE.updateQueue(d.queue);
      loadQueue();
    }
  });

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

$(document).ready(function() {
  
  function bind() {
    $('li.artist').unbind();
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
    
    $('li.album').unbind();
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
            trackNode.append($('<li class="track" id="'+d[i].key+'">'+d[i].name+'</li>'));
          }
          node.append(trackNode).removeClass('closed');
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
