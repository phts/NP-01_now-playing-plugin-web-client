/// <reference types="../declaration.d.ts" />

import React, { SyntheticEvent, useCallback } from 'react';
import { ScreenId, useScreens } from '../contexts/ScreenContextProvider';
import Button, { ButtonProps } from './Button';
import styles from './ScreenSwitcher.module.scss';

export interface ScreenSwitcherProps {
  onSwitch?: (screenId: string) => void;
}

function ScreenSwitcher(props: ScreenSwitcherProps) {
  const { activeScreenId, switchScreen } = useScreens();

  const onSwitch = props.onSwitch;
  const handleSwitchClicked = useCallback((e: SyntheticEvent) => {
    const el = e.currentTarget as HTMLElement;
    if (el.dataset.screen) {
      const screenId = el.dataset.screen as ScreenId;
      switchScreen({
        screenId
      });
      if (onSwitch) {
        onSwitch(screenId);
      }
    }
  }, [ switchScreen, onSwitch ]);

  const getSwitchStyles = (screenId: string): ButtonProps['styles'] => {
    return {
      baseClassName: 'Switch',
      bundle: styles,
      extraClassNames: (screenId === activeScreenId) ? [ styles['Switch--active'] ] : undefined
    };
  };

  return (
    <div className={styles.Layout}>
      <div className={styles.LabelWrapper}>
        <div className={styles.Label}><span className="material-icons">tv</span></div>
      </div>
      <div className={styles.SwitchesWrapper}>
        <Button
          styles={getSwitchStyles('Browse')}
          icon="library_music"
          data-screen="Browse"
          onClick={handleSwitchClicked} />
        <Button
          styles={getSwitchStyles('NowPlaying')}
          icon="art_track"
          data-screen="NowPlaying"
          onClick={handleSwitchClicked} />
        <Button
          styles={getSwitchStyles('Queue')}
          icon="queue_music"
          data-screen="Queue"
          onClick={handleSwitchClicked} />
      </div>
    </div>
  );
}

export default ScreenSwitcher;
