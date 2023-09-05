import * as PIXI from 'pixi.js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Container, Graphics, Text, useTick } from '@pixi/react';

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
  textElement: React.ReactNode;
  left: number;
  scrollPerSecond: number;
  pauseState: {
    active: boolean;
    millisPaused: number;
  }
}

const getMarqueeCycleGap = (metrics: PIXI.TextMetrics) => {
  return metrics.height * 3;
};

const MARQUEE_CYCLE_PAUSE_MILLIS = 2000;

function VUMeterPixiExtendedInfoTitle(props: VUMeterPixiExtendedInfoTitleProps) {
  const { text, style, position, maxWidth, center } = props;
  const [ marqueeState, setMarqueeState ] = useState<MarqueeState | null>(null);
  const marqueeContainerMaskRef = useRef(null);

  const metrics = useMemo(() => {
    return PIXI.TextMetrics.measureText(text, style);
  }, [ text, style ]);

  useEffect(() => {
    if (metrics.width > maxWidth) {
      const textElement = (
        <Container>
          <Text text={text} style={style} />
          <Text text={text} style={style} position={{x: metrics.width + getMarqueeCycleGap(metrics), y: 0}} />
        </Container>
      );

      setMarqueeState({
        textElement,
        left: 0,
        scrollPerSecond: 40 / 800 * metrics.width,
        pauseState: {
          active: true,
          millisPaused: 0
        }
      });
    }
    else {
      // No marquee needed
      setMarqueeState(null);
    }
  }, [ metrics, text, style ]);

  useTick((delta) => {
    if (!marqueeState) {
      return;
    }
    const fps = PIXI.Ticker.shared.FPS;
    if (marqueeState.pauseState.active) {
      const millisPaused = marqueeState.pauseState.millisPaused + ((delta / fps) * 1000);
      if (millisPaused < MARQUEE_CYCLE_PAUSE_MILLIS) {
        marqueeState.pauseState.millisPaused = millisPaused;
        setMarqueeState({...marqueeState});
        return;
      }
      marqueeState.pauseState.active = false;
      marqueeState.pauseState.millisPaused = 0;
    }
    const scroll = (marqueeState.scrollPerSecond / fps) * delta;
    let newLeft = marqueeState.left - scroll;
    if (newLeft + metrics.width + getMarqueeCycleGap(metrics) < 0) {
      // Scrolled one cycle
      newLeft = 0;
      marqueeState.pauseState.active = true;
    }
    setMarqueeState({
      ...marqueeState,
      left: newLeft
    });
  }, !!marqueeState);

  const drawMarqueeContainerMask = useCallback((g: PIXI.Graphics) => {
    g.clear()
      .beginFill(0xffffff)
      .drawRect(0, 0, maxWidth, metrics.height)
      .endFill();
  }, [ maxWidth, metrics.height ]);

  if (!marqueeState) {
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
      <Container position={{x: marqueeState.left, y: 0}}>
        {marqueeState.textElement}
      </Container>
      <Graphics
        draw={drawMarqueeContainerMask}
        ref={marqueeContainerMaskRef}
      />
    </Container>
  );
}

export default VUMeterPixiExtendedInfoTitle;
