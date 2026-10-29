// main.js
import { Filesystem } from '@capacitor/filesystem';
import { enrichMetadata } from './metadataLoader';
import { library, setTracks } from './library';
import {
  playTrack, togglePlayPause, next, previous,
  setVolume, setPlayerCallbacks, toggleShuffle, stop,
  seekTo, getPlaybackInfo, getVolumeLevel
} from './player';
import { appHTML } from './template';

let activeAlbum = null;  // { name, artist, tracks } or null

const AUDIO_EXTENSIONS = ['.mp3', '.flac'];

document.querySelector('#app').innerHTML = appHTML;

const savedPath = localStorage.getItem('musicPath');
if (savedPath) {
  document.getElementById('pathInput').value = savedPath;
}

async function ensureMusicFolder() {
  try {
    await Filesystem.mkdir({
      path: 'Music',
      directory: 'External',
      recursive: true
    });
    console.log('Music folder ready');
  } catch (e) {
    // Folder already exists — that's fine
    console.log('Music folder already exists');
  }
}

ensureMusicFolder();





async function scanRecursive(rootPath) {
  const found = [];

  async function walk(currentPath) {
    const result = await Filesystem.readdir({ path: currentPath });

    for (const entry of result.files) {
      const fullPath = `${currentPath}/${entry.name}`;

      if (entry.type === 'directory') {
        await walk(fullPath);
      } else {
        const lower = entry.name.toLowerCase();
        const ext = lower.slice(lower.lastIndexOf('.'));
        if (AUDIO_EXTENSIONS.includes(ext)) {
          found.push({
            uri: fullPath,
            fileName: entry.name,
            fileType: ext === '.mp3' ? 'MP3' : 'FLAC'
          });
        }
      }
    }
  }

  await walk(rootPath);
  return found;
}

