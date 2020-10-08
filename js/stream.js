
var flag = true;
var loop = 1;
var songId = null;

// seconds converter to human readable
function secondsTimeSpanToHMS(s) {
    var h = Math.floor(s/3600); //Get whole hours
    s -= h*3600;
    var m = Math.floor(s/60); //Get remaining minutes
    s -= m*60;
    return h+":"+(m < 10 ? '0'+m : m)+":"+(s < 10 ? '0'+s : s); //zero padding on minutes and seconds
}

function statistics(songId){   


       $.getJSON('statistics.php', function( data ){
       

        var meta            = data.streams[0].songtitle;
        var artist          = meta.substr(0, meta.indexOf(' - '));
        var title           = meta.substr(meta.indexOf(' - ') + 3);
        var servercontent   = data.streams[0].servertitle.split('-'); // configured in software - some text
        var servertitle     = servercontent.shift();
        var motd            = servercontent;                         // one-line motd on server
        var samplerate      = data.streams[0].samplerate;           // samplerate 44100
        var bitrate         = data.streams[0].bitrate;              // bitrate  128
        var genre           = data.streams[0].servergenre;          // not used
        var streamstatus    = data.streams[0].streamstatus;         // status of the stream
        var streamuptime    = data.streams[0].streamuptime;         // how long stream is playing
        var streamAvgTime   = millisToMinutesAndSeconds(data.averagetime);

        // still alive?
        if(streamstatus > 0 ){
            
            // Check if no artist/title data came, but we have a streamstatus

            var listeners = data.uniquelisteners;

            lastfm(artist, title, songId); // query lastFM for correct artist/title and metadata
            
            if(!songId){
                
                // console.log('Render artist name');
                $('.artist-name').html(artist.trim());
                // console.log('Render song title');
                $('.song-title').html(title.trim());
                // $('.nowplaying-title').html(title.trim() + ' - ' + artist.trim() );
                $('.jp-title').html( servertitle );
                // $('.recording-list-container').html('');
            }

            
            // console.log('Render current listeners: ' + listeners);
            $('.listeners').html(listeners + ' listener'+ (listeners === 1 ? '':'s') );            
            $('.nerdystats').html(samplerate + ' kHz @ ' + bitrate + ' kbps');
            $('.uptime').html('Uptime: '+ secondsTimeSpanToHMS(streamuptime));
            
        
        // no stream, just throw the maintenance item

        }else{

            // wipe all containers 
            $('.nowplaying-title').html('Offline for Maintenance');
            $('.artist-name').html('');
            $('.song-title').html('');
            $('.song-album').html('');
            $('.year-label').html('');       
            $('.thumb-container').html('<img src="img/no_image.png">');
            $('.summary-container').html('').css("padding", 0);
            $('.members-container').html('');
            $('.recording-list-container').html('');
            $('.artist-rels').html(''); // clear relations

        }
    }); // $.getJSON
}

/**
 * Functions for workload begin here
 */

function history(){
    $.getJSON('history.php' , function(list){
        var output = '';
        var listing = '';

        $.each(list, function(idx, val){
            listing += '<div class="listing">' + val + '</div>';
        });

        $('.wrap-collapsible-history').html(
            '<input id="collapsible" class="toggle" type="checkbox">' +
            '<label for="collapsible" class="lbl-toggle">Our latest played</label>'+
            '<div class="collapsible-content">'+
              '<div class="content-inner">' +
            listing +
            '</div>' +
            '</div>'
        );
    });
}

// Display list of releases by an artist in collapsible container
// Discography
// -------------------------------------------------------------
function releaseHistory(arid){

   $.getJSON('browseReleases.php', {
            artistId: arid
        }).done(function(list){

        var artistName = $('.artist-name').html();
        var listing = '';

        $.each(list, function(idx, val){
            listing += '<div class="listing">' + val.date + ' '+ val.title +'</div>';
            // console.log(val.date + ":" + val.title + " " +val.id);
        });

        // Render discography
        $('.wrap-collapsible-releases').html(
            '<input id="release-collapsible" class="toggle" type="checkbox">' +
            '<label for="release-collapsible" class="lbl-toggle">'+artistName+ ' discography</label>'+
            '<div class="collapsible-content">'+
              '<div class="content-inner">' + listing + '</div>' +
            '</div>'
        );
    });
}

