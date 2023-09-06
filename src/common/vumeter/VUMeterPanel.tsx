import React, { useCallback, useEffect, useRef, useState } from 'react';
import { VUMeter, VUMeterConfig } from 'now-playing-common';
import { useAppContext } from '../../contexts/AppContextProvider';
import { random } from 'lodash';
import { usePlayerState } from '../../contexts/PlayerProvider';
import VUMeterCSSPanel from './css/VUMeterCSSPanel';
import VUMeterPixiPanel from './pixi/VUMeterPixiPanel';
import VUMeterErrorPanel from './VUMeterErrorPanel';
import deepEqual from 'deep-equal';

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
  };
  size?: {
    width: number;
    height: number;
  };
  impl?: 'css' | 'pixi';
}

type LoadedMeter = {
  error: false;
  meter: VUMeter;
} | {
  error: true;
  message: string;
}

function VUMeterPanel(props: VUMeterPanelProps) {
  const { pluginInfo } = useAppContext();
  const playerState = usePlayerState();
  const { config } = props;
  const [ loadedMeter, setLoadedMeter ] = useState<LoadedMeter | null>(null);
  const currentMeterRef = useRef<VUMeter | null>(null);
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
    const doSetLoadedMeter = (lm: LoadedMeter | null) => {
      if (!lm) {
        currentMeterRef.current = null;
        setLoadedMeter(null);
      }
      else if (lm.error) {
        currentMeterRef.current = null;
        setLoadedMeter(lm);
      }
      else if (!deepEqual(lm.meter, currentMeterRef.current)) {
        currentMeterRef.current = lm.meter;
        setLoadedMeter(lm);
      }
    };

    const loadConfig = async () => {
      const url = template ? `${appUrl}/vumeter/${template}` : `${appUrl}/vumeter`;
      try {
        const res = await fetch(url);
        const configRes = (await res.json()) as VUMeterConfig;
        if (configRes.error) {
          doSetLoadedMeter({
            error: true,
            message: configRes.error
          });
          return;
        }
        const meters = configRes.meters;
        if (!meters || meters.length === 0) {
          const errMessage = template ? `No VU meters defined in '${template}` : 'No VU meters found';
          doSetLoadedMeter({
            error: true,
            message: errMessage
          });
          return;
        }
        let targetMeter: VUMeter | null = null;
        if (template && meter) {
          targetMeter = meters.find((m) => m.name === meter) || null;
          if (!targetMeter) {
            doSetLoadedMeter({
              error: true,
              message: `Meter '${meter}' not found in '${template}'`
            });
            return;
          }
        }
        else {
          targetMeter = meters[random(0, meters.length - 1)];
        }
        doSetLoadedMeter({
          error: false,
          meter: targetMeter
        });
      }
      catch (error) {
        doSetLoadedMeter({
          error: true,
          message: `Failed to load VU meter template from: ${url}`
        });
      }
    };

    if (!appUrl) {
      doSetLoadedMeter(null);
    }
    else {
      loadConfig();
    }
  }, [ template, meter, appUrl, refreshTrigger ]);

  if (!loadedMeter) {
    return null;
  }

  if (loadedMeter.error) {
    return (
      <VUMeterErrorPanel message={loadedMeter.message} />
    );
  }

  return (
    props.impl === undefined || props.impl === 'pixi' ?
      <VUMeterPixiPanel
        meter={loadedMeter.meter}
        size={props.size}
        offset={props.offset}
      />
      :
      <VUMeterCSSPanel
        meter={loadedMeter.meter}
        size={props.size}
        offset={props.offset}
      />
  );
}

export default VUMeterPanel;
