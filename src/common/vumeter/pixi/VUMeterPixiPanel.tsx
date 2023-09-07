/// <reference types="../../../declaration.d.ts" />

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './VUMeterPixiPanel.module.scss';
import * as PIXI from 'pixi.js';
import { Container, Sprite } from '@pixi/react';
import { CommonSettingsCategory, VUMeter } from 'now-playing-common';
import VUMeterPixiBasic from './VUMeterPixiBasic';
import VUMeterPixiStage from './VUMeterPixiStage';
import VUMeterPixiExtendedInfo from './VUMeterPixiExtendedInfo';
import VUMeterErrorPanel from '../VUMeterErrorPanel';
import { isExtendedMeter } from '../../../utils/vumeter';
import VUMeterPixiStats from './VUMeterPixiStats';
import { useSettings } from '../../../contexts/SettingsProvider';

export interface VUMeterPixiPanelProps {
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

interface RenderProps {
  meter: VUMeter;
  assets: VUMeterPixiLoadedAssets;
}

type VUMeterPixiImageAssets = (VUMeterPixiLoadedAssets & { error: false })['images'];

function VUMeterPixiPanel(props: VUMeterPixiPanelProps) {
  const { settings: performanceSettings } = useSettings(CommonSettingsCategory.Performance);
  const { meter, offset, size: fitSize } = props;
  const [ renderProps, setRenderProps ] = useState<RenderProps | null>(null);
  const isWebGLSupported = useRef(PIXI.utils.isWebGLSupported());

  useEffect(() => {
    return () => {
      // Destroy old assets
      const renderAssets = renderProps?.assets;
      if (renderAssets && !renderAssets.error) {
        Object.keys(renderAssets.images).forEach((key) => {
          const texture = renderAssets.images[key] as PIXI.Texture;
          texture.destroy(true);
        });
      }
    };
  }, [ renderProps ]);

  const loadAssets = useCallback(async(meter: VUMeter): Promise<VUMeterPixiLoadedAssets> => {
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
      return {
        error: true,
        message: errMessageParts.join(' from: ')
      };
    }
    const [ background, indicator, screenBackground, foreground ] = loadImageResult;
    if (background && indicator) {
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
      return {
        error: false,
        images: loadedImageAssets
      };
    }

    return {
      error: true,
      message: 'Failed to load VU meter asset: could not obtain background or indicator image texture.'
    };

  }, []);

  useEffect(() => {
    let aborted = false;

    loadAssets(meter).then((assets) => {
      if (!aborted) {
        setRenderProps({
          meter,
          assets
        });
      }
    });

    return () => {
      aborted = true;
    };
  }, [ meter, loadAssets ]);

  const extendedInfoComponent = useMemo(() => {
    if (renderProps && isExtendedMeter(renderProps.meter)) {
      return <VUMeterPixiExtendedInfo config={renderProps.meter} />;
    }
    return null;
  }, [ renderProps ]);

  if (!renderProps) {
    return null;
  }

  if (!isWebGLSupported.current) {
    const message = 'WebGL rendering is not supported on this device.';
    return (
      <VUMeterErrorPanel message={message} />
    );
  }

  const renderAssets = renderProps.assets;

  if (renderAssets.error) {
    return (
      <VUMeterErrorPanel message={renderAssets.message} />
    );
  }

  let scale = 1;
  let offsetDelta = {top: 0, left: 0};
  const background = renderAssets.images.screenBackground || renderAssets.images.background;
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
    >
      <Container
        position={{x: 0, y: 0}}
        scale={scale}>
        {
          renderAssets.images.screenBackground ?
            <Sprite
              texture={renderAssets.images.screenBackground}
              position={{x: 0, y: 0}}
            />
            :
            null
        }
        <VUMeterPixiBasic config={renderProps.meter} assets={renderAssets} />
        {extendedInfoComponent}
      </Container>
      {
        performanceSettings.vuMeterWebGLShowStats ?
          <VUMeterPixiStats
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
