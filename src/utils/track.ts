import EventEmitter from 'events';

export interface TrackInfo {
  trackType?: string;
  bitrate?: string;
  bitdepth?: string;
  samplerate?: string;
}

export function sanitizeImageUrl(url: string | null, host: string) {
  if (!url) {
    return `${host}/albumart`;
  }
  else if (url.startsWith('/')) {
    return host + url;
  }

  return url;

}

export function millisecondsToString(ms: number) {
  const mm = Math.trunc(ms / 1000 / 60);
  let ss = `${Math.trunc((ms / 1000) % 60)}`;
  if (ss.length === 1) {
    ss = `0${ss}`;
  }
  return `${mm}:${ss}`;
}

export function secondsToString(s: number) {
  const mm = Math.trunc(s / 60);
  let ss = `${Math.trunc(s % 60)}`;
  if (ss.length === 1) {
    ss = `0${ss}`;
  }
  return `${mm}:${ss}`;
}

export function getFormatResolution(track: TrackInfo) {
  if (track.trackType === 'webradio' && track.bitrate) {
    return track.bitrate;
  }

  const resolutionProps: string[] = [];
  if (track.bitrate) {
    resolutionProps.push(track.bitrate);
  }
  if (track.samplerate) {
    resolutionProps.push(track.samplerate);
  }
  if (track.bitdepth) {
    resolutionProps.push(track.bitdepth);
  }
  return resolutionProps.join(' / ');
}

export function getFormatIcon(trackType: TrackInfo['trackType'], host: string) {
  if (!trackType) {
    return null;
  }
  let url;
  switch (trackType) {
    case 'dff':
    case 'dsf':
      url = 'dsd';
      break;
    case 'ogg':
    case 'oga':
      url = 'ogg';
      break;
    case 'wv':
      url = 'wavpack';
      break;
    case 'aac':
    case 'aiff':
    case 'alac':
    case 'dsd':
    case 'dts':
    case 'flac':
    case 'm4a':
    case 'mp3':
    case 'mp4':
    case 'opus':
    case 'spotify':
    case 'wav':
    case 'wawpack':
    case 'airplay':
    case 'YouTube':
    case 'rr':
    case 'bt':
    case 'cd':
    case 'mg':
    case 'mb':
    case 'wma':
    case 'qobuz':
    case 'tidal':
      url = trackType;
      break;
    default:
      url = null;
  }
  if (url) {
    return `${host}/app/assets-common/format-icons/${url}.svg`;
  }

  return null;

}

export class TrackTimer extends EventEmitter {

  #worker: Worker | null;

  constructor() {
    super();
    this.#worker = new Worker(new URL('./TimerWorker.ts', import.meta.url));

    this.#worker.onmessage = (e) => {
      if (e.data.event === 'seek') {
        this.emit('seek', e.data.seek);
      }
    };
  }

  start(beginSeek: number, max: number) {
    if (!this.#worker) {
      return;
    }

    this.#worker.postMessage({ command: 'start', beginSeek, max });
    return this;
  }

  pause(pauseSeek: number, max: number) {
    if (!this.#worker) {
      return;
    }
    this.#worker.postMessage({ command: 'pause', pauseSeek, max });
    return this;
  }

  stop() {
    if (!this.#worker) {
      return;
    }
    this.#worker.postMessage({ command: 'stop' });
    return this;
  }

  destroy() {
    this.stop();
    this.removeAllListeners();
    if (this.#worker) {
      this.#worker.terminate();
      this.#worker = null;
    }
  }

  on(event: 'seek', listener: (seek: number) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}
