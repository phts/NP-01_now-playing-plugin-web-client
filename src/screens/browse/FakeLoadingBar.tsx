import React, { useCallback, useEffect, useImperativeHandle, useRef } from 'react';

export interface FakeLoadingBarProps {
  styles: Record<string, any>;
}

export type FakeLoadingBarElement = {
  start: () => void;
  stop: (complete?: boolean) => void;
}

const FakeLoadingBar = React.forwardRef<FakeLoadingBarElement, FakeLoadingBarProps>((props, ref) => {

  const internalRef = useRef<HTMLDivElement>(null);
  const progressTimer = useRef<NodeJS.Timeout | null>(null);
  const completedTimer = useRef<NodeJS.Timeout | null>(null);

  const stop = useCallback((complete?: boolean) => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
    if (completedTimer.current) {
      clearTimeout(completedTimer.current);
      completedTimer.current = null;
    }
    const self = internalRef.current;
    if (!self) {
      return;
    }
    const resetBar = () => {
      self.style.setProperty('--loading-percent', '0');
    };
    if (complete) {
      self.style.setProperty('--loading-percent', '100%');
      completedTimer.current = setTimeout(resetBar, 100);
    }
    else {
      resetBar();
    }
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [ stop ]);

  const start = useCallback(() => {
    const self = internalRef.current;
    if (!self) {
      return;
    }
    stop();
    // Based on https://codepen.io/1117/pen/zYxbqxO
    let step = 0.5;
    let currentProgress = 0;
    progressTimer.current = setInterval(() => {
      currentProgress += step;
      const progress = Math.min(Math.round(Math.atan(currentProgress) / (Math.PI / 2) * 100 * 1000) / 1000, 100);
      self.style.setProperty('--loading-percent', `${progress}%`);
      if (progress >= 70) {
        step = 0.1;
      }
    }, 100);
  }, [ stop ]);

  useImperativeHandle(ref, () => ({
    start,
    stop
  }));

  return (
    <div ref={internalRef} className={props.styles.FakeLoadingBar}></div>
  );
});

FakeLoadingBar.displayName = 'FakeLoadingBar';

export default FakeLoadingBar;
