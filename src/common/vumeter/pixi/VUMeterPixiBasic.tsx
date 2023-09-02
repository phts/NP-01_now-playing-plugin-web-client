import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VUMeter, VUMeterData } from 'now-playing-common';
import { useSocket } from '../../../contexts/SocketProvider';
import VUMeterPixiLinearIndicatorCommonProps from './VUMeterPixiLinearIndicatorCommonProps';
import { VUMeterPixiLoadedAssets } from './VUMeterPixiPanel';
import { Sprite } from '@pixi/react';
import VUMeterPixiLinearDefaultIndicator from './VUMeterPixiLinearDefaultIndicator';
import VUMeterPixiCircularIndicator from './VUMeterPixiCircularIndicator';

export interface VUMeterPixiBasicProps {
  config: VUMeter;
  assets: VUMeterPixiLoadedAssets;
}

const EMPTY_METER_DATA = {left: 0, right: 0, mono: 0};

function VUMeterPixiBasic(props: VUMeterPixiBasicProps) {
  const { config, assets } = props;
  const { socket } = useSocket();
  const meterDataRef = useRef<VUMeterData>(EMPTY_METER_DATA);

  useEffect(() => {
    if (socket) {
      const handler = (data: VUMeterData) => {
        meterDataRef.current = data;
      };
      socket.on('nowPlayingVUMeterData', handler);

      return () => {
        socket.off('nowPlayingVUMeterData', handler);
        meterDataRef.current = EMPTY_METER_DATA;
      };
    }
  }, [ socket ]);

  const getIndicator = useCallback(() => {
    /*If (config.type === 'circular') {
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
          <VUMeterPixiLinearDefaultIndicator {...linearLeftProps} />
          <VUMeterPixiLinearDefaultIndicator {...linearRightProps} />
        </>
      );
    }*/
    if (config.type === 'circular') {
      const circularBaseStyles = {
        img: assets.images.indicator,
        stepsPerDegree: config.stepsPerDegree,
        distance: config.distance
      };
      if (config.channels === 1) {
        return (
          <VUMeterPixiCircularIndicator
            {...circularBaseStyles}
            origin={config.monoOrigin}
            startAngle={config.angle.start}
            stopAngle={config.angle.stop}
            getValue={() => meterDataRef.current.mono}
          />
        );
      }

      return (
        <>
          <VUMeterPixiCircularIndicator
            {...circularBaseStyles}
            origin={config.leftOrigin}
            startAngle={config.angle.leftStart}
            stopAngle={config.angle.leftStop}
            getValue={() => meterDataRef.current.left}
          />
          <VUMeterPixiCircularIndicator
            {...circularBaseStyles}
            origin={config.rightOrigin}
            startAngle={config.angle.rightStart}
            stopAngle={config.angle.rightStop}
            getValue={() => meterDataRef.current.right}
          />
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
      const linearLeftProps: VUMeterPixiLinearIndicatorCommonProps = {
        img: assets.images.indicator,
        top: config.left.y,
        left: config.left.x,
        position: config.position,
        stepWidth: config.stepWidth,
        direction: getLinearMeterDirection('left'),
        flipX: config.flipLeft.x,
        getValue: () => meterDataRef.current.left
      };
      const linearRightProps: VUMeterPixiLinearIndicatorCommonProps = {
        img: assets.images.indicator,
        top: config.right.y,
        left: config.right.x,
        position: config.position,
        stepWidth: config.stepWidth,
        direction: getLinearMeterDirection('right'),
        flipX: config.flipRight.x,
        getValue: () => meterDataRef.current.right
      };
      return (
        <>
          <VUMeterPixiLinearDefaultIndicator {...linearLeftProps} />
          <VUMeterPixiLinearDefaultIndicator {...linearRightProps} />
        </>
      );
    }
  }, [ config, assets ]);

  const foreground = useMemo(() => {
    if (assets.images.foreground) {
      return (
        <Sprite
          texture={assets.images.foreground}
          position={{x: config.meter.x, y: config.meter.y}}
        />
      );
    }
    return null;
  }, [ config, assets ]);

  return (
    <>
      <Sprite
        texture={assets.images.background}
        position={{x: config.meter.x, y: config.meter.y}}
      />
      {getIndicator()}
      {foreground}
    </>
  );
}

export default VUMeterPixiBasic;
