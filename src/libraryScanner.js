// src/libraryScanner.js
import { Filesystem, Directory } from '@capacitor/filesystem';

const AUDIO_EXTENSIONS = ['.mp3', '.flac'];

export async function scanFolder(folderPath) {
  const tracks = [];

  async function walk(path) {
    const result = await Filesystem.readdir({ path, directory: Directory.External });
    for (const entry of result.files) {
      const fullPath = `${path}/${entry.name}`;
      if (entry.type === 'directory') {
        await walk(fullPath); // recurse into subfolders
      } else {
        const ext = entry.name.toLowerCase().slice(entry.name.lastIndexOf('.'));
        if (AUDIO_EXTENSIONS.includes(ext)) {
          tracks.push({
            uri: fullPath,
            fileName: entry.name,
            fileType: ext === '.mp3' ? 'MP3' : 'FLAC',
            // metadata added later
          });
        }
      }
    }
  }

  await walk(folderPath);
  return tracks;
}