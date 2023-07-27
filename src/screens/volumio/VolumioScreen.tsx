/// <reference types="../../declaration.d.ts" />

import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useAppContext } from '../../contexts/AppContextProvider';
import { ScreenProps, useScreens } from '../../contexts/ScreenContextProvider';
import styles from './VolumioScreen.module.scss';

export interface VolumioScreenProps extends ScreenProps {
  screenId: 'Volumio';
  className?: string;
}

function VolumioScreen(props: VolumioScreenProps) {
  const { host } = useAppContext();
  const { exitActiveScreen } = useScreens();

  const layoutClasses = classNames([
    styles.Layout,
    props.className
  ]);

  const onCloseClicked = useCallback(() => {
    exitActiveScreen();
  }, [ exitActiveScreen ]);

  return (
    <div className={layoutClasses}>
      <div className={styles.Layout__header}>
        <span className={styles.CloseLink} onClick={onCloseClicked}>Close</span>
      </div>
      <div className={styles.Layout__contents}>
        <iframe title="Volumio Interface" className={styles.VolumioFrame} src={host}></iframe>
      </div>
    </div>
  );
}

export default VolumioScreen;