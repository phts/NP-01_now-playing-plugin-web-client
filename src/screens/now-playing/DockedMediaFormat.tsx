/// <reference types="../../declaration.d.ts" />

import React from 'react';
import { useSettings } from '../../contexts/SettingsProvider';
import styles from './DockedMediaFormat.module.scss';
import { CommonSettingsCategory } from 'now-playing-common';
import { usePlayerState } from '../../contexts/PlayerProvider';
import TrackInfoText from '../../common/TrackInfoText';

function DockedMediaFormat() {
  const { settings: screenSettings } = useSettings(CommonSettingsCategory.NowPlayingScreen);
  const playerState = usePlayerState();
  const settings = screenSettings.dockedMediaFormat;

  const dockedStyles = {
    '--docked-margin': settings.margin
  } as React.CSSProperties;

  if (settings.fontSettings === 'custom') {
    Object.assign(dockedStyles, {
      '--docked-font-size': settings.fontSize,
      '--docked-font-color': settings.fontColor
    });
  }

  return (
    <div style={dockedStyles}>
      <TrackInfoText
        playerState={playerState}
        trackInfoVisibility={{
          title: false,
          artist: false,
          album: false,
          mediaInfo: true
        }}
        styles={{
          baseClassName: 'DockedMediaFormat',
          bundle: styles
        }} />
    </div>
  );
}

export default DockedMediaFormat;
