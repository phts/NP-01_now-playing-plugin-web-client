/// <reference types="../../declaration.d.ts" />

import deepEqual from 'deep-equal';
import { DateTime } from 'luxon';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAppContext } from '../../contexts/AppContextProvider';
import { useRawSettings, useTimezone } from '../../contexts/SettingsProvider';
import { requestPluginApiEndpoint } from '../../utils/api';
import { preloadImage } from '../../utils/image';
import styles from './IdleScreenBackground.module.scss';
import { IdleScreenSettings } from '../../types/settings/IdleScreenSettings';

interface BackgroundInfo {
  type?: 'volumio' | 'unsplash';
  src: string;
  nextRefresh: number;
  preloaded?: boolean;
}

type BackgroundSource = {
  type: 'volumio';
  url: string;
} | {
  type: 'color';
} | {
  type: 'unsplash';
  unsplashKeywords: string;
  unsplashKeywordsAppendDayPeriod: boolean;
  unsplashMatchScreenSize: boolean;
  unsplashRefreshInterval: number;
}

export type IdleScreenBackgroundContextValue = React.JSX.Element;

const IdleScreenBackgroundContext = createContext(<div></div> as IdleScreenBackgroundContextValue);

const getUnsplashUrl = async (apiPath: string | null, keywords: string, matchScreenSize: boolean) => {
  if (!apiPath) {
    return null;
  }
  const params: any = {
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

/*  Const qs = keywords ? encodeURIComponent(keywords) : '';
  const screenSizePart = matchScreenSize ? `${window.innerWidth}x${window.innerHeight}/` : '';
  const url = `https://source.unsplash.com/random/${screenSizePart}${qs ? '?' + qs : ''}`;
  return url + (qs ? '&' : '?') + `sig=${Date.now()}`;*/
};

const hourToKeywords = (hour: number) => {
  if (hour >= 6 && hour < 8) {
    return 'early morning';
  }
  else if (hour >= 8 && hour <= 11) {
    return 'morning';
  }
  else if (hour === 12) {
    return 'noon';
  }
  else if (hour > 12 && hour <= 17) {
    return 'afternoon';
  }
  else if (hour >= 18 && hour < 24) {
    return 'evening';
  }
  return 'night';

};

const getBackgroundSource = (screenSettings: IdleScreenSettings, host: string): BackgroundSource => {
  const backgroundType = screenSettings.backgroundType || 'unsplash';
  switch (backgroundType) {
    case 'volumioBackground':
      return {
        type: 'volumio',
        url: `${host}/backgrounds/${screenSettings.volumioBackgroundImage}`
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
        unsplashRefreshInterval: screenSettings.unsplashRefreshInterval !== undefined ? screenSettings.unsplashRefreshInterval : 10
      };
  }
};

const getBackgroundStyles = (screenSettings: IdleScreenSettings): React.CSSProperties => {
  const styles = {};
  const backgroundType = screenSettings.backgroundType || 'unsplash';
  switch (backgroundType) {
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
  switch (backgroundOverlayType) {
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

function IdleScreenBackgroundProvider({children}: { children: React.ReactNode }) {
  const {settings: screenSettings} = useRawSettings('screen.idle');
  const timeZone = useTimezone();
  const {host, pluginInfo} = useAppContext();
  const backgroundDepRef = useRef({screenSettings, host});
  const [ backgroundSource, setBackgroundSource ] = useState(getBackgroundSource(screenSettings, host));
  const [ backgroundStyles, applyBackgroundStyles ] = useState(getBackgroundStyles(screenSettings));
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [ background, setBackground ] = useState<BackgroundInfo | null>(null);

  const apiPath = pluginInfo ? pluginInfo.apiPath : null;

  const getBackground = useCallback(async (): Promise<BackgroundInfo | null> => {
    if (backgroundSource.type === 'volumio') {
      return {
        src: backgroundSource.url,
        nextRefresh: 0
      };
    }
    else if (backgroundSource.type === 'unsplash') {
      const keywords: string[] = [];
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
    return null;
  }, [ apiPath, backgroundSource, timeZone ]);

  const refresh = useCallback(async () => {
    setBackground(await getBackground());
  }, [ setBackground, getBackground ]);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const startRefreshTimer = useCallback((period: number) => {
    refreshTimerRef.current = setTimeout(refresh, period * 60 * 1000);
  }, [ refresh ]);

  // Retrieve and apply IdleScreen background settings
  useEffect(() => {
    if (host !== backgroundDepRef.current.host ||
      !deepEqual(screenSettings, backgroundDepRef.current.screenSettings)) {
      backgroundDepRef.current = { screenSettings, host };
      setBackgroundSource(getBackgroundSource(screenSettings, host));
      applyBackgroundStyles(getBackgroundStyles(screenSettings));
    }
  }, [ screenSettings, host ]);

  // Refresh when the dependencies of refresh() callback change
  useEffect(() => {
    clearRefreshTimer();
    refresh();
  }, [ clearRefreshTimer, refresh ]);

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
      };
    }
  }, [ background, startRefreshTimer, clearRefreshTimer ]);

  useEffect(() => {
    return () => {
      clearRefreshTimer();
    };
  }, [ clearRefreshTimer ]);

  const src = background ? background.src : null;
  const backgroundComponent = useMemo(() => (
    <div className={styles.Layout} style={backgroundStyles}>
      {src ? <img src={src} alt="" /> : null}
    </div>
  ), [ src, backgroundStyles ]);

  return (
    <IdleScreenBackgroundContext.Provider value={backgroundComponent}>
      {children}
    </IdleScreenBackgroundContext.Provider>)
  ;
}

const useIdleScreenBackgroundComponent = () => useContext(IdleScreenBackgroundContext);

export { useIdleScreenBackgroundComponent, IdleScreenBackgroundProvider };
