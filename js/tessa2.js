// tessa2.js - discogs version version 2.0 

// set your Discogs api key/secret here.
var auth = { 
    key: 'discogsKey',
    secret: 'mydiscogsecret',
    page: 1,
    per_page: 10,    
};


$(document).ready(function () {

// when the stats modal closes, clear nerdly content
$('#statsModal').on('hidden.bs.modal', function(){
    $(".nerdly").html("");
});

// When the image modal closes, clear content of the carousel
$('#imgModal').on('hidden.bs.modal', function(){
    $('.carousel-inner').html('');
});



/**
 * NERDLY STATS MODAL LISTENER AND CALLER FUNCTION
 */

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

 $('#statsModal').on('show.bs.modal', function(e){   
    $.post('/keep/index.php', {        
        'action' : 'nerdly'
    },
        function(stats){         

            stats = $.parseJSON(stats);
            
            $('.nerdly').html('<div>Songs Served: ' + numberWithCommas( stats.recording.track_count ) + '</div>')
            $('.nerdly').append('<div>Bands: ' + stats.artist.artist_count + '</div>')
            $('.nerdly').append('<div>Active Artists: ' + numberWithCommas(stats.members.members_count) + '</div>')
            $('.nerdly').append('<div>Albums: ' + numberWithCommas( stats.releases.releases_count ) + '</div>')
            $('.nerdly').append('<div>FLAC Albums: ' + numberWithCommas( stats.flac.flac_count ) + '</div>')
            $('.nerdly').append('<div>MP3 Albums: ' + stats.mp3.mp3_count + '</div>')
            $('.nerdly').append('<div>Labels: ' + stats.labels.labels_count + '</div>')
            $('.nerdly').append('<div>Songs learned: ' + numberWithCommas( stats.tracks.tracks_count ) + '</div>')

        }
    ).fail(function(){
        console.log('error');
    });
  });
  
  /**
   * Image modal listener and album image generation
   * @note - if multiple images, load up html with carousel content else, single image in modal body.
  */

  $('#imgModal').on('show.bs.modal', function(e){   
    
    //   var imgPath = $('.thumb-container img').attr('data-path');
    //   $(this).find('.modal-body').html('<img class="img-fluid" src="' + imgPath + '">');    

     var release_id = $('.thumb-container img').attr('data-release_id');

      $.post('/keep/index.php', {
          
          'action'     : 'browseCovers',
          'release_id' : release_id

      }, function(dataset){

          var browsedata = $.parseJSON(dataset)

        //   if more than one image, call modal render for carousel
          if(browsedata.paths.length > 1){              

              doBrowseData(browsedata.paths, renderModal);

           }else{

                // console.log(browsedata);
            
                var coverpath = $('.thumb-container img').attr('data-path');
                
                var release = browsedata.release[0];
                
                // set title and attribute containers
                $('#imgModal .modal-title').text( release.title + (release.year == 0 ? '' : ' - ' + release.year ) );
                $('#attribute').text('Format: '+ release.attribute );
                $('#genres').html('Genre: ' + release.genres + '<br/>Style: ' + release.styles );

                // a single image, turn off nav links    
                $('#imgModal .modal-body').html('<img class="img-fluid" src="' + coverpath + '">');  
                $('#carouselKeep').find('a').hide();
          }
         
      }).fail(function(){

          console.log('browseCovers failed - miserably...')
      })
      
    });    
    
}); // document.ready$

// itereate covers array and build carousel 
// rows
function doBrowseData(data, callback) {  
    $.each( data , function (i, row) {                 
        callback(i, row);
    });
}

// render the modal with the carousel of images

function renderModal(i, row){

    divclass = i == 0 ? 'carousel-item active' : 'carousel-item';

    $('#carouselKeep').find('.carousel-inner').append(
        '<div class="' + divclass + '"><img src="'+row.path+'" class="d-block w-100"></div>'
    )
    // turn on the nav links
    $('#carouselKeep').find('a').show();
}


