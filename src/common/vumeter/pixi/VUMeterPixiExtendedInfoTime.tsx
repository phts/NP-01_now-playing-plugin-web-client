import * as PIXI from 'pixi.js-legacy';
import React, { useMemo } from 'react';
import { VUMeterExtended } from 'now-playing-common';
import { usePlayerSeek, usePlayerState } from '../../../contexts/PlayerProvider';
import { Text } from '@pixi/react';
import { VU_METER_FONT_FAMILY, getTimeRemainingText } from '../../../utils/vumeter';

export interface VUMeterPixiExtendedInfoTimeProps {
  config: Pick<VUMeterExtended, 'timeRemaining' | 'font'>;
}

function VUMeterPixiExtendedInfoTime(props: VUMeterPixiExtendedInfoTimeProps) {
  const playerState = usePlayerState();
  const { currentSeekPosition } = usePlayerSeek();
  const { config } = props;
  const { timeRemaining, font } = config;

  const textStyle = useMemo(() => {
    if (!timeRemaining) {
      return null;
    }
    return new PIXI.TextStyle({
      fontFamily: [ VU_METER_FONT_FAMILY.digi, 'Roboto', 'sans-serif' ],
      fontSize: font.size.digi,
      fill: timeRemaining.color
    });
  }, [ font, timeRemaining ]);

  if (!textStyle || !timeRemaining || playerState.duration === 0 || playerState.status === 'stop') {
    return null;
  }

  const remainingText = getTimeRemainingText(playerState.duration, currentSeekPosition);

  return (
    <Text
      text={remainingText}
      position={timeRemaining.position}
      style={textStyle}
    />
  );
}

export default VUMeterPixiExtendedInfoTime;
