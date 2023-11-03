import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import VUMeterPixiLinearIndicatorCommonProps from './VUMeterPixiLinearIndicatorCommonProps';
import { Container, Graphics, Sprite } from '@pixi/react';
import { getLinearMeterIndicatorLength } from '../../../utils/vumeter';
import { usePlayerState } from '../../../contexts/PlayerProvider';
import { useVUMeterTicker } from './VUMeterPixiTickerProvider';

export type VUMeterPixiLinearDefaultIndicatorProps = VUMeterPixiLinearIndicatorCommonProps;

interface IndicatorSpriteProps {
  position: {
    x: number;
    y: number;
  };
  maskProps: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  flipX: boolean;
}

function VUMeterPixiLinearDefaultIndicator(props: VUMeterPixiLinearDefaultIndicatorProps) {
  const { img, top, left, position, stepWidth, direction, flipX, getValue } = props;
  const playerState = usePlayerState();
  const { ticker } = useVUMeterTicker();
  const [ indicatorSpriteProps, setIndicatorSpriteProps ] = useState<IndicatorSpriteProps | null>(null);
  const lastValueRef = useRef(NaN);
  const maskRef = useRef(null);

  const updateIndicator = useCallback((force = false) => {
    const value = getValue();
    if (lastValueRef.current === value && !force) {
      return;
    }
    lastValueRef.current = value;
    const { current: indicatorLength, max: fullLength } = getLinearMeterIndicatorLength(position, stepWidth, value);
    let mask: {
      x: number,
      y: number,
      width: number,
      height: number
    };
    const offset = { x: left, y: top };
    switch (direction) {
      case 'left':
      case 'right':
        mask = {
          x: 0,
          y: 0,
          width: indicatorLength,
          height: img.height
        };
        break;
      case 'up':
        mask = {
          x: 0,
          y: fullLength - indicatorLength,
          width: img.width,
          height: indicatorLength
        };
        break;
      case 'down':
        mask = {
          x: 0,
          y: 0,
          width: img.width,
          height: indicatorLength
        };
        break;
    }

    if (flipX && (direction === 'up' || direction === 'down')) {
      offset.x += img.width;
    }

    setIndicatorSpriteProps({
      maskProps: mask,
      position: offset,
      flipX
    });
  }, [ img, top, left, position, stepWidth, direction, flipX, getValue ]);

  useEffect(() => {
    /**
     * In case `value` has not changed (such as when paused or stopped), force update to
     * render components with changed `updateIndicator` callback dependencies.
     */
    updateIndicator(true);
  }, [ updateIndicator ]);

  const enableTick = playerState.status === 'play' || !indicatorSpriteProps || lastValueRef.current !== 0;

  const updateIndicatorTick = useCallback(() => {
    updateIndicator();
  }, [ updateIndicator ]);

  useEffect(() => {
    if (enableTick) {
      ticker.add(updateIndicatorTick);

      return () => {
        ticker.remove(updateIndicatorTick);
      };
    }
  }, [ updateIndicatorTick, enableTick ]);

  const indicatorSprite = useMemo(() => {
    if (!indicatorSpriteProps) {
      return null;
    }
    const maskProps = indicatorSpriteProps.maskProps;
    return (
      <Container
        position={indicatorSpriteProps.position}
        scale={{x: indicatorSpriteProps.flipX ? -1 : 1, y: 1}}
        mask={maskRef.current}
        visible={!!maskRef.current}
      >
        <Sprite
          texture={img}
        />
        <Graphics
          draw={(g) => {
            g.clear()
              .beginFill(0xffffff)
              .drawRect(maskProps.x, maskProps.y, maskProps.width, maskProps.height)
              .endFill();
          }}
          ref={maskRef}
        />
      </Container>
    );
  }, [ img, indicatorSpriteProps ]);

  return indicatorSprite;
}

export default VUMeterPixiLinearDefaultIndicator;
