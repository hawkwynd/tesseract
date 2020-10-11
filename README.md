# Tesseract 
## The metadata of the Shoutcast Steaming Service
This is the project of Hawkwynd Radio's web front end, which is a labor of love in the search for a better display of metadata/content while a song is being played on the Shoutcast Server. My love of music, and running my own station started with a idea, and has grown to this point. It is open source, and constantly being improved/updated. Soley for personal use, I make no warranties or provide any assurance this will work on your system. 

### Requirements
- Apache Webserver with Mysql and PHP 
- Shoutcast Server (sc_serv) with admin access
- Love of being a radio station kind of person, who loves music.

#### NOTE: I share this repository to anyone who is looking to have a better, responsive HTML based Shoutcast Radio station front-end.

### How it works
- Tesseract asks Shoutcast Server for current playing Artist/Title `Pink Floyd` - `Money`
- Ajax call to Discogs API with Artist/Title which returns: release, label, image and artist objects.
- PHP will check for a local copy of the cover image based on the release_id, if not found, it downloads it from discogs, and stores in the /img/covers directory. (make /img dir writable for Apache )
- Wikipedia api query to obtain About Artist content, About Release Content (if found)
- Sort Release Discography of Artist
- Prepare all content, and update MYSQL tables with Artists, ExtraArtists, Members, Release, Recording and Wikipedia profile objects.
- Render Page with nice fades, background image changes, and colors. 


[View Hawkwynd Radio](http://stream.hawkwynd.com)

![Optional Text](/docs/img/readme1.png)

## Installation / Configurations
Requires MYSQL database. Set your Shoutcast configuration details and MYSQL credentials.

`mysql/stream_mysql.sql` 
 
 Import the `stream_mysql.sql` file into your database.

Set your Discogs Developer Api Key/Secret

`js/tessa2.js`
```
var auth = { 
    key: 'discogsKey',
    secret: 'mydiscogsecret',
    page: 1,
    per_page: 10,    
};
```

`include/config.inc.php` 

 Make your configuration changes in this file or shit wont do diddly squat.  

```
define('SHOUTCAST_HOST', 'http://myradiowebsite.com:8000'); // url:port to your shoutcast server
define('SHOUTCAST_ADMIN_PASS', 'mypassword'); // admin password for accessing admin.cgi
define('SCROBBLER_API', 'scrobbler_api_key'); // API key from lastfm to query data (no longer used)
define('APPLICATION_NAME', 'My Radio station'); // Name of your website's application
define('NOW_PLAYING_TXT', 'Now Playing'); // Content to display as Now Playing
define('SITE_URL', 'http://mywebsite.com'); // used in FB share link (deprecated)

define('MYSQL_USER', 'myusern'); // your mysql username
define('MYSQL_USER_PASSWORD', 'mysql_password'); // your mysql user password
define('MYSQL_DATABASE', 'mydatabaseName'); // your mysql database
define('MYSQL_HOST', 'localhost'); // your mysql hostname
```

## TODO and future plans
- Teseract to first check for local MYSQL results before making Discogs API calls and use that result instead. 
