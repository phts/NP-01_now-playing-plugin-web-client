/// <reference types="../../declaration.d.ts" />

import React, { useEffect, useState } from 'react';
import styles from './VUMeterCircularIndicator.module.scss';

export interface VUMeterCircularIndicatorProps {
  img: string;
  stepsPerDegree: number;
  startAngle: number;
  stopAngle: number;
  distance: number;
  origin: {
    x: number;
    y: number;
  };
  value: number;
}

interface IndicatorOffset {
  top: number;
  left: number;
}

function VUMeterCircularIndicator(props: VUMeterCircularIndicatorProps) {
  const { img, startAngle, stopAngle, distance, origin, value } = props;
  const [ offset, setOffset ] = useState<IndicatorOffset | null>(null);

  useEffect(() => {
    const image = new Image();
    image.src = img;
    image.onload = () => {
      const top = origin.y - (image.height * 0.5) - distance;
      const left = origin.x - (image.width * 0.5);
      setOffset({top, left});
    };
    image.onerror = () => {
      console.log(`Failed to load image from ${img}`);
      setOffset(null);
    };

    return () => {
      setOffset(null);
    };
  }, [ img, origin.x, origin.y, distance ]);

  if (!offset) {
    return null;
  }

  const rotate = (((stopAngle - startAngle) / 100 * value) + startAngle) * -1;

  return (
    <img
      src={props.img}
      className={styles.Layout}
      style={{
        '--top': `${offset.top}px`,
        '--left': `${offset.left}px`,
        '--distance': `${distance}px`,
        '--rotate': `${rotate}deg`
      } as React.CSSProperties} />
  );
}

export default VUMeterCircularIndicator;
