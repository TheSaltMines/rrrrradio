#!/usr/bin/php
<?php 
  $dir = __FILE__;
  $dir = substr($dir, 0, strrpos($dir, "/"))."/";

  include("$dir../configuration.php");
  include("$dir../classes/Db.class.php");
  include("$dir../classes/Artist.class.php");
  include("$dir../classes/Album.class.php");
  include("$dir../classes/Track.class.php");
  include("$dir../classes/Queue.class.php");
  include("$dir../classes/Collection.class.php");
  include("$dir../include/functions.php");
  
  $c = new Config();
  $db = new Db();
  $q = new Queue();
  
  $length = $q->length();
  for (;$length<=3;$length++) {
    $q->push(Collection::getRandomTrack(false, true));
  }
?>
