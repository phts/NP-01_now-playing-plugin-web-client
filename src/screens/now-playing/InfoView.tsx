/// <reference types="../../declaration.d.ts" />

import PlayerButtonGroup from '../../common/PlayerButtonGroup';
import Seekbar from '../../common/Seekbar';
import classNames from 'classnames';
import styles from './InfoView.module.scss';
import MetadataPanel from '../../common/MetadataPanel';
import React from 'react';
import { PlayerState } from '../../contexts/player/PlayerStateProvider';

export interface InfoViewProps {
  playerState: PlayerState;
  seekbarProps?: {
    showThumb: boolean;
  };
  widgetsVisibility?: {
    playbackButtons: boolean;
    seekbar: boolean;
  };
}

const DEFAULT_SEEKBAR_PROPS = {
  showThumb: true
};

const DEFAULT_WIDGETS_VISIBILITY = {
  playbackButtons: true,
  seekbar: true
};

function InfoView(props: InfoViewProps) {
  const {
    playerState,
    seekbarProps = DEFAULT_SEEKBAR_PROPS,
    widgetsVisibility = DEFAULT_WIDGETS_VISIBILITY
  } = props;

  const playerButtonGroupClasses = classNames(
    [ `${styles.PlayerButtonGroup}` ],
    'no-swipe'
  );

  return (
    <div className={styles.Layout}>
      <MetadataPanel
        styles={{
          baseClassName: 'MetadataPanel',
          bundle: styles
        }}
        song={playerState.title}
        album={playerState.album}
        artist={playerState.artist}
        uri={playerState.uri}
        service={playerState.service}
        placeholderImage={playerState.albumart}
        restoreStateKey="NowPlayingScreen.InfoView.restoreState" />
      <div className={styles.BottomBar}>
        {widgetsVisibility.seekbar ?
          <Seekbar
            styles={{
              baseClassName: 'Seekbar',
              bundle: styles
            }}
            showThumb={seekbarProps.showThumb}
            playerState={playerState} />
          : null}
        {widgetsVisibility.playbackButtons ?
          <PlayerButtonGroup
            className={playerButtonGroupClasses}
            buttonStyles={{
              baseClassName: 'PlayerButton',
              bundle: styles
            }}
            playerState={playerState} />
          : null}
      </div>
    </div>
  );
}

export default InfoView;
