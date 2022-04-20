let seek = 0;
let timer = null;

onmessage = (e) => {
  const command = e.data.command;
  switch(command) {
    case 'start':
      startTimer(e.data.beginSeek);
      return;
    case 'pause':
      pauseTimer();
      return;
    case 'stop':
      stopTimer();
      return;
    default:
      // Do nothing
  }
};

function startTimer(beginSeek) {
  if (beginSeek !== undefined) {
    stopTimer();
    seek = beginSeek;
  }
  this.postMessage({event: 'start', seek});
  if (!timer) {
    timer = setInterval(() => {
      seek += 1000;
      this.postMessage({event: 'seek', seek});
    }, 1000);
  }
}

function pauseTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  this.postMessage({event: 'pause', seek});
}

function stopTimer() {
  pauseTimer();
  seek = 0;
  this.postMessage({event: 'stop', seek});
}
