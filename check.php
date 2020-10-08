<html><head><title>Find String</title></head><body>
<?php
ini_set('max_execution_time', '0');
ini_set('set_time_limit', '0');

find_files('/var/www/hawkwynd.com/html/');

function find_files($seed) {
  if(! is_dir($seed)) return false;
  $files = array();
  $dirs = array($seed);
  while(NULL !== ($dir = array_pop($dirs)))
    {
      if($dh = opendir($dir))
        {
          while( false !== ($file = readdir($dh)))
            {
              if($file == '.' || $file == '..') continue;
              $path = $dir . '/' . $file;
              if(is_dir($path)) { $dirs[] = $path; }
                 else { if(preg_match('/^.*\.(php[\d]?|txt|js|htaccess)$/i', $path)) { check_files($path); }}
            }
          closedir($dh);
        }
    }
}

function check_files($this_file){
  $str_to_find[]='base64_decode';
  $str_to_find[]='edoced_46esab'; // base64_decode reversed
  $str_to_find[]='@include';
  $str_to_find[]='GLOBALS';

  if(!($content = file_get_contents($this_file)))
    { echo("<p>Could not check $this_file You should check the contents manually!</p>\n"); }
    else
      {
        while(list(,$value)=each($str_to_find))
          {
            if (stripos($content, $value) !== false)
              {
		      echo("<p>$this_file -> contains $value</p>\n");
              }
            }
          }
        unset($content);
}
?>
</body></html>
