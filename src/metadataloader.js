import { CapacitorMediaStore } from '@odion-cloud/capacitor-mediastore';

export async function loadMusicMetadata() {
  await CapacitorMediaStore.requestPermissions({ types: ['audio'] });
  const result = await CapacitorMediaStore.getMediasByType({
    mediaType: 'audio',
    sortBy: 'TITLE',
    includeExternal: true
  });
  return result.media.map(song => ({
    id: song.id,
    title: song.title,
    artist: song.artist,
    album: song.album,
    duration: song.duration,
    fileType: song.mimeType?.includes('flac') ? 'FLAC' : 'MP3',
    uri: song.uri
  }));
}