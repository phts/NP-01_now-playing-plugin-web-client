import * as PIXI from 'pixi.js';
import React, { useMemo, useRef, useState } from 'react';
import VUMeterPixiLinearIndicatorCommonProps from './VUMeterPixiLinearIndicatorCommonProps';
import { Container, Graphics, Sprite, useTick } from '@pixi/react';

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
  const [ indicatorSpriteProps, setIndicatorSpriteProps ] = useState<IndicatorSpriteProps | null>(null);
  const lastValueRef = useRef(NaN);
  const maskRef = useRef(null);

  useTick(() => {
    const value = getValue();
    if (lastValueRef.current === value) {
      return;
    }
    lastValueRef.current = value;
    const maxSteps = position.regular + position.overload;
    const steps = Math.round((maxSteps / 100) * getValue());
    const regularSteps = Math.min(steps, position.regular);
    const overloadSteps = steps - regularSteps;
    const indicatorLength = (regularSteps * stepWidth.regular) + (overloadSteps * stepWidth.overload);
    const fullLength = (position.regular * stepWidth.regular) + (position.overload * stepWidth.overload);
    const clipLength = fullLength - indicatorLength;
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
          y: clipLength,
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

    setIndicatorSpriteProps({
      maskProps: mask,
      position: offset,
      flipX
    });
  });

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