/**
 *  THE TESSERACT BEGINS HER WORK HERE 
 */


// search artist/title
var mastersUrl    = "https://api.discogs.com/masters/";
var artistsUrl    = "https://api.discogs.com/artists/";
var discogsSearch = "https://api.discogs.com/database/search";


var render = {};

// loop it every 5 seconds to check if the songs changed yet. 
setInterval(function(){                      
            getJSONData( "statistics.php", statistical );       
}, 5000);

// Clock function displays in right corner
setInterval(function(){
    const monthNames    = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const weekdays      = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
    var dt 	            = new Date();
    var dayofw          = dt.getDay();
    var tdDay           = dt.getDate(); 
    var tdMonth         = dt.getMonth();
    var tdYr            = dt.getFullYear();
    var dtHour 	        = dt.getHours() > 12 ? (dt.getHours()-12 ): dt.getHours();
    var AP  	        = dt.getHours() > 12 ? " PM" : " AM";
    var tdSec           = dt.getSeconds() < 10 ? '0' + dt.getSeconds() : dt.getSeconds() ; 
    var dtMin           = dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes();

    $('.timebox').text( weekdays[dayofw] + ' ' + monthNames[tdMonth] + ' ' + tdDay + ' ');
    $('.timebox').append( dtHour +':'+dtMin + ':' + tdSec +  AP + ' CST');

}, 1000 );


function statistical(jsonStats) {

     // Turn off loading spinner
    $('.loading').fadeOut( 1200, function(){
        $(this).html('');
    });

    var meta            = jsonStats.streams[0].songtitle;
    var artist          = meta.substr(0, meta.indexOf(' - ')).replace(/'~\(.*?\)\s?~'/,'');
    var title           = meta.substr(meta.indexOf(' - ') + 3);   
    $title              = title;
    var totalRecs       = jsonStats.totalRecs;
    var listeners       = jsonStats.uniquelisteners;
    var servercontent   = jsonStats.streams[0].servertitle.split('-'); // configured in software - some text
    var servertitle     = servercontent.shift();
    // var motd            = servercontent;                            // one-line motd on server
    // var samplerate      = jsonStats.streams[0].samplerate;           // samplerate 44100
    // var bitrate         = jsonStats.streams[0].bitrate;              // bitrate  128
    // var genre           = jsonStats.streams[0].servergenre;          // not used
    var streamstatus    = jsonStats.streams[0].streamstatus;         // status of the stream
    var streamuptime    = jsonStats.streams[0].streamuptime;         // how long stream is playing
    // var streamAvgTime   = millisToMinutesAndSeconds(jsonStats.averagetime);


    if( streamstatus > 0 ){

        // update server stats
        $('.listeners').html(listeners + ' listener'+ (listeners === 1 ? '':'s') );            
        $('.uptime').html('Uptime: '+ secondsTimeSpanToHMS(streamuptime));
    
        // if the title has changed
        if(  title !=$('.song-title').text() ) {           
           
            // artist name container
            $('.artist-name').fadeIn(1200, function(){
                $(this).text(artist);
            }).fadeIn(1200);
            
            // song title container
            $('.song-title').fadeOut(1200, function(){
                $(this).text(title);   
            }).fadeIn(1200);

            console.clear();
            
            // Incoming
            console.log('%cUpdate banner Processing Incoming', 'color: lightgreen');

            // Now playing container
            $('.nowplaying-title span').fadeOut(200, function(){
                $(this).text('Processing Incoming selection...').addClass('animate-flicker');
            }).fadeIn(200);
            
            
            
            // Perform lookup of artist/title pair unliess the artist is "Hawkwynd Radio"
            if(artist != "Hawkwynd Radio"){
                
                console.log('%cDoing local search on ' + artist + ' - ' + title, 'color:green')               
                lookupAT(artist, title, parseAT );              
                
                // Just keep this as 'the way' for now. 
                console.log('%cDiscogs search on '+ artist + ' - ' + title, 'color: yellow' );  
                 lookupDiscogs(artist, title, auth, parseSearch );   


            }
        }

    }else{

         // wipe all containers 
         $('.nowplaying-title span').text('Offline for Maintenance');
         $('.artist-name').html('');
         $('.song-title').html('');
         $('.song-album').html('');
         $('.year-label').html('');       
         $('.thumb-container').html('<img src="img/no_image.png">');
         $('.artist-rels').html(''); // clear relations
         $('.summary-container').html('').css("padding", 0);
         $('.members-container').html('');
         $('.recording-list-container').html('');
         $('.metaContainer').html('');

         return false;
    }

} // statistcal