function renderTab(tab) {
  const list = document.getElementById('fileList');
  list.innerHTML = '';

  // Album detail view
  if (activeAlbum) {
    list.innerHTML += `
      <li style="background:none; border:none; padding:8px 4px;">
        <button id="backToAlbums" style="color:var(--accent); font-size:13px;">← Back to albums</button>
        <h3 style="margin:10px 0 4px;">${activeAlbum.name}</h3>
        <small style="color:var(--text-dim);">${activeAlbum.artist} · ${activeAlbum.tracks.length} tracks</small>
      </li>`;
    activeAlbum.tracks.forEach((t) => {
      const globalIdx = library.tracks.indexOf(t);
      list.innerHTML += `
        <li data-index="${globalIdx}" style="cursor:pointer;">
          <strong>${t.title}</strong><br>
          <small>${t.artist} · ${t.fileType} · ${t.duration}s</small>
        </li>`;
    });
    document.getElementById('backToAlbums').addEventListener('click', () => {
      activeAlbum = null;
      renderTab('albums');
    });
    return;
  }

  // Normal tab views
  if (tab === 'tracks') {
    library.tracks.forEach((t, i) => {
      list.innerHTML += `
        <li data-index="${i}" style="cursor:pointer;">
          <strong>${t.title}</strong><br>
          <small>${t.artist} — ${t.album} · ${t.fileType} · ${t.duration}s</small>
        </li>`;
    });
  } else if (tab === 'albums') {
    library.albums.forEach((a, i) => {
      list.innerHTML += `
        <li data-album-index="${i}" style="cursor:pointer;">
          <strong>${a.name}</strong><br>
          <small>${a.artist} · ${a.tracks.length} tracks</small>
        </li>`;
    });
  } else if (tab === 'types') {
    library.types.forEach((t) => {
      list.innerHTML += `
        <li>
          <strong>${t.type}</strong><br>
          <small>${t.count} files</small>
        </li>`;
    });
  }

  document.querySelectorAll('.tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
}

setPlayerCallbacks({
  onTrack: (track) => {
    const artEl = document.querySelector('.np-art');

    if (!track) {
      document.getElementById('npTitle').textContent = 'No track';
      document.getElementById('npArtist').textContent = 'Select a track to begin';
      document.getElementById('npBadge').textContent = '';
      if (artEl) {
        artEl.style.backgroundImage = '';
        artEl.textContent = '🎵';
        artEl.classList.remove('has-art');
      }
      syncRetroUI(null, null);
      return;
    }

    document.getElementById('npTitle').textContent = track.title;
    document.getElementById('npArtist').textContent = `${track.artist} — ${track.album}`;
    document.getElementById('npBadge').textContent = track.fileType;

    if (artEl) {
      if (track.coverArt) {
        artEl.style.backgroundImage = `url(${track.coverArt})`;
        artEl.textContent = '';
        artEl.classList.add('has-art');
      } else {
        artEl.style.backgroundImage = '';
        artEl.textContent = '🎵';
        artEl.classList.remove('has-art');
      }
    }

    syncRetroUI(track, null);   // ← retro sync
  },
  onState: (state) => {
    document.getElementById('playPauseBtn').textContent =
      state === 'playing' ? '⏸' : '▶';

    const retroPlay = document.getElementById('retroPlay');
    const retroDisc = document.querySelector('.retro-disc');
    if (retroPlay) retroPlay.textContent = state === 'playing' ? '⏸' : '▶';
    if (retroDisc) {
      if (state === 'playing') retroDisc.classList.add('spinning');
      else retroDisc.classList.remove('spinning');
    }
  },
  onShuffle: (enabled) => {
    document.getElementById('shuffleBtn').classList.toggle('active', enabled);

    const retroShuffle = document.getElementById('retroShuffle');
    if (retroShuffle) retroShuffle.classList.toggle('active', enabled);
  }
});
document.getElementById('fileList').addEventListener('click', (e) => {
  const albumLi = e.target.closest('li[data-album-index]');
  if (albumLi) {
    const idx = parseInt(albumLi.dataset.albumIndex);
    activeAlbum = library.albums[idx];
    renderTab('albums');
    return;
  }

  const trackLi = e.target.closest('li[data-index]');
  if (trackLi) {
    playTrack(parseInt(trackLi.dataset.index));
  }
});

document.getElementById('playPauseBtn').addEventListener('click', togglePlayPause);
document.getElementById('nextBtn').addEventListener('click', next);
document.getElementById('prevBtn').addEventListener('click', previous);
document.getElementById('volumeSlider').addEventListener('input', (e) => {
  setVolume(parseFloat(e.target.value));
});



// Scan button handler
document.getElementById('scanBtn').addEventListener('click', async () => {
  const status = document.getElementById('status');
  const rootPath = document.getElementById('pathInput').value.trim();
  
  localStorage.setItem('musicPath', rootPath);

  document.getElementById('fileList').innerHTML = '';
  status.textContent = `Scanning ${rootPath}...`;

  try {
    const files = await scanRecursive(rootPath);
    status.textContent = `Found ${files.length} files. Reading metadata...`;

    const tracks = await enrichMetadata(files);
    setTracks(tracks);

    status.textContent = `Loaded ${tracks.length} tracks, ${library.albums.length} albums.`;
    document.getElementById('tabs').style.display = 'flex';
    renderTab('tracks');
  } catch (err) {
    status.textContent = `Error: ${err.message}`;
    console.error('Scan error:', err);
  }
});

setInterval(() => {
  const info = getPlaybackInfo();
  if (!info) return;

  const seekBar = document.getElementById('seekBar');
  const currentTime = document.getElementById('currentTime');

  if (document.activeElement !== seekBar) {
    seekBar.value = info.position;
    const pct = info.duration > 0 ? (info.position / info.duration) * 100 : 0;
    seekBar.style.setProperty('--progress', `${pct}%`);
  }
  currentTime.textContent = formatTime(info.position);
}, 500);

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// VU meter animation
let lastLog = 0;
function animateMeter() {
  const fill = document.getElementById('vuFill');
  if (fill) {
    const level = getVolumeLevel();
    const now = Date.now();
    if (now - lastLog > 1000) {
      console.log('VU level:', level.toFixed(2));
      lastLog = now;
    }
    const percent = Math.min(100, (level / 64) * 100);
    fill.style.width = percent + '%';
  }
  requestAnimationFrame(animateMeter);
}
animateMeter();

// Tab switching
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => renderTab(btn.dataset.tab));
});

