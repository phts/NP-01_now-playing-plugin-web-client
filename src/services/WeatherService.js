import { EventEmitter } from "eventemitter3";
import { requestPluginApiEndpoint } from "../utils/api";

export default class WeatherService {
  constructor() {
    this.apiPath = null;
    this.emitter = new EventEmitter();
    this.ready = false;
  }

  setApiPath(apiPath) {
    this.apiPath = apiPath;
    const nowReady = apiPath ? true : false
    if (this.ready !== nowReady) {
      this.ready = nowReady;
      this.emitter.emit('readyStateChange', nowReady);
    }
  }

  isReady() {
    return this.ready;
  }

  async getInfo() {
    if (!this.isReady()) {
      return;
    }
    const data = await requestPluginApiEndpoint(this.apiPath, '/weather/fetchInfo');
    if (data.success) {
      this._pushFetched(data.data);
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

  _pushFetched(data) {
    this.emitter.emit('fetched', data);
  }

  _pushError(message) {
    this.emitter.emit('error', message)
  }
}
