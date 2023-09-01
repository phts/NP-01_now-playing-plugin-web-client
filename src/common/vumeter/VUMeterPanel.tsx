/// <reference types="../../declaration.d.ts" />

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './VUMeterPanel.module.scss';
import { VUMeter, VUMeterConfig, VUMeterExtended } from 'now-playing-common';
import VUMeterExtendedInfo from './VUMeterExtendedInfo';
import VUMeterBasic from './VUMeterBasic';
import { useAppContext } from '../../contexts/AppContextProvider';
import { random } from 'lodash';
import { usePlayerState } from '../../contexts/PlayerProvider';

export type VUMeterPanelMeterProps = {
  meterType: 'random';
  randomRefreshInterval: number;
  randomRefreshOnTrackChange: boolean;
} | {
  meterType: 'fixed';
  meter: string;
}

export interface VUMeterPanelProps {
  config: {
    templateType: 'random';
    randomRefreshInterval: number;
    randomRefreshOnTrackChange: boolean;
  } | ({
    templateType: 'fixed';
    template: string;
  } & VUMeterPanelMeterProps);
  offset?: {
    top: number;
    left: number;
  }
  size?: {
    width: number;
    height: number;
  }
}

interface PanelSize {
  width: number;
  height: number;
}

const isExtendedMeter = (meter: VUMeter): meter is VUMeterExtended => {
  return Reflect.has(meter, 'extend') && !!Reflect.get(meter, 'extend');
};

function VUMeterPanel(props: VUMeterPanelProps) {
  const { pluginInfo } = useAppContext();
  const playerState = usePlayerState();
  const { config, offset, size: fitSize } = props;
  const [ loadedMeter, setLoadedMeter ] = useState<VUMeter | null>(null);
  const [ size, setSize ] = useState<PanelSize | null>(null);
  const appUrl = pluginInfo?.appUrl || null;
  const [ refreshTrigger, setRefreshTrigger ] = useState(Date.now());
  const currentPlayerStateRef = useRef(playerState);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const refreshInterval = config.templateType === 'random' || config.meterType === 'random' ? config.randomRefreshInterval : 0;
  const refreshOnTrackChange = (config.templateType === 'random' || config.meterType === 'random') && config.randomRefreshOnTrackChange;

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearRefreshTimer();
    };
  }, [ clearRefreshTimer ]);

  useEffect(() => {
    if (!loadedMeter) {
      return;
    }
    clearRefreshTimer();
    if (refreshInterval > 0) {
      refreshTimerRef.current = setTimeout(() => {
        setRefreshTrigger(Date.now());
      }, refreshInterval * 1000);
    }
    return () => {
      clearRefreshTimer();
    };
  }, [ clearRefreshTimer, refreshInterval, loadedMeter ]);

  // Random: refresh when playerState URI / title / album... changes
  useEffect(() => {
    if (!refreshOnTrackChange) {
      return;
    }
    const oldState = currentPlayerStateRef.current;
    const trackChanged =
      playerState.uri !== oldState.uri ||
      playerState.title !== oldState.title ||
      playerState.artist !== oldState.artist ||
      playerState.album !== oldState.album;

    if (trackChanged) {
      currentPlayerStateRef.current = { ...playerState };
      setRefreshTrigger(Date.now());
    }
  }, [ playerState.uri, playerState.title, playerState.artist, playerState.album, refreshOnTrackChange ]);

  const template = config.templateType === 'fixed' ? config.template : null;
  const meter = config.templateType === 'fixed' && config.meterType === 'fixed' ? config.meter : null;

  useEffect(() => {
    const loadConfig = async () => {
      const url = template ? `${appUrl}/vumeter/${template}` : `${appUrl}/vumeter`;
      try {
        const res = await fetch(url);
        const configRes = (await res.json()) as VUMeterConfig;
        if (!configRes.meters || configRes.meters.length === 0) {
          setLoadedMeter(null);
          return;
        }
        const meters = configRes.meters;
        let targetMeter: VUMeter | null = null;
        if (template && meter) {
          targetMeter = meters.find((m) => m.name === meter) || null;
        }
        if (!targetMeter) {
          targetMeter = meters[random(0, meters.length - 1)] || null;
        }
        setLoadedMeter(targetMeter);
      }
      catch (error) {
        // TODO: pass error to VUMeterPanel
        setLoadedMeter(null);
      }
    };

    if (!appUrl) {
      setLoadedMeter(null);
    }
    else {
      loadConfig();
    }
  }, [ template, meter, appUrl, refreshTrigger ]);

  useEffect(() => {
    if (!loadedMeter) {
      return;
    }
    const image = new Image();
    image.src = loadedMeter.images.screenBackground || loadedMeter.images.background;
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
  }, [ loadedMeter ]);

  const extendedInfoComponent = useMemo(() => {
    if (loadedMeter && isExtendedMeter(loadedMeter)) {
      return <VUMeterExtendedInfo config={loadedMeter} />;
    }
    return null;
  }, [ loadedMeter ]);

  if (!size || !loadedMeter) {
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

  const screenBackground = loadedMeter.images.screenBackground;
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
      <VUMeterBasic config={loadedMeter} />
      {extendedInfoComponent}
    </div>
  );
}

export default VUMeterPanel;