function lookupAT(artist, title, callback){

    // send post query, throw results to parseAT
    $.post('/keep/index.php', { 
        'action' : 'lookupAT',
        'artist' : artist,
        'title'  : title
    },
        function(results){
               callback(results);
    });
}


function parseAT( mysqlResults ){
    var out = $.parseJSON( mysqlResults )  
    console.log('%cparseAT results:','color:yellow')
    console.log( out );
}



function parseSearch(jsonSearchResults){

    // Background color selection array
    var colors = ['#0067354f', '#e2c19d', '#10103a47','#bfc17169', 
    '#1c31a93b', '#e88c8c69','#d8d8d6fc',
    '#1c31a95c','#efe5b2'];

    // background image selection array
    bgimages = ['no_image.png','girl-music-hair.png','speaker-colors.png','skull-headphones.png','smile-emoji-1.png',
    'rock-of-mind.png','earth-150.png','blue-woman-150.png','cyandragon-150.png','golden-mic-150.png',
    'pixie-pink-150.png','flaming-guitar-200.png','jam-band-150.png','micro-tech-200.png','cat-rainbow-150.png'];

    // set bgimage from random choice of array 
    bgimage = bgimages[Math.floor(Math.random() * bgimages.length)];

    $('#wb_MediaPlayer1').css('background', colors[Math.floor(Math.random() * colors.length)] + ' url(/img/background/'+bgimage+')' );
    $('#wb_MediaPlayer1').css('background-repeat', 'no-repeat');
    $('#wb_MediaPlayer1').css('background-position', 'bottom right');


    if(jsonSearchResults.results.length == 0){
        
        console.log('%cNo parseSearch results, clearing the deck.', 'color:red');
        
        // return to "Now Playing"
        console.log('%cUpdating banner Now Playing', 'color: green');

        $('.nowplaying-title span').fadeOut(2400, function(){
            
            $(this).text('Now Playing').removeClass('animate-flicker');

        }).fadeIn(2400);

        $('.song-album').fadeOut(1200, function(){
        //    $(this).html('');
        });

        $('.year-label').fadeOut(1200, function(){
            // $(this).html(''); 
        });

        // transitional fade of the image
        $('.thumb-container img').removeClass('flipped').attr('src', 'img/no_image.png');
        $('.thumb-container img').delay(300).addClass('flipped');
    
        $('.summary-container').fadeOut(1200, function(){
            $(this).css("padding", 0);
        });

    
        $('.recording-list-container').fadeOut(1200, function(){
            // $(this).html('');
        })

        $('.active-members').fadeOut(1200, function(){
            // $(this).html(''); // clear relations
        });
        $('.inactive-members').fadeOut(1200, function(){

        });

        $('.artist-wiki').fadeOut(1200, function(){
            // $(this).html('');
        });
        $('.wrap-collapsible-about-releases').fadeOut(1200, function(){
            // $(this).html('');
        });
        $('.wrap-collapsible-releases').fadeOut(1200);

        return;
    }  

    // download the cover_image if one exists in the first 
    // set of results and store in the /img/covers directory
    // based on the id of the release 

    if( jsonSearchResults.results[0].hasOwnProperty('cover_image') ){

        $.post('/keep/index.php', { 
            'action'         : 'cover',
            'data'           : jsonSearchResults.results[0]
        },
            function(results){

                console.log( '%cGot Cover from Keep: ' + results,'color:yellow');     

                $('.thumb-container img').attr('data-path', results ).attr('src', results);
                $('.thumb-container img').attr('data-release_id', jsonSearchResults.results[0].id );

            }
        );
    }


    myResults = jsonSearchResults.results;
    myResults.sort(function(a, b){
            return a.year - b.year;
    });

    console.log('%cRunning parseSearch', 'color: green');
    
    firstRes            = myResults[0];
    var master_id       = firstRes.master_id;   
    var imgUrl          = firstRes.thumb === "" ? firstRes.cover_image : firstRes.thumb;
    var meta            = firstRes.title;
    var artist          = meta.substr(0, meta.indexOf(' - ')).replace(/'~\(.*?\)\s?~'/,'');
    var releaseTitle    = meta.substr(meta.indexOf(' - ') + 3).replace(/[^A-Za-z0-9\s]/g,"").replace(/\s{2,}/g, " ");
    var year            = firstRes.year;
    var label           = firstRes.label[0];
    var resource_url    = firstRes.resource_url;
    var master_url      = firstRes.master_url;
    var url_parts       = imgUrl.replace(/\/\s*$/,'').split('/');
    
    url_parts.shift(); 
    spacer              = url_parts.splice(-1)[0];

    if( spacer === 'spacer.gif' ){
        thumbImg = 'img/no_image.png';
    }else{
        thumbImg = imgUrl;
    }

   
    $('.thumb-container img').fadeOut(600, function(){
        // $(this).attr('src', thumbImg);        
    }).fadeIn(600);
  
    
    $('.song-album').fadeOut(1200, function(){
        $(this).text( releaseTitle );
    }).fadeIn(1200);

    $('.year-label').fadeOut(1200, function(){
        $(this).text(label + (year != null ? ' ('+year+')': '' ) );       
    }).fadeIn(1200);
           
    // return to "Now Playing"
    console.log('%cUpdating banner Now Playing', 'color: green');
    

    // Date check, if Friday and hour between 9pm and 1am 
    // https://hangouts.google.com/call/-I5pvds7WDU_1AyPDchxAEEE

    var d 	        = new Date();
    var day         = d.getDay(); 
    var hour 	    = d.getHours();
    
    // Friday night between 9pm and midnight show Hangouts link and display "Friday Night Live" 
    playingText  = (day == 5 && ( hour > 20 || hour <= 0)) ? 'Friday Night Live Broadcast': 'Now Playing: ' + artist.replace(/\([^()]*\)/g, '');

     $('.nowplaying-title span').fadeOut(2400, function(){       
        $(this).html(playingText).removeClass('animate-flicker');
    }).fadeIn(2400);

    // lookup resource_url for master
    getJSONData( resource_url, parseMaster );
   
}


