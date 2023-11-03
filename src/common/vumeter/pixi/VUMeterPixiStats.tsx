import React, { useEffect } from 'react';
import * as PIXI from 'pixi.js-legacy';
import { Text } from '@pixi/react';
import { useState } from 'react';
import { round } from 'lodash';
import { useVUMeterTicker } from './VUMeterPixiTickerProvider';

const style = new PIXI.TextStyle({
  fontFamily: [ 'Roboto', 'sans-serif' ],
  fontSize: 24,
  fill: '#00FF00',
  align: 'right'
});

export interface VUMeterPixiStatsProps {
  position: {
    x: number;
    y: number;
  };
  anchor?: {
    x: number;
    y: number;
  };
  extraStats?: Record<string, string>;
}

function VUMeterPixiStats(props: VUMeterPixiStatsProps) {
  const { ticker } = useVUMeterTicker();
  const { position, anchor, extraStats } = props;
  const [ statsText, setStatsText ] = useState('');

  useEffect(() => {
    const refresh = () => {
      const lines = [
        `${round(ticker.FPS, 2).toFixed(2)} FPS`,
        `Ticks: ${ticker.count}`
      ];
      if (extraStats) {
        for (const [ key, value ] of Object.entries(extraStats)) {
          lines.push(`${key}: ${value}`);
        }
      }
      setStatsText(lines.join('\n'));
    };
    ticker.add(refresh);

    return () => {
      ticker.remove(refresh);
    };
  }, [ extraStats ]);

  return (
    <Text
      text={statsText}
      style={style}
      anchor={anchor || {x: 0, y: 0}}
      position={position}
    />
  );
}

export default VUMeterPixiStats;
