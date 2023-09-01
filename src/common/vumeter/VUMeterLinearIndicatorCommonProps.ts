interface VUMeterLinearIndicatorCommonProps {
  img: string;
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
  value: number;
}

export default VUMeterLinearIndicatorCommonProps;
