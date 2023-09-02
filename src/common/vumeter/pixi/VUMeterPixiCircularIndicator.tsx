import { Sprite, useTick } from '@pixi/react';
import * as PIXI from 'pixi.js';
import React, { useEffect, useMemo, useRef, useState } from 'react';

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
  const [ indicatorSpriteProps, setIndicatorSpriteProps ] = useState<IndicatorSpriteProps | null>(null);
  const lastValueRef = useRef(NaN);

  useTick(() => {
    const value = getValue();
    if (lastValueRef.current === value) {
      return;
    }
    const position = {
      x: origin.x, // - (img.width / 2),
      y: origin.y// - (img.height / 2) - distance
    };
    const angle = (((stopAngle - startAngle) / 100 * value) + startAngle) * -1;
    const pivot = {
      x: img.width / 2,
      y: (img.height / 2) + distance
    };
    setIndicatorSpriteProps({
      position,
      pivot,
      angle
    });
  });

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
