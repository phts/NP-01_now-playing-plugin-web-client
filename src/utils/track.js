import { EventEmitter } from "eventemitter3";

export function sanitizeImageUrl(url, host) {
  if (!url) {
    return host + '/albumart';
  }
  else if (url.startsWith('/')) {
    return host + url;
  }
  else {
    return url;
  }
}

export function millisecondsToString(ms) {
  let mm = Math.trunc(ms / 1000 / 60);
  let ss = `${Math.trunc((ms / 1000) % 60)}`;
  if (ss.length === 1) {
    ss = '0' + ss;
  }
  return `${mm}:${ss}`;
}

export function secondsToString(s) {
  let mm = Math.trunc(s / 60);
  let ss = `${Math.trunc(s % 60)}`;
  if (ss.length === 1) {
    ss = '0' + ss;
  }
  return `${mm}:${ss}`;
}

export function getFormatResolution (track) {
  if (track.trackType === 'webradio') {
    return track.bitrate;
  }
  else {
    const resolutionProps = [];
    ['bitdepth', 'samplerate'].forEach( prop => {
      if (track[prop]) {
        resolutionProps.push(track[prop]);
      }
    });
    return resolutionProps.join(' ');
  }
}

export function getFormatIcon(trackType, host) {
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
      url = 'wavpack'
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
      url = trackType
      break;
    default:
      url = null;
  }
  if (url) {
    return `${ host }/app/assets-common/format-icons/${ url }.svg`;
  }
  else {
    return null;
  }
}

export class TrackTimer {

  constructor() {
    this.worker = new Worker(new URL('./timer-worker.js', import.meta.url));
    this.eventEmitter = new EventEmitter();

    this.worker.onmessage = (e) => {
      if (e.data.event === 'seek') {

        this.eventEmitter.emit('seek', e.data.seek);
      }
    };
  }

  start(beginSeek) {
    if (this.worker === undefined) {
      return;
    }
    this.worker.postMessage({command: 'start', beginSeek});
    return this;
  }

  pause() {
    if (this.worker === undefined) {
      return;
    }
    this.worker.postMessage({command: 'pause'});
    return this;
  }

  stop() {
    if (this.worker === undefined) {
      return;
    }
    this.worker.postMessage({command: 'stop'});
  }

  destroy() {
    this.stop();
    this.eventEmitter.removeAllListeners();
    if (this.worker) {
      this.worker.terminate();
      this.worker = undefined;
    }
  }

  on(event, handler) {
    this.eventEmitter.on(event, handler);
  }

  off(event, handler) {
    this.eventEmitter.removeListener(event, handler);
  }
}
