import { Sprite } from '@pixi/react';
import * as PIXI from 'pixi.js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getCircularMeterIndicatorAngle } from '../../../utils/vumeter';
import { usePlayerState } from '../../../contexts/PlayerProvider';
import { useVUMeterTicker } from './VUMeterPixiTickerProvider';

export interface VUMeterPixiCircularIndicatorProps {
  img: PIXI.Texture;
  stepsPerDegree: number;
  startAngle: number;
  stopAngle: number;
  distance: number;
  origin: {
    x: number;
    y: number;
  };
  getValue: () => number;
}

interface IndicatorSpriteProps {
  position: {
    x: number;
    y: number;
  };
  pivot: {
    x: number;
    y: number;
  };
  angle: number;
}

function VUMeterPixiCircularIndicator(props: VUMeterPixiCircularIndicatorProps) {
  const { img, startAngle, stopAngle, distance, origin, getValue } = props;
  const playerState = usePlayerState();
  const { ticker } = useVUMeterTicker();
  const [ indicatorSpriteProps, setIndicatorSpriteProps ] = useState<IndicatorSpriteProps | null>(null);
  const lastValueRef = useRef(NaN);

  const updateIndicator = useCallback(() => {
    const value = getValue();
    if (lastValueRef.current === value) {
      return;
    }
    lastValueRef.current = value;
    const position = {
      x: origin.x,
      y: origin.y
    };
    const angle = getCircularMeterIndicatorAngle(startAngle, stopAngle, value);
    const pivot = {
      x: img.width / 2,
      y: (img.height / 2) + distance
    };
    setIndicatorSpriteProps({
      position,
      pivot,
      angle
    });
  }, [ img, startAngle, stopAngle, distance, origin, getValue ]);

  const enableTick = playerState.status === 'play' || !indicatorSpriteProps || lastValueRef.current !== 0;

  useEffect(() => {
    if (enableTick) {
      ticker.add(updateIndicator);

      return () => {
        ticker.remove(updateIndicator);
      };
    }
  }, [ updateIndicator, enableTick ]);

  const indicatorSprite = useMemo(() => {
    if (!indicatorSpriteProps) {
      return null;
    }
    return (
      <Sprite
        texture={img}
        position={indicatorSpriteProps.position}
        angle={indicatorSpriteProps.angle}
        pivot={indicatorSpriteProps.pivot}
      />
    );
  }, [ img, indicatorSpriteProps ]);

  return indicatorSprite;
}

export default VUMeterPixiCircularIndicator;
