let seek = 0;
let timer = null;
let max = 0;

onmessage = (e) => {
  const command = e.data.command;
  switch(command) {
    case 'start':
      startTimer(e.data.beginSeek, e.data.max);
      return;
    case 'pause':
      pauseTimer(e.data.pauseSeek, e.data.max);
      return;
    case 'stop':
      stopTimer();
      return;
    default:
      // Do nothing
  }
};

function startTimer(beginSeek, max) {
  clearTimer();
  seek = beginSeek;
  setMax(max);
  if (!timer) {
    timer = setInterval(() => {
      seek = Math.min(seek + 1000, max);
      this.postMessage({event: 'seek', seek});
    }, 1000);
  }
}

function pauseTimer(pauseSeek, max) {
  clearTimer();
  if (pauseSeek !== undefined) {
    seek = Math.min(pauseSeek, max);
  }
  setMax(max);
}

function stopTimer() {
  clearTimer();
  seek = 0;
  this.postMessage({event: 'seek', seek: 0});
}

function clearTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function setMax(value) {
  max = value;
  if (seek > max) {
    seek = max;
  }
  this.postMessage({event: 'seek', seek});
}
