import { BrowseContentsListItem, BrowseServiceLocation, BrowseSource, BrowseSourceService } from '../../services/BrowseService';

const PLAY_ON_DIRECT_CLICK_TYPES = [
  'song',
  'album',
  'webradio',
  'mywebradio',
  'cuesong'/*,
  'cd' // What's this? Can see in Volumio UI code but not in the backend...Leaving it out until I know how it's actually used
  */
];

export function isPlayOnDirectClick(itemType?: string) {
  if (!itemType) {
    return;
  }
  return PLAY_ON_DIRECT_CLICK_TYPES.includes(itemType);
}

export function isHome(location: BrowseServiceLocation) {
  return location.type === 'browse' &&
    (location.uri === '/' || location.uri === '');
}

export function getServiceByUri(uri: string, browseSources: BrowseSource[]): BrowseSourceService | null {
  if (!uri) {
    return null;
  }

  const matchedSource = browseSources.find((source) => source.uri && uri.startsWith(source.uri));
  if (matchedSource) {
    return {
      name: matchedSource.plugin_name,
      prettyName: matchedSource.plugin_name === 'mpd' ? 'Music Library' : matchedSource.name
    };
  }

  return null;

}

export function getServiceByName(name: string, browseSources: BrowseSource[]): BrowseSourceService | null {
  if (!name) {
    return null;
  }

  const matchedSource = browseSources.find((source) => name === source.plugin_name);
  if (matchedSource) {
    return {
      name: matchedSource.plugin_name,
      prettyName: matchedSource.plugin_name === 'mpd' ? 'Music Library' : matchedSource.name
    };
  }

  return null;

}

// Based on:
// https://github.com/volumio/Volumio2-UI/blob/master/src/app/browse-music/browse-music.controller.js
export function hasPlayButton(item: BrowseContentsListItem) {
  if (!item || !item.type) {
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
  ];
  return playButtonTypes.includes(item.type);
}

export function hasMenu(item: BrowseContentsListItem) {
  const ret = item.type === 'radio-favourites' || item.type === 'radio-category' || item.type === 'spotify-category';
  return !ret;
}

export function canAddToQueue(item: BrowseContentsListItem) {
  const ret = item.type === 'folder' || item.type === 'song' ||
    item.type === 'mywebradio' || item.type === 'webradio' ||
    item.type === 'playlist' || item.type === 'remdisk' ||
    item.type === 'cuefile' || item.type === 'folder-with-favourites' ||
    item.type === 'internal-folder';
  return ret;
}
export function canAddToPlaylist(item: BrowseContentsListItem) {
  const ret = item.type === 'folder' || item.type === 'song' ||
    item.type === 'remdisk' || item.type === 'folder-with-favourites' ||
    item.type === 'internal-folder';
  return ret;
}

export function getItemActions(location: BrowseServiceLocation, item: BrowseContentsListItem) {
  if (!hasMenu(item)) {
    return null;
  }
  const itemActions: {
    icon: string;
    action: string;
  }[] = [];
  if (hasPlayButton(item)) {
    itemActions.push({
      icon: 'play_arrow',
      action: 'play'
    });
  }
  if (canAddToQueue(item)) {
    itemActions.push({
      icon: 'add_to_queue',
      action: (location.type === 'browse' && location.uri === 'playlists') ? 'addPlaylistToQueue' : 'addToQueue'
    });
  }
  if (hasPlayButton(item)) {
    itemActions.push({
      icon: 'playlist_play',
      action: 'clearAndPlay'
    });
  }
  if (canAddToPlaylist(item)) {
    itemActions.push({
      icon: 'playlist_add',
      action: 'addToPlaylist'
    });
  }
  if (location.type === 'browse' && location.browseItem && location.browseItem.type === 'playlist') {
    itemActions.push({
      icon: 'playlist_remove',
      action: 'removeFromPlaylist'
    });
  }
  if (item.type === 'playlist') {
    itemActions.push({
      icon: 'delete_outline',
      action: 'deletePlaylist'
    });
  }
  if (item.type === 'remdisk') {
    itemActions.push({
      icon: 'eject',
      action: 'removeDrive'
    });
  }
  if (item.type === 'folder' || item.type === 'internal-folder') {
    itemActions.push({
      icon: 'sync',
      action: 'updateFolder'
    });
  }
  if (item.type === 'internal-folder') {
    itemActions.push({
      icon: 'folder_delete',
      action: 'deleteFolder'
    });
  }

  if ((item.type === 'song' || item.type === 'folder-with-favourites') && (location.type !== 'browse' || location.uri !== 'favourites') && !item.favourite) {
    itemActions.push({
      icon: 'favorite',
      action: 'addToFavorites'
    });
  }
  if ((location.type === 'browse' && location.uri === 'favourites') || item.favourite) {
    itemActions.push({
      icon: 'favorite_border',
      action: 'removeFromFavorites'
    });
  }
  if (item.type === 'mywebradio-category') {
    itemActions.push({
      icon: 'add',
      action: 'addWebRadio'
    });
  }
  if (item.type === 'mywebradio') {
    itemActions.push({
      icon: 'edit',
      action: 'editWebRadio'
    });
  }
  if (item.type === 'mywebradio' && location.type === 'browse' && location.uri === 'radio/myWebRadio') {
    itemActions.push({
      icon: 'delete',
      action: 'deleteWebRadio'
    });
  }
  if ((location.type !== 'browse' || location.uri !== 'radio/favourites') && (item.type === 'webradio' || item.type === 'mywebradio')) {
    itemActions.push({
      icon: 'favorite',
      action: 'addWebRadioToFavorites'
    });
  }
  if ((location.type === 'browse' && location.uri === 'radio/favourites') && (item.type === 'webradio' || item.type === 'mywebradio')) {
    itemActions.push({
      icon: 'favorite_border',
      action: 'removeWebRadioFromFavorites'
    });
  }
  if (item.type === 'song') {
    itemActions.push({
      icon: 'info',
      action: 'viewInfo'
    });
  }
  return itemActions;
}
