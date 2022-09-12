import deepEqual from 'deep-equal';
import { DateTime } from 'luxon';
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useAppContext } from '../../contexts/AppContextProvider';
import { useRawSettings, useTimezone } from '../../contexts/SettingsProvider';
import { requestPluginApiEndpoint } from '../../utils/api';
import { preloadImage } from '../../utils/image';
import styles from './IdleScreenBackground.module.scss';

const IdleScreenBackgroundContext = createContext();

const getUnsplashUrl = async (apiPath, keywords, matchScreenSize) => {
  if (!apiPath) {
    return null;
  }
  const params = {
    keywords
  };
  if (matchScreenSize) {
    params.w = window.innerWidth;
    params.h = window.innerHeight;
  }
  const result = await requestPluginApiEndpoint(apiPath, '/unsplash/getRandomPhoto', params);
  if (result.success) {
    return result.data;
  }

  return null;

/*  const qs = keywords ? encodeURIComponent(keywords) : '';
  const screenSizePart = matchScreenSize ? `${window.innerWidth}x${window.innerHeight}/` : '';
  const url = `https://source.unsplash.com/random/${screenSizePart}${qs ? '?' + qs : ''}`;
  return url + (qs ? '&' : '?') + `sig=${Date.now()}`;*/
};

const hourToKeywords = (hour) => {
  if (hour >= 6 && hour < 8) {
    return 'early morning';
  } else if (hour >= 8 && hour <= 11) {
    return 'morning';
  } else if (hour === 12) {
    return 'noon';
  } else if (hour > 12 && hour <= 17) {
    return 'afternoon';
  } else if (hour >= 18 && hour < 24) {
    return 'evening';
  } else {
    return 'night';
  }
};

const getBackgroundSource = (screenSettings, host) => {
  const backgroundType = screenSettings.backgroundType || 'unsplash';
  switch(backgroundType) {
    case 'volumioBackground':
      return {
        type: 'volumio',
        url: `${ host }/backgrounds/${ screenSettings.volumioBackgroundImage }`,
      };
    case 'color':
      return {
        type: 'color'
      };
    default:
      return {
        type: 'unsplash',
        unsplashKeywords: screenSettings.unsplashKeywords || '',
        unsplashKeywordsAppendDayPeriod: screenSettings.unsplashKeywordsAppendDayPeriod || false,
        unsplashMatchScreenSize: screenSettings.unsplashMatchScreenSize !== undefined ? screenSettings.unsplashMatchScreenSize : true,
        unsplashRefreshInterval: screenSettings.unsplashRefreshInterval !== undefined ? screenSettings.unsplashRefreshInterval : 10,
      };
  }
};

const getBackgroundStyles = (screenSettings) => {
  const styles = {};
  const backgroundType = screenSettings.backgroundType || 'unsplash';
  switch(backgroundType) {
    case 'volumioBackground':
      Object.assign(styles, {
        '--background-fit': screenSettings.volumioBackgroundFit || null,
        '--background-position': screenSettings.volumioBackgroundPosition || null,
        '--background-blur': screenSettings.volumioBackgroundBlur || null,
        '--background-scale': screenSettings.volumioBackgroundScale || null
      });
      break;
    case 'color':
      Object.assign(styles, {
        '--background-color': screenSettings.backgroundColor || null
      });
      break;
    default: // Unsplash
      Object.assign(styles, {
        '--background-blur': screenSettings.unsplashBackgroundBlur || null
      });
  }

  const backgroundOverlayType = screenSettings.backgroundOverlay || 'default';
  switch(backgroundOverlayType) {
    case 'none':
      Object.assign(styles, {
        '--background-overlay-display': 'none'
      });
      break;
    case 'customColor':
      Object.assign(styles, {
        '--background-overlay-color': screenSettings.backgroundOverlayColor || null,
        '--background-overlay-opacity': screenSettings.backgroundOverlayColorOpacity || null
      });
      break;
    case 'customGradient':
      Object.assign(styles, {
        '--background-overlay-gradient': screenSettings.backgroundOverlayGradient || null,
        '--background-overlay-opacity': screenSettings.backgroundOverlayGradientOpacity || null
      });
      break;
    default:
      // Do nothing
  }

  return styles;
};

