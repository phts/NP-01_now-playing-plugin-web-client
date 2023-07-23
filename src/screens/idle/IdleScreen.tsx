/// <reference types="../../declaration.d.ts" />

import classNames from 'classnames';
import { createPortal } from 'react-dom';
import Clock, { ClockProps } from '../../common/Clock';
import { useRawSettings } from '../../contexts/SettingsProvider';
import { useWeather } from '../../contexts/WeatherProvider';
import styles from './IdleScreen.module.scss';
import { useIdleScreenBackgroundComponent } from './IdleScreenBackgroundProvider';
import IdleScreenWeather from './IdleScreenWeather';
import React, { HTMLProps, useCallback, useEffect, useRef, useState } from 'react';
import { DefaultIdleScreenSettings, IdleScreenSettings } from '../../types/settings/IdleScreenSettings';

export interface IdleScreenProps {
  onClick: HTMLProps<HTMLDivElement>['onClick'];
}

function IdleScreen(props: IdleScreenProps) {
  const weather = useWeather();
  const {settings: screenSettings} = useRawSettings('screen.idle');
  const displayNames = new Intl.DisplayNames([ 'en' ], { type: 'region' });
  const {showWeather = true, showLocation = true, timeFormat = 'default'} = screenSettings;
  const clockTimeFormat: ClockProps['timeFormat'] = {
    hour12: !!((timeFormat === 'default' || !screenSettings.hour24)),
    second: (timeFormat === 'default' || !screenSettings.showSeconds) ? undefined : 'numeric'
  };
  const customFontSizes = screenSettings.fontSizes === 'custom';
  const customFontColors = screenSettings.fontColors === 'custom';

  const [ mainAlignment, setMainAlignment ] = useState(screenSettings.mainAlignment === 'cycle' ? 'flex-start' : screenSettings.mainAlignment || DefaultIdleScreenSettings.mainAlignment);
  const mainAlignmentCycleTimer = useRef<NodeJS.Timeout | null>(null);

  const mainStyles = {
    '--main-alignment': mainAlignment || null
  } as React.CSSProperties;

  const clockStyles = {
    '--time-font-size': customFontSizes && screenSettings.timeFontSize ? screenSettings.timeFontSize : null,
    '--date-font-size': customFontSizes && screenSettings.dateFontSize ? screenSettings.dateFontSize : null,
    '--time-color': customFontColors && screenSettings.timeColor ? screenSettings.timeColor : null,
    '--date-color': customFontColors && screenSettings.dateColor ? screenSettings.dateColor : null
  } as React.CSSProperties;

  const locationStyles = {
    '--location-font-size': customFontSizes && screenSettings.locationFontSize ? screenSettings.locationFontSize : null,
    '--location-color': customFontColors && screenSettings.locationColor ? screenSettings.locationColor : null
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
      const {name, country} = weather.info.location;
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
    const interval = (screenSettings.mainAlignmentCycleInterval || 60) * 1000;
    const cycles: Array<Required<IdleScreenSettings>['mainAlignment']> = [ 'flex-start', 'center', 'flex-end' ];
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
      setMainAlignment(screenSettings.mainAlignment || DefaultIdleScreenSettings['mainAlignment']);
    }
    else if (!mainAlignmentCycleTimer.current) {
      startMainAlignmentCycleTimer();
    }
  }, [ screenSettings, startMainAlignmentCycleTimer ]);

  return createPortal(
    <div className={styles.Layout} onClick={props.onClick}>
      {backgroundComponent}
      <div className={mainClassNames} style={mainStyles}>
        <Clock
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
          style={clockStyles} />
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
