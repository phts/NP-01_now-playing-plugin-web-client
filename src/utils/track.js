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
    this.seek = 0;
    this.timer = null;
    this.eventEmitter = new EventEmitter();
  }

  getSeek() {
    return this.seek;
  }

  start(beginSeek) {
    if (beginSeek !== undefined) {
      this.stop();
      this.seek = beginSeek;
    }
    if (!this.timer) {
      this.timer = setInterval(() => {
        this.seek += 1000;
        this.eventEmitter.emit('seek', this.seek);
      }, 1000);
    }
    return this;
  }

  pause() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    return this;
  }

  stop() {
    this.pause();
    this.seek = 0;
    return this;
  }

  destroy() {
    this.stop();
    this.eventEmitter.removeAllListeners();
  }

  on(event, handler) {
    this.eventEmitter.on(event, handler);
  }

  off(event, handler) {
    this.eventEmitter.removeListener(event, handler);
  }
}