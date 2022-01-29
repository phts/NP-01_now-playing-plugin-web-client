export function getInitialData(prop, defaultVal = null) {
  if (window.__initialData && window.__initialData[prop]) {
    return window.__initialData[prop];
  }
  else {
    return defaultVal;
  }  
};

export function getInitialHost() {
  const host = getInitialData('host');
  if (!host) {
    const urlSearchParams = new URLSearchParams(window.location.search);
    return urlSearchParams.get('host') || null;
  }
  return host;
};

export function getInitialThemeName() {
  return getInitialData('theme', 'default');
}

export function getInitialCustomStyles() {
  return getInitialData('styles', {});
};
