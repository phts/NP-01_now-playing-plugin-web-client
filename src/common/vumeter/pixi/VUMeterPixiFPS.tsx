import React, { useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { Text, useApp, useTick } from '@pixi/react';
import { useState } from 'react';
import { round } from 'lodash';

const style = new PIXI.TextStyle({
  fontFamily: [ 'Roboto', 'sans-serif' ],
  fontSize: 24,
  fill: '#00FF00'
});

export interface VUMeterPixiFPSProps {
  position: {
    x: number;
    y: number;
  };
  anchor?: {
    x: number;
    y: number;
  };
}

function VUMeterPixiFPS(props: VUMeterPixiFPSProps) {
  const pixiApp = useApp();
  const { position, anchor } = props;
  const [ fpsText, setFPSText ] = useState('');

  const refresh = useCallback(() => {
    setFPSText(`${round(pixiApp.ticker.FPS, 2).toFixed(2)} FPS
    Ticks: ${pixiApp.ticker.count}`);
  }, [ pixiApp ]);

  useTick(refresh);

  return (
    <Text
      text={fpsText}
      style={style}
      anchor={anchor || {x: 0, y: 0}}
      position={position}
    />
  );
}

export default VUMeterPixiFPS;
