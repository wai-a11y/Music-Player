// folderPicker.js
// Opens the native Android folder picker and returns the selected folder path.

import { FolderPicker } from 'capacitor-folder-picker';

export async function pickMusicFolder() {
  try {
    const result = await FolderPicker.chooseFolder();
    console.log('Selected folder:', result.value);
    return result.value; // e.g. "/storage/emulated/0/Music"
  } catch (error) {
    console.warn('Folder picker cancelled or failed:', error);
    return null;
  }
}