const backgroundSettingsReducer = (currentSettings, newSettings) => deepEqual(currentSettings, newSettings) ? currentSettings : newSettings;

function IdleScreenBackgroundProvider({children}) {
  const {settings: screenSettings} = useRawSettings('screen.idle');
  const timeZone = useTimezone();
  const {host, pluginInfo} = useAppContext();
  const [backgroundSource, setBackgroundSource] = useReducer(backgroundSettingsReducer, getBackgroundSource(screenSettings, host));
  const [backgroundStyles, applyBackgroundStyles] = useReducer(backgroundSettingsReducer, getBackgroundStyles(screenSettings));
  const refreshTimerRef = useRef(null);
  const [background, setBackground] = useState(null);

  const apiPath = pluginInfo ? pluginInfo.apiPath : null;

  const getBackground = useCallback(async () => {
    if (backgroundSource.type === 'volumio') {
      return {
        src: backgroundSource.url,
        nextRefresh: 0
      };
    }
    else if (backgroundSource.type === 'unsplash') {
      const keywords = [];
      if (backgroundSource.unsplashKeywords) {
        keywords.push(backgroundSource.unsplashKeywords);
      }
      if (!backgroundSource.unsplashKeywords?.trim() || backgroundSource.unsplashKeywordsAppendDayPeriod) {
        const dateTime = DateTime.local({zone: timeZone, locale: 'en'});
        keywords.push(hourToKeywords(dateTime.hour));
      }
      return {
        type: 'unsplash',
        src: await getUnsplashUrl(apiPath, keywords.join(' '), backgroundSource.unsplashMatchScreenSize),
        nextRefresh: backgroundSource.unsplashRefreshInterval || 0
      };
    }
    return {};
  }, [apiPath, backgroundSource, timeZone]);

  const refresh = useCallback(async () => {
    setBackground(await getBackground());
  }, [setBackground, getBackground]);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const startRefreshTimer = useCallback((period) => {
    refreshTimerRef.current = setTimeout(refresh, period * 60 * 1000);
  }, [refresh]);

  // Retrieve and apply IdleScreen background settings
  useEffect(() => {
    setBackgroundSource(getBackgroundSource(screenSettings, host));
    applyBackgroundStyles(getBackgroundStyles(screenSettings));
  }, [screenSettings, host]);

  // Refresh when the dependencies of refresh() callback change
  useEffect(() => {
    clearRefreshTimer();
    refresh();
  }, [clearRefreshTimer, refresh]);

  // Background change - Preload and start refresh timer if necessary
  useEffect(() => {
    if (background && !background.preloaded) {
      const preloader = preloadImage(background.src);
      background.preloaded = true;
      clearRefreshTimer();
      if (background.type === 'unsplash' && background.nextRefresh) {
        startRefreshTimer(background.nextRefresh);
      }
      return () => {
        preloader.dispose();
      }
    }
  }, [background, startRefreshTimer, clearRefreshTimer]);

  useEffect(() => {
    return () => {
      clearRefreshTimer();
    }
  }, [clearRefreshTimer]);

  const src = background ? background.src : null;
  const backgroundComponent = useMemo(() => (
    <div className={styles.Layout} style={backgroundStyles}>
      {src ? <img src={src} alt="" /> : null}
    </div>
  ), [src, backgroundStyles]);

  return (
    <IdleScreenBackgroundContext.Provider value={backgroundComponent}>
      {children}
    </IdleScreenBackgroundContext.Provider>)
  ;
}

const useIdleScreenBackgroundComponent = () => useContext(IdleScreenBackgroundContext);

export { useIdleScreenBackgroundComponent, IdleScreenBackgroundProvider };
