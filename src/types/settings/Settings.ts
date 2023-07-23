import { ActionPanelSettings } from './ActionPanelSettings';
import { BackgroundSettings } from './BackgroundSettings';
import { IdleScreenSettings } from './IdleScreenSettings';
import { LocalizationSettings } from './LocalizationSettings';
import { NowPlayingScreenSettings } from './NowPlayingScreenSettings';
import { PerformanceSettings } from './PerformanceSettings';
import { ThemeSettings } from './ThemeSettings';

export type SettingsCategory =
  'theme' |
  'performance' |
  'localization' |
  'background' |
  'actionPanel' |
  'screen.nowPlaying' |
  'screen.idle';

export type SettingsOf<T extends SettingsCategory> =
  T extends 'theme' ? ThemeSettings :
  T extends 'performance' ? PerformanceSettings :
  T extends 'localization' ? LocalizationSettings :
  T extends 'background' ? BackgroundSettings :
  T extends 'actionPanel' ? ActionPanelSettings :
  T extends 'screen.nowPlaying' ? NowPlayingScreenSettings :
  T extends 'screen.idle' ? IdleScreenSettings :
  never;

export type DockComponentPlacement =
  'top-left' | 'top' | 'top-right' |
  'left' | 'right' |
  'bottom-left' | 'bottom' | 'bottom-right';

export type ImageFit = 'cover' | 'contain' | 'fill';
export type WeatherIconStyle = 'filled' | 'outline' | 'mono';

export type BackgroundPosition = 'center' | 'top' | 'left' | 'bottom' | 'right';
export type BackgroundOverlay = 'default' | 'customColor' | 'customGradient' | 'none';
