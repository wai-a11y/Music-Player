// main.js
import { pickMusicFolder } from './folderPicker';
import { scanFolder } from './libraryScanner';
import { enrichMetadata } from './metadataLoader';
import { library, setTracks } from './library';

document.getElementById('pickFolderBtn').addEventListener('click', async () => {
  const folder = await pickMusicFolder();
  if (!folder) return;

  const rawFiles = await scanFolder(folder);       // step 1: discover files
  const tracks   = await enrichMetadata(rawFiles); // step 2: read tags
  setTracks(tracks);                               // step 3: build library

  renderLibrary('tracks');
});