// no longer used in rendering for now.
function millisToMinutesAndSeconds(millis) {
    var seconds = parseInt(millis, 10);
    var days = Math.floor(seconds / (3600*24));
    seconds  -= days*3600*24;
    var hrs   = Math.floor(seconds / 3600);
    seconds  -= hrs*3600;
    var mnts = Math.floor(seconds / 60);
    seconds  -= mnts*60;

    return days + " days " + hrs + " hours " +  mnts + " minutes";
}

function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  }

// callback function renders page with results
function callback(results, songId){
    
    // Clear out the meta containers
    $('#release-wiki').html(''); // release wiki
    $('#artist-wiki').html(''); // artist extract   
    $('.artist-rels').html(''); // clear relations
    $('.recording-list-container').html(''); // clear recording-list
    $('.nowplaying-title').html('Now Playing');

    if(results){
        
        console.log('%c165: Callback of results', 'color: green');

        // load vars from results
        var artist      = results.artist.name;
        var arid        = results.artist.mbid;
        var album       = results.album.title;        
        var image       = results.album.image == null ? 'img/no_image.png' : results.album.image;      
        var tid         = results.track.mbid;
        var track       = results.track.name;
        var relid       = results.album.mbid;
        var d           = new Date(results.album.releaseDate);
        var release     = d.getFullYear();
        var AExtract    = '';
        var label       = results.album.label == null ? '' : results.album.label;
        var totalRecs   = results.totalRecs;


        // render release summary
        if(results.album.hasOwnProperty('wikiExtract') && results.album.wikiExtract !=null ){       
            
            var AExtract = '<div class="wrap-collapsible members-container">' +
            '<input type="checkbox" class="toggle" id="members">' +
            '<label id="lbl-members" for="members" class="lbl-toggle">About '+results.album.title + '</label>' +
            '<div class="collapsible-content">' +
            '<div class="content-inner">';                
            var AExtractCloser = '</div></div></div>';
            var extract_array = results.album.wikiExtract.split('. ');
            var extract_trunc = extract_array.slice(0, 3).join('. ');
            AExtract +=  extract_trunc + AExtractCloser;
            
            // console.log('Render release-wiki');
            $('#release-wiki').html(AExtract); // add release container info
            
        }

        // Render artist summary
        if(results.artist.hasOwnProperty('summary') && results.artist.summary !=null ){

            var summaryContent = '<div class="wrap-collapsible summary-container">' +
            '<input type="checkbox" class="toggle" id="summary">' +
            '<label id="lbl-summary" for="summary" class="lbl-toggle">About ' + results.artist.name +'</label>' +
            '<div class="collapsible-content"><div class="content-inner">';                
            var summaryContentCloser = '</div></div></div>';
            var summary_array = results.artist.summary.split('. ');
            var summary_trunc = summary_array.slice(0, 3).join('. ') + '.';           
            var summary = results.artist.summary.length > 2 ? summaryContent + '<div class="summary">'+ summary_trunc + '</div>' + summaryContentCloser :'';       
            
            // console.log('Render artist-wiki');
            $('#artist-wiki').html( summary ); // artist extract   
    
        }

        // set id to containers and render content
        //  console.log('Render artistId:' + arid);
         $('.artist-name').prop('id', arid);
        //  console.log('Render songId: ' + tid);
         $('.song-title').prop('id', tid);
        //  console.log('Render releaseId ' + relid);
         $('.song-album').prop('id', relid);
         
        //  lets try this.
        //  musicbrainzSearchFirst(artist, track);

        // List tracks on the release being displayed.
        // when we have data coming from our mongoDB search

         $.getJSON('https://musicbrainz.org/ws/2/release/'+ relid +'?inc=recordings&fmt=json',{}).done(function(results){
            tracks = results.media[0].tracks;           

            if(tracks.length > 0){
                console.log('%c235:MusicBrainz: Tracks: ' + tracks.length, 'color: #96b0c0');

                $('.recording-list-container').html('<div class="header">Tracks ('+ tracks.length +')</div><ol></ol>');   
                
                // limit list to 15 tracks              
                $.each(tracks.slice(0, 15), function(idx, recording){
                    tracklen = recording.length != null ? millisToMinutesAndSeconds(recording.length) : '';
                    $('.recording-list-container ol').append('<li>' + recording.title + ' ' + tracklen + '</li>');
                });
            }
        });


        // console.log('Render release title: ' + album);
         $('.song-album').html(album);
        // console.log('Render label: ' + release + ' ' + label);
         $('.year-label').html('(' + release + ') ' + label );              
         
        // if we have an arid, shoot a release history
        releaseHistory( arid );
         
        // update history listing of played songs
        history();  
       
        //  console.log('Render count');
         $('.totalRecs').html('The Keep: ' + totalRecs);


        // Image grab
        // https://api.discogs.com/database/search?page=1&per_page=1&key=jaRkJhfCzjSmakRoGyjP&secret=MGSKueXgidqwXOxbmmtSOGfUoFHtXdfC&q=Priceless%20Jazz
        
        if( !results.album.image  ){

            console.log('%c294: no_image detected: Calling discogs for ' + results.artist.name , 'background: #222; color: #bada55');      

            $.getJSON('https://api.discogs.com/database/search?page=1&per_page=1&key=jaRkJhfCzjSmakRoGyjP&secret=MGSKueXgidqwXOxbmmtSOGfUoFHtXdfC&q='+ results.artist.name,{}).done(function(imgJson){
    
                if(imgJson.results.length > 0){
                    $.each(imgJson.results, function (idx, row){
                        console.log('%c300:Discogs:' + row.cover_image, 'color: green');
                        $('.thumb-container').html('<img src='+row.cover_image+'>');
                    });
                }
            });

        }else{

            console.log('%c388:Using MongoDB image', 'color: #96b0c0');
            $('.thumb-container').html('<img src="'+ image + '">'); // update the image with the image we got
            console.log( $('.thumb-container').children('img').attr('src') );
       
        }



   }else{
       
        console.log('%c328:No MongoDB match found.', 'color: red');

        // no data from Musicbrainz firstRecording.php
        $('.song-duration').html('');
        $('.song-album').html('');
        $('.year-label').html('');
        $('.thumb-container').html('<img src="img/no_image.png">'); // thumbnail of LP cover
        $('.content-container').html('').css("padding", 0);
        $('.article').html('');
        $('.recording-list-container').html(''); // clear recordings list
        $('.artist-rels').html(''); // clear relations
               
        
   }
}

