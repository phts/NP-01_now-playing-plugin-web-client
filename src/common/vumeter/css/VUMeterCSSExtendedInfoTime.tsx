/// <reference types="../../../declaration.d.ts" />

import React from 'react';
import styles from './VUMeterCSSExtendedInfoTime.module.scss';
import { VUMeterExtended } from 'now-playing-common';
import { usePlayerSeek, usePlayerState } from '../../../contexts/PlayerProvider';
import { VU_METER_FONT_FAMILY, getTimeRemainingText } from '../../../utils/vumeter';

export interface VUMeterCSSExtendedInfoTimeProps {
  config: Pick<VUMeterExtended, 'timeRemaining' | 'font'>;
}

function VUMeterCSSExtendedInfoTime(props: VUMeterCSSExtendedInfoTimeProps) {
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
    '--font-family': `"${VU_METER_FONT_FAMILY.digi}", var(--app-font-family)`,
    '--font-size': `${font.size.digi}px`,
    '--color': timeRemaining.color
  } as React.CSSProperties;

  const remainingText = getTimeRemainingText(playerState.duration, currentSeekPosition);

  return (
    <span className={styles.Layout} style={style}>{remainingText}</span>
  );
}

export default VUMeterCSSExtendedInfoTime;
