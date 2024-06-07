import { DefaultStartupOptions } from 'now-playing-common/dist/config/StartupOptions';
import { PluginInfo } from '../contexts/AppContextProvider';
import { CommonSettingsCategory, CommonSettingsOf, DefaultActionPanelSettings, DefaultBackgroundSettings, DefaultIdleScreenSettings, DefaultLocalizationSettings, DefaultNowPlayingScreenSettings, DefaultPerformanceSettings, DefaultThemeSettings } from 'now-playing-common';
import { DefaultContentRegionSettings } from 'now-playing-common/dist/config/ContentRegionSettings';

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

export function getInitialSettings<T extends CommonSettingsCategory>(category: T): CommonSettingsOf<T> {
  const settings = getInitialData<any>('settings', null);
  switch (category) {
    case CommonSettingsCategory.Startup:
      return settings?.[category] || DefaultStartupOptions;
    case CommonSettingsCategory.ContentRegion:
      return settings?.[category] || DefaultContentRegionSettings;
    case CommonSettingsCategory.NowPlayingScreen:
      return settings?.[category] || DefaultNowPlayingScreenSettings;
    case CommonSettingsCategory.IdleScreen:
      return settings?.[category] || DefaultIdleScreenSettings;
    case CommonSettingsCategory.Background:
      return settings?.[category] || DefaultBackgroundSettings;
    case CommonSettingsCategory.ActionPanel:
      return settings?.[category] || DefaultActionPanelSettings;
    case CommonSettingsCategory.Theme:
      return settings?.[category] || DefaultThemeSettings;
    case CommonSettingsCategory.Performance:
      return settings?.[category] || DefaultPerformanceSettings;
    case CommonSettingsCategory.Localization:
      return settings?.[category] || DefaultLocalizationSettings;
    default:
      throw Error(`Unknown settings category: ${category}`);
  }
}

export function checkKiosk() {
  return window.location.hostname === 'localhost' || (!!JSON.parse(getLocationQueryParam('kiosk', '0')));
}
