import EventEmitter from 'events';
import { requestPluginApiEndpoint } from '../utils/api';
import { WeatherData } from 'now-playing-common';

export default class WeatherService extends EventEmitter {

  #apiPath: string | null;
  #socket: SocketIOClient.Socket | null;
  #ready: boolean;
  #socketEventHandlers!: {
    npPushWeatherOnServiceChange: (data: any) => void;
  };

  constructor() {
    super();
    this.#apiPath = null;
    this.#socket = null;
    this.#ready = false;
    this.#initSocketEventHandlers();
  }

  setApiPath(apiPath: string | null) {
    this.#apiPath = apiPath;
    const nowReady = !!apiPath;
    if (this.#ready !== nowReady) {
      this.#ready = nowReady;
      this.emit('readyStateChange', nowReady);
    }
  }

  #initSocketEventHandlers() {
    this.#socketEventHandlers = {
      npPushWeatherOnServiceChange: this.#handleApiResponse.bind(this)
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
    }
  }

  isReady() {
    return this.#ready;
  }

  #handleApiResponse(data: any) {
    if (data.success) {
      this.#pushFetched(data.data);
    }
    else {
      this.#pushError(data.error);
    }
  }

  async getInfo() {
    if (!this.#apiPath) {
      return;
    }
    const data = await requestPluginApiEndpoint(this.#apiPath, '/weather/fetchInfo');
    this.#handleApiResponse(data);
  }

  #pushFetched(data: WeatherData) {
    this.emit('fetched', data);
  }

  #pushError(message: string) {
    this.emit('error', message);
  }

  on(event: 'fetched', listener: (data: WeatherData) => void): this;
  on(event: 'error', listener: (message: string) => void): this;
  on(event: 'readyStateChange', listener: (ready: boolean) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}
