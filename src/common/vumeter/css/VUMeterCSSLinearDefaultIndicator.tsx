/// <reference types="../../../declaration.d.ts" />

import React from 'react';
import classNames from 'classnames';
import styles from './VUMeterCSSLinearIndicator.module.scss';
import VUMeterCSSLinearIndicatorCommonProps from './VUMeterCSSLinearIndicatorCommonProps';
import { getLinearMeterIndicatorLength } from '../../../utils/vumeter';

export type VUMeterCSSLinearDefaultIndicatorProps = VUMeterCSSLinearIndicatorCommonProps;

function VUMeterCSSLinearDefaultIndicator(props: VUMeterCSSLinearDefaultIndicatorProps) {
  const { img, top, left, position, stepWidth, direction, flipX, value } = props;

  const { current: indicatorLength, max: fullLength } = getLinearMeterIndicatorLength(position, stepWidth, value);
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
      src={img.src}
      className={mainClassNames}
      style={{
        '--top': `${offset.top}px`,
        '--left': `${offset.left}px`,
        '--clip': `Inset(${inset})`
      } as React.CSSProperties} />
  );
}

export default VUMeterCSSLinearDefaultIndicator;
