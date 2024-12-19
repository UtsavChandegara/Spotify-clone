let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";

    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;

}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}`)  // here first i wrote `/${currFolder}/` 
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}`)[1])  // here first i wrote `/${currFolder}/` 
        }
    }

    //play the first song

    //show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs)
         /* here i solve how to remove two different content*/ {
        songUL.innerHTML = songUL.innerHTML + `<li>
                             <img class="invert" src="img/music.svg" alt="">
                             <div class="info">
                                  <div>${song.replaceAll("file://R:/song/NarayanSwamibapu/", " ").replaceAll("%20", " ").replaceAll("%2", " ")}       
                                  </div>
                             </div>
                             <div class="playnow">
                                 <span>Play now</span>
                                 <img class="invert" src="img/play2.svg" alt="">
                             </div>
         
         </li>`;
    }

    //attach an event listener to each song 
    //here i made error about speling in querySelector (querrySelector)
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs;
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("song/" + track) //here first i wrote '/song/'
    // here first i wrote `/${currFolder}/` 
    currentSong.src = `/${currFolder}` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/song`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/song/")) {
            let folder = e.href.split("/").slice(-1)[0]
            //get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/song/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card bg-gray">
                        <div class="play-button play">
                            <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24"
                                class="Svg-sc-ytk21e-0 bneLcE">
                                <!-- Green background -->
                                <circle cx="12" cy="12" r="12" fill="#008000" />
                                <!-- Black play button -->
                                <path
                                    d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"
                                    fill="#000000" />
                            </svg>
                        </div>
                        <img aria-hidden="false" draggable="false" loading="eager"
                            src="/song/${folder}/cover.jpeg"
                            alt="Top Artists of 2024 Global" class="rounded" sizes="(min-width: 1280px) 232px, 192px">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`song/${item.currentTarget.dataset.folder}`);

            playMusic(songs[0])

        })
    })

}


async function main() {

    //get the list of all the song
    await getSongs("song/NarayanSwamibapu/");
    playMusic(songs[0], true)

    //display all the albums on the page
    displayAlbums()

    //attach an event listener to previose, play and next
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"  // here i made "play.svg" as error insted of .src
        }
    })


    //listen for time upade event
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration)
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    //add an event listener to previous
    previous.addEventListener("click", () => {
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    //add an event listener to next
    next.addEventListener("click", () => {
        console.log("Next clicked")
        console.log(currentSong)
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < (songs.length))
        // if here use "> 0" then we can create loop in song list means the list are ended and the start from the top of the list
        {
            playMusic(songs[index + 1])
        }
    })

    //add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volme to", e.target.value, "/100")
        currentSong.volume = parseInt(e.target.value) / 100
    })

    //add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("img/volume.svg")){
            e.target.src = e.target.src.replace("img/volume.svg","img/mute.svg") 
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("img/mute.svg","img/volume.svg") 
            currentSong.volume = .30;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 30;
        }
    })

}
main()