function parseRelease( jsonReleaseResults ){
    
    
    var recording = {'title' : $title };
    
    jsonReleaseResults.recording = recording;
    jsonReleaseResults.firstRes  = firstRes;
    
    delete jsonReleaseResults['images'];
    delete jsonReleaseResults['community'];
    delete jsonReleaseResults['videos'];
    delete jsonReleaseResults['identifiers'];
    
    // insert releases table
   
    $.post('/keep/index.php', { 
        'action'         : 'release',
        'data'           : jsonReleaseResults
    },
        function( results ){            

            if( results ) {
                
                results = JSON.parse( results );
                if( results.hasOwnProperty('artist_id') ){
               
                    console.log('%cUpdate Keep Release info', 'color: lightblue');
                    console.log('%crecording_title: ' + results.recording_title, 'color:lightblue');
                    console.log('%cartist_id: '+ results.artist_id, 'color:lightblue');
                    console.log('%crelease_id: '+ results.release_id,'color: lightblue');
                    console.log('%cYear: ' + results.released, 'color:lightblue');
                    console.log('%cLabel: ' + results.label, 'color:lightblue');
                    console.log('%cStyles: '+ results.styles, 'color:lightblue');
                    console.log('%cGenres: '+ results.genres, 'color:lightblue');
                    console.log('%cAudio: '+results.type+ ' '+ results.attribute,'color:lightblue');
                }else{
                    
                    console.log('%cERROR: NO results: ' + results , 'color:red');
                }
    
                //  update display for file format
                $('.nerdystats').text(results.attribute);

            }

        }
    ).fail(function(){
        console.log('error');
    });
}
   
