// src/folderPicker.js
import { FolderPicker } from 'capacitor-folder-picker';

export async function pickMusicFolder() {
  try {
    const result = await FolderPicker.chooseFolder();
    console.log('Selected folder:', result.value);
    return result.value; // folder path
  } catch (error) {
    console.error('Folder picker cancelled or failed:', error);
    return null;
  }
}