
  function playerMute() {
    player().rdio_setMute(1);
    window.fluid.removeDockMenuItem('Mute');
    window.fluid.addDockMenuItem('Unmute', function() { playerUnmute() });
  }
  
  function playerUnmute() {
    player().rdio_setMute(0);
    window.fluid.removeDockMenuItem('Unmute');
    window.fluid.addDockMenuItem('Mute', function() { playerMute() });
  }
  
  function radioplay() {
    $('#queue').addClass('playing');
    getQueue(true);
  }
   
  ///////////////////////////////////////////
  // Rdio SWF callback function assignments
  ///////////////////////////////////////////
  cb.ready = function() {
    var pb = document.getElementById('playbutton');
    pb.className = "ready";
  }
  
  cb.playingTrackChanged = function(newTrack) {
    $('.song_title').html(newTrack.name);
    $('.song_artist').html(newTrack.artist);
    $('.song_album').html(newTrack.album);
  }
  
  
  cb.playStateChanged = function(state) {
    if (state==1) { // PLAY
      if (playerstate!=1) {
        if ((skip>0) && autoplay) {
          // delay necessary to avoid Rdio track skipping bug
          setTimeout("player().rdio_seek("+skip+")", 1000);
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
    } else 
    if (state==4) { // PAUSED -- USUALLY ONLY HAPPENS WHEN RDIO IS DOWN
      if (playerstate!=4) {
        display("Rdio appears to be down. Please check back soon!");
        playerstate = 4;
      }
    }
  }
  
  cb.playingSomewhereElse = function() {
    display("Sorry, you're streaming Rdio somewhere else");
  }
  
  cb.positionChanged = function(pos) {
    $('.progress').each(function() {
      progress = $(this);
      slider = progress.children('.slider');
      slider.css('width', parseInt(progress.width()*(pos/_QUEUE.currentTrack().duration))+'px');
      progress.find('.time_current').html(parseInt(pos/60)+':'+('0'+parseInt(pos%60)).substr(-2,2));
      progress.find('.time_total').html(parseInt(_QUEUE.currentTrack().duration/60)+':'+('0'+parseInt(_QUEUE.currentTrack().duration%60)).substr(-2,2))
    });
  }
  
  cb.volumeChanged = function(level) {
    if (muting!=1) {
      setVolumeIndicator(level);
    } else {
      muting = 0;
    }
  }
  
  function setVolumeIndicator(level) {
    $('#volume').children().each(function(i, e) {
      if (i<level) {
        $(e).attr('src','/theme/cramppbo/images/volnotch.gif');
      } else {
        $(e).attr('src','/theme/cramppbo/images/volnotchoff.gif');
      }
    });
  }
  
  function player() {
    return $('#api_swf').get(0);
  }
  
  function display(msg, buttons) {
    if ((arguments.length==1) && window.fluid) {
      window.fluid.showGrowlNotification({
          title: 'rrrrradio', 
          description: msg
      });
    } else {
      $('#error #message').html(msg);    
      if (arguments.length>1) {
        for (var key in buttons) {
          $button = $('<a href="javascript:;"></a>').addClass('button').html(key).bind('click', buttons[key]);
          $('#error #message').append($button);
        }

      } else {
        $close = $('<br /><br /><a href="javascript:;" onClick="$.fancybox.close();">ok</a>');      
        $('#error #message').append($close);  
      }

      $('#errorlink').trigger('click')
    }
  }


  function getMarkButtons(key) {
    $d = $('<div></div>');
    $d.append(
      $('<div></div>').attr('rel', key).addClass('like').html('Love it!').prepend($('<img>').attr('src','/theme/cramppbo/images/heart.png')).qtip({
        content: {
          text: "Mark this song as a favorite. In the future, you will be able to reference your favorite tracks for easy queueing."
        },
        position: {
          target: 'mouse',
          my: 'bottom center',
          adjust: {
            y: -15
          }          
        },
        show: {
          delay: 1000
        },
        style: {
          classes: 'ui-tooltip-light ui-tooltip-shadow ui-tooltip-rounded'
        }
        
      }).click(function() { 
        $('.qtip').qtip('hide');
        setmark($(this).attr('rel'), 1); 
      })
    ).append(
      $('<div></div>').attr('rel', key).addClass('dislike').html('Hate it!').prepend($('<img>').attr('src','/theme/cramppbo/images/cancel.png')).qtip({
        content: {
          text: "Mark this song as 'disliked.' In the future, this song will play less often when you're listening."
        },
        position: {
          target: 'mouse',
          my: 'bottom center',
          adjust: {
            y: -15
          }          
        },
        show: {
          delay: 1000
        },        
        style: {
          classes: 'ui-tooltip-light ui-tooltip-shadow ui-tooltip-rounded'
        }
        
      }).click(function() { 
        $('.qtip').qtip('hide');
        setmark($(this).attr('rel'), -1); 
      })
    ).click(function() { setmark($(this).attr('rel'), -1); });
    
    return $d;
  }
  
  function getMarkStatus(key, mark) {
    $d = $('<div></div>');  

    switch (parseInt(mark)) {
      case 1:
        $d.append(
          $('<div></div>').addClass('markstatus').html('You love it!').prepend($('<img>').attr('src','/theme/cramppbo/images/heart.png'))
        );
        break;
      case -1:
        $d.append(
          $('<div></div>').addClass('markstatus').html('You hate it!').prepend($('<img>').attr('src','/theme/cramppbo/images/cancel.png'))
        );
        break;
    }
    
    $d.append(
      $('<div></div>').attr('rel', key).addClass('unmark').html('(unmark)').click(function() { setmark($(this).attr('rel'), 0); })        
    );
    
    return $d;
  
  }

  // UI Function: Loads up the contents of the JS:Queue object into the user interface
  function refreshQueueDisplay() {
    $('#queue .track').remove();
    $.each(_QUEUE.q.slice(_QUEUE.ptr), function(i, track) {
      if (i==_QUEUE.ptr) {
        $('.song_title').html(track.name);
        $('.song_artist').html(track.artist);
        $('.song_album').html(track.album);
      }    
    
      $t = $('<div></div>').attr('id', track.key).addClass('track').css('background-image', 'url('+track.icon+')');
      $title = $('<div></div>').addClass('title');
      $track = $('<div></div>').addClass('trackname').append($('<a></a>').attr('href', '#!/'+track.artistKey+"/"+track.albumKey+"/"+track.key).html(track.name));
      $artist = $('<div></div>').addClass('artist').append($('<a></a>').attr('href', '#!/'+track.artistKey).html(track.artist));
      $title.append($track).append($artist);
      
      if (track.user != null) {
        $userpic = $('<img>').addClass('userpic').attr('src', track.user.icon).attr('width', '14').attr('height', '14');
        $username = $('<div></div>').addClass('username').html('Requested by '+track.user.username);
        $user = $('<div></div>').addClass('user').append($userpic).append($username);

        $t.addClass('request').attr('rel',track.user.username).append($('<div></div>').addClass('indicator')).append($user);
      }
      
      $details = $('<div></div>').addClass('detail');
      if (playerstate==1) {
        if (track.mark==null) {
          $details.append(getMarkButtons(track.key));
        } else {
          $details.append(getMarkStatus(track.key, track.mark));
        }
      } else if (i==0) {
        $details.append($('<img>').attr('src', '/theme/cramppbo/images/play_button_overlay.png').attr('id', 'playbutton').click(function() {
          $(this).attr('src', '/theme/cramppbo/images/ajax-loader-large-dark.gif').delay(2000).fadeOut(500, function() {
            radioplay()
          });
        }));
      }
      
      $t.append($details).append($title);
      if (playerstate==1) {
        $t.hover(function() {
          $('.request[rel='+$(this).attr('rel')+']').find('.user').fadeIn();
          $(this).children('.detail').fadeIn();        
        }, function() {
          $(this).children('.detail').fadeOut();      
          $('.request[rel='+$(this).attr('rel')+']').find('.user').fadeOut();
        });
      }
  
      if (i==0) {
        $('#queue').prepend($t);
      } else {
        $('#queue').append($t);
      }
    });
  }
    
  function refreshListeners(listeners) {
    $('#toolbar .listeners').empty();
    $.each(listeners, function(i, listener) {
      $l = $('<img>').attr('src', listener.icon).attr('alt', listener.username).attr('title', listener.username).qtip({
        content: {
          text: 'Loading...',
          ajax: {
            url: 'profile.php',
            type: 'GET',
            data: { key: listener.key },
            once: false
          }
        },
        position: {
          my: 'top right',
          adjust: {
            x: -16,
            y: 5
          }          
        },
        style: {
          classes: 'ui-tooltip-dark ui-tooltip-shadow ui-tooltip-rounded'
        }
      });
      $('#toolbar .listeners').append($l);
    })
  }

  $(document).ready(function() {
    $('a[href^="#!/"]').live('click', function() {
      scrollTo($(this).attr('href').substr(3));
      return false;
    });
    
    $('a[href^="#_"]').live('click', function() {
      linkInfo = $(this).attr('href').substr(3).split('/');

      switch (linkInfo.length) {
        case 2: // album
          $.ajax({
            url: '/data.php',
            dataType: 'json',
            data: 'a='+linkInfo[1]+'&all=true',
            async: false,
            success: function(d) {
              $content = $('<div></div>').addClass('album').attr('id', d[linkInfo[1]].key)
                          .append($('<img>').attr('src', d[linkInfo[1]].icon).attr('width',125).attr('height',125))
                          .append($('<div></div>').addClass('detail')
                            .append($('<h1></h1>').html(d[linkInfo[1]].artist + ": " + d[linkInfo[1]].name)));
            }
          });
          break;
        case 1: // artist
          $.ajax({
            url: '/data.php',
            dataType: 'json',
            data: 'r='+linkInfo[1]+'&all=true',
            async: false,
            success: function(d) {
              $content = $('<div></div>').addClass('album').attr('id', d[linkInfo[1]].key)
                          .append($('<img>').attr('src', d[linkInfo[1]].icon).attr('width',125).attr('height',125))
                          .append($('<div></div>').addClass('detail')
                            .append($('<h1></h1>').html(d[linkInfo[1]].artist + ": " + d[linkInfo[1]].name)));
            }
          });
          break;
      }
      display("The selected item is not in the rrrrradio collection.<br />Would you like to request that it be added?<br /><br />"+$('<div>').append($content.clone()).remove().html(), {
        yes: function() {
          $.ajax({
            url: '/controller.php',
            dataType: 'json',
            data: 'r=request&item='+$(this).siblings('.album').attr('id'),
            async: false,
            success: function(d) {
              display("The selected item has been submitted for consideration", {
                ok: function() {
                  $.fancybox.close();
                }
              });            
            }
          });
        },
        no: function() {
          $.fancybox.close();
        }
      });
      
      return false;
    });
    
    $('input[title!=""]').live({
      blur: function() {
        if ($(this).val()=='') $(this).val($(this).attr('title')).addClass('empty');
      },
      focus: function() {
        if ($(this).val()==$(this).attr('title')) $(this).val('').removeClass('empty');
      }
    });  
  
    $('#toolbar').live({
      mouseenter: function() {
        $(this).find('#tools #nowplaying').animate({ top: '-30px' }, 150)
        $(this).find('#tools #ops').animate({ top: 0 }, 150)      
      }
    }).live('mouseleave blur focusout', function () {
      $(this).find('#tools #nowplaying').animate({ top: 0 }, 150)    
      $(this).find('#tools #ops').animate({ top: '30' }, 150)          
    });
    
    $(window).bind('blur', function() {
      $('#tools #nowplaying').animate({ top: 0 }, 150)    
      $('#tools #ops').animate({ top: '30' }, 150)          
      $('div.qtip:visible').qtip('hide');  
      $('.track .user:visible').fadeOut();    
    });
  
    $('li.artist').live({
      click: function(event, targetInfo) {
        node = $(this);
    
        $.ajax({
          url: '/data.php',
          dataType: 'json',
          data: 'r='+$(this).attr('id'),
          async: true,
          beforeSend: function() {
            $('#collection #browser .artist.highlight').removeClass('highlight');
            node.addClass('highlight');          
            $('#collection #browser #album').empty().append($('<img>').addClass('loading').attr('src', '/theme/cramppbo/images/ajax-loader-bar.gif'));       
          },
          success: function(d) {
            $('#collection #browser #album').empty();
            for (i=0; i<d.length; i++) {
              if ((d[i]!=undefined) && (d[i].canStream)) {
                $a = $('<div></div>').addClass('album').attr('id', d[i].key);
                $a.append($('<img>').attr('src',d[i].icon).attr('width','125').attr('height','125'));
                
                $d = $('<div></div>').addClass('detail');
                $d.append($('<h1></h1>').html(d[i].name));
                
                $tracks = $('<ol></ol>');
                $prevtrack = 0;
                for (j=0; j<d[i].tracks.length; j++) {
                  if (d[i].tracks[i].canStream && (d[i].tracks[j].trackNum!=$prevtrack)) {
                    $t = $('<li></li>').addClass('track').attr('id', d[i].tracks[j].key).attr('value', d[i].tracks[j].trackNum).html(d[i].tracks[j].name);
                    if (d[i].tracks[j].randomable==1) $t.addClass('randomable');
                    $tracks.append($t);
                  }
                  $prevtrack = d[i].tracks[j].trackNum;
                }
                $d.append($tracks);
                
                $('#collection #browser #album').append($a.append($d));
              }
            }
            
            $('.ajax-loader').remove();
          },
          complete: function() {
            if ((targetInfo!=undefined) && (targetInfo.length>0)) {
              albumKey = targetInfo[0];
              tinfo = targetInfo.slice(1);
              
              $('#collection #browser #album').scrollTo('#'+albumKey+' .detail', 400);
              if (tinfo.length>0) {
                $('#collection #album .track.highlight').removeClass('highlight');
                $('#'+albumKey+' #'+tinfo[0]).addClass('highlight');
              }
            }
          }      
        })
      },
      dblclick: function() {
        node = $(this);
    
        $.ajax({
          url: '/data.php',
          dataType: 'json',
          data: 'r='+$(this).attr('id')+'&force=1',
  
          beforeSend: function() {
            node.append($('<div class="ajax-loader"></div>'));        
          },
          success: function(d) {
            $('#collection #browser #album').empty();
            for (i=0; i<d.length; i++) {
              $a = $('<div></div>').addClass('album closed').attr('id', d[i].key);
              $a.append($('<img>').attr('src',d[i].icon).attr('width','125').attr('height','125'));
              $a.append($('<p></p>').html(d[i].name));
              $('#collection #browser #album').append($a);
            }
            $('.ajax-loader').remove();
          }      
        });
      }
    });
    
    $('li.track').live('click', function() {
      node = $(this);
      queueTrack($(this).attr('id'));
    });
      
    $.widget( "custom.catcomplete", $.ui.autocomplete, {
  		_renderMenu: function( ul, items ) {
  			var self = this,
  				currentCategory = "";
  			$.each( items, function( index, item ) {
  				if ( item.type != currentCategory ) {
  				  switch (item.type) {
  				    case 'r':
  				      type = 'Artists';
  				      break;
  				    case 'a':
  				      type = 'Albums';
  				      break;
  				    case 't':
  				      type = 'Songs';
  				      break;
  				    case '_r':
  				      type = 'More Artists...';
  				      break;
  				    case '_a':
  				      type = 'More Albums...';
  				      break;
  				  }
  					ul.append( "<li class='ui-autocomplete-category'>" + type + "</li>" );
  					currentCategory = item.type;
  				}
  				self._renderItem( ul, item );
  			});
  		},
      _renderItem: function( ul, item ) {
        $result = $( "<li></li>" ).addClass(item.type).data( "item.autocomplete", item )
    		  .append($("<a></a>").addClass('name').attr('href',(item.type.substring(0,1)=='_'?'#_/':'#!/')+item.key)
    		    .append((item.type!='_r') ? $('<img>').attr('src',item.icon).attr('width',64).attr('height',64) : null)
    		    .append( $("<span></span>").addClass('track main').html(item.name))		    
    		    .append( $("<span></span>").addClass('artist').html(item.artist))
    		    .append( $("<span></span>").addClass('album').html(item.album)))		    
    		  .appendTo( ul );
    		return $result;
      }		
  	});
	    
    $('#search').catcomplete({
      source: "/data.php", 
      minLength: 2,
      position: {
        my: "right top",
        at: "right bottom",
        collision: "none"
      }
    }).parent().bind('submit', function () {
      return false;
    });
  
    $('.player_mute').live('click', function() {
      player().rdio_setMute(1);
      $(this).attr('src','/theme/cramppbo/images/tools/sound_mute.png').addClass('player_unmute').removeClass('player_mute');
    });
    
    $('.player_unmute').live('click', function() {
      muting = 1;
      player().rdio_setMute(0);
      $(this).attr('src','/theme/cramppbo/images/tools/sound_high.png').addClass('player_mute').removeClass('player_unmute');    
    });
  
    
    $('#volume img').click(function() {
      level = $(this).attr('rel');
      volume = $(this).parent();
      player().rdio_setVolume($(this).attr('rel')/10);
      setVolumeIndicator(level);
    })
  
    $('#collection .header').click(function(event) {
      if ($(event.target).attr('id')!='search') {
        $('#collection #browser').slideToggle(400, function() {
          if ($(this).is(':visible')) {
            $('#collection #search').attr('value','').fadeIn();
          } else {
            $('#collection #search').attr('value','').fadeOut();
          }
        });
      }
    });
    
    $('#welcomelink').fancybox({
      'width': 700,  
      'padding': 0
    });
    
    $('#errorlink').fancybox({
      'width': 300,
      'showCloseButton': false
    })
  
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
  
    getQueue();
    
  });
  
  function scrollTo(linkInfo) {
    linkInfo = linkInfo.split('/');
    link = linkInfo[0];
    if (linkInfo.length>1) {
      linfo = linkInfo.slice(1);
    } else {
      linfo = array();
    }
    
    $('#collection #album').empty();
    $('#collection #browser').slideDown(400, function() {
      $(this).children('#music').scrollTo('#'+link, 800, {
        onAfter: function() { 
          $('#'+link).trigger('click', [linfo]);
        }
      });
    });    
  }
  
  
  if (window.fluid) {
    window.resizeTo(660, 770);
  }