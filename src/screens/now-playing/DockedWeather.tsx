/// <reference types="../../declaration.d.ts" />

import React from 'react';
import styles from './DockedWeather.module.scss';
import { useWeather } from '../../contexts/WeatherProvider';
import classNames from 'classnames';
import { useSettings } from '../../contexts/SettingsProvider';
import { CommonSettingsCategory, DefaultNowPlayingScreenSettings, WeatherDataIconUrl } from 'now-playing-common';

function DockedWeather() {
  const { settings: screenSettings } = useSettings(CommonSettingsCategory.NowPlayingScreen);
  const settings = screenSettings.dockedWeather;
  const defaults = DefaultNowPlayingScreenSettings.dockedWeather;
  const weather = useWeather();

  const useIconSettings = settings.iconSettings === 'custom' ? settings : defaults;
  const iconSettings = {
    style: useIconSettings.iconStyle,
    animate: useIconSettings.iconAnimate,
    monoColor: useIconSettings.iconMonoColor
  };

  const getIcon = (type: keyof WeatherDataIconUrl) => {
    if (weather.status !== 'fetched') {
      return null;
    }
    const iconStyleKey = iconSettings.style + (iconSettings.animate ? 'Animated' : 'Static');
    const iconUrl = weather.info.current.iconUrl[type][iconStyleKey];
    const iconClassNames = [ styles.DockedWeather__icon, styles[`DockedWeather__icon--${type}`] ];
    if (!iconUrl) {
      return null;
    }
    if (iconSettings.style === 'mono') {
      const monoStyles = {
        '--icon-mono-url': `url(${iconUrl})`,
        '--icon-mono-color': (iconSettings as any).monoColor // TODO: Until we have typings for settings, cast to any
      } as React.CSSProperties;
      return <div
        className={classNames(...iconClassNames, styles['DockedWeather__icon--mono'])}
        style={monoStyles}></div>;
    }

    return <img
      className={classNames(iconClassNames)}
      src={iconUrl}
      alt="" />;

  };

  if (weather.status === 'fetched') {
    const info = weather.info;
    const dockedStyles = {
      '--margin': settings.margin
    } as React.CSSProperties;
    if (settings.fontSettings === 'custom') {
      Object.assign(dockedStyles, {
        '--font-size': settings.fontSize,
        '--font-color': settings.fontColor
      });
    }
    if (settings.iconSettings === 'custom') {
      Object.assign(dockedStyles, {
        '--icon-size': settings.iconSize
      });
    }

    return (
      <div className={styles.DockedWeather} style={dockedStyles}>
        <div key="temperature" className={styles.DockedWeather__unit}>
          {getIcon('condition')}
          <span className={styles.DockedWeather__temp}>{info.current.temp.now.text}</span>
        </div>
        {
          settings.showHumidity ?
            <div key="humidity" className={styles.DockedWeather__unit}>
              {getIcon('humidity')}
              <span className={styles.DockedWeather__humidity}>{info.current.humidity.text}</span>
            </div>
            : null
        }
        {
          settings.showWindSpeed ?
            <div key="windSpeed" className={styles.DockedWeather__unit}>
              {getIcon('windSpeed')}
              <span className={styles.DockedWeather__windSpeed}>{info.current.windSpeed.text}</span>
            </div>
            : null
        }
      </div>
    );
  }

  return null;

}

export default DockedWeather;