/**
 * 
 * @param {*} jsonMasterResults 
 * Parse Master results
 */
function parseMaster( jsonMasterResults ){

    if( jsonMasterResults.hasOwnProperty('resource_url')){
        getJSONData( jsonMasterResults.resource_url, parseRelease );
    }

    console.log('%cRunning parseMaster', 'color: yellow');
     

    // Render tracklist on page
    if( jsonMasterResults.hasOwnProperty('tracklist') ){

        console.log('%cFound track list', 'color: green');

        $('.recording-list-container').fadeOut(function(){

            $(this).html('<div class="header">TRACK LISTING</div><ul></ul>');    

            $.each(jsonMasterResults.tracklist, function(x, track){
                $('.recording-list-container ul').append('<li>'+ track.position.toLowerCase()+ ' ' + track.title + ' - ' + track.duration + '</li>');
                return x < 15;
            });
        }).fadeIn(1200);

    }

    // get the artist object
    artistURL = jsonMasterResults.artists[0].resource_url;
    
    getJSONData(artistURL, parseArtist);

    // about release parser
    releaseWikidata( jsonMasterResults.title,  parseReleaseWiki ) ;
    
}

function parseArtist( jsonArtistResults ){
        
                // shoot the artist to the keep
                $.post('/keep/index.php', { 
                    'artist': jsonArtistResults.name,
                    'discogs_id': jsonArtistResults.id,
                    'action' : 'artist'
                },
                    function(insertID){
                        // console.log( '%cKeep ArtistID: ' + insertID , 'color: lightblue');
                    }
                ).fail(function(){
                    console.log('error');
                });

                // artist-profile insert/update
                if(jsonArtistResults.hasOwnProperty('profile') ) {
                    
                    $.post('/keep/index.php', {
                            'action'  : 'profile',
                            'artist_id': jsonArtistResults.id,
                            'exceprt' : jsonArtistResults.profile
                        },
                    function(insertedID){
                        // console.log('profile ID: ' + insertedID )
                    }).fail(function(){
                        console.log('profile failed!');
                    });
                }

                // members insert statement
                if(jsonArtistResults.hasOwnProperty('members')){
                    $.post('/keep/index.php',{
                        'members' : jsonArtistResults.members,
                        'artist_id': jsonArtistResults.id,
                        'action' : 'members'   
                    },
                    function(insertedIDs){
                        // console.log( 'Member inserts/updates: ' + insertedIDs );
                    }).fail(function(){
                        console.log('members failed!');
                    });
                }

                // console.log( jsonArtistResults.urls );
                
                if( jsonArtistResults.hasOwnProperty('urls')){
                    $.post('/keep/index.php', {
                        'artist_id' : jsonArtistResults.id,
                        'urls'      : jsonArtistResults.urls,
                        'action'    : 'urls'
                    },
                    function(insertedID){
                        // console.log('artist_urls id: ' + insertedID);
                    }).fail(function(){
                        console.log('artist_urls failed!');
                    });

                }

        // MEMBERS
        if(jsonArtistResults.hasOwnProperty('members')){
        
            console.log('%cRunning parseArtist', 'color: green');

            var activeMembers = jsonArtistResults.members.filter(function (item) {
            return item.active == true;
        });
        
        if( activeMembers.length > 0 ){
            
                console.log('%cFound ' + activeMembers.length + ' Active Members', 'color: green');
            
            $('.active-members').fadeOut(1200, function(){
                    $(this).html('<div class="header">MEMBERS</div>');
                    $.each(activeMembers, function(idx, member){
                    //    console.log( member.name);
                    $('.active-members').append('<div>'+ member.name.replace(/ *\([^)]*\) */g, "")+'</div>');
                    return idx < 8;                 
                });
            }).fadeIn(1200);

        } 
    
        var inActiveMembers = jsonArtistResults.members.filter(function (item) {
            return item.active == false;
        });

        if(inActiveMembers.length >0 ){
            console.log('%cFound ' + inActiveMembers.length + ' Inactive Members', 'color: green');
            
            $('.inactive-members').fadeOut(1200, function(){
            
                $(this).html('<div class="header">ALUMNI</div>');
            
                $.each(inActiveMembers, function(idx, member){
                    $('.inactive-members').append('<div>'+ member.name.replace(/ *\([^)]*\) */g, "")+'</div>');
                    return idx < 5;
                });

            }).fadeIn(1200);  
        } 
        
        
    }else{
        
        $('.inactive-members').fadeOut(1200, function(){
            console.log('%cNo inactive members found', 'color: red');
            $(this).html('');
        }).fadeIn(200);

        $('.active-members').fadeOut(1200, function(){
            console.log('%cNo active members found', 'color: red');
            $(this).html('');
        }).fadeIn(200);

    } // hasOwnProp members


    // get Artist releases for discography
    lookupReleases( jsonArtistResults.name, auth, parseReleases);

    // grab play history
    gethistory( parseHistory );

    // wikidata Artst
    Wikidata( jsonArtistResults.name  , parseWikidata );

    $('.nerdlyContainer').fadeIn(2400);

} // parseArtist 


