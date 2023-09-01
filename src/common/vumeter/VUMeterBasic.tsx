/// <reference types="../../declaration.d.ts" />

import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './VUMeterBasic.module.scss';
import { VUMeter, VUMeterData } from 'now-playing-common';
import VUMeterCircularIndicator from './VUMeterCircularIndicator';
import { useSocket } from '../../contexts/SocketProvider';
import deepEqual from 'deep-equal';
import VUMeterLinearDefaultIndicator from './VUMeterLinearDefaultIndicator';
import VUMeterLinearIndicatorCommonProps from './VUMeterLinearIndicatorCommonProps';
import VUMeterLinearSingleIndicator from './VUMeterLinearSingleIndicator';

export interface VUMeterBasicProps {
  config: VUMeter | null;
}

interface MeterSize {
  width: number;
  height: number;
}

const EMPTY_METER_DATA = {left: 0, right: 0, mono: 0};

function VUMeterBasic(props: VUMeterBasicProps) {
  const [ meterData, setMeterData ] = useState<VUMeterData>(EMPTY_METER_DATA);
  const { config } = props;
  const { socket } = useSocket();
  const [ size, setSize ] = useState<MeterSize | null>(null);
  const latestMeterDataRef = useRef<VUMeterData>(meterData);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshMeterData = useRef<VUMeterData>(EMPTY_METER_DATA);

  useEffect(() => {
    if (!config) {
      return;
    }
    const image = new Image();
    image.src = config.images.background;
    image.onload = () => {
      setSize({
        width: image.width,
        height: image.height
      });
    };
    image.onerror = () => {
      console.log(`Failed to load image from ${config.images.background}`);
      setSize(null);
    };

    return () => {
      setSize(null);
    };
  }, [ config ]);

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
        img: config.images.indicator,
        stepsPerDegree: config.stepsPerDegree,
        distance: config.distance
      };
      if (config.channels === 1) {
        return (
          <VUMeterCircularIndicator
            {...circularBaseStyles}
            origin={config.monoOrigin}
            startAngle={config.angle.start}
            stopAngle={config.angle.stop}
            value={_meterData.mono} />
        );
      }

      return (
        <>
          <VUMeterCircularIndicator
            {...circularBaseStyles}
            origin={config.leftOrigin}
            startAngle={config.angle.leftStart}
            stopAngle={config.angle.leftStop}
            value={_meterData.left} />
          <VUMeterCircularIndicator
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
      const linearLeftProps: VUMeterLinearIndicatorCommonProps = {
        img: config.images.indicator,
        top: config.left.y,
        left: config.left.x,
        position: config.position,
        stepWidth: config.stepWidth,
        direction: getLinearMeterDirection('left'),
        flipX: config.flipLeft.x,
        value: _meterData.left
      };
      const linearRightProps: VUMeterLinearIndicatorCommonProps = {
        img: config.images.indicator,
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
            <VUMeterLinearSingleIndicator {...linearLeftProps} />
            <VUMeterLinearSingleIndicator {...linearRightProps} />
          </>
        );
      }
      return (
        <>
          <VUMeterLinearDefaultIndicator {...linearLeftProps} />
          <VUMeterLinearDefaultIndicator {...linearRightProps} />
        </>
      );
    }
  }, []);

  if (!size || !config) {
    return null;
  }

  const panelStyles = {
    '--top': `${config.meter.y}px`,
    '--left': `${config.meter.x}px`,
    '--width': `${size.width}px`,
    '--height': `${size.height}px`,
    '--background': `url("${config.images.background}")`
  } as React.CSSProperties;

  return (
    <div className={styles.Layout} style={panelStyles}>
      {getIndicator(config, meterData)}

      {config.images.foreground ?
        <div
          className={styles['Layout__foreground']}
          style={{'--foreground': `url("${config.images.foreground}")`} as React.CSSProperties}></div>
        : null}
    </div>
  );
}

export default VUMeterBasic;
