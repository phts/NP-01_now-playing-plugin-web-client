/// <reference types="../../../declaration.d.ts" />

import React, { useEffect, useRef, useState } from 'react';
import styles from './VUMeterPixiPanel.module.scss';
import * as PIXI from 'pixi.js';
import { Sprite, Stage } from '@pixi/react';
import { VUMeter, VUMeterExtended } from 'now-playing-common';
import deepEqual from 'deep-equal';

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

interface LoadedAssets {
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
  const [ loadedAssets, setLoadedAssets ] = useState<LoadedAssets | null>(null);

  useEffect(() => {
    const unloadAssets = () => {
      return PIXI.Assets.unloadBundle('images');
    };
    const loadAssets = async() => {
      if (!deepEqual(meter, meterRef.current)) {
        meterRef.current = meter;
        await unloadAssets();

        const imageBundle: Record<string, string> = {};
        if (meter.images.screenBackground) {
          imageBundle.screenBackground = meter.images.screenBackground;
        }
        if (meter.images.foreground) {
          imageBundle.foreground = meter.images.foreground;
        }
        imageBundle.background = meter.images.background;
        imageBundle.indicator = meter.images.indicator;

        PIXI.Assets.addBundle('images', imageBundle);
        const assets = await PIXI.Assets.loadBundle('images');
        const { screenBackground, background, foreground, indicator } = assets;
        console.log('assets: ', assets);
        if (background && indicator) {
          const loadedImageAssets: LoadedAssets['images'] = {
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
    return;
  }

  let scale = 1;
  let offsetDelta = {top: 0, left: 0};
  const background = loadedAssets.images.screenBackground || loadedAssets.images.background;
  if (fitSize && fitSize.height > 0 && fitSize.width > 0) {
    scale = Math.min(
      fitSize.width / background.width,
      fitSize.height / background.height
    );

    if (scale !== 1) {
      const scaledWidth = background.width * scale;
      const scaledHeight = background.height * scale;
      offsetDelta = {
        top: (fitSize.height - scaledHeight) / 2,
        left: (fitSize.width - scaledWidth) / 2
      };
    }
  }

  console.log('render VUMeterPixiPanel');

  const stageStyles = {
    '--top': `${(offset ? offset.top : 0) + offsetDelta.top}px`,
    '--left': `${(offset ? offset.left : 0) + offsetDelta.left}px`
  } as React.CSSProperties;

  return (
    <Stage
      className={styles.Layout}
      style={stageStyles}
      width={fitSize?.width || background.width}
      height={fitSize?.height || background.height}
    >
      <Sprite texture={background} scale={{x: scale, y: scale}}/>
    </Stage>
  );
}

export default VUMeterPixiPanel;
