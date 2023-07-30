/// <reference types="../../declaration.d.ts" />

import deepEqual from 'deep-equal';
import { DateTime } from 'luxon';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAppContext } from '../../contexts/AppContextProvider';
import { useSettings, useTimezone } from '../../contexts/SettingsProvider';
import { requestPluginApiEndpoint } from '../../utils/api';
import { preloadImage } from '../../utils/image';
import styles from './IdleScreenBackground.module.scss';
import { CommonSettingsCategory, CommonSettingsOf, IdleScreenSettings } from 'now-playing-common';

interface BackgroundInfo {
  type?: 'volumio' | 'unsplash' | 'myBackground';
  src: string | null;
  nextRefresh: number;
  preloaded?: boolean;
}

type BackgroundSource = {
  type: 'volumio';
  url: string;
} | {
  type: 'myBackground';
  url: string | null;
  isRandom: boolean;
  myBackgroundRefreshInterval: number;
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

const getUnsplashUrl = async (apiPath: string | null, keywords: string, matchScreenSize: boolean): Promise<string | null> => {
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

const getBackgroundSource = (screenSettings: CommonSettingsOf<IdleScreenSettings>, host: string, appUrl: string | null): BackgroundSource => {
  const backgroundType = screenSettings.backgroundType;
  if (backgroundType === 'volumioBackground' && screenSettings.volumioBackgroundImage) {
    return {
      type: 'volumio',
      url: `${host}/backgrounds/${screenSettings.volumioBackgroundImage}`
    };
  }
  else if (backgroundType === 'color') {
    return {
      type: 'color'
    };
  }
  else if (backgroundType === 'myBackground') {
    let myBackgroundUrl: string | null = null;
    if (appUrl) {
      myBackgroundUrl = `${appUrl}/mybg`;

      if (screenSettings.myBackgroundImageType === 'fixed' && screenSettings.myBackgroundImage) {
        myBackgroundUrl += `?file=${encodeURIComponent(screenSettings.myBackgroundImage)}`;
      }
    }
    return {
      type: 'myBackground',
      url: myBackgroundUrl,
      isRandom: screenSettings.myBackgroundImageType === 'random',
      myBackgroundRefreshInterval: screenSettings.myBackgroundImageType === 'random' ? screenSettings.myBackgroundRandomRefreshInterval : 0
    };
  }

  return {
    type: 'unsplash',
    unsplashKeywords: screenSettings.unsplashKeywords,
    unsplashKeywordsAppendDayPeriod: screenSettings.unsplashKeywordsAppendDayPeriod,
    unsplashMatchScreenSize: screenSettings.unsplashMatchScreenSize,
    unsplashRefreshInterval: screenSettings.unsplashRefreshInterval
  };

};

const getBackgroundStyles = (screenSettings: IdleScreenSettings): React.CSSProperties => {
  const styles = {};
  switch (screenSettings.backgroundType) {
    case 'volumioBackground':
      Object.assign(styles, {
        '--background-fit': screenSettings.volumioBackgroundFit,
        '--background-position': screenSettings.volumioBackgroundPosition,
        '--background-blur': screenSettings.volumioBackgroundBlur,
        '--background-scale': screenSettings.volumioBackgroundScale
      });
      break;
    case 'myBackground':
      Object.assign(styles, {
        '--background-fit': screenSettings.myBackgroundFit,
        '--background-position': screenSettings.myBackgroundPosition,
        '--background-blur': screenSettings.myBackgroundBlur,
        '--background-scale': screenSettings.myBackgroundScale
      });
      break;
    case 'color':
      Object.assign(styles, {
        '--background-color': screenSettings.backgroundColor
      });
      break;
    default: // Unsplash
      Object.assign(styles, {
        '--background-blur': screenSettings.unsplashBackgroundBlur
      });
  }

  switch (screenSettings.backgroundOverlay) {
    case 'none':
      Object.assign(styles, {
        '--background-overlay-display': 'none'
      });
      break;
    case 'customColor':
      Object.assign(styles, {
        '--background-overlay-color': screenSettings.backgroundOverlayColor,
        '--background-overlay-opacity': screenSettings.backgroundOverlayColorOpacity
      });
      break;
    case 'customGradient':
      Object.assign(styles, {
        '--background-overlay-gradient': screenSettings.backgroundOverlayGradient,
        '--background-overlay-opacity': screenSettings.backgroundOverlayGradientOpacity
      });
      break;
    default:
    // Do nothing
  }

  return styles;
};

function IdleScreenBackgroundProvider({ children }: { children: React.ReactNode }) {
  const { settings: screenSettings } = useSettings(CommonSettingsCategory.IdleScreen);
  const timeZone = useTimezone();
  const { host, pluginInfo } = useAppContext();
  const { apiPath = null, appUrl = null } = pluginInfo || {};
  const backgroundDepRef = useRef({ screenSettings, host, appUrl });
  const [ backgroundSource, setBackgroundSource ] = useState(getBackgroundSource(screenSettings, host, appUrl));
  const [ backgroundStyles, applyBackgroundStyles ] = useState(getBackgroundStyles(screenSettings));
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [ background, setBackground ] = useState<BackgroundInfo | null>(null);
  const getBackgroundAbortControllerRef = useRef<AbortController | null>(null);

  const getBackground = useCallback(async (abortController: AbortController): Promise<BackgroundInfo | null> => {
    if (getBackgroundAbortControllerRef.current) {
      getBackgroundAbortControllerRef.current.abort();
      getBackgroundAbortControllerRef.current = null;
    }
    getBackgroundAbortControllerRef.current = abortController;
    let result: BackgroundInfo | null = null;
    if (backgroundSource.type === 'volumio') {
      result = {
        type: 'volumio',
        src: backgroundSource.url,
        nextRefresh: 0
      };
    }
    else if (backgroundSource.type === 'myBackground') {
      result = {
        type: 'myBackground',
        src: backgroundSource.url,
        nextRefresh: backgroundSource.myBackgroundRefreshInterval
      };
      if (backgroundSource.isRandom) {
        result.src += `?ts=${Date.now()}`;
      }
    }
    else if (backgroundSource.type === 'unsplash') {
      const keywords: string[] = [];
      if (backgroundSource.unsplashKeywords) {
        keywords.push(backgroundSource.unsplashKeywords);
      }
      if (!backgroundSource.unsplashKeywords?.trim() || backgroundSource.unsplashKeywordsAppendDayPeriod) {
        const dateTime = DateTime.local({ zone: timeZone, locale: 'en' });
        keywords.push(hourToKeywords(dateTime.hour));
      }
      result = {
        type: 'unsplash',
        src: await getUnsplashUrl(apiPath, keywords.join(' '), backgroundSource.unsplashMatchScreenSize),
        nextRefresh: backgroundSource.unsplashRefreshInterval || 0
      };
    }
    if (abortController.signal.aborted) {
      const abortError = new Error();
      abortError.name = 'AbortError';
      throw abortError;
    }
    return result;
  }, [ apiPath, backgroundSource, timeZone ]);

  const refresh = useCallback(async () => {
    try {
      const bg = await getBackground(new AbortController());
      setBackground(bg);
    }
    catch (error: any) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      throw error;
    }
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
      appUrl !== backgroundDepRef.current.appUrl ||
      !deepEqual(screenSettings, backgroundDepRef.current.screenSettings)) {
      backgroundDepRef.current = { screenSettings, host, appUrl };
      const newBackgroundSource = getBackgroundSource(screenSettings, host, appUrl);
      setBackgroundSource(newBackgroundSource);
      applyBackgroundStyles(getBackgroundStyles(screenSettings));
    }
  }, [ screenSettings, host, appUrl ]);

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
      if ((background.type === 'unsplash' || background.type === 'myBackground') && background.nextRefresh) {
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