function parseReleaseWiki( releaseTitle , wikiReleaseResults){
    
    if( wikiReleaseResults.length > 50 ){

        console.log('%cFound Wikidata for ' + releaseTitle, 'color: green');
       
        var summaryContent = '<div class="aboutRelease-container">' +
        '<input type="checkbox" class="toggle" id="aboutRelease">' +
        '<label id="lbl-aboutRelease" for="aboutRelease" class="lbl-toggle">About ' + releaseTitle +'</label>' +
        '<div class="collapsible-content"><div class="content-inner">';                
        var summaryContentCloser = '</div></div></div>';
        var summary_array = wikiReleaseResults.split('. ');
        var summary_trunc = summary_array.slice(0, 4).join('. ') + '.';           
        var summary = wikiReleaseResults.length > 2 ? summaryContent + '<div class="summary">'+ summary_trunc + '</div>' + summaryContentCloser :'';       
        
        $('.wrap-collapsible-about-releases').html( summary ); // artist extract 

    }

}


function parseWikidata( artist, wikiresults){
    
    if(wikiresults.length > 100 ){

        console.log('%cFound Wikidata for ' + artist, 'color: green');
        // console.log(wikiresults);
    
        var summaryContent = '<div class="wrap-collapsible summary-container">' +
        '<input type="checkbox" class="toggle" id="summary">' +
        '<label id="lbl-summary" for="summary" class="lbl-toggle">About ' + artist +'</label>' +
        '<div class="collapsible-content"><div class="content-inner">';                
        var summaryContentCloser = '</div></div></div>';
        var summary_array = wikiresults.split('. ');
        var summary_trunc = summary_array.slice(0, 4).join('. ') + '.';           
        var summary = wikiresults.length > 2 ? summaryContent + '<div class="summary">'+ summary_trunc + '</div>' + summaryContentCloser :'';       
        
        $('#artist-wiki').fadeOut(1200, function(){
            $(this).html( summary );
        }).fadeIn(1200); // artist extract 
    
    }else{

        $('#artist-wiki').html();
    }

}

