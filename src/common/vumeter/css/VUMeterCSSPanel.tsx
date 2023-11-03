/// <reference types="../../../declaration.d.ts" />

import React, { useEffect, useMemo, useState } from 'react';
import styles from './VUMeterCSSPanel.module.scss';
import { VUMeter } from 'now-playing-common';
import VUMeterCSSExtendedInfo from './VUMeterCSSExtendedInfo';
import VUMeterCSSBasic from './VUMeterCSSBasic';
import { isExtendedMeter } from '../../../utils/vumeter';
import VUMeterErrorPanel from '../VUMeterErrorPanel';

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

export type VUMeterCSSLoadedAssets = {
  error: false;
  images: {
    screenBackground?: HTMLImageElement;
    background: HTMLImageElement;
    foreground?: HTMLImageElement;
    indicator: HTMLImageElement;
  };
} | {
  error: true,
  message: string
}

type VUMeterCSSImageAssets = (VUMeterCSSLoadedAssets & { error: false })['images'];

function VUMeterCSSPanel(props: VUMeterCSSPanelProps) {
  const { meter, offset, size: fitSize } = props;
  const [ loadedAssets, setLoadedAssets ] = useState<VUMeterCSSLoadedAssets | null>(null);

  useEffect(() => {
    let aborted = false;

    const loadWithImageElement = (url: string) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          resolve(image);
        };
        image.onerror = () => {
          console.log(`Failed to load image from ${url}`);
          reject({src: url});
        };
        image.src = url;
      });
    };

    const doSetLoadedAssets = (assets: VUMeterCSSLoadedAssets | null) => {
      if (!aborted) {
        setLoadedAssets(assets);
      }
    };

    const loadAssets = async() => {
      setLoadedAssets(null);

      const loadImagePromises = [
        loadWithImageElement(meter.images.background),
        loadWithImageElement(meter.images.indicator),
        meter.images.screenBackground ? loadWithImageElement(meter.images.screenBackground) : Promise.resolve(null),
        meter.images.foreground ? loadWithImageElement(meter.images.foreground) : Promise.resolve(null)
      ];
      let loadImageResult: Array<HTMLImageElement | null>;
      try {
        loadImageResult = await Promise.all(loadImagePromises);
      }
      catch (error) {
        const errMessageParts = [ 'Failed to load VU meter asset' ];
        if (error?.src) {
          errMessageParts.push(error.src);
        }
        doSetLoadedAssets({
          error: true,
          message: errMessageParts.join(' from: ')
        });
        return;
      }
      const [ background, indicator, screenBackground, foreground ] = loadImageResult;
      if (background && indicator) {
        const loadedImageAssets: VUMeterCSSImageAssets = {
          background,
          indicator
        };
        if (screenBackground) {
          loadedImageAssets.screenBackground = screenBackground;
        }
        if (foreground) {
          loadedImageAssets.foreground = foreground;
        }
        doSetLoadedAssets({
          error: false,
          images: loadedImageAssets
        });
      }
      else {
        doSetLoadedAssets(null);
      }
    };

    loadAssets();

    return () => {
      aborted = true;
    };
  }, [ meter ]);

  const extendedInfoComponent = useMemo(() => {
    if (meter && isExtendedMeter(meter)) {
      return <VUMeterCSSExtendedInfo config={meter} />;
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

  const background = loadedAssets.images.screenBackground || loadedAssets.images.background;
  let scale = 1;
  let offsetDelta = {top: 0, left: 0};
  if (fitSize && fitSize.height > 0 && fitSize.width > 0) {
    scale = Math.min(
      fitSize.width / background.width,
      fitSize.height / background.height
    );

    const scaledWidth = background.width * scale;
    const scaledHeight = background.height * scale;
    offsetDelta = {
      top: (fitSize.height - scaledHeight) / 2,
      left: (fitSize.width - scaledWidth) / 2
    };
  }

  const screenBackground = loadedAssets.images.screenBackground;
  const panelStyles = {
    '--top': `${(offset ? offset.top : 0) + offsetDelta.top}px`,
    '--left': `${(offset ? offset.left : 0) + offsetDelta.left}px`,
    '--width': `${background.width}px`,
    '--height': `${background.height}px`,
    '--background': screenBackground ? `url("${screenBackground.src}")` : 'none'
  } as React.CSSProperties;

  if (scale !== 1) {
    panelStyles.transform = `scale(${scale})`;
    panelStyles.transformOrigin = '0 0';
  }

  return (
    <div className={styles.Layout} style={panelStyles}>
      <VUMeterCSSBasic config={meter} assets={loadedAssets} />
      {extendedInfoComponent}
    </div>
  );
}

export default VUMeterCSSPanel;
