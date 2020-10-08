<?php
/**
 * @author scott fleming
 * @version 1.0
 * keep.php - the mysql connection to Tesseract
 * 
 */

 include('../include/db.php');

class keep {

/**
 * Insert/Update Artist discogs_id
 */
    function insertArtist( $artist, $discogs_id ){
        global $mysqli;
        $mysqli->report_mode = MYSQLI_REPORT_STRICT;

        // insert/update artist
        $stmt = $mysqli->prepare("INSERT INTO artist ( `name` ,`discogs_id` ) VALUES (?,?) 
        ON DUPLICATE KEY UPDATE  `name` = VALUES(`name`), `discogs_id` = VALUES(`discogs_id`)" );
        $stmt->bind_param( "si" , $artist, $discogs_id );
        $stmt->execute();      
        
        return $stmt->insert_id;  

        $stmt->close();
    }


    /**
     * Insert Members of Artist 
     */

    function insertMembers( $artist_id, $members ){
        global $mysqli;
        $mysqli->report_mode = MYSQLI_REPORT_STRICT;
        $inserts = array();

        foreach($members as $member) {

            $active = $member['active'] == 'true' ? 1 : 0;
            $member['name']         =  $mysqli->real_escape_string( preg_replace('~\(.*?\)\s?~', '', $member['name']) );
            $member['resource_url'] = $mysqli->real_escape_string( $member['resource_url']);
    

            $sql = "INSERT INTO members ( discogs_id, artist_id, status, member_name, resource_url ) 
                VALUES (". $member['id'] . "," . $artist_id . ",'" . $active . "','" .$member['name']."','".$member['resource_url']. "')
                ON DUPLICATE KEY UPDATE
                    discogs_id = " . $member['id'] . ", 
                    artist_id  = ".$artist_id.",
                    status = '".$active."', 
                    member_name = '".$member['name']."',
                    resource_url = '".$member['resource_url'] . "'";
       
            $result = $mysqli->query($sql) or die( mysqli_error($mysqli));

            array_push($inserts, $mysqli->insert_id);
            
            $count = count($inserts);
            
        }
        // $stmt->close();
        return $count;
    }

    /**
     * insert/update artist profile exceprt
     */
    function insertProfile( $artist_id, $excerpt ){

        global $mysqli;
        $excerpt = $mysqli->real_escape_string($excerpt);

        $sql = "INSERT INTO profile (`discogs_id`, `profile`) 
                VALUES ( $artist_id, '$excerpt') 
                ON DUPLICATE KEY UPDATE `discogs_id`=$artist_id, `profile`='$excerpt'";

        $result = $mysqli->query($sql) or die( mysqli_error($mysqli) );

        return $mysqli->insert_id;               
    }

    // ArtistUrls

    function insertArtistUrls( $artist_id, $urls ){
        global $mysqli;
        $json_urls = json_encode($urls);

        $sql = "INSERT INTO artist_urls (discogs_id, urls) VALUES( $artist_id, '$json_urls') 
                ON DUPLICATE KEY UPDATE discogs_id = VALUES(discogs_id), urls='$json_urls'";
        
        $result = $mysqli->query($sql) or die( mysqli_error($mysqli) );
        return $mysqli->insert_id;  
    }


/**
 * INSERT RELEASES, TRACKLIST,RECORDING, LABEL INFO
 */

    function insertRelease( $release, $styles='', $genres='' ){
        try{

            global $mysqli;
            $artist_id  = $release['artists'][0]['id'];
            $discogs_id = $release['id'];
            $title      = $mysqli->real_escape_string( $release['title'] );
            $year       = $release['year'];
            $country    = isset($release['country']) ? $release['country'] : '';
            $label_id   = $release['labels'][0]['id'];
            $label_name = $release['labels'][0]['name'];
            $label_cat  = $release['labels'][0]['catno'];
            $label_url  = $release['labels'][0]['resource_url'];
            $recording_title = trim($mysqli->real_escape_string( $release['recording']['title']));
            
            $tracklist  = $release['tracklist'];
            
            if(isset($release['styles'])){
                $genres     = implode(',', $release['genres']);
                $styles     = implode(',', $release['styles']);
            }
            
            $trackInserts   = array();
            $xtras          = array();
            $extraartists   = isset( $release['extraartists']) ? $release['extraartists']: '';
            $thumb          =  $mysqli->real_escape_string( $release['firstRes']['thumb'] );
            
    
            // releases insert command on update country,genres,styles
            $sql = "INSERT INTO releases (artist_id,discogs_id,title, genres, styles, year, country, label_id, thumb, audio) 
                    VALUES ($artist_id, $discogs_id, '$title', '$genres','$styles', '$year', '$country', $label_id, '$thumb', '2') 
                    ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id), thumb=VALUES(thumb)";
    
            if( !$inserted = $mysqli->query($sql) ) throw new Exception( $mysqli->error );
    
            $inserted = $mysqli->insert_id;
            
            // recording inserts - set plays to 0 because floyd will update and increment. 
            $sql = "INSERT INTO recording (title, artist_id, release_id) VALUES ('$recording_title',$artist_id, $discogs_id ) 
                    ON DUPLICATE KEY UPDATE title=VALUES(title), artist_id=VALUES(artist_id), release_id=VALUES(release_id)";
    
            if( !$inserted = $mysqli->query($sql) ) throw new Exception( $mysqli->error );
    
            $recording_insert = $mysqli->insert_id;
    
            // tracklist inserts
    
            foreach( $tracklist as $track ) {
    
                $trackTitle = $mysqli->real_escape_string( $track['title']);
                $duration   = $track['duration'];
                $position   = $track['position'];
                $type       = $track['type_'];
    
                $sql = "INSERT INTO tracklist ( title, position, duration, release_id, `type`, my_unique ) 
                        VALUES( '$trackTitle', '$position', '$duration',$discogs_id, '$type', '$position.$duration')
                        ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id), title='$trackTitle', duration='$duration',release_id='$discogs_id', type='$type', my_unique='$position.$duration'";
    
                if( !$inserted = $mysqli->query($sql) ) throw new Exception( $mysqli->error );
                
                array_push( $trackInserts, $mysqli->insert_id );
            }
    
    
            // extraartists insert command 
            if($extraartists){
                foreach( $extraartists as $artist ){
                    // strip (d) from the artist name if there.
                    $name       =  preg_replace('~\(.*?\)\s?~', '', $mysqli->real_escape_string( $artist['name'] ));
                    $res_url    =  $artist['resource_url'];
                    $role       = $mysqli->real_escape_string( trim($artist['role']) );
                    $artistID   =  $artist['id'];
                    $tracks     = json_encode($artist['tracks']);
                    
                    $sql = "INSERT INTO extraartists ( release_id, artist_id, name, resource_url, role, tracks ) 
                            VALUES ( $discogs_id, $artist_id, '$name', '$res_url','$role','$tracks' ) 
                            ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id), artist_id = $artist_id ";
    
                    if( !$inserted = $mysqli->query($sql) ) throw new Exception( $mysqli->error );
                    
                    array_push($xtras, $mysqli->insert_id);
                }
    
                // labels insert command
                $sql = "INSERT INTO labels (discogs_id, `name`, resource_url, cat_no)
                        VALUES ($label_id,'$label_name','$label_url', '$label_cat')
                        ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id), discogs_id=$label_id, cat_no=VALUES(cat_no)";
                
