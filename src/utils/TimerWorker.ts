let seek = 0;
let timer: NodeJS.Timeout | null = null;
let max = 0;

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
  setMax(max);
  if (!timer) {
    timer = setInterval(() => {
      seek = Math.min(seek + 1000, max);
      postMessage({event: 'seek', seek});
    }, 1000);
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
  postMessage({event: 'seek', seek: 0});
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
  postMessage({event: 'seek', seek});
}