function singleArrayRemove(array, value){
    var index = array.indexOf(value);
    if (index > -1) array.splice(index, 1);
    return array;
  }

// search mongoDB for match on artist and title.
// return json data if a match is found
function lastfm(a, t, songId){

    $.getJSON('lookup.php', { // call internal search for artist/track
        track: t,
        artist: a,
        test: true

    }).done(function( results ){ // mongo successful find in lastfm collection

        if (results.hasOwnProperty('artist') ){
        
            // if our songId doesn't match the returned recording.id
            // then we know it's a new song, and do a render to update
            // the page with the new information, otherwise move on.

            if( results.track.mbid !== songId ){
                
                console.clear(); // clear console so we dont get a long train of data
                console.log('%cMongoDB Results', 'color: darkgreen');
                console.log('object: %O', results );
                
                $('.song-title').html(t);
                $('.artist-name').html(a);
                
                // shoot some data
                console.log('https://musicbrainz.org/release/' + results.album.mbid);
                console.log('https://musicbrainz.org/recording/' + results.track.mbid);
                
                callback(results, songId); // process success results  

            }
            

        }else{
            
            console.log('%c379:No rResults from lastfm call', 'color: red');

            // Wipe the page renders clean 
            // console.clear();

            $('.song-title').html(t);
            $('.artist-name').html(a);            
            // $('.song-duration').html('');
            // $('.song-album').html('');
            // $('.year-label').html('');            
            // $('.thumb-container').html('<img src="img/no_image.png">'); // thumbnail of LP cover
            
            $('.summary-container').html('').css("padding", 0);
            $('.members-container').html('');
            $('.article').html('');
            $('.nowplaying-title').html('Now Playing');
            $('.artist-rels').html(''); // clear relations
            
            history();
            // $('.recording-list-container').html('');
            
            musicbrainzSearchFirst(a,t);


        }

        }).fail(function() { // trigger musicbrainzSearchFirst

                callback(null);
                failed(a ,t );           

    });

}
function failed(a, t){
    
    console.log( '%cTessa:We dont have ' + a + ', ' + t, 'color: red');
    // console.log( 'Triggering musicbrainzSearchFirst for ' + a + ' : ' + t);  
    // musicbrainzSearchFirst(a, t);  

}

