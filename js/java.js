const cover = document.getElementById('cover');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const prevBtn = document.getElementById('prev-btn');
const playPauseBtn = document.getElementById('play-btn');
const nextBtn = document.getElementById('next-btn');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const playlistContainer = document.getElementById('playlist-container');
const songsList = document.getElementById('songs-list');
const volumeSlider = document.getElementById('volume-slider');
const searchInput = document.getElementById('search-song');

const audio = new Audio();// El reproductor
let songs = []; // lista de canciones cargadas del JSON
let currentSongIndex = 0; //para indicar que cancion esta activa


const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const source = audioCtx.createMediaElementSource(audio);
const analyser = audioCtx.createAnalyser();

source.connect(audioCtx.destination);

analyser.fftSize = 64;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);


//  Carga de datos del JSON
fetch('canciones.json')
    .then(response => response.json())
    .then(data => {
        songs = data;
        loadSong(currentSongIndex);
         displayPlaylist();
        console.log("Canciones cargadas correctamente:", songs);
    })
    .catch(error => console.error("Error al cargar el JSON:", error));

//  funcion para cargar una canción en el reproductor
function loadSong(index) { 
    const song = songs[index];
    
    // Actualizar textos e imagen
    songTitle.innerText = song["song-title"];
    songArtist.innerText = song["song-artist"];
    cover.src = song.Imagen;
    // Actualizar archivo de audio
    audio.src = song.url;
}

//  Eventos de Control (Play/Pause)
playPauseBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    audioCtx.resume();
    playPauseBtn.innerText = '⏸';
  } else {
    audio.pause();
    audioCtx.resume();
    playPauseBtn.innerText = '▶';
  }
});

//  Navegacion (Next/Prev)
// funcion que centraliza todo lo necesario para reproducir la cancion
function playAudio() {
  audio.play();
  audioCtx.resume();
  playPauseBtn.innerText = '⏸';
} 

//boton next 
nextBtn.addEventListener('click', () => {
    currentSongIndex++;
    if (currentSongIndex > songs.length - 1) {
        currentSongIndex = 0;
    }
    loadSong(currentSongIndex);
    displayPlaylist();
    playAudio();
});
//boton prev
prevBtn.addEventListener('click', () => {
    currentSongIndex--;
    if (currentSongIndex < 0) {
        currentSongIndex = songs.length - 1;
    }
    loadSong(currentSongIndex);
    displayPlaylist();
    playAudio();
});

//para reproducir la cancion al terminar 
audio.addEventListener('ended', () => {
  currentSongIndex++;

  if (currentSongIndex > songs.length - 1) {
    currentSongIndex = 0; 
  }

  loadSong(currentSongIndex);
  displayPlaylist();
  playAudio(); 
});

//  Barra de Progreso y Tiempo
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${progressPercent}%`;

        // Formatear minutos y segundos
        let curMin = Math.floor(audio.currentTime / 60);
        let curSec = Math.floor(audio.currentTime % 60);

        let durMin = Math.floor(audio.duration / 60);
        let durSec = Math.floor(audio.duration % 60);

        if (curSec < 10) curSec = `0${curSec}`;
        if (durSec < 10) durSec = `0${durSec}`;

        currentTimeEl.innerText = `${curMin}:${curSec}`;
        durationEl.innerText = `${durMin}:${durSec}`;
    }
});

//para arrastrar la barra
let isDragging = false;

progressContainer.addEventListener('mousedown', () => {
  isDragging = true;
});
document.addEventListener('mouseup', () => {
  isDragging = false;
});
progressContainer.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
 const rect = progressContainer.getBoundingClientRect();
 const moveX = e.clientX - rect.left;
 const width = rect.width;
  audio.currentTime = (moveX / width) * audio.duration;
});

// para hacer clic en la barra para saltar a un punto de la canción
progressContainer.addEventListener('click', (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    audio.currentTime = (clickX / width) * audio.duration;
});

//para sincronizar UI con el estado de reproductor
function displayPlaylist(filter = '') {
    songsList.innerHTML = '';

    songs.forEach((song, index) => {
        const text = `${song["song-title"]} ${song["song-artist"]}`.toLowerCase();

        if (!text.includes(filter.toLowerCase())) return;

        const li = document.createElement('li');
        li.innerText = `${song["song-title"]} - ${song["song-artist"]}`;

        if (index === currentSongIndex) {
            li.classList.add('active');
        }

        li.addEventListener('click', () => {
            currentSongIndex = index;
            loadSong(currentSongIndex);
            playAudio();
            displayPlaylist(filter);
        });

        songsList.appendChild(li);
    });
}
//BARRA DE VOLUMEN//
//carga volumen guardado
const savedVolume = localStorage.getItem("playerVolume");
audio.volume = savedVolume !== null ? savedVolume : 0.5;
volumeSlider.value = audio.volume;

// guardar cambios
volumeSlider.addEventListener("input", (e) => {
  audio.volume = e.target.value;
  localStorage.setItem("playerVolume", e.target.value);
});    




//SOPORTE PARA MOVIL// 
progressContainer.addEventListener('touchstart', () => {
  isDragging = true;
});

document.addEventListener('touchend', () => {
  isDragging = false;
});
progressContainer.addEventListener('touchmove', (e) => {
  if (!isDragging) return;

  const rect = progressContainer.getBoundingClientRect();
  const touchX = e.touches[0].clientX - rect.left;
  audio.currentTime = (touchX / rect.width) * audio.duration;
});

//--------------------------//
searchInput.addEventListener('input', (e) => {
    const value = e.target.value;
    displayPlaylist(value);
});
