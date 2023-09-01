/// <reference types="../../declaration.d.ts" />

import React from 'react';
import classNames from 'classnames';
import styles from './VUMeterLinearIndicator.module.scss';
import VUMeterLinearIndicatorCommonProps from './VUMeterLinearIndicatorCommonProps';

export type VUMeterLinearDefaultIndicatorProps = VUMeterLinearIndicatorCommonProps;

function VUMeterLinearDefaultIndicator(props: VUMeterLinearDefaultIndicatorProps) {
  const { img, top, left, position, stepWidth, direction, flipX, value } = props;

  const maxSteps = position.regular + position.overload;
  const steps = Math.round((maxSteps / 100) * value);
  const regularSteps = Math.min(steps, position.regular);
  const overloadSteps = steps - regularSteps;
  const indicatorLength = (regularSteps * stepWidth.regular) + (overloadSteps * stepWidth.overload);
  const fullLength = (position.regular * stepWidth.regular) + (position.overload * stepWidth.overload);
  const clipLength = fullLength - indicatorLength;
  let inset: string;
  let offset = { top, left };
  switch (direction) {
    case 'left':
      if (flipX) {
        inset = `0 ${clipLength}px 0 0`;
      }
      else {
        inset = `0 0 0 ${clipLength}px`;
      }
      offset = {
        top,
        left: left - fullLength
      };
      break;
    case 'right':
      if (flipX) {
        inset = `0 0 0 ${clipLength}px`;
      }
      else {
        inset = `0 ${clipLength}px 0 0`;
      }
      break;
    case 'up':
      inset = `${clipLength}px 0 0 0`;
      break;
    case 'down':
      inset = `0 0 ${clipLength}px 0`;
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
        '--left': `${offset.left}px`,
        '--clip': `Inset(${inset})`
      } as React.CSSProperties} />
  );
}

export default VUMeterLinearDefaultIndicator;