                if( !$inserted = $mysqli->query($sql) ) throw new Exception( $mysqli->error );
                
                $insertedLabel = $mysqli->insert_id; 
    
                return array('release' => $inserted, 
                             'recording' => $recording_insert, 
                             'labels' => $insertedLabel, 
                             'trackInserts' => implode(',', $trackInserts ), 
                             'xtras' => implode(',', $xtras )  
                            );
            }
        } catch (Exception $e ){
            return array(
                'error' => $e->getMessage(),
                'file'  => $e->getFile(),
                'line'  => $e->getLine()
            );
        }
    
    }

    // END OF INSERT FUNCTIONS

    
    /**
     * returns the release info based on title and artistID
     */

    function findRecording( $title, $artist_id ){
        try{

            global $mysqli;

            $title = $mysqli->real_escape_string($title);

            $sql = "SELECT artist.discogs_id artist_id, artist.name artist, recording.title recording_title, releases.discogs_id release_id, releases.title album, releases.year released, releases.country, releases.thumb coverimg, labels.name label, releases.genres, releases.styles, audio.type type, audio.attribute attribute, covers.path
            FROM `recording`
            join artist on artist.discogs_id=recording.artist_id
            join releases on releases.discogs_id = recording.release_id
            join labels on labels.discogs_id=releases.label_id
            join audio on audio.audio_id=releases.audio
            LEFT JOIN covers on covers.release_id=releases.discogs_id
            WHERE recording.title LIKE '$title' AND artist.discogs_id in ('$artist_id')" ;

            if( !$result = $mysqli->query($sql) ) throw new Exception( $mysqli->error );
            if( $result->num_rows > 0){

                $recording = $result->fetch_array( MYSQLI_ASSOC );
            } else{
                throw new Exception( 'findRecording returned no results : ' . $sql  );
            }

            return $recording;

        } catch (Exception $e){
            return array(
                'error' => $e->getMessage(),
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
                
            );
        }
    }

    /**
     * extraArtistByArtist 
     * @var artist_id (int)
     * @return obj
     */

    function extraArtistByArtist( $artist_id ) {
        global $mysqli;
        $sql = "SELECT name, role, releases.title 'release title' FROM `extraartists` 
                JOIN releases on releases.artist_id = extraartists.artist_id
                WHERE extraartists.artist_id = $artist_id";
        $results = $mysqli->query($sql);

    }


    function nerdly(){
        global $mysqli;
        $out = [];
        
        // recording
        $sql = "SELECT SUM(plays) track_count from recording WHERE 1";
        $result = $mysqli->query($sql) or die('nerdly() function failure: ' . mysql_error($mysqli));
        $out['recording'] = $result->fetch_array( MYSQLI_ASSOC );
        // artists
        $sql = "SELECT COUNT(*) artist_count from artist WHERE 1";
        $result = $mysqli->query($sql) or die('nerdly() function failure: ' . mysql_error($mysqli));
        $out['artist'] = $result->fetch_array( MYSQLI_ASSOC );
        // releases
        $sql = "SELECT COUNT(*) releases_count from releases WHERE 1";
        $result = $mysqli->query($sql) or die('nerdly() function failure: ' . mysql_error($mysqli));
        $out['releases'] = $result->fetch_array( MYSQLI_ASSOC );
        // labels
        $sql = "SELECT COUNT(*) labels_count from labels WHERE 1";
        $result = $mysqli->query($sql) or die('nerdly() function failure: ' . mysql_error($mysqli));
        $out['labels'] = $result->fetch_array( MYSQLI_ASSOC );
        // known tracks
        $sql = "SELECT COUNT(*) tracks_count from tracklist WHERE 1";
        $result = $mysqli->query($sql) or die('nerdly() function failure: ' . mysql_error($mysqli));
        $out['tracks'] = $result->fetch_array( MYSQLI_ASSOC );

        // flac releases
        $sql = "SELECT COUNT(*) flac_count from releases WHERE audio > '1'";
        $result = $mysqli->query($sql) or die('nerdly() function failure: ' . mysql_error($mysqli));
        $out['flac'] = $result->fetch_array( MYSQLI_ASSOC );

        // mp3 releases
        $sql = "SELECT COUNT(*) mp3_count from releases WHERE audio = '1'";
        $result = $mysqli->query($sql) or die('nerdly() function failure: ' . mysql_error($mysqli));
        $out['mp3'] = $result->fetch_array( MYSQLI_ASSOC );

        // members (individuals)
        $sql = "SELECT COUNT(*) members_count from members WHERE status = '1'";
        $result = $mysqli->query($sql) or die('nerdly() function failure: ' . mysql_error($mysqli));
        $out['members'] = $result->fetch_array( MYSQLI_ASSOC );

        return $out;
        $mysql->close();
    }



