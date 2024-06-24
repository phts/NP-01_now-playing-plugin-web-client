import { now } from 'lodash';

let seek = 0;
let timer: NodeJS.Timeout | null = null;
let max = 0;
let dateMillis: number;

onmessage = (e) => {
  const command = e.data.command;
  switch (command) {
    case 'start':
      startTimer(e.data.beginSeek, e.data.max);
      break;
    case 'pause':
      pauseTimer(e.data.pauseSeek, e.data.max);
      break;
    case 'stop':
      stopTimer();
      break;
    default:
    // Do nothing
  }
};

function startTimer(beginSeek: number, max: number) {
  clearTimer();
  seek = beginSeek;
  dateMillis = now();
  setMax(max);
  if (!timer) {
    timer = setInterval(() => {
      const lastDateMillis = dateMillis;
      dateMillis = now();
      const realElapsed = dateMillis - lastDateMillis;
      seek = Math.min(seek + realElapsed, max);
      postMessage({ event: 'seek', seek });
    }, 500);
  }
}

function pauseTimer(pauseSeek: number, max: number) {
  clearTimer();
  if (pauseSeek !== undefined) {
    seek = Math.min(pauseSeek, max);
  }
  setMax(max);
}

function stopTimer() {
  clearTimer();
  seek = 0;
  postMessage({ event: 'seek', seek: 0 });
}

function clearTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function setMax(value: number) {
  max = value;
  if (seek > max) {
    seek = max;
  }
  postMessage({ event: 'seek', seek });
}
