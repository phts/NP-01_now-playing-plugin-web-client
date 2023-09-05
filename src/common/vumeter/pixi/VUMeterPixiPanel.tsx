/// <reference types="../../../declaration.d.ts" />

import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './VUMeterPixiPanel.module.scss';
import * as PIXI from 'pixi.js';
import { Container, Sprite } from '@pixi/react';
import { VUMeter } from 'now-playing-common';
import deepEqual from 'deep-equal';
import VUMeterPixiBasic from './VUMeterPixiBasic';
import VUMeterPixiStage from './VUMeterPixiContextBridge';
import VUMeterPixiExtendedInfo from './VUMeterPixiExtendedInfo';
import VUMeterErrorPanel from '../VUMeterErrorPanel';
import { isExtendedMeter } from '../../../utils/vumeter';
import VUMeterPixiFPS from './VUMeterPixiFPS';

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
  showFPS?: boolean;
}

export type VUMeterPixiLoadedAssets = {
  error: false;
  images: {
    screenBackground?: PIXI.Texture;
    background: PIXI.Texture;
    foreground?: PIXI.Texture;
    indicator: PIXI.Texture;
  };
} | {
  error: true,
  message: string
}

type VUMeterPixiImageAssets = (VUMeterPixiLoadedAssets & { error: false })['images'];

function VUMeterPixiPanel(props: VUMeterPixiPanelProps) {
  const { meter, offset, size: fitSize, showFPS } = props;
  const meterRef = useRef<VUMeter | null>(null);
  const [ loadedAssets, setLoadedAssets ] = useState<VUMeterPixiLoadedAssets | null>(null);

  useEffect(() => {
    return () => {
      // Destroy old assets
      if (loadedAssets && !loadedAssets.error) {
        Object.keys(loadedAssets.images).forEach((key) => {
          const texture = loadedAssets.images[key] as PIXI.Texture;
          texture.destroy(true);
        });
      }
    };
  }, [ loadedAssets ]);

  useEffect(() => {
    const loadAssets = async() => {
      if (!deepEqual(meter, meterRef.current)) {
        meterRef.current = meter;

        setLoadedAssets(null);

        const loadImagePromises = [
          PIXI.Texture.fromURL(meter.images.background),
          PIXI.Texture.fromURL(meter.images.indicator),
          meter.images.screenBackground ? PIXI.Texture.fromURL(meter.images.screenBackground) : Promise.resolve(null),
          meter.images.foreground ? PIXI.Texture.fromURL(meter.images.foreground) : Promise.resolve(null)
        ];
        let loadImageResult: Array<PIXI.Texture | null>;
        try {
          loadImageResult = await Promise.all(loadImagePromises);
        }
        catch (error) {
          const errMessageParts = [ 'Failed to load VU meter asset' ];
          if (error?.target?.src) {
            errMessageParts.push(error.target.src);
          }
          setLoadedAssets({
            error: true,
            message: errMessageParts.join(' from: ')
          });
          return;
        }
        const [ background, indicator, screenBackground, foreground ] = loadImageResult;
        if (background && indicator) {
          PIXI.Ticker.shared.maxFPS = 1 / meter.uiRefreshPeriod;
          const loadedImageAssets: VUMeterPixiImageAssets = {
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
            error: false,
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

  const extendedInfoComponent = useMemo(() => {
    if (meter && isExtendedMeter(meter)) {
      return <VUMeterPixiExtendedInfo config={meter} />;
    }
    return null;
  }, [ meter ]);

  if (!loadedAssets) {
    return null;
  }

  if (loadedAssets.error) {
    return (
      <VUMeterErrorPanel message={loadedAssets.message} />
    );
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

    stageSize.width = background.width * scale;
    stageSize.height = background.height * scale;
    offsetDelta = {
      top: (fitSize.height - stageSize.height) / 2,
      left: (fitSize.width - stageSize.width) / 2
    };
  }

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
      options={{
        antialias: true,
        resolution: window.devicePixelRatio
      }}
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
        {extendedInfoComponent}
      </Container>
      {
        showFPS ?
          <VUMeterPixiFPS
            position={{x: stageSize.width - 18, y: stageSize.height - 18}}
            anchor={{x: 1, y: 1}}
          />
          :
          null
      }
    </VUMeterPixiStage>
  );
}

export default VUMeterPixiPanel;
