/// <reference types="../../declaration.d.ts" />

import PlayerButtonGroup from '../../common/PlayerButtonGroup';
import Seekbar from '../../common/Seekbar';
import classNames from 'classnames';
import styles from './InfoView.module.scss';
import MetadataPanel, { MetadataPanelInfoType } from '../../common/MetadataPanel';
import React, { useCallback, useEffect, useState } from 'react';
import { PlayerState } from '../../contexts/player/PlayerStateProvider';
import { NowPlayingScreenInfoViewLayout } from 'now-playing-common';

export interface InfoViewProps {
  playerState: PlayerState;
  seekbarProps?: {
    showThumb: boolean;
  };
  widgetsVisibility?: {
    playbackButtons: boolean;
    seekbar: boolean;
  };
  topPadding?: boolean;
  bottomPadding?: boolean;
  layout?: NowPlayingScreenInfoViewLayout;
  displayInfoType?: MetadataPanelInfoType;
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
    widgetsVisibility = DEFAULT_WIDGETS_VISIBILITY,
    topPadding = true,
    bottomPadding = true,
    layout,
    displayInfoType
  } = props;
  const [ targetLayout, setLayout ] = useState<NowPlayingScreenInfoViewLayout['layout']>('standard');

  const getLayout = useCallback((): NowPlayingScreenInfoViewLayout['layout'] => {
    if (layout?.type === 'custom') {
      return layout.layout;
    }
    // Auto layout
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (h > w) { // Portrait orientation
      return 'standard';
    }
    const aspectRatio = w / h;
    if (aspectRatio > 2.3) {
      return 'ultra-wide';
    }

    if (layout?.preferBiggerAlbumArt && aspectRatio > 1.7) {
      return 'big-art';
    }

    return 'standard';
  }, [ layout ]);

  useEffect(() => {
    const refreshLayout = () => {
      setLayout(getLayout());
    };

    window.addEventListener('resize', refreshLayout);
    refreshLayout();

    return () => {
      window.removeEventListener('resize', refreshLayout);
    };
  }, [ getLayout ]);

  const playerButtonGroupClasses = classNames(
    [ `${styles.PlayerButtonGroup}` ],
    'no-swipe'
  );

  const getSeekbar = () => {
    if (widgetsVisibility.seekbar) {
      return <Seekbar
        styles={{
          baseClassName: 'Seekbar',
          bundle: styles
        }}
        showThumb={seekbarProps.showThumb}
        playerState={playerState} />;
    }
    if (widgetsVisibility.playbackButtons) {
      return <div className={styles['SeekbarPlaceholder']} />;
    }
    return null;
  };

  const bottomBar = (<div className={styles.BottomBar}>
    {getSeekbar()}
    {widgetsVisibility.playbackButtons ?
      <PlayerButtonGroup
        className={playerButtonGroupClasses}
        buttonStyles={{
          baseClassName: 'PlayerButton',
          bundle: styles
        }}
        playerState={playerState} />
      : null}
  </div>);

  const wrapBottomBar = targetLayout === 'ultra-wide' || targetLayout === 'big-art';
  const wrapHeader = targetLayout === 'ultra-wide';

  const mainClassName = classNames(
    styles.Layout,
    targetLayout === 'big-art' ? styles['Layout--bigart'] : null,
    targetLayout === 'ultra-wide' ? styles['Layout--ultrawide'] : null,
    !topPadding ? styles['Layout--noTopPadding'] : null,
    !bottomPadding ? styles['Layout--noBottomPadding'] : null
  );

  return (
    <div className={mainClassName}>
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
        restoreStateKey="NowPlayingScreen.InfoView.restoreState"
        wrappedHeader={wrapHeader}
        customComponent={wrapBottomBar ? bottomBar : null}
        displayInfoType={displayInfoType}/>
      {!wrapBottomBar ? bottomBar : null}
    </div>
  );
}

export default InfoView;
