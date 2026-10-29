// player.js





import { Howl, Howler } from 'howler';
import { Capacitor } from '@capacitor/core';
import { library } from './library';


let currentSound = null;
let currentIndex = -1;
let shuffleEnabled = false;        // ← NEW
let onTrackChange = null;
let onStateChange = null;
let onShuffleChange = null;        // ← NEW

// ── VU meter analyser ──
let analyser = null;
const analyserData = new Uint8Array(256);

function initAnalyser() {
  if (analyser) return;
  if (!Howler.ctx) return;

  analyser = Howler.ctx.createAnalyser();
  analyser.fftSize = 256;

  Howler.masterGain.connect(analyser);
  analyser.connect(Howler.ctx.destination);
}

export function setPlayerCallbacks({ onTrack, onState, onShuffle }) {
  onTrackChange = onTrack;
  onStateChange = onState;
  onShuffleChange = onShuffle;     // ← NEW
}

// ← NEW
export function toggleShuffle() {
  shuffleEnabled = !shuffleEnabled;
  onShuffleChange?.(shuffleEnabled);
}

// ← NEW
export function isShuffleEnabled() {
  return shuffleEnabled;
}

export function playTrack(index) {
  if (index < 0 || index >= library.tracks.length) return;

  if (currentSound) currentSound.unload();

  currentIndex = index;
  const track = library.tracks[index];

currentSound = new Howl({
  src: [Capacitor.convertFileSrc(track.uri)],
  html5: true,  
  onload: () => {
    const dur = currentSound.duration();
    document.getElementById('seekBar').max = dur;
    document.getElementById('totalTime').textContent = formatTime(dur);
  },
onplay: () => {
  initAnalyser();  	
  onTrackChange?.(track);
  onStateChange?.('playing');
},
onpause: () => onStateChange?.('paused'),
onend: () => next(),
onloaderror: (id, err) => {
  console.error('Load error:', track.fileName, err);
  onStateChange?.('error');
}
});

  currentSound.play();
}

export function togglePlayPause() {
  if (!currentSound) return;
  if (currentSound.playing()) currentSound.pause();
  else currentSound.play();
}

// MODIFIED to support shuffle
export function next() {
  if (library.tracks.length === 0) return;

  if (shuffleEnabled && library.tracks.length > 1) {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * library.tracks.length);
    } while (newIndex === currentIndex);
    playTrack(newIndex);
  } else {
    playTrack((currentIndex + 1) % library.tracks.length);
  }
}

export function previous() {
  if (library.tracks.length === 0) return;
  playTrack((currentIndex - 1 + library.tracks.length) % library.tracks.length);
}

// ← NEW
export function stop() {
  if (currentSound) {
    currentSound.stop();
    currentSound.unload();
    currentSound = null;
    currentIndex = -1;
  }
  onStateChange?.('stopped');
  onTrackChange?.(null);
}

export function setVolume(value) {
  if (currentSound) currentSound.volume(value);
}

export function getCurrentTrack() {
  return currentIndex >= 0 ? library.tracks[currentIndex] : null;
}

// ... existing exports above (playTrack, togglePlayPause, next, previous, stop, setVolume, getCurrentTrack)



// ... existing exports above (playTrack, togglePlayPause, next, previous, stop, setVolume, getCurrentTrack)

export function seekTo(seconds) {
  if (currentSound) currentSound.seek(seconds);
}

export function getPlaybackInfo() {
  console.log('getPlaybackInfo → currentSound:', !!currentSound,
              'playing:', currentSound ? currentSound.playing() : 'null');
  if (!currentSound) return null;
  return {
    position: currentSound.seek() || 0,
    duration: currentSound.duration() || 0,
    playing: currentSound.playing()
  };
}

export function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function getVolumeLevel() {
  if (!analyser) return 0;

  analyser.getByteTimeDomainData(analyserData);

  let sum = 0;
  for (let i = 0; i < analyserData.length; i++) {
    sum += Math.abs(analyserData[i] - 128);
  }
  return sum / analyserData.length;   // 0 to ~128
}