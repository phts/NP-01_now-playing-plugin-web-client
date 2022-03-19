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

export function getInitialThemeName() {
  return getInitialData('theme', 'default');
}

export function getInitialCustomStyles() {
  return getInitialData('styles', {});
};
