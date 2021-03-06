<?php 
  include("include/header.php");
?>
<h1>Frequently Asked Questions</h1>
<dt>Why do I need an Rdio account to use this site?</dt>
<dd>Rdio takes all the complicated, non-technical issues out of running a site like this. By leveraging Rdio's music base, we can forget about all the legal issues surrounding streaming audio &mdash; not to mention the high bandwidth and storage costs &mdash; and focus on coding the best social experience with the features you want. If you aren't sure that the $4.99/month cost is justified, try out their <a href="<?php print $c->affiliate_link_subscribe; ?>" target="_blank">free 7-day trial</a> and see for yourself.</dd>
<dt>Why aren't all the artists on Rdio available to request here?</dt>
<dd>Rdio does have a <b>ton</b> of music. And while that's a great thing when you're listening to music alone, it can be a great detriment when a lot of people with different tastes are trying to listen. At the moment, the music available for request here is a subset in the indie rock / alternative genre. In the future, we may expand and create several new stations with different genres.</dd>
<dt>Why am I only hearing 30 second samples of each song?</dt>
<dd>You must have an expired trial Rdio account. In order to listen to the full songs, you need at least a web subscription. <a href="<?php print $c->affiliate_link_subscribe; ?>" target="_blank">Upgrade your account</a> and you should be fine.</dd>
<dt>Sometimes a song will skip or repeat. What's that about?</dt>
<dd>Our streaming algorithm isn't quite perfect at this point, and sometimes one user's player will get out of sync with everyone elses. Occasionally the system will "course correct" to get everyone back at approximately the same place. This can present itself in the form of either skipped or repeated tracks.</dd>
<dt>OK, but sometimes when I first log in I hear a bunch of noise / static instead of what should be playing. What's <i>that</i> about.</dt>
<dd>We're aware of that issue and are looking into it. All we can suggest right now is that you reload the browser and it should fix itself.</dd>
<dt>Is this site affiliated with Rdio?</dt>
<dd>This product uses the Rdio API but is not endorsed, certified or otherwise approved in any way by Rdio.</dd>
<?php
  include("include/footer.php");
?>