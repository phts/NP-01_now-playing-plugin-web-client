import EventEmitter from 'events';
import { requestPluginApiEndpoint } from '../utils/api';
import { Metadata } from 'now-playing-common';

export interface MetadataServiceGetSongInfoParams {
  name?: string;
  album?: string;
  artist?: string;
  duration?: number;
  uri?: string;
  service?: string;
}

export interface MetadataServiceGetAlbumInfoParams {
  name?: string;
  artist?: string;
  uri?: string;
  service?: string;
}

export interface MetadataServiceGetArtistInfoParams {
  name?: string;
  uri?: string;
  service?: string;
}

export interface MetadataServiceGetInfoResult {
  params: {
    song?: string;
    album?: string;
    artist?: string;
  };
  info: Metadata;
}

export default class MetadataService extends EventEmitter {

  #apiPath: string | null;

  constructor() {
    super();
    this.#apiPath = null;
  }

  setApiPath(apiPath: string | null) {
    this.#apiPath = apiPath;
  }

  isReady() {
    return this.#apiPath !== null;
  }

  #cleanParams<T extends object>(params: T): T {
    const result = {} as T;
    for (const key of Object.keys(params)) {
      if (params[key as keyof T] !== undefined) {
        result[key as keyof T] = params[key as keyof T];
      }
    }
    return result;
  }

  async getSongInfo(params: MetadataServiceGetSongInfoParams) {
    if (!this.#apiPath) {
      return;
    }
    const payload = { ...this.#cleanParams(params), type: 'song' };
    const data = await requestPluginApiEndpoint(this.#apiPath, '/metadata/fetchInfo', payload);
    if (data.success) {
      this.#pushFetched({
        song: params.name,
        album: params.album,
        artist: params.artist
      }, data.data);
    }
    else {
      this.#pushError(data.error);
    }
  }

  async getAlbumInfo(params: MetadataServiceGetAlbumInfoParams) {
    if (!this.#apiPath) {
      return;
    }
    const payload = { ...this.#cleanParams(params), type: 'album' };
    const data = await requestPluginApiEndpoint(this.#apiPath, '/metadata/fetchInfo', payload);
    if (data.success) {
      this.#pushFetched({
        album: params.name,
        artist: params.artist
      }, data.data);
    }
    else {
      this.#pushError(data.error);
    }
  }

  async getArtistInfo(params: MetadataServiceGetArtistInfoParams) {
    if (!this.#apiPath) {
      return;
    }
    const payload = { ...this.#cleanParams(params), type: 'artist' };
    const data = await requestPluginApiEndpoint(this.#apiPath, '/metadata/fetchInfo', payload);
    if (data.success) {
      this.#pushFetched({
        artist: params.name
      }, data.data);
    }
    else {
      this.#pushError(data.error);
    }
  }

  #pushFetched(params: MetadataServiceGetInfoResult['params'], data: any) {
    const info: MetadataServiceGetInfoResult['info'] = {};
    if (Reflect.has(data, 'song')) {
      info.song = data.song;
    }
    if (Reflect.has(data, 'album')) {
      info.album = data.album;
    }
    if (Reflect.has(data, 'artist')) {
      info.artist = data.artist;
    }
    this.emit('fetched', {
      params,
      info
    });
  }

  #pushError(message: string) {
    this.emit('error', message);
  }

  emit(event: 'fetched', data: MetadataServiceGetInfoResult): boolean;
  emit(event: 'error', message: string): boolean;
  emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  on(event: 'fetched', listener: (data: MetadataServiceGetInfoResult) => void): this;
  on(event: 'error', listener: (message: string) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}
