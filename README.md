# Tesseract 
## The metadata of the Shoutcast Steaming Service
Uses the Discogs API to populate the content during the current song played.
[Hawkwynd Radio Demo](http://stream.hawkwynd.com)

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

 Make your configuration changes here. 

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

