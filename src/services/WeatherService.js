import { EventEmitter } from "eventemitter3";
import { requestPluginApiEndpoint } from "../utils/api";

export default class WeatherService {
  constructor() {
    this.apiPath = null;
    this.socket = null;
    this.emitter = new EventEmitter();
    this.ready = false;
    this.initSocketEventHandlers();
  }

  setApiPath(apiPath) {
    this.apiPath = apiPath;
    const nowReady = apiPath ? true : false
    if (this.ready !== nowReady) {
      this.ready = nowReady;
      this.emitter.emit('readyStateChange', nowReady);
    }
  }

  initSocketEventHandlers() {
    this.socketEventHandlers = {
      'npPushWeatherOnServiceChange': this._handleApiResponse.bind(this)
    };
  }

  setSocket(socket) {
    const oldSocket = this.socket;
    if (oldSocket === socket) {
      return;
    }
    if (oldSocket) {
      for (const[event, handler] of Object.entries(this.socketEventHandlers)) {
        oldSocket.off(event, handler);
      }
    }
    this.socket = socket;
    if (this.socket) {
      for (const[event, handler] of Object.entries(this.socketEventHandlers)) {
        this.socket.on(event, handler);
      }
    }
  }

  isReady() {
    return this.ready;
  }

  _handleApiResponse(data) {
    if (data.success) {
      this._pushFetched(data.data);
    }
    else {
      this._pushError(data.error);
    }
  }

  async getInfo() {
    if (!this.isReady()) {
      return;
    }
    const data = await requestPluginApiEndpoint(this.apiPath, '/weather/fetchInfo');
    this._handleApiResponse(data);
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
