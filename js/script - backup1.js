/*
    Author: Miguel Belmonte
    creation date: 27/12/2019
    last update date: 27/12/2019
*/
"use strict";

// variables
let player;
let songs;
let currentSong;
let songList;
let reader;
let playBtn;
let songView;
let lastSong;
let xmlHttp;
const apiKey = "024eac067975d805c98bc0a4a3d1f857";
let seekbar;
let duration;

// script body
window.addEventListener("load", ()=>{
    // initializating variables
    player = new Audio();
    songs = [];
    currentSong = -1;
    lastSong = currentSong;
    playBtn = document.getElementById("play");
    songList = document.getElementById("songList");
    songView = document.getElementById("songView");
    reader = new FileReader();
    xmlHttp = createXMLHTTP();
    seekbar = document.getElementById("seekbar");
    duration = Array.from(document.querySelector("#seekbar-container > h3").children); // [0]=currentTime, [1]=duration

    // events
    if(window.addEventListener){
        document.getElementById("btnPicker").addEventListener("click", function(){
            document.getElementById("songPicker").click();
        }, false);
        document.getElementById("songPicker").addEventListener("change", uploadSongs, false);
        reader.addEventListener("load", function() {
            try {
                player.src = this.result;
                player.controls = true;
                player.play();
                playBtnPlay();
            } catch(e){
                console.log("err: "+e);
            }
            
        }, false);
        player.addEventListener("ended",function(){
            if(currentSong < songs.length-1){
                playSong(++currentSong);
            } else {
                playSong(currentSong=0);
            }
        },false);
        document.getElementById("last").addEventListener("click",function(){
            if(currentSong > 0){
                playSong(--currentSong);
            }
        }, false);
        document.getElementById("backward").addEventListener("click",function(){
            if(player.currentTime > 0){
                player.currentTime-=15;
            }
        }, false);
        document.getElementById("forward").addEventListener("click",function(){
            if(player.currentTime < player.duration){
                player.currentTime += 15;
            }
        }, false);
        document.getElementById("next").addEventListener("click",function(){
            if(currentSong < songs.length-1){
                playSong(++currentSong);
            }
        }, false);
        document.getElementById("reload").addEventListener("click",function(){
            if(player.duration > 0){
                player.currentTime = 0;
                if(player.paused){
                    playBtnPlay();
                }
            }
        }, false);
        document.getElementById("volume").addEventListener("change",function(){
            player.volume = this.value;
        } ,false);
        player.addEventListener("loadedmetadata",function(){
            seekbar.max = this.duration;
            duration[1].innerText = timeFormat(this.duration);
        },false);
        seekbar.addEventListener("change",function(){ // cuando se termina de hacer slide sobre el input range
            player.currentTime = this.value;
        },false);
        seekbar.addEventListener("input",function(){ // cuando se hace slide sobre el input range
            duration[0].innerText = timeFormat(this.value);
        },false);
        player.addEventListener("timeupdate",function(){
            seekbar.value = this.currentTime;
            duration[0].innerText = timeFormat(this.currentTime);
        },false);
    } else {
        // internet explorer
        document.getElementById("btnPicker").attachEvent("onclick", function(){
            document.getElementById("songPicker").click();
        });
        document.getElementById("songPicker").attachEvent("onchange", uploadSongs);
        reader.attachEvent("onload", function(e) {
            try {
                player.src = this.result;
                player.controls = true;
                player.play();
                playBtnPlay();
            } catch(e){
                console.log("err: "+e);
            }
            
        });
        player.attachEvent("onended",function(){
            if(currentSong < songs.length-1){
                playSong(++currentSong);
            } else {
                playSong(currentSong=0);
            }
        });
        document.getElementById("last").attachEvent("onclick",function(){
            if(currentSong > 0){
                playSong(--currentSong);
            }
        });
        document.getElementById("backward").attachEvent("onclick",function(){
            if(player.currentTime > 0){
                player.currentTime-=15;
            }
        });
        document.getElementById("forward").attachEvent("onclick",function(){
            if(player.currentTime < player.duration){
                player.currentTime += 15;
            }
        });
        document.getElementById("next").attachEvent("onclick",function(){
            if(currentSong < songs.length-1){
                playSong(++currentSong);
            }
        });
        document.getElementById("reload").attachEvent("onclick",function(){
            if(player.duration > 0){
                player.currentTime = 0;
                if(player.paused){
                    playBtnPlay();
                }
            }
        });
        document.getElementById("volume").attachEvent("onchange",function(){
            player.volume = this.value;
        });
        player.attachEvent("onloadedmetadata",function(){
            seekbar.max = this.duration;
            duration[1].innerText = timeFormat(this.duration);
        });
        seekbar.attachEvent("onchange",function(){ // cuando se termina de hacer slide sobre el input range
            player.currentTime = this.value;
        });
        seekbar.attachEvent("oninput",function(){ // cuando se hace slide sobre el input range
            duration[0].innerText = timeFormat(this.value);
        });
        player.attachEvent("ontimeupdate",function(){
            seekbar.value = this.currentTime;
            duration[0].innerText = timeFormat(this.currentTime);
        });
    }
    
});

// functions
/*
    Handling the change event of file input with id songPicker.
    This reads the files uploaded and validate them.
    Valid ones will be added to songs array and added to the songs list
*/
function uploadSongs(e){
    let evento = e || window.event;
    if(evento.target.files.length > 0){
        for(const [i,song] of Object.entries(evento.target.files)){
            if(validateFile(song.name) && notRepeated(song.name)){
                songs.push(song);
                listSong(formatedName(song.name));
            }
        }
        // console.log(songs);
    }
}

