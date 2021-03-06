  ///////////////////////////////////////////
  // Rdio SWF callback function assignments
  ///////////////////////////////////////////
  
var RdioStream = {
  ready: function() {
    var pb = document.getElementById('playbutton');
    pb.className = "ready";
    getQueue(true);
  },

  playingTrackChanged: function(newTrack) {
    $('.song_title').html(newTrack.name);
    $('.song_artist').html(newTrack.artist);
    $('.song_album').html(newTrack.album);
  },
  
  playStateChanged: function(state) {
    if (state==1) { // PLAY
      if (playerstate!=1) {
        playerstate=1;
      }
    } else
    if (state==2) { // STOP
      if (playerstate!=2) {
        playerstate=2;
        RdioPlayer().rdio_play(_QUEUE.getNext().key); // play the newly bottom item in the queue
        if (ignoring==1) unignoreCurrent();
      }
    } else 
    if (state==4) { // PAUSED -- USUALLY ONLY HAPPENS WHEN RDIO IS DOWN
      if (playerstate!=4) {
        display("Rdio appears to be down. Please check back soon!");
        playerstate = 4;
      }
    } else {
      debug("buffering:"+(new Date()).toLocaleString());
    }
  },
  
  playingSomewhereElse: function() {
    display("Sorry, you're streaming Rdio somewhere else");
  },
  
  positionChanged: function(pos) {
    currentPosition = pos;

    if (skip==-1) {
      $('.progress').each(function() {
        progress = $(this);
        slider = progress.children('.slider');
        slider.css('width', parseInt(progress.width()*(pos/_QUEUE.currentTrack().duration))+'px');
        progress.find('.time_current').html(parseInt(pos/60)+':'+('0'+parseInt(pos%60)).substr(-2,2));
        progress.find('.time_total').html(parseInt(_QUEUE.currentTrack().duration/60)+':'+('0'+parseInt(_QUEUE.currentTrack().duration%60)).substr(-2,2))
      });
    }
  },
  
  volumeChanged: function(level) {
    if (muting!=1) {
      setVolume(level*10, true);
    } else {
      muting = 0;
    }
  }
}
