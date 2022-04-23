import classNames from 'classnames';
import { createPortal } from 'react-dom';
import Clock from '../../common/Clock';
import { useRawSettings } from '../../contexts/SettingsProvider';
import { useWeather } from '../../contexts/WeatherProvider';
import styles from './IdleScreen.module.scss';
import { useIdleScreenBackgroundComponent } from './IdleScreenBackgroundProvider';
import IdleScreenWeather from './IdleScreenWeather';

function IdleScreen(props) { 
  const weather = useWeather();
  const {settings: screenSettings} = useRawSettings('screen.idle');
  const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
  const {showWeather = true, showLocation = true, showDate = true, timeFormat = 'default'} = screenSettings;
  const clockTimeFormat = {
    hour12: (timeFormat === 'default' || !screenSettings.hour24) ? true : false,
    second: (timeFormat === 'default' || !screenSettings.showSeconds) ? undefined : 'numeric'
  };
  const customFontSizes = screenSettings.fontSizes === 'custom';
  const customFontColors = screenSettings.fontColors === 'custom';
  const mainStyles = {
    '--main-alignment': screenSettings.mainAlignment || null
  }
  const clockStyles = {
    '--time-font-size': customFontSizes && screenSettings.timeFontSize ? screenSettings.timeFontSize : null,
    '--date-font-size': customFontSizes && screenSettings.dateFontSize ? screenSettings.dateFontSize : null,
    '--time-color': customFontColors && screenSettings.timeColor ? screenSettings.timeColor : null,
    '--date-color': customFontColors && screenSettings.dateColor ? screenSettings.dateColor : null,
  };
  const locationStyles = {
    '--location-font-size': customFontSizes && screenSettings.locationFontSize ? screenSettings.locationFontSize : null,
    '--location-color': customFontColors && screenSettings.locationColor ? screenSettings.locationColor : null
  }
  const backgroundComponent = useIdleScreenBackgroundComponent();

  const getCountryName = (code) => {
    try {
      return displayNames.of(code);
    } catch (e) {
      return null;
    }
  };

  const getLocationName = () => {
    if (weather.status === 'fetched') {
      const {name, state, country} = weather.info.location;
      const stateName = (state !== name) ? state : null;
      const countryName = !stateName ? getCountryName(country) : null;
      return name + (stateName ? ', ' + stateName : countryName ? ', ' + countryName : '');
    }
    return null;
  };

  const locationName = showLocation ? getLocationName() : null;
  const hasWeather = showWeather && weather.status === 'fetched';
  const mainClassNames = classNames(
    styles.Layout__main,
    !hasWeather ? styles['Layout__main--full'] : null
  );

  return createPortal(
    <div className={styles.Layout} onClick={props.onClick}>
      {backgroundComponent}
      <div className={mainClassNames} style={mainStyles}>
        <Clock
          showDate={showDate}
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
            bundle: styles,
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
