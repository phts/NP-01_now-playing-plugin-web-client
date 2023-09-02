/// <reference types="../../../declaration.d.ts" />

import React, { useEffect, useMemo, useState } from 'react';
import styles from './VUMeterCSSPanel.module.scss';
import { VUMeter, VUMeterExtended } from 'now-playing-common';
import VUMeterExtendedInfo from '../VUMeterExtendedInfo';
import VUMeterBasic from '../VUMeterBasic';

export type VUMeterCSSPanelProps = {
  meter: VUMeter;
  offset?: {
    top: number;
    left: number;
  };
  size?: {
    width: number;
    height: number;
  };
}

interface PanelSize {
  width: number;
  height: number;
}

const isExtendedMeter = (meter: VUMeter): meter is VUMeterExtended => {
  return Reflect.has(meter, 'extend') && !!Reflect.get(meter, 'extend');
};

function VUMeterCSSPanel(props: VUMeterCSSPanelProps) {
  const { meter, offset, size: fitSize } = props;
  const [ size, setSize ] = useState<PanelSize | null>(null);

  useEffect(() => {
    const image = new Image();
    image.src = meter.images.screenBackground || meter.images.background;
    image.onload = () => {
      setSize({
        width: image.width,
        height: image.height
      });
    };
    image.onerror = () => {
      console.log(`Failed to load image from ${image.src}`);
      setSize(null);
    };

    return () => {
      setSize(null);
    };
  }, [ meter ]);

  const extendedInfoComponent = useMemo(() => {
    if (meter && isExtendedMeter(meter)) {
      return <VUMeterExtendedInfo config={meter} />;
    }
    return null;
  }, [ meter ]);

  if (!size || !meter) {
    return null;
  }

  let scale = 1;
  let offsetDelta = {top: 0, left: 0};
  if (fitSize && fitSize.height > 0 && fitSize.width > 0) {
    scale = Math.min(
      fitSize.width / size.width,
      fitSize.height / size.height
    );

    if (scale !== 1) {
      const scaledWidth = size.width * scale;
      const scaledHeight = size.height * scale;
      offsetDelta = {
        top: (fitSize.height - scaledHeight) / 2,
        left: (fitSize.width - scaledWidth) / 2
      };
    }
  }

  const screenBackground = meter.images.screenBackground;
  const panelStyles = {
    '--top': `${(offset ? offset.top : 0) + offsetDelta.top}px`,
    '--left': `${(offset ? offset.left : 0) + offsetDelta.left}px`,
    '--width': `${size.width}px`,
    '--height': `${size.height}px`,
    '--background': screenBackground ? `url("${screenBackground}")` : 'none'
  } as React.CSSProperties;

  if (scale !== 1) {
    panelStyles.transform = `scale(${scale})`;
    panelStyles.transformOrigin = '0 0';
  }

  console.log('render vumeterpanel');

  return (
    <div className={styles.Layout} style={panelStyles}>
      <VUMeterBasic config={meter} />
      {extendedInfoComponent}
    </div>
  );
}

export default VUMeterCSSPanel;
