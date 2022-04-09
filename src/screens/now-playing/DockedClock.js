import Clock from '../../common/Clock';
import { useRawSettings } from '../../contexts/SettingsProvider';
import styles from './DockedClock.module.scss';

function DockedClock() {
  const {settings: screenSettings} = useRawSettings('screen.nowPlaying');
  const dockedClockSettings = screenSettings.dockedClock || {};
  
  const dockedStyles = {
    '--docked-font-size': dockedClockSettings.fontSize,
    '--docked-date-color': dockedClockSettings.dateColor,
    '--docked-time-color': dockedClockSettings.timeColor,
    '--docked-margin': dockedClockSettings.margin
  };

  const dateFormat = {
    year: dockedClockSettings.showYear ? (dockedClockSettings.yearFormat || 'numeric') : undefined,
    month: dockedClockSettings.monthFormat || 'short',
    day: dockedClockSettings.dayFormat || 'numeric',
    weekday: dockedClockSettings.showDayOfWeek ? (dockedClockSettings.dayOfWeekFormat || 'short') : undefined
  };

  const timeFormat = {
    hour: dockedClockSettings.hourFormat || 'numeric',
    minute: 'numeric',
    second: dockedClockSettings.showSeconds ? 'numeric' : undefined,
    hour12: !(dockedClockSettings.hour24 || false)
  };

  const showDate = (dockedClockSettings.showInfo === 'dateTime' || dockedClockSettings.showInfo === 'date');
  const showTime = (dockedClockSettings.showInfo === 'dateTime' || dockedClockSettings.showInfo === 'time');
    
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
