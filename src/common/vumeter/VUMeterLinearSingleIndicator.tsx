/// <reference types="../../declaration.d.ts" />

import React from 'react';
import classNames from 'classnames';
import styles from './VUMeterLinearIndicator.module.scss';
import VUMeterLinearIndicatorCommonProps from './VUMeterLinearIndicatorCommonProps';

export type VUMeterLinearSingleIndicatorProps = VUMeterLinearIndicatorCommonProps;

function VUMeterLinearSingleIndicator(props: VUMeterLinearSingleIndicatorProps) {
  const { img, top, left, position, stepWidth, direction, flipX, value } = props;

  const maxSteps = position.regular + position.overload;
  const steps = Math.round((maxSteps / 100) * value);
  const regularSteps = Math.min(steps, position.regular);
  const overloadSteps = steps - regularSteps;
  const distance = (regularSteps * stepWidth.regular) + (overloadSteps * stepWidth.overload);
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
      src={img}
      className={mainClassNames}
      style={{
        '--top': `${offset.top}px`,
        '--left': `${offset.left}px`
      } as React.CSSProperties} />
  );
}

export default VUMeterLinearSingleIndicator;