// Player button handlers
document.getElementById('fileList').addEventListener('click', (e) => {
  const li = e.target.closest('li[data-index]');
  if (li) playTrack(parseInt(li.dataset.index));
});

document.getElementById('playPauseBtn').addEventListener('click', togglePlayPause);
document.getElementById('nextBtn').addEventListener('click', next);
document.getElementById('prevBtn').addEventListener('click', previous);
document.getElementById('volumeSlider').addEventListener('input', (e) => {
  setVolume(parseFloat(e.target.value));
});

// ← Add these two lines here
document.getElementById('shuffleBtn').addEventListener('click', toggleShuffle);
document.getElementById('stopBtn').addEventListener('click', stop);


document.getElementById('scanBtn').addEventListener('click', async () => {
  const status = document.getElementById('status');
  const rootPath = document.getElementById('pathInput').value.trim();

  document.getElementById('fileList').innerHTML = '';
  status.textContent = `Scanning ${rootPath}...`;

  try {
    const files = await scanRecursive(rootPath);
    status.textContent = `Found ${files.length} files. Reading metadata...`;

    const tracks = await enrichMetadata(files);
    setTracks(tracks);

    status.textContent = `Loaded ${tracks.length} tracks, ${library.albums.length} albums.`;
    document.getElementById('tabs').style.display = 'flex';
    renderTab('tracks');
  } catch (err) {
    status.textContent = `Error: ${err.message}`;
    console.error('Scan error:', err);
  }
});

document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => renderTab(btn.dataset.tab));
});

document.getElementById('seekBar').addEventListener('input', (e) => {
  seekTo(parseFloat(e.target.value));
});

document.getElementById('openLibrary').addEventListener('click', () => {
  document.getElementById('libraryPanel').classList.remove('hidden');
});

document.getElementById('closeLibrary').addEventListener('click', () => {
  document.getElementById('libraryPanel').classList.add('hidden');
});

const libBtn = document.getElementById('openLibrary');
const libPanel = document.getElementById('libraryPanel');
console.log('Btn found:', !!libBtn, 'Panel found:', !!libPanel);

libBtn.addEventListener('click', () => {
  console.log('Click fired');
  libPanel.classList.remove('hidden');
  console.log('Panel classes now:', libPanel.className);
});

// ── Retro layout handlers ──
function syncRetroUI(track, state) {
  const retroTitle = document.getElementById('retroTitle');
  const retroArtist = document.getElementById('retroArtist');
  const retroArt = document.getElementById('retroArt');
  const retroDisc = document.querySelector('.retro-disc');
  const retroPlay = document.getElementById('retroPlay');
  const retroShuffle = document.getElementById('retroShuffle');

  if (!track) {
    retroTitle.textContent = 'No track';
    retroArtist.textContent = 'Select a track to begin';
    retroArt.style.backgroundImage = '';
    retroDisc.classList.remove('spinning');
    retroPlay.textContent = '▶';
    return;
  }

  retroTitle.textContent = track.title;
  retroArtist.textContent = `${track.artist} — ${track.album}`;
  if (track.coverArt) {
    retroArt.style.backgroundImage = `url(${track.coverArt})`;
  } else {
    retroArt.style.backgroundImage = '';
  }

  if (state === 'playing') {
    retroDisc.classList.add('spinning');
    retroPlay.textContent = '⏸';
  } else {
    retroDisc.classList.remove('spinning');
    retroPlay.textContent = '▶';
  }
}

