/// <reference types="../../../declaration.d.ts" />

import React, { useEffect, useRef, useState } from 'react';
import styles from './VUMeterPixiPanel.module.scss';
import * as PIXI from 'pixi.js';
import { Container, Sprite } from '@pixi/react';
import { VUMeter, VUMeterExtended } from 'now-playing-common';
import deepEqual from 'deep-equal';
import VUMeterPixiBasic from './VUMeterPixiBasic';
import VUMeterPixiStage from './VUMeterPixiContextBridge';

export type VUMeterPixiPanelProps = {
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

const isExtendedMeter = (meter: VUMeter): meter is VUMeterExtended => {
  return Reflect.has(meter, 'extend') && !!Reflect.get(meter, 'extend');
};

export interface VUMeterPixiLoadedAssets {
  images: {
    screenBackground?: PIXI.Texture;
    background: PIXI.Texture;
    foreground?: PIXI.Texture;
    indicator: PIXI.Texture;
  }
}

function VUMeterPixiPanel(props: VUMeterPixiPanelProps) {
  const { meter, offset, size: fitSize } = props;
  const meterRef = useRef<VUMeter | null>(null);
  const [ loadedAssets, setLoadedAssets ] = useState<VUMeterPixiLoadedAssets | null>(null);

  useEffect(() => {
    return () => {
      // Destroy old assets
      if (loadedAssets) {
        Object.keys(loadedAssets.images).forEach((key) => (loadedAssets.images[key] as PIXI.Texture).destroy());
      }
    };
  }, [ loadedAssets ]);

  useEffect(() => {
    const loadAssets = async() => {
      if (!deepEqual(meter, meterRef.current)) {
        meterRef.current = meter;

        const loadImagePromises = [
          PIXI.Texture.fromURL(meter.images.background),
          PIXI.Texture.fromURL(meter.images.indicator),
          meter.images.screenBackground ? PIXI.Texture.fromURL(meter.images.screenBackground) : Promise.resolve(null),
          meter.images.foreground ? PIXI.Texture.fromURL(meter.images.foreground) : Promise.resolve(null)
        ];
        const [ background, indicator, screenBackground, foreground ] = await Promise.all(loadImagePromises);
        if (background && indicator) {
          PIXI.Ticker.shared.maxFPS = 1 / meter.uiRefreshPeriod;
          const loadedImageAssets: VUMeterPixiLoadedAssets['images'] = {
            background,
            indicator
          };
          if (screenBackground) {
            loadedImageAssets.screenBackground = screenBackground;
          }
          if (foreground) {
            loadedImageAssets.foreground = foreground;
          }
          setLoadedAssets({
            images: loadedImageAssets
          });
        }
        else {
          setLoadedAssets(null);
        }
      }
    };

    loadAssets();
  }, [ meter ]);

  if (!loadedAssets) {
    return null;
  }

  let scale = 1;
  let offsetDelta = {top: 0, left: 0};
  const background = loadedAssets.images.screenBackground || loadedAssets.images.background;
  const stageSize = {
    width: background.width,
    height: background.height
  };
  if (fitSize && fitSize.height > 0 && fitSize.width > 0) {
    scale = Math.min(
      fitSize.width / background.width,
      fitSize.height / background.height
    );

    if (scale !== 1) {
      stageSize.width = background.width * scale;
      stageSize.height = background.height * scale;
      offsetDelta = {
        top: (fitSize.height - stageSize.height) / 2,
        left: (fitSize.width - stageSize.width) / 2
      };
    }
  }

  console.log('render VUMeterPixiPanel');

  const stageStyles = {
    '--top': `${(offset ? offset.top : 0) + offsetDelta.top}px`,
    '--left': `${(offset ? offset.left : 0) + offsetDelta.left}px`
  } as React.CSSProperties;

  return (
    <VUMeterPixiStage
      className={styles.Layout}
      width={stageSize.width}
      height={stageSize.height}
      style={stageStyles}
      interactive={'auto'}
    >
      <Container
        position={{x: 0, y: 0}}
        scale={scale}>
        {
          loadedAssets.images.screenBackground ?
            <Sprite
              texture={loadedAssets.images.screenBackground}
              position={{x: 0, y: 0}}
            />
            :
            null
        }
        <VUMeterPixiBasic config={meter} assets={loadedAssets} />
      </Container>
    </VUMeterPixiStage>
  );
}

export default VUMeterPixiPanel;
