# The Tesseract - v2 of the streaming audio player 

## Install/configurations

`include/config.inc.php`  - edit this file to meet your needs and set the varables. 

```
define('SHOUTCAST_HOST', 'http://myradiowebsite.com:8000');          // url:port to your shoutcast server
define('SHOUTCAST_ADMIN_PASS', 'mypassword');                      	// admin password for accessing admin.cgi
define('SCROBBLER_API', 'scrobbler_api_key');    					// API key from lastfm to query data (no longer used)
define('APPLICATION_NAME', 'My Radio station');                   	// Name of your website's application
define('NOW_PLAYING_TXT', 'Now Playing');                       	// Content to display as Now Playing
define('SITE_URL', 'http://mywebsite.com');               			// used in FB share link
define('MB_URL', '');                                           	// not sure what this is for.

define('MYSQL_USER', 'myusern');                          // your mysql username
define('MYSQL_USER_PASSWORD', 'mysql_password');          // your mysql user password
define('MYSQL_DATABASE', 'mydatabaseName');               // your mysql database
define('MYSQL_HOST', 'localhost');                        // your mysql hostname

```
`mysql/stream_mysql.sql`  - create your database and import this sql into it. 

`js/tessa2.js`            - add your Discogs api developer key/secret 

```
// set your Discogs api key/secret here.
var auth = { 
    key: 'discogsKey',
    secret: 'mydiscogsecret',
    page: 1,
    per_page: 10,    
};
```