// search musicbrainz api for song
function musicbrainzSearchFirst( a , t){

    // searchRelease(a, t, function(datapak){
        
    //     console.log('SEARCHRELEASE:');
    //     console.log(datapak.results);
    // });

    console.log('%cMusicBrainzFirst: ' + a + ', ' + t , 'color: yellow' );

    args = { 
        query: t + ' AND artist:' + a + ' AND primarytype:album',
        inc: "release-groups", 
        fmt: "json",
        callback: '?'
    },

    $.getJSON('https://musicbrainz.org/ws/2/recording/', args, function( brainz ){
        var brainzArtist = '';
        $.each(brainz.recordings, function(idx, recording){
            
            if( recording.score == 100 ){
                score = recording.score;                         
                console.log('%c415: Brainz Recording Title: ' + recording.title, 'color: blue');
              
                releases = recording.releases;           
                release = releases[0];

                // $('.song-album').html(releases[0].title);
                // $('.year-label').html(  releases[0].date  );
                
                relid = releases[0].id; 

                $.getJSON('https://musicbrainz.org/ws/2/release/'+ relid +'?inc=recordings&fmt=json',{}).done(function(results){
                        tracks = results.media[0].tracks; 
                        
                        if(tracks.length > 0){
                            $('.recording-list-container').html('<div class="header">Track List (' + tracks.length + ')</div><ol></ol>');      
                            // Limit tracks to 15 listing
                            $.each(tracks.slice( 0,15 ), function(idx, recording){
                                tracklen = recording.length != null ? millisToMinutesAndSeconds(recording.length) : '';
                                $('.recording-list-container ol').append('<li>' + recording.title + ' ' + tracklen + '</li>');
                            });
                        }
                    });

            args = {
                key: 'jaRkJhfCzjSmakRoGyjP',
                secret: 'MGSKueXgidqwXOxbmmtSOGfUoFHtXdfC',
                page: 1,
                per_page: 1,
                // type: 'master',
                artist: a,
                track_title: t
            }
            
            console.log('%c464:discogs search ' + a , 'color: yellow');
            console.log('%c464:discogs search ' + release.title , 'color: yellow');

            console.log('https://api.discogs.com/database/search?key=jaRkJhfCzjSmakRoGyjP&secret=MGSKueXgidqwXOxbmmtSOGfUoFHtXdfC&page=1&per_page=1&artist='+encodeURI(a)+'&track_title='+encodeURI(t));
        
            $.getJSON('https://api.discogs.com/database/search', args ).done( function(master){   
                $.each(master.results, function(idx, result){

                    console.log(result);                
                   
                    getResourceUrl(result.resource_url, function(data){
                        console.log(data);
                    });

                    $('.thumb-container').html('<img src="'+result.cover_image + '">'); // thumbnail of LP cover           
                    $('.song-album').html(result.title);                                        
                    $('.totalRecs').html('Metadata by Tessaract');
        
                });
            });
            console.log('returning false because scoree is ' + score );
            
            return false;
            
        } // if score == 100

        

    }); // $.each recording

   

}); // function musicbrainzSearchFirst

function searchRelease(artist, track_title, callback){
    args = {
        key: 'jaRkJhfCzjSmakRoGyjP',
        secret: 'MGSKueXgidqwXOxbmmtSOGfUoFHtXdfC',
        page: 1,
        per_page: 1,
        // type: 'master',
        artist: artist,
        track_title: track_title
    }

    $.getJSON('https://api.discogs.com/database/search', args , function(data){
                callback(data);
    });

}


function getResourceUrl(resourceUrl, callback) {  
    $.getJSON( resourceUrl, function (jsonData) {       
        callback(jsonData);
    });
}





function getYear (str) {
    var year = (/\b\d{4}\b/).exec(str);
  return year === null ? 'Now' : year[0];
}

    // $.post( "firstrecording.php", { artist: a, title: t})      
    //   .done( function( data ) {            

    //        console.log('Got results from musicbrainz.org.');
    //        console.log('I searched:' + a + ' - ' + t);
    //        console.log( $.parseJSON(data) );
             
    //   });
       
}
