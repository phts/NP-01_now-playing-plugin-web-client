const PLAY_ENTIRE_LIST_TYPES = [
  'song'
];

export default class QueueService {
  constructor(socket) {
    this.socket = socket;
  }

  play(item, list, itemIndex) {
    if (!this.socket) {
      return;
    }
    if (item.type === 'cuesong') {
      this.socket.emit('addPlayCue', {
        uri: item.uri,
        number: item.number,
        service: (item.service || null)
      });
    }
    else if (item.type === 'playlist') {
      this.socket.emit('playPlaylist', {
        name: item.title
      });
    }
    else {
      if (PLAY_ENTIRE_LIST_TYPES.includes(item.type) && list && itemIndex !== undefined) {
        this.socket.emit('playItemsList', {
          item,
          list: list.items,
          index: itemIndex
        });
      }
      else {
        this.socket.emit('playItemsList', { item });
      }
    }
  }

  addToQueue(item, isPlaylist = false) {
    if (!this.socket) {
      return;
    }
    if (!isPlaylist) {
      this.socket.emit('addToQueue', {
        uri: item.uri,
        title: item.title,
        albumart: (item.albumart || null),
        service: (item.service || null)
      });
    }
    else {
      this.socket.emit('enqueue', {name: item.title});
    }
  }

  clearAndPlay(item) {
    this.socket.emit('replaceAndPlay', {
      uri: item.uri,
      title: item.title,
      albumart: (item.albumart || null),
      service: (item.service || null)
    });
  }
}
