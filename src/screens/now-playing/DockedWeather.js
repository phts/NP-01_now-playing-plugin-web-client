import styles from './DockedWeather.module.scss';
import { useWeather } from '../../contexts/WeatherProvider';
import classNames from 'classnames';
import { useRawSettings } from '../../contexts/SettingsProvider';

function DockedWeather() {
  const {settings: screenSettings} = useRawSettings('screen.nowPlaying');
  const dockedWeatherSettings = screenSettings.dockedWeather || {};
  const {fontSize, fontColor, iconSize, iconStyle = 'filled', iconAnimate = false, iconMonoColor, margin} = dockedWeatherSettings;
  const weather = useWeather();

  const getIcon = (type) => {
    const iconStyleKey = iconStyle + (iconAnimate ? 'Animated' : 'Static');
    const iconUrl = weather.info.current.iconUrl[type][iconStyleKey];
    const iconClassNames = [styles.DockedWeather__icon, styles[`DockedWeather__icon--${type}`]];
    if (!iconUrl) {
      return null;
    }
    if (iconStyle === 'mono') {
      const monoStyles = {
        '--icon-mono-url': `url(${iconUrl})`,
        '--icon-mono-color': iconMonoColor
      };
      return <div 
        className={classNames(...iconClassNames, styles['DockedWeather__icon--mono'])}
        style={monoStyles}></div>;
    }
    else {
      return <img 
        className={classNames(iconClassNames)}
        src={iconUrl} 
        alt="" />;
    }
  };

  if (weather.status === 'fetched') {
    const info = weather.info;
    const dockedStyles = {
      '--font-size': fontSize,
      '--font-color': fontColor,
      '--icon-size': iconSize,
      '--margin': margin
    };

    return (
      <div className={styles.DockedWeather} style={dockedStyles}>
        <div key="temperature" className={styles.DockedWeather__unit}>
          {getIcon('condition')}
          <span className={styles.DockedWeather__temp}>{info.current.temp.now.text}°</span>
        </div>
        {
        dockedWeatherSettings.showHumidity ?
        <div key="humidity" className={styles.DockedWeather__unit}>
          {getIcon('humidity')}
          <span className={styles.DockedWeather__humidity}>{info.current.humidity.text}</span>
        </div>
        : null
        }
        {
        dockedWeatherSettings.showWindSpeed ?
        <div key="windspeed" className={styles.DockedWeather__unit}>
          {getIcon('windspeed')}
          <span className={styles.DockedWeather__windSpeed}>{info.current.windSpeed.text}</span>
        </div>
        : null
        }
      </div>
    );
  }
  else {
    return null;
  }
};

export default DockedWeather;