/**
 * Validates the file by extension
 * @param name string
 */
function validateFile(name){
    let validExtensions = ["mp3"]; // valid extensions
    let extension = name.substring(name.lastIndexOf(".")+1).toLowerCase();
    return validExtensions.includes(extension);
}

/**
 * Validates that the file is not in songs arrays yet
 * @param name string
 */
function notRepeated(name){
    for (const song of songs) {
        if(!song.name.localeCompare(name)){
            return false;
        }
    }
    return true;
}

/**
 * Appends the li element with the song name to the songList ul element
 * @param name string 
 */
function listSong(name){
    let li = document.createElement("li");
    let span = document.createElement("span");
    span.innerText = name;
    li.appendChild(span);
    li.setAttribute("id", `song${songs.length-1}`);
    if(li.addEventListener){
        li.addEventListener("click", pickSong, false);
    } else {
        li.attachEvent("onclick", pickSong);
    }
    songList.appendChild(li);
}

/**
 * Pick a song from the songList ul element
 */
function pickSong(){
    playSong(parseInt(this.id.substr(4)));
}

/**
 * Plays a song
 * save the current song into the currentSong variable and load it
 * also loads the songView, the song name and lyrics
 * @param i number
 */
function playSong(i){
    unselectSong();
    currentSong = i;
    lastSong = currentSong;
    try {
        reader.readAsDataURL(songs[currentSong]);
    } catch(e){
        console.log("err: "+e);
    }
    
    document.getElementById(`song${currentSong}`).classList.add("selected");
    let name = formatedName(songs[currentSong].name);
    songView.querySelector("header > h3").innerText = name;
    // cargar lyrics aqui
    name = name.split("-");
    for(let i in name){
        name[i] = name[i].trim();
    }
    getTrackID(...name);
}

/**
 * return the formated name, without extensions, parenthesis or underscores
 * @param name string
 */
function formatedName(name){
    name = name.substring(0, name.lastIndexOf("."));
    if(name.indexOf("(") > 0){
        name = name.substring(0, name.indexOf("("));
    }
    name = name.replace(/_/g, " ");
    return name;  
}

function getTrackID(artist, track){
    if(track){
        xmlHttp.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200){
                let info = JSON.parse(this.responseText).message.body.track_list;
                if(info.length > 0){
                    info = info[0].track;
                    document.getElementById("album_name").innerText = "Album: "+info.album_name;
                    getLyrics(info.track_id);
                } else {
                    document.getElementById("album_name").innerText = "No ha sido posible extraer la información necesaria del título de la canción";
                }
            }
        }
        xmlHttp.open("get", `https://cors-anywhere.herokuapp.com/http://api.musixmatch.com/ws/1.1/track.search?q_artist=${artist}&q_track=${track}&apikey=${apiKey}`, true);
        xmlHttp.send();
    }
}

function getLyrics(track_id){
        xmlHttp.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200){
                let lyrics = JSON.parse(this.responseText).message.body.lyrics;
                if(lyrics){
                    lyrics = lyrics.lyrics_body;
                    document.getElementById("lyrics").innerText = lyrics;
                } else {
                    document.getElementById("lyrics").innerText = "No ha sido posible localizar la letra de esta canción";
                } 
            }
        }
        xmlHttp.open("get", `https://cors-anywhere.herokuapp.com/http://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=${track_id}&apikey=${apiKey}`, true);
        xmlHttp.send();
}

function createXMLHTTP(){
    let obj;
    if(window.XMLHttpRequest){
        obj = new XMLHttpRequest();
    } else if(window.ActiveXObject){
        try {
            obj = new ActiveXObject("MSXML2.XMLHTTP");
        } catch(e) {
            obj = new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
    return obj;
}

/**
 * Remove selected class from the previous currentSong
 */
function unselectSong(){
    if(lastSong > -1){
        document.getElementById(`song${lastSong}`).classList.remove("selected");
    }
}

/**
 * Looks for playBtn playing state, if not, toggles into playing state
 */
function playBtnPlay(){
    if(playBtn.children[0].classList.contains("fa-play")){
        if(player.paused){
            player.play();
        }
        playToggle();
        playBtn.onclick = playBtnPause;
    }
}

/**
 * Looks for playBtn paused state, if not, toggles into paused state
 */
function playBtnPause(){
    if(playBtn.children[0].classList.contains("fa-pause")){
        if(!player.paused){
            player.pause();
        }
        playToggle();
        playBtn.onclick = playBtnPlay;
    }
}

/**
 * Toggle playBtn between playing state and paused state
 */
function playToggle(){
    playBtn.children[0].classList.toggle("fa-pause");
    playBtn.children[0].classList.toggle("fa-play");
}


/**
 * Format a number of seconds to
 *  - m:ss
 *  - h:mm:ss (if hour > 0)
 * @param sec number
 */
function timeFormat(seconds) {
    let hours = Math.floor(seconds/60/60);
    seconds -= hours*60*60;
    let minutes = Math.floor(seconds/60);
    seconds -= minutes*60
    seconds = Math.floor(seconds);
    seconds = (seconds > 9) ? seconds : "0" + seconds;
    if (hours > 0) {
        return hours + ":" + ((minutes > 9) ? minutes : "0" + minutes) + ":" + seconds;
    }
    return minutes + ":" + seconds;
}