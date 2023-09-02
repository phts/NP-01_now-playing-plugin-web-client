import * as PIXI from 'pixi.js';

interface VUMeterPixiLinearIndicatorCommonProps {
  img: PIXI.Texture;
  top: number;
  left: number;
  position: {
    regular: number;
    overload: number;
  };
  stepWidth: {
    regular: number;
    overload: number;
  };
  direction: 'left' | 'right' | 'up' | 'down';
  flipX: boolean;
  getValue: () => number;
}

export default VUMeterPixiLinearIndicatorCommonProps;
