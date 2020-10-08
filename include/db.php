<?php

// database connection
require 'config.inc.php';

$mysqli = new mysqli( MYSQL_HOST, MYSQL_USER, MYSQL_USER_PASSWORD, MYSQL_DATABASE);
if ($mysqli->connect_errno) {
    echo "Failed to connect to MySQL: " . $mysqli->connect_error;
}



