// libraryScanner.js
import { ScopedStorage } from '@daniele-rolli/capacitor-scoped-storage';

const AUDIO_EXTENSIONS = ['.mp3', '.flac'];

/**
 * Scans a folder for audio files.
 * @param {object} folder - The folder object returned by ScopedStorage.pickFolder()
 *                          (e.g., { id: "...", name: "Music" }).
 * @returns {Promise<Array>} List of audio file descriptors.
 */
export async function scanFolder(folder) {
  const files = [];

  async function walk(currentPath) {
    // Pass the SAME folder object through every recursive call.
    const { entries } = await ScopedStorage.readdir({
      folder: folder,
      path: currentPath
    });

    for (const entry of entries) {
      const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;

      if (entry.isDir) {
        await walk(entryPath);
      } else {
        const lowerName = entry.name.toLowerCase();
        const ext = lowerName.slice(lowerName.lastIndexOf('.'));

        if (AUDIO_EXTENSIONS.includes(ext)) {
          files.push({
            uri: entryPath,
            fileName: entry.name,
            fileType: ext === '.mp3' ? 'MP3' : 'FLAC'
          });
        }
      }
    }
  }

  // Start from the root of the picked folder.
  await walk('');
  return files;
}