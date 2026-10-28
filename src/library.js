// library.js
export const library = {
  tracks: [],
  albums: [],
  types: []
};

export function setTracks(tracks) {
  library.tracks = tracks;
  library.albums = buildAlbums(tracks);
  library.types = buildFileTypes(tracks);
}

function buildAlbums(tracks) {
  const map = {};
  for (const t of tracks) {
    const key = `${t.album}::${t.artist}`;
    if (!map[key]) {
      map[key] = { name: t.album, artist: t.artist, tracks: [] };
    }
    map[key].tracks.push(t);
  }
  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
}

function buildFileTypes(tracks) {
  const counts = {};
  for (const t of tracks) {
    counts[t.fileType] = (counts[t.fileType] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => a.type.localeCompare(b.type));
}