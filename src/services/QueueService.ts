import EventEmitter from 'events';
import { BrowseContentsList, BrowseContentsListItem } from './BrowseService';

export interface QueueItem {
  title?: string;
  album?: string;
  artist?: string;
  albumart?: string;
  duration?: string;
  name?: string;
  service?: string;
  uri?: string;
}

const PLAY_ENTIRE_LIST_TYPES = [
  'song'
];

export default class QueueService extends EventEmitter {

  #socket: SocketIOClient.Socket | null;
  #socketEventHandlers!: {
    connect: () => void;
    reconnect: () => void;
    pushQueue: (data: QueueItem[]) => void;
  };
  #queue!: QueueItem[];

  constructor() {
    super();
    this.#socket = null;
    this.#initState();
    this.initSocketEventHandlers();
  }

  #initState() {
    this.#setQueue([]);
  }

  initSocketEventHandlers() {
    this.#socketEventHandlers = {
      connect: this.#handleSocketConnnect.bind(this),
      reconnect: this.#handleSocketConnnect.bind(this),
      pushQueue: this.#setQueue.bind(this)
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
        // Request queue
        this.#socket.emit('getQueue');
      }
    }
  }

  #handleSocketConnnect() {
    if (this.#socket) {
      this.#socket.emit('getQueue');
    }
  }

  #setQueue(data: QueueItem[]) {
    if (this.#queue !== data) {
      this.#queue = data;
      this.emit('queueChanged', this.#queue);
    }
  }

  getQueue() {
    return this.#queue;
  }

  play(item: BrowseContentsListItem, list: BrowseContentsList, itemIndex: number) {
    if (!this.#socket) {
      return;
    }
    if (item.type === 'cuesong') {
      this.#socket.emit('addPlayCue', {
        uri: item.uri,
        number: item.number,
        service: (item.service || null)
      });
    }
    else if (item.type === 'playlist') {
      this.#socket.emit('playPlaylist', {
        name: item.title
      });
    }
    else if (item.type) {
      if (PLAY_ENTIRE_LIST_TYPES.includes(item.type) && list && itemIndex !== undefined) {
        this.#socket.emit('playItemsList', {
          item,
          list: list.items,
          index: itemIndex
        });
      }
      else {
        this.#socket.emit('playItemsList', { item });
      }
    }
  }

  playQueue(position = 0) {
    if (!this.#socket) {
      return;
    }
    this.#socket.emit('play', { value: position });
  }

  addToQueue(item: BrowseContentsListItem, isPlaylist = false) {
    if (!this.#socket) {
      return;
    }
    if (!isPlaylist) {
      this.#socket.emit('addToQueue', {
        uri: item.uri,
        title: item.title,
        albumart: (item.albumart || null),
        service: (item.service || null)
      });
    }
    else {
      this.#socket.emit('enqueue', {name: item.title});
    }
  }

  removeFromQueue(position: number) {
    if (!this.#socket) {
      return;
    }
    this.#socket.emit('removeFromQueue', { value: position });
  }

  clearQueue() {
    if (!this.#socket) {
      return;
    }
    this.#socket.emit('clearQueue');
  }

  clearAndPlay(item: BrowseContentsListItem | QueueItem) {
    if (!this.#socket) {
      return;
    }
    this.#socket.emit('replaceAndPlay', {
      uri: item.uri,
      title: item.title,
      albumart: (item.albumart || null),
      service: (item.service || null)
    });
  }
}
