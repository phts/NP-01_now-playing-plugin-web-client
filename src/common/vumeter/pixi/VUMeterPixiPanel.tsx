/// <reference types="../../../declaration.d.ts" />

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './VUMeterPixiPanel.module.scss';
import * as PIXI from 'pixi.js-legacy';
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
  impl: 'webgl' | 'canvas';
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

type LoadImageAssetResult = ({
  error: false;
  texture: PIXI.Texture;
} | {
  error: true;
  url: string;
}) & {
  assetName: keyof VUMeterPixiImageAssets;
}

const loadImageTexture = async (url: string, assetName: LoadImageAssetResult['assetName']): Promise<LoadImageAssetResult> => {
  try {
    return {
      error: false,
      assetName,
      texture: await PIXI.Texture.fromURL(url)
    };
  }
  catch (error) {
    return {
      error: true,
      assetName,
      url
    };
  }
};

function VUMeterPixiPanel(props: VUMeterPixiPanelProps) {
  const { settings: performanceSettings } = useSettings(CommonSettingsCategory.Performance);
  const { meter, offset, size: fitSize, impl } = props;
  const [ renderProps, setRenderProps ] = useState<RenderProps | null>(null);
  const [ forceRefreshing, setForceRefreshing ] = useState(false);
  const isFirstRunRef = useRef(true);
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

  useEffect(() => {
    if (isFirstRunRef.current) {
      return;
    }
    // Probably unsafe to change PIXI.Application.renderer directly...
    // So force refresh when impl changes from 'webgl' to 'canvas' or vice versa.
    setForceRefreshing(true);
    const timer = setTimeout(() => {
      setForceRefreshing(false);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [ impl ]);

  const loadAssets = useCallback(async(meter: VUMeter): Promise<VUMeterPixiLoadedAssets> => {
    const loadImagePromises = [
      loadImageTexture(meter.images.background, 'background'),
      loadImageTexture(meter.images.indicator, 'indicator')
    ];
    if (meter.images.screenBackground) {
      loadImagePromises.push(loadImageTexture(meter.images.screenBackground, 'screenBackground'));
    }
    if (meter.images.foreground) {
      loadImagePromises.push(loadImageTexture(meter.images.foreground, 'foreground'));
    }
    const loadImageResult: Array<LoadImageAssetResult> = await Promise.all(loadImagePromises);

    const errorResult = (url: string, tag: string): VUMeterPixiLoadedAssets => {
      loadImageResult.forEach((r) => {
        if (!r.error) {
          r.texture.destroy(true);
        }
      });
      return {
        error: true,
        message: `Failed to load VU meter ${tag} from: ${url}`
      };
    };

    const [ background, indicator, screenBackground, foreground ] = loadImageResult;

    for (const requiredAsset of [ background, indicator ]) {
      if (requiredAsset.error) {
        return errorResult(requiredAsset.url, requiredAsset.assetName);
      }
    }
    const loadedImageAssets: VUMeterPixiImageAssets = {
      background: (background as LoadImageAssetResult & {error: false}).texture,
      indicator: (indicator as LoadImageAssetResult & {error: false}).texture
    };

    for (const optionalAsset of [ screenBackground, foreground ]) {
      if (optionalAsset) {
        if (!optionalAsset.error) {
          loadedImageAssets[optionalAsset.assetName] = optionalAsset.texture;
        }
        else {
          console.warn(`Failed to load VU meter ${optionalAsset.assetName} from: ${optionalAsset.url}`);
        }
      }
    }

    return {
      error: false,
      images: loadedImageAssets
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

  const extraStats = useMemo(() => {
    if (performanceSettings.vuMeterWebGLShowStats) {
      return {
        Template: meter.template,
        Meter: meter.name
      };
    }
    return undefined;
  }, [ performanceSettings.vuMeterWebGLShowStats, meter.name ]);

  useEffect(() => {
    isFirstRunRef.current = false;
  }, []);

  if (!renderProps || forceRefreshing) {
    return null;
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
  if (!renderAssets.images.screenBackground) {
    stageSize.width += renderProps.meter.meter.x;
    stageSize.height += renderProps.meter.meter.y;
  }
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
      forceCanvas={impl === 'canvas' || !isWebGLSupported.current}
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
            extraStats={extraStats}
          />
          :
          null
      }
    </VUMeterPixiStage>
  );
}

export default VUMeterPixiPanel;
