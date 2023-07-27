/// <reference types="../../declaration.d.ts" />

import classNames from 'classnames';
import React, { SyntheticEvent } from 'react';
import Button from '../../common/Button';
import PlayerButtonGroup from '../../common/PlayerButtonGroup';
import styles from './Toolbar.module.scss';
import { PlayerState } from '../../contexts/player/PlayerStateProvider';

export interface QueueScreenToolbarProps {
  onButtonClick: (action: string) => void;
  screenMaximizable: boolean;
  screenMaximized: boolean;
  itemCount: number;
  playerState: PlayerState;
}

export type QueueScreenToolbarElement = HTMLDivElement;

const Toolbar = React.forwardRef<HTMLDivElement, QueueScreenToolbarProps>((props, ref) => {

  const handleButtonClicked = (e: SyntheticEvent) => {
    const el = e.currentTarget as HTMLElement;
    if (el.dataset.action) {
      props.onButtonClick(el.dataset.action);
    }
  };

  const baseButtonStyles = {
    baseClassName: 'Button',
    bundle: styles
  };

  const getButtonStyles = (buttonName: string) => ({
    ...baseButtonStyles,
    extraClassNames: [ styles[`Button--${buttonName}`] ]
  });

  const addToPlaylistButton = (
    <Button
      key="addToPlaylist"
      styles={getButtonStyles('addToPlaylist')}
      icon="playlist_add"
      data-action="addToPlaylist"
      onClick={handleButtonClicked} />
  );

  const clearButton = (
    <Button
      key="clear"
      styles={getButtonStyles('clear')}
      icon="delete_sweep"
      data-action="clear"
      onClick={handleButtonClicked} />
  );

  const maximizeScreenButton = props.screenMaximizable ?
    <Button
      key="maximizeScreen"
      styles={getButtonStyles('toggleScreenMaximize')}
      icon={!props.screenMaximized ? 'fullscreen' : 'fullscreen_exit'}
      data-action="toggleScreenMaximize"
      onClick={handleButtonClicked} />
    : null;

  const buttonGroupClassNames = classNames([
    styles.PlayerButtonGroup,
    'no-swipe'
  ]);

  return (
    <div ref={ref} className={styles.Layout}>
      <div className={styles['Layout__screen']}>
        <Button
          styles={getButtonStyles('close')}
          icon="expand_more"
          data-action="close"
          onClick={handleButtonClicked} />
        <div className={styles['Title']}>
          <div className={styles['Title--primary']}>Queue</div>
          <div className={styles['Title--secondary']}>{`${props.itemCount} items`}</div>
        </div>
      </div>
      <div className={styles['Layout__main']}>
        <PlayerButtonGroup
          className={buttonGroupClassNames}
          buttonStyles={baseButtonStyles}
          buttons={[ 'random', 'repeat', addToPlaylistButton, clearButton, maximizeScreenButton ]}
          playerState={props.playerState} />
      </div>
    </div>
  );
});

export default Toolbar;