/**
 * Grabs a cover image from discogs.org and saves the file
 * in the /img/covers/####/####.png 
 */
    function fetchCover( $data ){
        global $mysqli;
        
        $id     = $data['data']['id'];
        $url    = $data['data']['cover_image'];


        if ( !file_exists( $_SERVER['DOCUMENT_ROOT'] . 'img/covers/' . $id )) {
            // go get the image file from 
            $c = curl_init();
            curl_setopt($c, CURLOPT_HEADER, 0);
            curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($c, CURLOPT_BINARYTRANSFER,1);
            curl_setopt($c, CURLOPT_USERAGENT,'MyImage Collector +https://www.hawkwynd.com/'); 
            curl_setopt($c, CURLOPT_URL, $url);
            
            $coverImage = curl_exec($c);
            curl_close($c);

            mkdir($_SERVER['DOCUMENT_ROOT'].'img/covers/'.$id, 0777, true);
            
            $pathImg = $_SERVER['DOCUMENT_ROOT'] . 'img/covers/' . $id;   
            $imgPath = '/img/covers/'.$id.'/'.$id.'.png';    
            
            file_put_contents( $pathImg .'/'. $id.'.png', $coverImage ) or die( 'cant put shit here!');
            
            $sql = "INSERT into covers(release_id, path) VALUES( $id, '$imgPath') 
                ON DUPLICATE KEY UPDATE release_id=VALUES(release_id),path=VALUES(path)
                ";
            $mysqli->query( $sql ) or die( 'image insert failure ' . mysqli_error( $mysqli ));
        
            return $imgPath;
        
        }else{
            // we have a local copy, serve that instead
            return '/img/covers/'.$id.'/'.$id.'.png';
        }
        
    }

    /**
     * lookup cover images by release id
     * @return array
     */

     function browseCovers( $release_id ){
         global $mysqli;
         $output = array('paths' => null, 'release' => null);

         $sql                 = "SELECT DISTINCT(path) FROM covers WHERE release_id = $release_id";
         $results             = $mysqli->query($sql) or die( 'browseCovers error: ' . mysqli_error( $mysqli ));
         $output['paths']     = $results->fetch_all( MYSQLI_ASSOC );

         //  get release title, label, year, country
         $sql                   = "SELECT r.*, au.attribute FROM releases r
                                   LEFT JOIN audio au on au.audio_id=r.audio
                                   WHERE r.discogs_id = '$release_id'";

         $result                = $mysqli->query($sql) or die('browseCovers error:' . mysqli_error( $mysqli ));
         $output['release']     = $result->fetch_all( MYSQLI_ASSOC); 

         return $output;
        
     }


