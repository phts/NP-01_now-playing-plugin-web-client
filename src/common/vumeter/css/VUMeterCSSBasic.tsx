/// <reference types="../../../declaration.d.ts" />

import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './VUMeterCSSBasic.module.scss';
import { VUMeter, VUMeterData } from 'now-playing-common';
import VUMeterCSSCircularIndicator from './VUMeterCSSCircularIndicator';
import { useSocket } from '../../../contexts/SocketProvider';
import deepEqual from 'deep-equal';
import VUMeterCSSLinearDefaultIndicator from './VUMeterCSSLinearDefaultIndicator';
import VUMeterCSSLinearIndicatorCommonProps from './VUMeterCSSLinearIndicatorCommonProps';
import VUMeterCSSLinearSingleIndicator from './VUMeterCSSLinearSingleIndicator';
import { VUMeterCSSLoadedAssets } from './VUMeterCSSPanel';

export interface VUMeterCSSBasicProps {
  config: VUMeter;
  assets: VUMeterCSSLoadedAssets & { error: false }
}

const EMPTY_METER_DATA = {left: 0, right: 0, mono: 0};

function VUMeterCSSBasic(props: VUMeterCSSBasicProps) {
  const [ meterData, setMeterData ] = useState<VUMeterData>(EMPTY_METER_DATA);
  const { config, assets } = props;
  const { background, foreground, indicator } = assets.images;
  const { socket } = useSocket();
  const latestMeterDataRef = useRef<VUMeterData>(meterData);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshMeterData = useRef<VUMeterData>(EMPTY_METER_DATA);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (socket) {
      const handler = (data: VUMeterData) => {
        latestMeterDataRef.current = data;
      };
      socket.on('nowPlayingVUMeterData', handler);

      return () => {
        socket.off('nowPlayingVUMeterData', handler);
        latestMeterDataRef.current = EMPTY_METER_DATA;
        clearRefreshTimer();
      };
    }
  }, [ socket, clearRefreshTimer ]);

  const refresh = () => {
    clearRefreshTimer();
    if (!deepEqual(lastRefreshMeterData.current, latestMeterDataRef.current)) {
      lastRefreshMeterData.current = {...latestMeterDataRef.current};
      setMeterData(latestMeterDataRef.current);
    }
    startRefreshTimer();
  };

  const startRefreshTimer = useCallback(() => {
    if (config) {
      refreshTimerRef.current = setTimeout(refresh, config.uiRefreshPeriod * 1000);
    }
  }, [ config ]);

  useEffect(() => {
    startRefreshTimer();
  }, [ startRefreshTimer ]);

  const getIndicator = useCallback((config: VUMeter, _meterData: VUMeterData) => {
    if (config.type === 'circular') {
      const circularBaseStyles = {
        img: indicator,
        stepsPerDegree: config.stepsPerDegree,
        distance: config.distance
      };
      if (config.channels === 1) {
        return (
          <VUMeterCSSCircularIndicator
            {...circularBaseStyles}
            origin={config.monoOrigin}
            startAngle={config.angle.start}
            stopAngle={config.angle.stop}
            value={_meterData.mono} />
        );
      }

      return (
        <>
          <VUMeterCSSCircularIndicator
            {...circularBaseStyles}
            origin={config.leftOrigin}
            startAngle={config.angle.leftStart}
            stopAngle={config.angle.leftStop}
            value={_meterData.left} />
          <VUMeterCSSCircularIndicator
            {...circularBaseStyles}
            origin={config.rightOrigin}
            startAngle={config.angle.rightStart}
            stopAngle={config.angle.rightStop}
            value={_meterData.right} />
        </>
      );
    }
    else if (config.type === 'linear') {
      const getLinearMeterDirection = (alignment: 'left' | 'right') => {
        switch (config.direction) {
          case 'left-right':
            return 'right';
          case 'bottom-top':
            return 'up';
          case 'top-bottom':
            return 'down';
          case 'center-edges':
            return alignment === 'left' ? 'left' : 'right';
          case 'edges-center':
            return alignment === 'left' ? 'right' : 'left';
        }
      };
      const linearLeftProps: VUMeterCSSLinearIndicatorCommonProps = {
        img: indicator,
        top: config.left.y,
        left: config.left.x,
        position: config.position,
        stepWidth: config.stepWidth,
        direction: getLinearMeterDirection('left'),
        flipX: config.flipLeft.x,
        value: _meterData.left
      };
      const linearRightProps: VUMeterCSSLinearIndicatorCommonProps = {
        img: indicator,
        top: config.right.y,
        left: config.right.x,
        position: config.position,
        stepWidth: config.stepWidth,
        direction: getLinearMeterDirection('right'),
        flipX: config.flipRight.x,
        value: _meterData.right
      };
      if (config.indicatorType === 'single') {
        return (
          <>
            <VUMeterCSSLinearSingleIndicator {...linearLeftProps} />
            <VUMeterCSSLinearSingleIndicator {...linearRightProps} />
          </>
        );
      }
      return (
        <>
          <VUMeterCSSLinearDefaultIndicator {...linearLeftProps} />
          <VUMeterCSSLinearDefaultIndicator {...linearRightProps} />
        </>
      );
    }
  }, []);

  const panelStyles = {
    '--top': `${config.meter.y}px`,
    '--left': `${config.meter.x}px`,
    '--width': `${background.width}px`,
    '--height': `${background.height}px`,
    '--background': `url("${background.src}")`
  } as React.CSSProperties;

  return (
    <div className={styles.Layout} style={panelStyles}>
      {getIndicator(config, meterData)}

      {foreground ?
        <div
          className={styles['Layout__foreground']}
          style={{'--foreground': `url("${foreground.src}")`} as React.CSSProperties}></div>
        : null}
    </div>
  );
}

export default VUMeterCSSBasic;
