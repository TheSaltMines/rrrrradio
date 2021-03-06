var cb = {};
var _QUEUE = new musicQueue();
var skip;
var playerstate = 2;
var muting = 0;
var  autoplay = false;
var queueCurrent = 0;

$.jQTouch({
    icon: 'css/jqtouch.themes/jqt/img/jqtouch.png',
    statusBar: 'black-translucent',
    preloadImages: [
        'css/jqtouch.themes/jqt/img/chevron_white.png',
        'css/jqtouch.themes/jqt/img/bg_row_select.gif',
        'css/jqtouch.themes/jqt/img/back_button_clicked.png',
        'css/jqtouch.themes/jqt/img/button_clicked.png'
        ]
});

$(document).ready(function() {
    function bind() {
      $('#home .addtrack').unbind().click(function() {
        $('#collection li a.active').removeClass('active');
        jQT.goTo('#collection', 'flip');
      });
    
      $('#collection ul li').unbind().click(function() {
        key = $(this).attr('id');
        $.ajax({
          url: '/data.php',
          dataType: 'json',
          data: 'r='+key,
          async: false,
          success: function(d) {
            $('#albums ul').empty();
            $('#albums h1').html(d[0].artist);            
            $.each(d, function(i, val) {
              $('#albums ul').append($('<li></li>').addClass('arrow album').attr('id', val.key).append($('<a></a>').attr('href', '#').html(val.name)));
            });
            
            bind();
            $('#albums li a.active').removeClass('active');
            jQT.goTo('#albums', 'slide');
      
          }
        });
      });
  
      $('#albums ul li').unbind().click(function() {
        key = $(this).attr('id');
        $.ajax({
          url: '/data.php',
          dataType: 'json',
          data: 'a='+key,
          async: false,
          success: function(d) {
            $('#tracks ul').empty();
            $('#tracks h1').html(d[0].album);
            $.each(d, function(i, val) {
              $('#tracks ul').append($('<li></li>').addClass('arrow track').attr('id', val.key).append($('<a></a>').attr('href', '#').html(val.name)));
            });
            
            bind();
            $('#tracks li a.active').removeClass('active');
            jQT.goTo('#tracks', 'slide');
      
          }
        });
      });      
      
      $('#tracks ul li').unbind().click(function() {
        key = $(this).attr('id');
        $.ajax({
          url: '/data.php',
          dataType: 'json',
          data: 't='+key,
          async: false,
          success: function(d) {
           
            $('#trackdetail .request').attr('id', key).removeClass('active');
            $('#trackdetail h2').html(d.name);
            
            bind();
            jQT.goTo('#trackdetail', 'slide');
      
          }
        });
      });      
      
      
      $('.request').unbind().click(function() {
        queueTrack($(this).attr('id'));
        bind();
        jQT.goTo('#home', 'flip');
      });
    }

    $('.refresh').click(function() {
      getQueue();
    });
    
  
    getQueue();
    bind();
})



function refreshQueueDisplay() {
  $('#home ul').empty();
  $.each(_QUEUE.q, function(i, track) {
    if (i==0) {
      $('#nowplaying').append($('<li></li>').html(track.name+' : '+track.artist));
    } else {
      $('#queue').append($('<li></li>').html(track.name+' : '+track.artist));
    }
  })
}

function refreshListeners(listeners) {
  $('#listeners').empty();
  $.each(listeners, function(i, listener) {
    $('#listeners').append($('<li></li>').html(listener.firstName+' '+listener.lastName));
  });
}

function display(msg) {
  alert(msg);
}