// Lookup, browse and queries for tessa.js

     function browseKeep( $artist, $title ){

         try{

             global $mysqli;
             $artist = $mysqli->real_escape_string( $artist );
             $title  = $mysqli->real_escape_string( $title );
    
             $payload = array(
                         'query'       => array(
                             'artist'   => $artist,
                             'title'    => $title,
                             'querystring' => ''
                         ),
                        'artist'       => array(
                         'name'         => null,
                         'id'           => 0,
                         'excerpt'      => null,
                         'members'      => array()
                     ),
                     'recording'    => array(
                         'title'    => null,
                         'audio'    => null,
                         'plays'    => null
                     ),
                     'release'      => array(
                         'id'       => null,
                         'title'    => null,
                         'label'    => null,
                         'year'     => null,
                         'country'  => null,
                         'genres'   => null,
                         'styles'   => null,
                         'coverImg' => null,
                         'tracklist'=> []                                             
                     )
                 
        
             );
    
             
             $spl = "SELECT a.discogs_id artistID, rel.id, rel.discogs_id releaseID, rel.year, rel.country, rel.genres, 
                            rel.styles, r.title, r.release_id, a.name artist, rel.title release_title, 
                            l.name label, p.profile, c.path coverIMG, au.attribute audioType, r.plays played
                    FROM recording r 
                    LEFT JOIN artist a on a.discogs_id=r.artist_id
                    lEFT JOIN profile p on p.discogs_id = a.discogs_id
                    LEFT JOIN releases rel on rel.discogs_id = r.release_id
                    LEFT JOIN covers c on c.release_id = r.release_id
                    LEFT JOIN labels l on l.discogs_id = rel.label_id
                    LEFT JOIN audio au on au.audio_id = rel.audio
                    WHERE r.title   = '$title'
                    AND a.name      = '$artist'
                    LIMIT 1";
    
             $payload['query']['querystring'] = $spl; 

             if(!$results = $mysqli->query( $spl ) ) throw new Exception( $mysqli->error );
    
             if($results->num_rows > 0 ){
                 
                $datapak                            = $results->fetch_array( MYSQLI_ASSOC );                
                $payload['artist']['id']           = $datapak['artistID'];
                $payload['artist']['name']         = $datapak['artist'];
                $payload['artist']['excerpt']      = $datapak['profile'];
                $payload['recording']['title']     = $datapak['title'];
                $payload['recording']['audio']     = $datapak['audioType'];
                $payload['recording']['plays']     = $datapak['played'];
                $payload['release']['id']          = $datapak['release_id'];
                $payload['release']['title']       = $datapak['release_title'];
                $payload['release']['label']       = $datapak['label'];
                $payload['release']['year']        = $datapak['year'];
                $payload['release']['country']     = $datapak['country'];
                $payload['release']['coverImg']    = $datapak['coverIMG'];
                $payload['release']['genres']      = $datapak['genres'];
                $payload['release']['styles']      = $datapak['styles'];               
                $releaseID                         = $payload['release']['id'];
                 
                //  tracklist query
                $tQuery = sprintf("SELECT position, title, duration FROM tracklist WHERE release_id = %d ORDER BY position", $datapak['release_id'] );
         
                if(!$tracksRes = $mysqli->query($tQuery) ) throw new Exception( $mysqli->error );
                
                if( $tracksRes->num_rows > 0 ){     
                      $tracks = array();              
                     while($row = $tracksRes->fetch_all( MYSQLI_ASSOC )){
                         $payload['release']['tracklist'] = $row;
                     }      
                
                // members query
                $mQuery = sprintf("SELECT * FROM members  m
                                   LEFT JOIN artist a on a.discogs_id=m.artist_id
                                   WHERE m.artist_id = %d order by status DESC", 
                                   $datapak['artistID']);

                if(!$members = $mysqli->query($mQuery) ) throw new Exception( $mysqli->error );
                if( $members->num_rows > 0 ){
                    while($row = $members->fetch_all( MYSQLI_ASSOC )) {
                        $payload['artist']['members'] = $row;
                    }
                }
                     
                }else{
                    throw new Exception('No tracklist results: ' . $tQuery );
                }
             
            } else {
                 throw new Exception( 'No results for browseKeep :' . $spl  );
            }
            


            // all packed up, fire the weapon!
            return json_encode( $payload, true );
    
        }catch (Exception $e){
    
            $payload = array(
                'error' => $e->getMessage(),
                'line'  => $e->getLine(),
                'file'  => $e->getFile()    
            );

            return json_encode( $payload );

        } 

    }






}
