export function isHome(location) {
  return location.type === 'browse' && 
    (location.uri === '/' || location.uri === '');
};

// Based on:
// https://github.com/volumio/Volumio2-UI/blob/master/src/app/browse-music/browse-music.controller.js
export function hasPlayButton(item) {
  if (!item) {
    return false;
  }
  // We avoid that by mistake one clicks on play all NAS or USB, freezing volumio
  if ((item.type === 'folder' && item.uri && item.uri.startsWith('music-library/') && item.uri.split('/').length < 4) ||
    item.disablePlayButton === true) {
    return false;
  }
  const playButtonTypes = [
    'folder',
    'album',
    'artist',
    'song',
    'mywebradio',
    'webradio',
    'playlist',
    'cuesong',
    'remdisk',
    'cuefile',
    'folder-with-favourites',
    'internal-folder'
  ]
  return playButtonTypes.includes(item.type);
}
