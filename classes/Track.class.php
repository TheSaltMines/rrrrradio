<?php
  class Track {
    public $key;
    public $name;
    public $album;    
    public $duration;
    
    function __construct($key) {
      return $this->load($key);
    }
    
    function load($key) {
      $db = new Db();
      
      $rs = $db->query("SELECT `name`, albumKey, duration FROM track WHERE `key`='$key'");  
      if ($rec = mysql_fetch_array($rs)) {
        $this->key = $key;
        $this->name = $rec['name'];
        $this->duration = $rec['duration'];
        $this->album = new Album($rec['albumKey']);

        return true;
      } else {
        return false;
      }
    }
  }
  
  class QueueTrack extends Track {
    public $startplay;
    public $endplay;
  }
?>