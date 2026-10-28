// folderPicker.js
<<<<<<< HEAD
// Opens the native Android folder picker and returns the selected folder path.

import { FolderPicker } from 'capacitor-folder-picker';

export async function pickMusicFolder() {
  try {
    const result = await FolderPicker.chooseFolder();
    console.log('Selected folder:', result.value);
    return result.value; // e.g. "/storage/emulated/0/Music"
=======
import { FilePicker } from '@capawesome/capacitor-file-picker';

export async function pickMusicFolder() {
  try {
    const result = await FilePicker.pickDirectory();
    console.log('Selected folder:', result.path);
    return result.path;
>>>>>>> 037867f (Working app: dual layouts, album art, VU meters, brushed metal faceplate)
  } catch (error) {
    console.warn('Folder picker cancelled or failed:', error);
    return null;
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> 037867f (Working app: dual layouts, album art, VU meters, brushed metal faceplate)
