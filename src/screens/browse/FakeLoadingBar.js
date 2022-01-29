import React, { useEffect } from "react";

const FakeLoadingBar = React.forwardRef((props, ref) => {

  useEffect(() => {
    ref.current.start = () => {
      const self = ref.current;
      self.stop();
      // Based on https://codepen.io/1117/pen/zYxbqxO
      let step = 0.5;
      let currentProgress = 0;
      self.dataset.progressTimer = setInterval(() => {
        currentProgress += step;
        let progress = Math.min(Math.round(Math.atan(currentProgress) / (Math.PI / 2) * 100 * 1000) / 1000, 100);
        self.style.setProperty('--loading-percent', progress + '%');
        if (progress >= 70) {
          step = 0.1;
        }
      }, 100);
    };
  
    ref.current.stop = (complete) => {
      const self = ref.current;
      if (self.dataset.progressTimer) {
        clearInterval(self.dataset.progressTimer);
        self.dataset.progressTimer = null;
      }
      if (self.dataset.completedTimer) {
        clearTimeout(self.dataset.completedTimer);
        self.dataset.completedTimer = null;
      }
      const resetBar = () => {
        self.style.setProperty('--loading-percent', '0');
      };
      if (complete) {
        self.style.setProperty('--loading-percent', '100%');
        self.dataset.completedTimer = setTimeout(resetBar, 100);
      }
      else {
        resetBar();
      }
    };  
  }, [ref]);
  
  return (
    <div ref={ref} className={props.styles.FakeLoadingBar}></div>
  );
});

FakeLoadingBar.displayName = 'FakeLoadingBar';

export default FakeLoadingBar;
