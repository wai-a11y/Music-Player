// metadataLoader.js
import { Filesystem } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { parseBlob } from 'music-metadata';

export async function enrichMetadata(files) {
  const tracks = [];

  for (const file of files) {
    try {
      const fileUrl = Capacitor.convertFileSrc(file.uri);
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const metadata = await parseBlob(blob);

      // Extract embedded cover art (first picture, if any)
      let coverArt = null;
      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const picture = metadata.common.picture[0];
        const base64 = uint8ArrayToBase64(picture.data);
        coverArt = `data:${picture.format};base64,${base64}`;
      }

      tracks.push({
        ...file,
        title: metadata.common.title || stripExt(file.fileName),
        artist: metadata.common.artist || 'Unknown Artist',
        album: metadata.common.album || 'Unknown Album',
        duration: Math.round(metadata.format.duration || 0),
        coverArt
      });
    } catch (err) {
      console.warn(`Metadata failed for ${file.fileName}:`, err);
      tracks.push({
        ...file,
        title: stripExt(file.fileName),
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        duration: 0,
        coverArt: null
      });
    }
  }

  return tracks;
}

function stripExt(name) {
  return name.replace(/\.[^.]+$/, '');
}

function uint8ArrayToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}