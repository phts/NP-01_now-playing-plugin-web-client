/// <reference types="../../../declaration.d.ts" />

import React, { useEffect, useState } from 'react';
import styles from './VUMeterCSSCircularIndicator.module.scss';
import { getCircularMeterIndicatorAngle } from '../../../utils/vumeter';

export interface VUMeterCSSCircularIndicatorProps {
  img: HTMLImageElement;
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

function VUMeterCSSCircularIndicator(props: VUMeterCSSCircularIndicatorProps) {
  const { img, startAngle, stopAngle, distance, origin, value } = props;
  const [ offset, setOffset ] = useState<IndicatorOffset | null>(null);

  useEffect(() => {
    const top = origin.y - (img.height / 2) - distance;
    const left = origin.x - (img.width / 2);
    setOffset({top, left});

    return () => {
      setOffset(null);
    };
  }, [ img, origin.x, origin.y, distance ]);

  if (!offset) {
    return null;
  }

  const rotate = getCircularMeterIndicatorAngle(startAngle, stopAngle, value);

  return (
    <img
      src={img.src}
      className={styles.Layout}
      style={{
        '--top': `${offset.top}px`,
        '--left': `${offset.left}px`,
        '--distance': `${distance}px`,
        '--rotate': `${rotate}deg`
      } as React.CSSProperties} />
  );
}

export default VUMeterCSSCircularIndicator;
