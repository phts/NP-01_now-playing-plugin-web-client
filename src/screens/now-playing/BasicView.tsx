/// <reference types="../../declaration.d.ts" />

import React from 'react';
import TrackInfoText from '../../common/TrackInfoText';
import PlayerButtonGroup from '../../common/PlayerButtonGroup';
import Seekbar from '../../common/Seekbar';
import classNames from 'classnames';
import Image from '../../common/Image';
import styles from './BasicView.module.scss';
import { PlayerState } from '../../contexts/player/PlayerStateProvider';

export interface BasicViewProps {
  playerState: PlayerState;
  trackInfoVisibility?: {
    title: boolean;
    artist: boolean;
    album: boolean;
    mediaInfo: boolean;
  };
  widgetsVisibility?: {
    playbackButtons: boolean;
    seekbar: boolean;
  };
  albumartVisibility?: boolean;
  trackInfoOrder?: Array<'title' | 'artist' | 'album' | 'mediaInfo'>;
  marqueeTitle: boolean;
}

const DEFAULT_TRACK_INFO_VISIBILITY = {
  title: true,
  artist: true,
  album: true,
  mediaInfo: true
};

const DEFAULT_WIDGETS_VISIBILITY = {
  playbackButtons: true,
  seekbar: true
};

function BasicView(props: BasicViewProps) {
  const {
    playerState,
    trackInfoVisibility = DEFAULT_TRACK_INFO_VISIBILITY,
    widgetsVisibility = DEFAULT_WIDGETS_VISIBILITY,
    albumartVisibility = true
  } = props;

  // Vertically center-align PlayerButtonGroup if there's no TrackInfoText
  const emptyTrackInfoText =
    (playerState.title === undefined || playerState.title === '') &&
    (playerState.artist === undefined || playerState.artist === '') &&
    (playerState.album === undefined || playerState.album === '');

  const alwaysHideTrackInfoText = !trackInfoVisibility.title &&
    !trackInfoVisibility.artist && !trackInfoVisibility.album && !trackInfoVisibility.mediaInfo;

  const alwaysHideMainContents = alwaysHideTrackInfoText && !widgetsVisibility.playbackButtons && !widgetsVisibility.seekbar;

  const playerButtonGroupClasses = classNames({
    [`${styles.PlayerButtonGroup}`]: true,
    [`${styles['PlayerButtonGroup--vcenter']}`]: emptyTrackInfoText || alwaysHideTrackInfoText,
    'no-swipe': true
  });

  const albumartClasses = classNames({
    [`${styles.AlbumArt}`]: true,
    [`${styles['AlbumArt--center']}`]: alwaysHideMainContents
  });

  return (
    <div className={styles.Layout}>
      {albumartVisibility ? (
        <div className={albumartClasses}>
          <Image className={styles.AlbumArt__image} src={playerState.albumart} preload />
        </div>)
        : null}
      {!alwaysHideMainContents ?
        <div className={styles.MainContents}>
          {!emptyTrackInfoText && !alwaysHideTrackInfoText ?
            <TrackInfoText
              styles={{
                baseClassName: 'TrackInfoText',
                bundle: styles
              }}
              playerState={playerState}
              trackInfoVisibility={props.trackInfoVisibility}
              trackInfoOrder={props.trackInfoOrder}
              marqueeTitle={props.marqueeTitle} />
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
          {!emptyTrackInfoText && widgetsVisibility.playbackButtons ?
            <Seekbar
              styles={{
                baseClassName: 'Seekbar',
                bundle: styles
              }}
              playerState={playerState} />
            : null}
        </div>
        : null}
    </div>
  );
}

export default BasicView;
