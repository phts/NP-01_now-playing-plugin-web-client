import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import VUMeterPixiLinearIndicatorCommonProps from './VUMeterPixiLinearIndicatorCommonProps';
import { Sprite } from '@pixi/react';
import { getLinearMeterIndicatorLength } from '../../../utils/vumeter';
import { usePlayerState } from '../../../contexts/PlayerProvider';
import { useVUMeterTicker } from './VUMeterPixiTickerProvider';

export type VUMeterPixiLinearSingleIndicatorProps = VUMeterPixiLinearIndicatorCommonProps;

interface IndicatorSpriteProps {
  position: {
    x: number;
    y: number;
  };
  flipX: boolean;
}

function VUMeterPixiLinearSingleIndicator(props: VUMeterPixiLinearSingleIndicatorProps) {
  const { img, top, left, position, stepWidth, direction, flipX, getValue } = props;
  const playerState = usePlayerState();
  const { ticker } = useVUMeterTicker();
  const [ indicatorSpriteProps, setIndicatorSpriteProps ] = useState<IndicatorSpriteProps | null>(null);
  const lastValueRef = useRef(NaN);

  const updateIndicator = useCallback((force = false) => {
    const value = getValue();
    if (lastValueRef.current === value && !force) {
      return;
    }
    lastValueRef.current = value;

    const { current: distance } = getLinearMeterIndicatorLength(position, stepWidth, value);

    let offset: { x: number; y: number; };
    switch (direction) {
      case 'left':
        offset = {
          x: left - distance,
          y: top
        };
        break;
      case 'right':
        offset = {
          x: left + distance,
          y: top
        };
        break;
      case 'up':
        offset = {
          x: left,
          y: top - distance
        };
        break;
      case 'down':
        offset = {
          x: left,
          y: top + distance
        };
        break;
    }

    if (flipX && (direction === 'up' || direction === 'down')) {
      offset.x += img.width;
    }

    setIndicatorSpriteProps({
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
    return (
      <Sprite
        texture={img}
        position={indicatorSpriteProps.position}
        scale={{ x: indicatorSpriteProps.flipX ? -1 : 1, y: 1 }}
      />
    );
  }, [ img, indicatorSpriteProps ]);

  return indicatorSprite;
}

export default VUMeterPixiLinearSingleIndicator;
