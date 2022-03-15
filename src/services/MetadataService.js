import { EventEmitter } from "eventemitter3";

export default class MetadataService {
  constructor(apiPath) {
    this.apiPath = apiPath;
    this.init();
  }

  init() {
    this.emitter = new EventEmitter();
    
  }

  destroy() {
    this.emitter.removeAllListeners();
    this.emitter = null;
  }

  /**
   * params {
   *  name: ...
   *  artist: ...
   *  album: ...
   * }
   */
  async getSongInfo(params) {
    const url = `${this.apiPath}/metadata/fetchInfo`;
    const payload = {...params, type: 'song'}
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      this._pushFetched(params, data.data);
    }
    else {
      this._pushError(data.error);
    }
  }

  // Event:
  // fetched
  on(event, handler) {
    this.emitter.on(event, handler);
  }

  off(event, handler) {
    this.emitter.off(event, handler);
  }

  _pushFetched(params, data) {
    this.emitter.emit('fetched', {
      params,
      info: data
    });
  }

  _pushError(message) {
    this.currentLoading = null;
    this.emitter.emit('error', message)
  }
}
