import * as PIXI from 'pixi.js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { useVUMeterTicker } from './VUMeterPixiTickerProvider';

export interface VUMeterPixiExtendedInfoTitleProps {
  text: string;
  style: PIXI.TextStyle;
  position: {
    x: number;
    y: number;
  };
  maxWidth: number;
  center: boolean;
}

interface MarqueeState {
  textElement: React.ReactNode; // The element to scroll
  left: number;
  scrollDistancePerSecond: number;
  cycleDistance: number;
  pauseState: {
    active: boolean;
    millisPaused: number;
  }
}

type MarqueeRenderProps = Pick<MarqueeState, 'textElement' | 'left'>;

const getMarqueeCycleGap = (metrics: PIXI.TextMetrics) => {
  return metrics.height * 3;
};

const MARQUEE_CYCLE_PAUSE_MILLIS = 2000;

function VUMeterPixiExtendedInfoTitle(props: VUMeterPixiExtendedInfoTitleProps) {
  const { ticker } = useVUMeterTicker();
  const { text, style, position, maxWidth, center } = props;
  const [ marqueeActive, setMarqueeActive ] = useState(false);
  const marqueeStateRef = useRef<MarqueeState | null>(null);
  const [ marqueeRenderProps, setMarqueeRenderProps ] = useState<MarqueeRenderProps | null>(null);
  const marqueeContainerMaskRef = useRef(null);
  const textElementRef = useRef<PIXI.Container | null>(null);

  const metrics = useMemo(() => {
    return PIXI.TextMetrics.measureText(text, style);
  }, [ text, style ]);

  useEffect(() => {
    if (metrics.width > maxWidth) {
      const cycleDistance = metrics.width + getMarqueeCycleGap(metrics);

      const textElement = (
        <Container key={Date.now().toString()} ref={textElementRef} cacheAsBitmap>
          <Text text={text} style={style} />
          <Text text={text} style={style} position={{x: cycleDistance, y: 0}} />
        </Container>
      );

      marqueeStateRef.current = {
        textElement,
        left: 0,
        scrollDistancePerSecond: 40 / 800 * maxWidth,
        cycleDistance,
        pauseState: {
          active: true,
          millisPaused: 0
        }
      };
      setMarqueeActive(true);

      return () => {
        if (textElementRef.current) {
          textElementRef.current.destroy();
        }
      };
    }

    // No marquee needed
    marqueeStateRef.current = null;
    setMarqueeActive(false);

  }, [ metrics, text, style, maxWidth ]);

  const scrollMarquee = useCallback(() => {
    const marqueeState = marqueeStateRef.current;
    if (!marqueeState) {
      return;
    }
    const elapsedMS = ticker.elapsedMS;
    if (marqueeState.pauseState.active) {
      const millisPaused = marqueeState.pauseState.millisPaused + elapsedMS;
      if (millisPaused < MARQUEE_CYCLE_PAUSE_MILLIS) {
        marqueeState.pauseState.millisPaused = millisPaused;
        setMarqueeRenderProps({
          textElement: marqueeState.textElement,
          left: marqueeState.left
        });
        return;
      }
      marqueeState.pauseState.active = false;
      marqueeState.pauseState.millisPaused = 0;
    }
    const scrollDistance = (marqueeState.scrollDistancePerSecond / 1000) * elapsedMS;
    let newLeft = marqueeState.left - scrollDistance;
    if (newLeft + marqueeState.cycleDistance < 0) {
      // Scrolled one cycle
      newLeft = 0;
      marqueeState.pauseState.active = true;
    }
    marqueeState.left = newLeft;
    setMarqueeRenderProps({
      textElement: marqueeState.textElement,
      left: newLeft
    });
  }, []);

  useEffect(() => {
    if (marqueeActive) {
      ticker.add(scrollMarquee);

      return () => {
        ticker.remove(scrollMarquee);
      };
    }
  }, [ marqueeActive ]);

  const drawMarqueeContainerMask = useCallback((g: PIXI.Graphics) => {
    g.clear()
      .beginFill(0xffffff)
      .drawRect(0, 0, maxWidth, metrics.height)
      .endFill();
  }, [ maxWidth, metrics.height ]);

  if (!marqueeActive || !marqueeRenderProps) {
    return (
      <Text
        text={text}
        style={style}
        position={{
          x: position.x + (center ? (maxWidth - metrics.width) / 2 : 0),
          y: position.y
        }}
      />
    );
  }

  return (
    <Container
      position={position}
      mask={marqueeContainerMaskRef.current}
      visible={!!marqueeContainerMaskRef.current}
    >
      <Container position={{x: marqueeRenderProps.left, y: 0}}>
        {marqueeRenderProps.textElement}
      </Container>
      <Graphics
        draw={drawMarqueeContainerMask}
        ref={marqueeContainerMaskRef}
      />
    </Container>
  );
}

export default VUMeterPixiExtendedInfoTitle;
