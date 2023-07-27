/// <reference types="../../declaration.d.ts" />

import React from 'react';
import Clock, { ClockProps } from '../../common/Clock';
import { useSettings } from '../../contexts/SettingsProvider';
import styles from './DockedClock.module.scss';
import { CommonSettingsCategory, DefaultNowPlayingScreenSettings } from 'now-playing-common';

function DockedClock() {
  const { settings: screenSettings } = useSettings(CommonSettingsCategory.NowPlayingScreen);
  const settings = screenSettings.dockedClock;
  const defaults = DefaultNowPlayingScreenSettings.dockedClock;

  const dockedStyles = {
    '--docked-margin': settings.margin
  } as React.CSSProperties;

  if (settings.fontSettings === 'custom') {
    Object.assign(dockedStyles, {
      '--docked-font-size': settings.fontSize,
      '--docked-date-color': settings.dateColor,
      '--docked-time-color': settings.timeColor
    });
  }

  const dateFormatSettings = settings.dateFormat === 'custom' ? settings : defaults;
  const dateFormat: ClockProps['dateFormat'] = {
    year: dateFormatSettings.yearFormat === 'none' ? undefined : dateFormatSettings.yearFormat,
    month: dateFormatSettings.monthFormat,
    day: dateFormatSettings.dayFormat,
    weekday: dateFormatSettings.dayOfWeekFormat === 'none' ? undefined : dateFormatSettings.dayOfWeekFormat
  };

  const timeFormatSettings = settings.timeFormat === 'custom' ? settings : defaults;
  const timeFormat: ClockProps['timeFormat'] = {
    hour: timeFormatSettings.hourFormat,
    minute: 'numeric',
    second: timeFormatSettings.showSeconds ? 'numeric' : undefined,
    hour12: !timeFormatSettings.hour24
  };

  const showDate = (settings.showInfo === 'dateTime' || settings.showInfo === 'date');
  const showTime = (settings.showInfo === 'dateTime' || settings.showInfo === 'time');

  return (
    <div style={dockedStyles}>
      <Clock
        showDate={showDate}
        showTime={showTime}
        dateFormat={dateFormat}
        timeFormat={timeFormat}
        styles={{
          baseClassName: 'DockedClock',
          bundle: styles
        }} />
    </div>
  );
}

export default DockedClock;
