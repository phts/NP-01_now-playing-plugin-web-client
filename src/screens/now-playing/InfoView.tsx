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
}

function InfoView(props: InfoViewProps) {
  const { playerState } = props;

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
        placeholderImage={playerState.albumart}
        restoreStateKey="NowPlayingScreen.InfoView.restoreState" />
      <div className={styles.BottomBar}>
        <Seekbar
          styles={{
            baseClassName: 'Seekbar',
            bundle: styles
          }}
          playerState={playerState} />
        <PlayerButtonGroup
          className={playerButtonGroupClasses}
          buttonStyles={{
            baseClassName: 'PlayerButton',
            bundle: styles
          }}
          playerState={playerState} />
      </div>
    </div>
  );
}

export default InfoView;
