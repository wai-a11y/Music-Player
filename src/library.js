// library.js
// Holds the in-memory music library and provides grouping logic.

export const library = {
  tracks: [],
  albums: [],
  types: []
};

/**
 * Replaces the current library contents with a new set of tracks.
 * Automatically rebuilds the album and file-type groupings.
 */
export function setTracks(tracks) {
  library.tracks = tracks;
  library.albums = buildAlbums(tracks);
  library.types = buildFileTypes(tracks);
}

/**
 * Groups tracks by album + artist so that two albums with the same name
 * but different artists stay separate.
 */
function buildAlbums(tracks) {
  const map = {};
  for (const t of tracks) {
    const key = `${t.album}::${t.artist}`;
    if (!map[key]) {
      map[key] = { name: t.album, artist: t.artist, tracks: [] };
    }
    map[key].tracks.push(t);
  }
  // Sort albums alphabetically by name
  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Counts how many tracks belong to each file type (MP3, FLAC, etc.)
 */
function buildFileTypes(tracks) {
  const counts = {};
  for (const t of tracks) {
    counts[t.fileType] = (counts[t.fileType] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => a.type.localeCompare(b.type));
}

/**
 * Convenience lookup: find a track by its URI.
 */
export function findTrackByUri(uri) {
  return library.tracks.find(t => t.uri === uri) || null;
}

/**
 * Returns all tracks for a given album name + artist.
 */
export function getTracksForAlbum(albumName, artist) {
  return library.tracks.filter(
    t => t.album === albumName && t.artist === artist
  );
}