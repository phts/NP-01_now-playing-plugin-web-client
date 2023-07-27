import './Clock.scss';
import classNames from 'classnames';
import React, { HTMLProps, useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { useLocale, useTimezone } from '../contexts/SettingsProvider';
import { StylesBundleProps } from './StylesBundle';

export interface ClockProps extends StylesBundleProps {
  style?: HTMLProps<HTMLDivElement>['style'];
  showDate?: boolean;
  showTime?: boolean;
  // `undefined` = not shown
  dateFormat?: {
    year?: 'numeric' | '2-digit';
    month?: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long';
    day?: 'numeric' | '2-digit';
    weekday?: 'narrow' | 'short' | 'long';
  };
  // `undefined` = not shown
  timeFormat?: {
    hour?: 'numeric' | '2-digit'
    minute?: 'numeric' | '2-digit'
    second?: 'numeric' | '2-digit'
    hour12?: boolean;
    dayPeriod?: 'narrow' | 'short' | 'long' // Only when `hour12` is true; many locales return the same string
  };
}

const DEFAULT_DATE_FORMAT = DateTime.DATE_SHORT;
const DEFAULT_TIME_FORMAT = DateTime.TIME_SIMPLE;

const getDateTime = (timeZone: string, locale: string) => {
  return DateTime.local({ zone: timeZone, locale });
};

const Clock = React.forwardRef<HTMLDivElement, ClockProps>((props, ref) => {
  const { showDate = true, showTime = true } = props;
  const formats = {
    date: { ...DEFAULT_DATE_FORMAT, ...props.dateFormat },
    time: { ...DEFAULT_TIME_FORMAT, ...props.timeFormat }
  };
  const timeZone = useTimezone();
  const locale = useLocale();
  const [ dateTime, setDateTime ] = useState(getDateTime(timeZone, locale));

  const baseClassName = props.styles ? props.styles.baseClassName : null;
  const stylesBundle = baseClassName ? props.styles?.bundle : null;
  const extraClassNames = (props.styles ? props.styles.extraClassNames : null) || [];

  useEffect(() => {
    const refreshDateTime = () => {
      setDateTime(getDateTime(timeZone, locale));
    };
    const timer = setInterval(refreshDateTime, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [ setDateTime, timeZone, locale ]);

  const getComponentParts = (element: 'date' | 'time') => {
    const parts = dateTime.toLocaleParts(formats[element]);
    return parts.map((part: Intl.DateTimeFormatPart, index: number) => (
      <span
        key={`${element}_part_${index}`}
        className={getElementClassName(`${element}--${part.type}`)}>
        {part.value}
      </span>
    ));
  };

  const mainClassName = (baseClassName && stylesBundle) ?
    classNames(
      stylesBundle[baseClassName] || 'Clock',
      [ ...extraClassNames ]
    )
    :
    classNames(
      'Clock',
      [ ...extraClassNames ]
    );

  const getElementClassName = (element: string) => (baseClassName && stylesBundle) ?
    stylesBundle[`${baseClassName}__${element}`] || `Clock__${element}` :
    `Clock__${element}`;

  return (
    <div
      ref={ref}
      className={mainClassName}
      style={props.style}>
      {showDate ? <span className={getElementClassName('date')}>{getComponentParts('date')}</span> : null}
      {showTime ? <span className={getElementClassName('time')}>{getComponentParts('time')}</span> : null}
    </div>
  );
});

Clock.displayName = 'Clock';

export default Clock;