function parseHistory(history){
    listing = '';
    
    $.each(history, function(idx, val){
        
        // Don't include any of the jingles in the history
        if( !(/Hawkwynd Radio/i.test(val)) ){
            listing += '<div class="listing">' + val + '</div>';
        }

    });

    $('.wrap-collapsible-history').fadeOut(1200, function(){
        $(this).html(
            '<input id="collapsible" class="toggle" type="checkbox">' +
            '<label for="collapsible" class="lbl-toggle">Our latest played</label>'+
            '<div class="collapsible-content">'+
            '<div class="content-inner">' +
            listing + '</div>' + '</div>'
            );
        }).fadeIn(1200);

}


function parseReleases(jsonArtistReleases){
    
    console.log('%cRunning parseReleases', 'color:lightgreen');

    myReleases = jsonArtistReleases.results;
    myReleases.sort(function(a, b){
        return a.year - b.year;
    });

    uniqueReleases = removeDumplicateValue(myReleases);
    
    var albums = uniqueReleases.filter(function (release) {
        return (release.country != 'Japan' && release.year != null);
    });
  
    albums = removeDumplicateValue(albums);

    if(albums){

        var listing='';
        
        $.each(albums, function(idx, release){       

            // titleArtist   = release.title.substr(0, release.title.indexOf(' - ')).replace(/[^A-Za-z0-9/\\s]/g," " ).replace(/\s{2,[0-9]}/g, " ");
            titleArtist   = release.title.substr(0, release.title.indexOf(' - '));               
            releaseTitle  = release.title.substr(release.title.indexOf(' - ') + 3);
            label         = release.label[0];
            country       = release.country;
            
            listing +='<div class="listing">'+release.year + ' ' + releaseTitle + ' (' + country + ' - ' + label + ')</div>';
            
        });
        
        
        console.log('%cFound Discography for ' + titleArtist , 'color: lightgreen');

        // Render discography
        $('.wrap-collapsible-releases').fadeOut( 1200, function(){
            $(this).html(
            '<input id="release-collapsible" class="toggle" type="checkbox">' +
            '<label for="release-collapsible" class="lbl-toggle">'+ titleArtist.replace(/ *\([^)]*\) */g, "") + ' discography</label>'+
            '<div class="collapsible-content">'+
              '<div class="content-inner">' + listing + '</div>' +
            '</div>'
            );
        }).fadeIn(1200);


    }else{

        $('.wrap-collapsible-releases').fadeOut(1200, function(){
            console.log('%cNo Discography Found', 'color: red');
            $(this).html('');
        }).fadeIn(200);
    }   

} // parseReleases

function removeDumplicateValue(myArray){ 
    var newArray = [];
  
    $.each(myArray, function(key, value) {
      var exists = false;
      $.each(newArray, function(k, val2) {
        if(value.title == val2.title){ exists = true }; 
      });
      if(exists == false && value.id != "") { newArray.push(value); }
    });
     return newArray;
  }


function getJSONData(resourceUrl, callback) {  
    // console.log('getJSONData ' + resourceUrl );
    $.getJSON( resourceUrl , function (jsonData) {                 
        callback(jsonData);
    });
}

function render(id, value){
    $('.main-container').find('#'+id ).append( value );
}

// Discogs lookup for artist/track
function lookupDiscogs(artist, track, args, callback){

    // exceptions to the rule for artists who don't show up correctly.
    if( artist.indexOf('The B-52') == 0 ) artist = 'The B-52';

    args['artist']  = artist;
    args['q']       = track;
    args['country'] = 'US';
    args['type']    = 'release';
    args['format']  = 'album';

    // console.log(args);
    // console.log(discogsSearch+'?artist='+args['artist']+'&track='+args['track']+'&format='+args['format']+'&key='+args['key']+'&secret='+args['secret']);
    
    $.getJSON(discogsSearch, args).done( function( discogs ){ 
        callback( discogs );
    });   
}

function lookupMaster(mastersURL, args, callback){
    $.getJSON(mastersUrl, args).done( function( master ){
        callback( master );
    });
}