// Call syncRetroUI whenever the player state changes
const originalOnTrack = document.querySelector('#retroTitle');
setInterval(() => {
  const info = getPlaybackInfo();
  if (!info) return;

  // Update retro seek bar + time
  const retroSeek = document.getElementById('retroSeekBar');
  if (retroSeek && document.activeElement !== retroSeek) {
    retroSeek.value = info.position;
    retroSeek.max = info.duration;
  }
  document.getElementById('retroCurrentTime').textContent = formatTime(info.position);
}, 500);

document.getElementById('retroOpenLibrary').addEventListener('click', () => {
  document.getElementById('libraryPanel').classList.remove('hidden');
});

document.getElementById('retroPlay').addEventListener('click', togglePlayPause);
document.getElementById('retroNext').addEventListener('click', next);
document.getElementById('retroPrev').addEventListener('click', previous);
document.getElementById('retroStop').addEventListener('click', stop);
document.getElementById('retroShuffle').addEventListener('click', toggleShuffle);

document.getElementById('retroSeekBar').addEventListener('input', (e) => {
  seekTo(parseFloat(e.target.value));
});

// ── Simulated VU meter ──
let vuPhase = 0;
let vuLastUpdate = 0;
let phaseL = 0;
let phaseR = Math.PI * 1.7;   // start L and R out of phase

let lastVuLog = 0;
function animateVuMeter() {
  const needleL = document.getElementById('vuNeedleL');
  const needleR = document.getElementById('vuNeedleR');
  const info = getPlaybackInfo();

  const logNow = Date.now();
  if (logNow - lastVuLog > 2000) {
    console.log('VU → L:', !!needleL, 'R:', !!needleR, 'playing:', info?.playing);
    lastVuLog = logNow;
  }

  if (!needleL || !needleR) {
    requestAnimationFrame(animateVuMeter);
    return;
  }

  const now = Date.now();

  if (info && info.playing && now - vuLastUpdate > 80) {
    vuLastUpdate = now;
    phaseL += 0.25;
    phaseR += 0.22;
    const levelL = computeLevel(phaseL, 0.4, 0.25, 0.15);
    const levelR = computeLevel(phaseR, 0.42, 0.23, 0.16);
    needleL.style.transform = `rotate(${-30 + levelL * 60}deg)`;
    needleR.style.transform = `rotate(${-30 + levelR * 60}deg)`;
  }

  requestAnimationFrame(animateVuMeter);
}

function computeLevel(phase, baseAmp, shimmerAmp, noiseAmp) {
  const base = Math.sin(phase) * baseAmp;
  const shimmer = Math.sin(phase * 3.7) * shimmerAmp;
  const noise = (Math.random() - 0.5) * noiseAmp;
  return Math.max(0, Math.min(1, 0.5 + base + shimmer + noise));
}

animateVuMeter();

animateVuMeter();

console.log('Folded width:', window.innerWidth);
console.log('Retro display:', getComputedStyle(document.getElementById('retroPlayer')).display);
console.log('NowPlaying display:', getComputedStyle(document.getElementById('nowPlaying')).display);

const retroEl = document.getElementById('retroPlayer');
console.log('retroEl found:', !!retroEl);
if (retroEl) {
  console.log('inline display:', retroEl.style.display);
  console.log('inline cssText:', retroEl.style.cssText);
  console.log('class:', retroEl.className);
}

import { registerPlugin } from '@capacitor/core';

const NativeAudio = registerPlugin('NativeAudio');

document.getElementById('testNativePlay').addEventListener('click', async () => {
  try {
    const track = getCurrentTrack();
    if (!track) {
      alert('No track loaded. Play a track first.');
      return;
    }

    // Stop Howler so it doesn't play over the native service
    if (window.currentHowlerSound) window.currentHowlerSound.stop();

    await NativeAudio.play({ uri: track.uri });
    console.log('Native play started for', track.fileName);
  } catch (err) {
    console.error('Native play error:', err);
    alert('Native play failed: ' + err.message);
  }
});