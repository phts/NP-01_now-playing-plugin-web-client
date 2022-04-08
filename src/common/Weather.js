import './Clock.scss';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { useLocale, useTimezone } from '../contexts/SettingsProvider';
import { useWeatherService } from '../contexts/ServiceProvider';

const DEFAULT_DATE_FORMAT = DateTime.DATE_SHORT;
const DEFAULT_TIME_FORMAT = DateTime.TIME_SIMPLE;

const getDateTime = (timeZone, locale) => {
  return DateTime.local({zone: timeZone, locale});
};

/**
 * props.dateFormat: {
 *  year: "numeric", "2-digit"
 *  month: "numeric", "2-digit", "narrow", "short", "long"
 *  day: "numeric", "2-digit"
 *  weekday: "narrow", "short", "long"
 * }
 * 
 * props.timeFormat: {
 *  hour: "numeric", "2-digit"
 *  minute: "numeric", "2-digit"
 *  second: "numeric", "2-digit"
 *  hour12: true, false
 *  dayPeriod:  "narrow", "short", " long" (only when hour12 is true; many locales return the same string)
 * }
 * 
 * (A field with undefined value will not be shown)
 * 
 */

const Weather = React.forwardRef((props, ref) => {
  const {showCurrent = true, showForecast = false} = props;
  const weatherService = useWeatherService();
  
  const baseClassName = props.styles ? props.styles.baseClassName : null;
  const stylesBundle = baseClassName ? props.styles.bundle : null;
  const extraClassNames = (props.styles ? props.styles.extraClassNames : null) || [];

  useEffect(() => {
    
  }, [weatherService]);

  useEffect(() => {
    const refreshDateTime = () => {
      setDateTime(getDateTime(timeZone, locale));
    };
    const timer = setInterval(refreshDateTime, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, [setDateTime, timeZone, locale]);

  const dateString = dateTime.toLocaleString(dateFormat);
  const timeString = dateTime.toLocaleString(timeFormat);

  const mainClassName = (baseClassName && stylesBundle) ? 
    classNames(
      stylesBundle[baseClassName] || 'Clock',
      [...extraClassNames]
    )
    :
    classNames(
      'Clock',
      [...extraClassNames]
    );

  const getElementClassName = (element) => (baseClassName && stylesBundle) ? 
      stylesBundle[`${baseClassName}__${element}`] || `Clock__${element}`:
      `Clock__${element}`;

  return (
    <div 
      ref={ref} 
      className={mainClassName}>
        <span className={getElementClassName('date')}>{dateString}</span>
        <span className={getElementClassName('time')}>{timeString}</span>
    </div>
  );
});

Clock.displayName = 'Clock';

export default Clock;
