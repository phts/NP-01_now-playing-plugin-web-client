import EventEmitter from "eventemitter3";

export default class PlaylistService {
  constructor(socket) {
    this.socket = socket;
    this.init();
  }

  init() {
    this.emitter = new EventEmitter();
    this.setPlaylists([]);
    if (this.socket) {
      this.socketListPlaylistHandler = this.setPlaylists.bind(this);
      this.socket.on('pushListPlaylist', this.socketListPlaylistHandler);
      this.socket.emit('listPlaylist');
    }
  }

  destroy() {
    if (this.socket && this.socketListPlaylistHandler) {
      this.socket.off('pushListPlaylist', this.socketListPlaylistHandler);
    }
    this.socket = null;
    this.emitter.removeAllListeners();
    this.emitter = null;
    this.setPlaylists(null);
  }

  on(event, handler) {
    this.emitter.on(event, handler);
  }

  off(event, handler) {
    this.emitter.off(event, handler);
  }

  refreshPlaylists() {
    if (!this.socket) {
      return;
    }
    this.socket.emit('listPlaylist');
  }

  setPlaylists(data) {
    if (this.playlists !== data) {
      this.playlists = data;
      if (this.emitter) {
        this.emitter.emit('playlistsChanged', this.playlists);
      }
    }
  }

  getPlaylists() {
    return this.playlists;
  }

  addToPlaylist(item, playlist) {
    if (!this.socket) {
      return;
    }
    const emitPayload = {
      name: playlist,
      uri: item.uri,
      service: (item.service || null)
    };
    this.socket.emit('addToPlaylist', emitPayload);
  }

  addQueueToPlaylist(playlist) {
    if (!this.socket) {
      return;
    }
    this.socket.emit('saveQueueToPlaylist', { name: playlist });
  }

  removeFromPlaylist(item, playlist) {
    if (!this.socket) {
      return;
    }
    this.socket.emit('removeFromPlaylist', {
      name: playlist,
      uri: item.uri,
      service: (item.service || null)
    });
  }

  deletePlaylist(playlist) {
    if (!this.socket) {
      return;
    }
    this.socket.emit('deletePlaylist', { name: playlist });
  }

  addToFavorites(item) {
    if (!this.socket) {
      return;
    }
    if (item && item.uri) {
      this.socket.emit('addToFavourites', {
        uri: item.uri,
        title: item.title,
        service: (item.service || null)
      });
    }
  }

  removeFromFavorites(item) {
    if (!this.socket) {
      return;
    }
    if (item && item.uri) {
      this.socket.emit('removeFromFavourites', {
        uri: item.uri,
        service: (item.service || null)
      });
    }
  }

  addWebRadio(item) {
    if (!this.socket) {
      return;
    }
    if (item && item.title && item.uri) {
      this.socket.emit('addWebRadio', {
        name: item.title,
        uri: item.uri
      });
    }
  }

  editWebRadio(item) {
    if (!this.socket) {
      return;
    }
    this.addWebRadio(item);
  }

  deleteWebRadio(item) {
    if (!this.socket) {
      return;
    }
    if (item && item.title) {
      this.socket.emit('removeWebRadio', {
        name: item.title
      });
    }
  }

  addWebRadioToFavorites(item) {
    if (!this.socket) {
      return;
    }
    this.addToFavorites(item);
  }
  removeWebRadioFromFavorites(item) {
    if (!this.socket) {
      return;
    }
    this.removeFromFavorites(item);
  }
}
