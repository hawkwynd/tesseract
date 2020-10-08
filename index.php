<?php

require_once('include/config.inc.php');

?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1, shrink-to-fit=no" name="viewport" />
    <title><?php echo APPLICATION_NAME; ?></title>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
    
    <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">
    <script src="https://kit.fontawesome.com/b684508b7c.js" crossorigin="anonymous"></script>    
    <link href="css/sassy.css" rel="stylesheet" type="text/css"/>

    <!-- bootstrap style -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">

    <script type="text/javascript" src="js/jquery.min.js"></script>
    <script type="text/javascript" src="js/tessa2.js"></script>
    
    <!-- bootstrap modal js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>

</head>
<body>

<div class="main-container">
    <div id="wb_MediaPlayer1">
            <div class="stream-details">
                <div class="app-title" aria-label="title">                  
                    <?php printf('<div class="appName">%s %s</div>', APPLICATION_NAME ,'<span class="nerdlyContainer no-mobile">
                    <button type="button" class="btn btn-info" data-toggle="modal" data-target="#statsModal">stats</button></span>' ); ?><div class="timebox"></div>
                </div>
                
                <div class="app-motd" aria-label="motd"></div>

                <div class="nowplaying-title">
                    <span class="animate-flicker">Initializing Tesseract</span>
                </div>
                <div class="nowplaying">

                <div class="loading">
                    <div class="sk-folding-cube">
                        <div class="sk-cube1 sk-cube"></div>
                        <div class="sk-cube2 sk-cube"></div>
                        <div class="sk-cube4 sk-cube"></div>
                        <div class="sk-cube3 sk-cube"></div>
                    </div>
                </div>

                    <div class="thumb-container"><img data-toggle="modal" data-target="#imgModal" >                   
                    <div class="song-album"></div>
                    <div class="year-label"></div>
                
                    </div>

                    <div class="current-song-container">
                        <div class="artist-name"></div>
                        <div class="song-title"></div>
                        
                        <div class="artist-rels">
                            <div class="active-members"></div>
                            <div class="inactive-members"></div>
                        </div>
                    </div>
                    <div class="recording-list-container"></div>
                </div><!-- .now-playing -->
            </div>

        <div class="audioContainer">
            <audio src="<?php echo SHOUTCAST_HOST.'/;';?>" id="MediaPlayer1" controls="controls"></audio>
        </div>

    </div>
    <div class="statistics">
            <div class="totalRecs">Powered by Tesseract</div>
            <div class="nerdystats"></div>
            <div class="uptime"></div>
            <div class="listeners"></div>
    </div>
  <div class="metaContainer">
    <div class="content-container">
        <div class="tempContainer"></div>
        <div id="artist-wiki"></div>
        <div class="wrap-collapsible-history"></div>              
    </div>
    <div class="lowerContainer">
        <div class="wrap-collapsible-releases"></div>       
        <div class="wrap-collapsible-about-releases"></div>
    </div>        
   </div><!-- .metaContainer -->
 
</div><!-- main-container -->




<!-- Stats Modal -->
<div class="modal fade" id="statsModal" tabindex="-1" role="dialog" aria-labelledby="statsModallLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="statsModalLabel">Nerdly Statistics</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          
        </button>
      </div>
      <div class="modal-body">
            <div class="nerdly"></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>        
      </div>
    </div>
  </div>
</div>

<!-- Image Carosel Modal -->
<div class="modal fade" id="imgModal" tabindex="-1" role="dialog" aria-labelledby="imgModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="imgModalLabel"></h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          
        </button>
      </div>
      <div class="modal-body text-center">
        
          <div id="carouselKeep" class="carousel slide" data-ride="carousel">
            <div class="carousel-inner"></div>

          <a class="carousel-control-prev" href="#carouselKeep" role="button" data-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="sr-only">Previous</span>
          </a>
          <a class="carousel-control-next" href="#carouselKeep" role="button" data-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="sr-only">Next</span>
          </a>
      </div><!--//carouselKeep -->


    </div><!--//modal-body -->
      
      <div id="attribute" class="text-center"></div>
      <div id="genres" class="text-center"></div>
        
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>        
      </div>
    </div>
  </div>
</div>


</body>
</html>
