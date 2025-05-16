/// <reference types="../../declaration.d.ts" />

import classNames from 'classnames';
import { createPortal } from 'react-dom';
import Clock, { ClockProps } from '../../common/Clock';
import { useSettings } from '../../contexts/SettingsProvider';
import { useWeather } from '../../contexts/WeatherProvider';
import styles from './IdleScreen.module.scss';
import { useIdleScreenBackgroundComponent } from './IdleScreenBackgroundProvider';
import IdleScreenWeather from './IdleScreenWeather';
import React, { HTMLProps, useCallback, useEffect, useRef, useState } from 'react';
import { CommonSettingsCategory, DefaultIdleScreenSettings } from 'now-playing-common';

export interface IdleScreenProps {
  onClick: HTMLProps<HTMLDivElement>['onClick'];
}

function IdleScreen(props: IdleScreenProps) {
  const weather = useWeather();
  const { settings: screenSettings } = useSettings(CommonSettingsCategory.IdleScreen);
  const defaults = DefaultIdleScreenSettings;
  const displayNames = new Intl.DisplayNames([ 'en' ], { type: 'region' });
  const { showWeather, showLocation, timeFormat, showClock } = screenSettings;
  const showSeconds = timeFormat === 'default' ? defaults.showSeconds : screenSettings.showSeconds;
  const clockTimeFormat: ClockProps['timeFormat'] = {
    hour12: timeFormat === 'default' ? !defaults.hour24 : !screenSettings.hour24,
    second: showSeconds ? 'numeric' : undefined
  };
  const customFontSizes = screenSettings.fontSizes === 'custom';
  const customFontColors = screenSettings.fontColors === 'custom';
  const customWeatherAreaHeight = screenSettings.weatherAreaHeightType === 'custom';

  const [ mainAlignment, setMainAlignment ] = useState(screenSettings.mainAlignment === 'cycle' ? 'flex-start' : screenSettings.mainAlignment);
  const mainAlignmentCycleTimer = useRef<NodeJS.Timeout | null>(null);

  const layoutStyles = {
    '--secondary-height': customWeatherAreaHeight ? screenSettings.weatherAreaHeight : null
  } as React.CSSProperties;

  const mainStyles = {
    '--main-alignment': mainAlignment || null
  } as React.CSSProperties;

  const clockStyles = {
    '--time-font-size': customFontSizes ? screenSettings.timeFontSize : null,
    '--date-font-size': customFontSizes ? screenSettings.dateFontSize : null,
    '--time-color': customFontColors ? screenSettings.timeColor : null,
    '--date-color': customFontColors ? screenSettings.dateColor : null
  } as React.CSSProperties;

  const locationStyles = {
    '--location-font-size': customFontSizes ? screenSettings.locationFontSize : null,
    '--location-color': customFontColors ? screenSettings.locationColor : null
  } as React.CSSProperties;

  const backgroundComponent = useIdleScreenBackgroundComponent();

  const getCountryName = (code: string) => {
    try {
      return displayNames.of(code);
    }
    catch (e) {
      return null;
    }
  };

  const getLocationName = () => {
    if (weather.status === 'fetched') {
      const { name, country } = weather.info.location;
      const countryName = getCountryName(country);
      return name + (countryName ? `, ${countryName}` : '');
    }
    return null;
  };

  const locationName = showLocation ? getLocationName() : null;
  const hasWeather = showWeather && weather.status === 'fetched';
  const mainClassNames = classNames(
    styles.Layout__main,
    !hasWeather ? styles['Layout__main--full'] : null
  );

  const clearMainAlignmentCycleTimer = () => {
    if (mainAlignmentCycleTimer.current) {
      clearTimeout(mainAlignmentCycleTimer.current);
      mainAlignmentCycleTimer.current = null;
    }
  };

  const startMainAlignmentCycleTimer = useCallback(() => {
    const interval = screenSettings.mainAlignmentCycleInterval * 1000;
    const cycles: Array<typeof mainAlignment> = [ 'flex-start', 'center', 'flex-end' ];
    mainAlignmentCycleTimer.current = setTimeout(() => {
      mainAlignmentCycleTimer.current = null;
      let nextIndex = Math.max(cycles.indexOf(mainAlignment) + 1, 0);
      if (nextIndex >= cycles.length) {
        nextIndex = 0;
      }
      const nextAlignment = cycles[nextIndex];
      setMainAlignment(nextAlignment);
    }, interval);
  }, [ screenSettings, mainAlignment ]);

  useEffect(() => {
    if (screenSettings.mainAlignment !== 'cycle') {
      clearMainAlignmentCycleTimer();
      setMainAlignment(screenSettings.mainAlignment);
    }
    else if (!mainAlignmentCycleTimer.current) {
      startMainAlignmentCycleTimer();
    }
  }, [ screenSettings, startMainAlignmentCycleTimer ]);

  return createPortal(
    <div className={styles.Layout} style={layoutStyles} onClick={props.onClick}>
      {backgroundComponent}
      <div className={mainClassNames} style={mainStyles}>
        {showClock ? <Clock
          showTime
          dateFormat={{
            year: 'numeric',
            day: 'numeric',
            month: 'long',
            weekday: 'long'
          }}
          timeFormat={clockTimeFormat}
          styles={{
            baseClassName: 'Clock',
            bundle: styles
          }}
          style={clockStyles} /> : null}
        {locationName ?
          <span className={styles.Location} style={locationStyles} >
            {getLocationName()}
          </span>
          : null}
      </div>
      {hasWeather ?
        <div className={styles.Layout__secondary}>
          <IdleScreenWeather />
        </div>
        : null}
    </div>
    , document.body
  );
}

export default IdleScreen;
