/// <reference types="../../../declaration.d.ts" />

import React from 'react';
import classNames from 'classnames';
import styles from './VUMeterCSSLinearIndicator.module.scss';
import VUMeterCSSLinearIndicatorCommonProps from './VUMeterCSSLinearIndicatorCommonProps';
import { getLinearMeterIndicatorLength } from '../../../utils/vumeter';

export type VUMeterCSSLinearSingleIndicatorProps = VUMeterCSSLinearIndicatorCommonProps;

function VUMeterCSSLinearSingleIndicator(props: VUMeterCSSLinearSingleIndicatorProps) {
  const { img, top, left, position, stepWidth, direction, flipX, value } = props;

  const { current: distance } = getLinearMeterIndicatorLength(position, stepWidth, value);

  let offset: { top: number; left: number; };
  switch (direction) {
    case 'left':
      offset = {
        top,
        left: left - distance
      };
      break;
    case 'right':
      offset = {
        top,
        left: left + distance
      };
      break;
    case 'up':
      offset = {
        top: top - distance,
        left
      };
      break;
    case 'down':
      offset = {
        top: top + distance,
        left
      };
      break;
  }

  const mainClassNames = classNames([
    styles.Layout,
    flipX ? styles['Layout--flipX'] : null
  ]);

  return (
    <img
      src={img.src}
      className={mainClassNames}
      style={{
        '--top': `${offset.top}px`,
        '--left': `${offset.left}px`
      } as React.CSSProperties} />
  );
}

export default VUMeterCSSLinearSingleIndicator;
