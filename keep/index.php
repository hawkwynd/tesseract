<?php
/**
 * Keep processing 
 * @version 1.0
 * @author scott fleming
 * 
 */
error_reporting(E_STRICT);
ini_set('display_errors', 1);

 require('keep.php');
 $keep      = new keep();

 if( isset($_POST['action']) && $_POST['action'] == 'artist' ){
     $artist    = $_POST['artist'];    
     $artist    = preg_replace('~\(.*?\)\s?~', '', $artist);
     $discogs_id = $_POST['discogs_id'];
     $inserted  = $keep->insertArtist( $artist, $discogs_id );
     echo $inserted;
}

if( isset($_POST['action']) && $_POST['action'] == 'members') {
     $members       = $_POST['members'];
     $artist_id     = $_POST['artist_id'];
     $inserted      = $keep->insertMembers( $artist_id, $members );   
     echo json_encode($inserted);   
}

if( isset($_POST['action']) && $_POST['action'] == 'profile' ){
    $artist_id = $_POST['artist_id'];
    $excerpt   = $_POST['exceprt'];
    $inserted  = $keep->insertProfile($artist_id, $excerpt);
    echo json_encode($inserted);
}

if( isset($_POST['action']) && $_POST['action'] == 'urls' ){
    $artist_id = $_POST['artist_id'];
    $urls      = $_POST['urls'];
    $inserted  = $keep->insertArtistUrls($artist_id, $urls);
    echo json_encode($inserted);
}

// Do insert of release data
if( isset($_POST['action']) && $_POST['action'] == 'release'){   
    $inserted = $keep->insertRelease( $_POST['data'] ) ;   
    $results = $keep->findRecording( $_POST['data']['recording']['title'] , $_POST['data']['artists'][0]['id'] );
    $results['insertedRelease'] = $inserted;
    echo json_encode( $results );
}

// NERDLY stats 
if(isset($_POST['action']) && $_POST['action'] == 'nerdly') {
    $stats = $keep->nerdly();
    echo json_encode($stats);
}

// browse cover images 
if(isset($_POST['action']) && $_POST['action'] == 'browseCovers'){
    $paths = $keep->browseCovers( $_POST['release_id'] );
    echo json_encode($paths, true);
}

// cover image download
if(isset($_POST['action']) && $_POST['action'] == 'cover' ){
    $imagePath = $keep->fetchCover( $_POST );
    echo $imagePath;
}

// query artist/title
if( isset( $_POST['action'] ) && $_POST['action'] == 'lookupAT' ){
    try{
        $results = $keep->browseKeep($_POST['artist'], $_POST['title']);

        if(!$results) throw new Exception( 'browseKeep returned 0 results');

        echo $results;

    }catch( Exception $e){
        return array(
            'error' => $e->getMessage(),
            'func'  => 'browseKeep',
            'line'  => $e->getLine(),
            'file'  => $e->getFile(),
            'POST'  => $_POST
        );
    }

}

// extraartists by release
if( isset( $_POST['action']) && $_POST['action'] == 'extraartists' ){
    try{
        
        $results = $keep->extraArtistByArtist( $_POST['release_id'] );
        echo $results;

    }catch( Exception $e){
        return array(
            'error' => $e->getMessage(),
            'func'  => 'extraartists',
            'line'  => $e->getLine(),
            'file'  => $e->getFile(),
            'POST'  => $_POST
        );
    }
}
