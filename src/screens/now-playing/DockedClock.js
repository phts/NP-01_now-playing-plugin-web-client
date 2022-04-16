import Clock from '../../common/Clock';
import { useRawSettings } from '../../contexts/SettingsProvider';
import styles from './DockedClock.module.scss';

const DEFAULT_DATE_FORMAT = {
  year: undefined,
  month: 'short',
  day: 'numeric',
  weekday: undefined
};

const DEFAULT_TIME_FORMAT = {
  hour: 'numeric',
  minute: 'numeric',
  second: undefined,
  hour12: true
};

function DockedClock() {
  const {settings: screenSettings} = useRawSettings('screen.nowPlaying');
  const settings = screenSettings.dockedClock || {};
  
  const dockedStyles = {
    '--docked-margin': settings.margin
  };

  if (settings.fontSettings === 'custom') {
    Object.assign(dockedStyles, {
      '--docked-font-size': settings.fontSize,
      '--docked-date-color': settings.dateColor,
      '--docked-time-color': settings.timeColor,
    });
  }

  const dateFormat = (settings.dateFormat === 'custom') ? {
    year: settings.yearFormat === 'none' ? undefined : settings.yearFormat,
    month: settings.monthFormat,
    day: settings.dayFormat,
    weekday: settings.dayOfWeekFormat === 'none' ? undefined : settings.dayOfWeekFormat
  } : DEFAULT_DATE_FORMAT;

  const timeFormat = (settings.timeFormat === 'custom') ? {
    hour: settings.hourFormat,
    minute: 'numeric',
    second: settings.showSeconds ? 'numeric' : undefined,
    hour12: !settings.hour24
  } : DEFAULT_TIME_FORMAT;

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
