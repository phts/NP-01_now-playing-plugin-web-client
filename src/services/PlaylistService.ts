import EventEmitter from 'events';

export type Playlist = string;

export interface PlaylistItem {
  uri?: string;
  title?: string;
  service?: string | null;
}

export default class PlaylistService extends EventEmitter {

  #socket: SocketIOClient.Socket | null;
  #socketEventHandlers!: {
    connect: () => void;
    reconnect: () => void;
    pushListPlaylist: (data: Playlist[]) => void;
  };
  #playlists!: Playlist[];

  constructor() {
    super();
    this.#socket = null;
    this.#initState();
    this.#initSocketEventHandlers();
  }

  #initState() {
    this.setPlaylists([]);
  }

  #initSocketEventHandlers() {
    this.#socketEventHandlers = {
      connect: this.#handleSocketConnnect.bind(this),
      reconnect: this.#handleSocketConnnect.bind(this),
      pushListPlaylist: this.setPlaylists.bind(this)
    };
  }

  setSocket(socket: SocketIOClient.Socket | null) {
    const oldSocket = this.#socket;
    if (oldSocket === socket) {
      return;
    }
    if (oldSocket) {
      for (const [ event, handler ] of Object.entries(this.#socketEventHandlers)) {
        oldSocket.off(event, handler);
      }
    }
    this.#socket = socket;
    if (this.#socket) {
      for (const [ event, handler ] of Object.entries(this.#socketEventHandlers)) {
        this.#socket.on(event, handler);
      }

      // Reset
      this.#initState();

      if (this.#socket.connected) {
        // Request playlists
        this.#socket.emit('listPlaylist');
      }
    }
  }

  #handleSocketConnnect() {
    if (this.#socket) {
      this.#socket.emit('listPlaylist');
    }
  }

  refreshPlaylists() {
    if (!this.#socket) {
      return;
    }
    this.#socket.emit('listPlaylist');
  }

  setPlaylists(data: Playlist[]) {
    if (this.#playlists !== data) {
      this.#playlists = data;
      this.emit('playlistsChanged', this.#playlists);
    }
  }

  getPlaylists() {
    return this.#playlists;
  }

  addToPlaylist(item: PlaylistItem, playlist: Playlist) {
    if (!this.#socket) {
      return;
    }
    const emitPayload = {
      name: playlist,
      uri: item.uri,
      service: (item.service || null)
    };
    this.#socket.emit('addToPlaylist', emitPayload);
  }

  addQueueToPlaylist(playlist: Playlist) {
    if (!this.#socket) {
      return;
    }
    this.#socket.emit('saveQueueToPlaylist', { name: playlist });
  }

  removeFromPlaylist(item: PlaylistItem, playlist: Playlist) {
    if (!this.#socket) {
      return;
    }
    this.#socket.emit('removeFromPlaylist', {
      name: playlist,
      uri: item.uri,
      service: (item.service || null)
    });
  }

  deletePlaylist(playlist: Playlist) {
    if (!this.#socket) {
      return;
    }
    this.#socket.emit('deletePlaylist', { name: playlist });
  }

  addToFavorites(item: PlaylistItem) {
    if (!this.#socket) {
      return;
    }
    if (item && item.uri) {
      this.#socket.emit('addToFavourites', {
        uri: item.uri,
        title: item.title,
        service: (item.service || null)
      });
    }
  }

  removeFromFavorites(item: PlaylistItem) {
    if (!this.#socket) {
      return;
    }
    if (item && item.uri) {
      this.#socket.emit('removeFromFavourites', {
        uri: item.uri,
        service: (item.service || null)
      });
    }
  }

  addWebRadio(item: PlaylistItem) {
    if (!this.#socket) {
      return;
    }
    if (item && item.title && item.uri) {
      this.#socket.emit('addWebRadio', {
        name: item.title,
        uri: item.uri
      });
    }
  }

  editWebRadio(item: PlaylistItem) {
    if (!this.#socket) {
      return;
    }
    this.addWebRadio(item);
  }

  deleteWebRadio(item: PlaylistItem) {
    if (!this.#socket) {
      return;
    }
    if (item && item.title) {
      this.#socket.emit('removeWebRadio', {
        name: item.title
      });
    }
  }

  addWebRadioToFavorites(item: PlaylistItem) {
    if (!this.#socket) {
      return;
    }
    this.addToFavorites(item);
  }
  removeWebRadioFromFavorites(item: PlaylistItem) {
    if (!this.#socket) {
      return;
    }
    this.removeFromFavorites(item);
  }

  on(event: 'playlistsChanged', listener: (data: Playlist[]) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}
