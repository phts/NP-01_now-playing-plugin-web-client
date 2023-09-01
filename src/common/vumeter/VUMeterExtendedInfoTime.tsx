/// <reference types="../../declaration.d.ts" />

import React from 'react';
import styles from './VUMeterExtendedInfoTime.module.scss';
import { VUMeterExtended } from 'now-playing-common';
import { usePlayerSeek, usePlayerState } from '../../contexts/PlayerProvider';
import { millisecondsToString } from '../../utils/track';

export interface VUMeterExtendedInfoTimeProps {
  config: Pick<VUMeterExtended, 'timeRemaining' | 'font'>;
}

const FONT_FAMILY = {
  digi: 'VUMeter Digi'
};

function VUMeterExtendedInfoTime(props: VUMeterExtendedInfoTimeProps) {
  const playerState = usePlayerState();
  const { currentSeekPosition } = usePlayerSeek();
  const { config } = props;
  const { timeRemaining, font } = config;

  if (!timeRemaining || playerState.duration === 0 || playerState.status === 'stop') {
    return null;
  }

  const style = {
    '--top': `${timeRemaining.position.y}px`,
    '--left': `${timeRemaining.position.x}px`,
    '--font-family': `"${FONT_FAMILY.digi}", var(--app-font-family)`,
    '--font-size': `${font.size.digi}px`,
    '--color': timeRemaining.color
  } as React.CSSProperties;

  const duration = (playerState.duration || 0) * 1000;
  const remaining = duration - currentSeekPosition;
  const remainingText = millisecondsToString(remaining, 2);

  return (
    <span className={styles.Layout} style={style}>{remainingText}</span>
  );
}

export default VUMeterExtendedInfoTime;
