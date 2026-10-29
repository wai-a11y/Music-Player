// template.js
export const appHTML = `
  <div id="nowPlaying">
    <div class="np-header">
      <button id="openLibrary" class="icon-btn">📚</button>
      <span id="npBadge" class="badge"></span>
    </div>

    <div class="np-art">🎵</div>

    <div class="np-info">
      <h2 id="npTitle">No track</h2>
      <p id="npArtist">Select a track to begin</p>
    </div>

    <div class="np-progress">
      <span id="currentTime">0:00</span>
      <input id="seekBar" type="range" min="0" max="100" value="0" />
      <span id="totalTime">0:00</span>
    </div>
	
	<div class="vu-meter">
      <div id="vuFill" class="vu-fill"></div>
    </div>

    <div class="np-controls">
      <button id="shuffleBtn" class="secondary">🔀</button>
      <button id="prevBtn">⏮</button>
      <button id="playPauseBtn">▶</button>
      <button id="nextBtn">⏭</button>
      <button id="stopBtn" class="secondary">⏹</button>
	  
    </div>

    <input id="volumeSlider" type="range" min="0" max="1" step="0.01" value="0.8" class="volume" />
  </div>
  
  <div id="retroPlayer">
  <div class="retro-faceplate">
    <div class="retro-brand">WAI AUDIO</div>

    <div class="retro-disc-wrap">
      <div class="retro-disc">
        <div id="retroArt" class="retro-art"></div>
        <div class="retro-disc-hole"></div>
      </div>
    </div>

    <div class="retro-info">
      <h2 id="retroTitle">No track</h2>
      <p id="retroArtist">Select a track to begin</p>
    </div>

    <div class="retro-vu-pair">
  <div class="retro-vu">
    <div class="vu-scale">
      <span>-20</span><span>-10</span><span>-5</span><span>0</span><span>+3</span>
    </div>
    <div class="vu-needle-track">
      <div id="vuNeedleL" class="vu-needle"></div>
    </div>
    <div class="vu-label">L</div>
  </div>

  <div class="retro-vu">
    <div class="vu-scale">
      <span>-20</span><span>-10</span><span>-5</span><span>0</span><span>+3</span>
    </div>
    <div class="vu-needle-track">
      <div id="vuNeedleR" class="vu-needle"></div>
    </div>
    <div class="vu-label">R</div>
  </div>
</div>

    <div class="retro-controls">
      <button id="retroShuffle" class="retro-btn small">🔀</button>
      <button id="retroPrev" class="retro-btn">⏮</button>
      <button id="retroPlay" class="retro-btn large">▶</button>
      <button id="retroNext" class="retro-btn">⏭</button>
      <button id="retroStop" class="retro-btn small">⏹</button>
    </div>

    <div class="retro-progress">
      <span id="retroCurrentTime">0:00</span>
      <input id="retroSeekBar" type="range" min="0" max="100" value="0" />
      <span id="retroTotalTime">0:00</span>
    </div>

    <button id="retroOpenLibrary" class="retro-library-btn">📚 Library</button>
  </div>
</div>


  <div id="libraryPanel" class="hidden">
    <div class="lib-header">
      <button id="closeLibrary" class="icon-btn">✕</button>
      <h2>Library</h2>
    </div>

    <input id="pathInput" type="text"
      value="/storage/emulated/0/Android/data/com.example.mymusic/files/Music" />

    <button id="scanBtn">Scan Folder</button>
    <p id="status">Tap Scan.</p>

    <div id="tabs" style="display:none; gap:8px; margin: 12px 0;">
      <button class="tab active" data-tab="tracks">Tracks</button>
      <button class="tab" data-tab="albums">Albums</button>
      <button class="tab" data-tab="types">File Type</button>
    </div>

    <ul id="fileList"></ul>
  </div>
`;