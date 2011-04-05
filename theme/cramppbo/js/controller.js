  // UI Function: Loads up the contents of the JS:Queue object into the user interface
  function refreshQueueDisplay() {
    $('#queue .track').remove();
    $.each(_QUEUE.q.slice(_QUEUE.ptr), function(i, track) {
      $t = $('<div></div>').addClass('track').css('background-image', 'url('+track.icon+')');
      $title = $('<div></div>').addClass('title');
      $track = $('<div></div>').addClass('trackname').html(track.name);
      $artist = $('<div></div>').addClass('artist').html(track.artist);
      $title.append($track).append($artist);
      
      if (track.user != null) {
        $userpic = $('<img>').addClass('userpic').attr('src', track.user.icon).attr('width', '14').attr('height', '14');
        $username = $('<div></div>').addClass('username').html('Requested by '+track.user.username);
        $user = $('<div></div>').addClass('user').append($userpic).append($username);
        $t.addClass('request').attr('rel',track.user.username).append($('<div></div>').addClass('indicator')).append($user);
      }
      $t.append($title).hover(function() {
        $('.request[rel='+$(this).attr('rel')+']').find('.user').fadeIn();
      }, function() {
        $('.request[rel='+$(this).attr('rel')+']').find('.user').fadeOut();
      });
  
      if (i==0) {
        $('#queue').prepend($t);
      } else {
        $('#queue').append($t);
      }
    });
  }

  function bind() {
    $('div.album').unbind();
    $('div.album.closed').click(function() {
      node = $(this).parent();
      albumTitle = $(this).find('p').html();
      $(this).find('p').html('').addClass('ajax-loader')
      $(this).removeClass('closed');
      $(this).siblings().fadeOut();
        
      $.ajax({
        url: '/data.php',
        dataType: 'json',
        data: 'a='+$(this).attr('id'),
        success: function(d) {
          node.append($('<h1></h1>').html(albumTitle));
          trackNode = $('<ul>');
          for (i=0; i<d.length; i++) {
            track = $('<li class="track" id="'+d[i].key+'" value="'+d[i].trackNum+'">'+d[i].name+'</li>');
            if (!d[i].canStream) track.addClass('unstreamable');
            trackNode.append(track);
          }
          node.append(trackNode).removeClass('closed');
          bind();
          $('.ajax-loader').remove();
        }      
      });
    });
    
    $('#toolbar').bind('mouseenter', function() {
      $(this).find('#tools').animate({
        top: '-30px'
      }, 150)
    }).bind('mouseleave blur focusout', function () {
      $(this).find('#tools').animate({
        top: 0
      }, 150)    
    });
    
    $(window).bind('blur', function() {
      $('#toolbar #tools').animate({
        top: 0
      }, 150);
    });
  
  
    $('li.artist').unbind();
    $('li.artist.closed').unbind().click(function() {
      node = $(this);
  
      $.ajax({
        url: '/data.php',
        dataType: 'json',
        data: 'r='+$(this).attr('id'),

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
          bind();
          $('.ajax-loader').remove();
        }      
      });
    }).dblclick(function() {
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
          bind();
          $('.ajax-loader').remove();
        }      
      });
    });
    
    $('li.track').unbind().click(function() {
      node = $(this);
  
      $.ajax({
        url: '/controller.php',
        dataType: 'json',
        data: 'r=queue&key='+$(this).attr('id'),
        beforeSend: function() {
          $('#queue').append($('<div></div>').addClass('track placeholder'));
        },
        success: function(d) {  
          if ("response" in d) {
            if (window.fluid) {
              fluid.showGrowlNotification({
                title: "Oops...",
                description: d.response
              })
            } else {
              alert(d.response);
            }
          } else {
            if (window.fluid) { fluid.showGrowlNotification({
              title: "Queue successful!",
              description: 'Track successfully added to queue'
            }) };
          }
          updateQueue();
        }      
      });
    })   
  }
  
  
  if (window.fluid) {
    window.resizeTo(660, 755);
  }