import { PluginInfo } from '../contexts/AppContextProvider';
import { DefaultActionPanelSettings } from '../types/settings/ActionPanelSettings';
import { DefaultBackgroundSettings } from '../types/settings/BackgroundSettings';
import { DefaultIdleScreenSettings } from '../types/settings/IdleScreenSettings';
import { DefaultLocalizationSettings } from '../types/settings/LocalizationSettings';
import { DefaultNowPlayerScreenSettings } from '../types/settings/NowPlayingScreenSettings';
import { DefaultPerformanceSettings } from '../types/settings/PerformanceSettings';
import { SettingsCategory, SettingsOf } from '../types/settings/Settings';
import { DefaultThemeSettings } from '../types/settings/ThemeSettings';

export const DEFAULT_PERFORMANCE_SETTINGS = {
  transitionEffectsKiosk: false,
  transitionEffectsOtherDevices: true,
  unmountScreensOnExit: 'default'
};

export const DEFAULT_LOCALIZATION_SETTINGS = {
  localeType: 'client',
  timezoneType: 'client'
};

export function getInitialData<T>(prop: string, defaultVal: T): T;
export function getInitialData<T>(prop: string, defaultVal?: T): T | undefined;
export function getInitialData<T>(prop: string, defaultVal?: T): T | undefined {
  const _window = window as any;
  if (_window.__initialData && _window.__initialData[prop]) {
    return _window.__initialData[prop];
  }

  return defaultVal;

}

export function getLocationQueryParam(key: string, defaultVal: string): string;
export function getLocationQueryParam(key: string, defaultVal?: string): string | null;
export function getLocationQueryParam(key: string, defaultVal?: string) {
  const urlSearchParams = new URLSearchParams(window.location.search);
  return urlSearchParams.get(key) || defaultVal || null;
}

export function getInitialHost() {
  return getInitialData<string>('host') || getLocationQueryParam('host') || '';
}

export function getInitialPluginInfo() {
  return getInitialData<PluginInfo | null>('pluginInfo', null);
}

export function getInitialSettings<T extends SettingsCategory>(category: T): SettingsOf<T> {
  const settings = getInitialData<any>('settings', null);
  switch (category) {
    case 'screen.nowPlaying':
      return settings?.[category] || DefaultNowPlayerScreenSettings;
    case 'screen.idle':
      return settings?.[category] || DefaultIdleScreenSettings;
    case 'background':
      return settings?.[category] || DefaultBackgroundSettings;
    case 'actionPanel':
      return settings?.[category] || DefaultActionPanelSettings;
    case 'theme':
      return settings?.[category] || DefaultThemeSettings;
    case 'performance':
      return settings?.[category] || DefaultPerformanceSettings;
    case 'localization':
      return settings?.[category] || DefaultLocalizationSettings;
    default:
      throw Error(`Unknown settings category: ${category}`);
  }
}

export function checkKiosk() {
  return window.location.hostname === 'localhost' || (!!JSON.parse(getLocationQueryParam('kiosk', '0')));
}
