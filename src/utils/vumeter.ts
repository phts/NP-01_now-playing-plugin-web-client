import { VUMeter, VUMeterExtended, VUMeterLinear } from 'now-playing-common';
import { PlayerState } from '../contexts/player/PlayerStateProvider';
import { millisecondsToString } from './track';

export const VU_METER_FONT_FAMILY = {
  light: 'VUMeter Light',
  regular: 'VUMeter Regular',
  bold: 'VUMeter Bold',
  digi: 'VUMeter Digi'
} as const;

type ValueOf<T> = T[keyof T];

export function isExtendedMeter(meter: VUMeter): meter is VUMeterExtended {
  return Reflect.has(meter, 'extend') && !!Reflect.get(meter, 'extend');
}

export function getLinearMeterIndicatorLength(position: VUMeterLinear['position'], stepWidth: VUMeterLinear['stepWidth'], value: number) {
  const maxSteps = position.regular + position.overload;
  const steps = Math.round((maxSteps / 100) * value);
  const regularSteps = Math.min(steps, position.regular);
  const overloadSteps = steps - regularSteps;
  return {
    current: (regularSteps * stepWidth.regular) + (overloadSteps * stepWidth.overload),
    max: (position.regular * stepWidth.regular) + (position.overload * stepWidth.overload)
  };
}

export function getCircularMeterIndicatorAngle(startAngle: number, stopAngle: number, value: number) {
  return (((stopAngle - startAngle) / 100 * value) + startAngle) * -1;
}

export function getTimeRemainingText(duration: PlayerState['duration'], currentSeekPosition: number) {
  duration = (duration || 0) * 1000;
  const remaining = duration - currentSeekPosition;
  return millisecondsToString(remaining, 2);
}

export function loadMeterFonts(fontConfig: VUMeterExtended['font']) {
  const loadFontPromises = [
    loadFont(VU_METER_FONT_FAMILY.light, fontConfig.url.light),
    loadFont(VU_METER_FONT_FAMILY.regular, fontConfig.url.regular),
    loadFont(VU_METER_FONT_FAMILY.bold, fontConfig.url.bold),
    loadFont(VU_METER_FONT_FAMILY.digi, fontConfig.url.digi)
  ];

  return Promise.all(loadFontPromises);
}

async function loadFont(family: ValueOf<typeof VU_METER_FONT_FAMILY>, url: string) {
  const fontFace = new FontFace(family, `url("${url}")`);
  try {
    const loadedFont = await fontFace.load();
    document.fonts.add(loadedFont);
  }
  catch (error) {
    console.log(`Failed to load VU meter font from ${url}:`, error);
  }
}
