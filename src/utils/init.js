export const DEFAULT_PERFORMANCE_SETTINGS = {
  transitionEffectsKiosk: false,
  transitionEffectsOtherDevices: true,
  unmountScreensOnExit: 'default'
};

export const DEFAULT_LOCALIZATION_SETTINGS = {
  localeType: 'client',
  timezoneType: 'client',
};

export function getInitialData(prop, defaultVal = null) {
  if (window.__initialData && window.__initialData[prop]) {
    return window.__initialData[prop];
  }
  else {
    return defaultVal;
  }  
};

export function getLocationQueryParam(key, defaultVal = null) {
  const urlSearchParams = new URLSearchParams(window.location.search);
  return urlSearchParams.get(key) || defaultVal;
}

export function getInitialHost() {
  return getInitialData('host') || getLocationQueryParam('host');
};

export function getInitialPluginInfo() {
  return getInitialData('pluginInfo', null);
}

export function getInitialSettings(namespace) {
  const settings = getInitialData('settings', {});
  switch (namespace) {
    case 'screen.nowPlaying':
    case 'background':
      return settings[namespace] || {};
    case 'theme':
      return settings[namespace] || 'default';
    case 'performance':
      return settings[namespace] || DEFAULT_PERFORMANCE_SETTINGS;
    case 'localization':
      return settings[namespace] || DEFAULT_LOCALIZATION_SETTINGS;
    default:
      return null;
  }
}

export function checkKiosk() {
  const url = new URL(window.location);
  return url.hostname === 'localhost' || getLocationQueryParam('kiosk', false);
}