function lookupReleases(artist, args, callback){

    if( artist.indexOf('The B-52') == 0 ) artist = 'The B-52';

    args['artist'] = encodeURI(artist.replace(/ *\([^)]*\) */g, "")); // remove (paren data)
    args['format'] = 'album';
    
    // console.log(discogsSearch+'?artist='+args['artist']+'&format='+args['format']+'&key='+args['key']+'&secret='+args['secret']);

    $.getJSON(discogsSearch+'?artist='+args['artist']+'&format='+args['format']+'&key='+args['key']+'&secret='+args['secret'])
    .done(function( releases ){
        callback( releases );
    });

}


/**
 * 
 * @param {array} callback 
 */
function gethistory( callback ){
    console.log('%cRunning History', 'color:lightblue');
    $.getJSON('history.php').done(function( history ){
        callback( history );
    })
}


function Wikidata(item, callback) {

    console.log('%cRunning Artist Wikidata ' + item , 'color: yellow');

    // Bands exceptions to add (band) to search
    bands =["Rush", "Cinderella", "Boston", "Saga", "Led Zeppelin", "Skid Row", "Styx", "Asia", "Genesis",
            "Scorpions", "Yes","Rainbow","Outlaws","Bad Company", "Kiss", "Kansas" , "Eagles","Chicago",
            "Cake","America","Jambros","War"
    ];

    wp = "https://en.wikipedia.org/w/api.php?";
    aq = "action=query" ;
    t = "&titles=";
    p = "&prop=extracts&exintro&explaintext&exsentences=10";
    r = "&redirects&converttitles" ; // wppage only
    c = "&callback=?" ;// wd|wp
    f = "&format=json" ;// wd|wp
    
    qq = item.replace(/ *\([^)]*\) */g, "");
    qs = qq;

    if(bands.indexOf(qq) != -1){
        // qs = qq+' (band)';
        console.log('%c'+ qs + ' found. ', 'color: green' );
        qs = qq+ ' (band)';
        // console.log(qs);
    }
    

    url = wp+aq+t+ qs + p + r + c + f;  
   
    // console.log( encodeURI(url) );

    $.getJSON(url, function (json) {
        
        var item_id = Object.keys(json.query.pages)[0]; // THIS DO THE TRICK !
        var extract = json.query.pages[item_id].extract;
        var result = extract;      

         if(result) callback( qq , result );

    });

    
}; 

// release Wiki 
function releaseWikidata( releaseTitle , releaseCall) {


    console.log('%cRunning Release Wikidata' + releaseTitle , 'color: yellow');
   
    wp = "https://en.wikipedia.org/w/api.php?";
    aq = "action=query" ;
    t = "&titles=";
    p = "&prop=extracts&exintro&explaintext&exsentences=10";
    r = "&redirects&converttitles" ; // wppage only
    c = "&callback=?" ;// wd|wp
    f = "&format=json" ;// wd|wp
    
    releaseTitle.replace(/ *\([^)]*\) */g, "");

    url = wp+aq+t+ releaseTitle + p + r + c + f;  
   
    // console.log( encodeURI(url) );

    $.getJSON(url, function (json) {
        var item_id = Object.keys(json.query.pages)[0]; // THIS DO THE TRICK !
        var extract = json.query.pages[item_id].extract;

        if(extract){
            releaseCall( releaseTitle, extract );
        }else{
            // clear container
            $('.wrap-collapsible-about-releases').fadeOut(1200, function(){ $(this).html(''); });
        }
    });
} // releaseWikidata() 



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
  function secondsTimeSpanToHMS(s) {
    var h = Math.floor(s/3600); //Get whole hours
    s -= h*3600;
    var m = Math.floor(s/60); //Get remaining minutes
    s -= m*60;
    return h+":"+(m < 10 ? '0'+m : m)+":"+(s < 10 ? '0'+s : s); //zero padding on minutes and seconds
}
