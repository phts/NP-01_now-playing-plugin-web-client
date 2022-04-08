import styles from './DockedWeather.module.scss';
import { useWeather } from '../../contexts/WeatherProvider';
import classNames from 'classnames';

function DockedWeather(props) {
  const {fontSize, fontColor, iconSize, iconStyle = 'filled', iconAnimate = false, iconMonoColor, margin} = props;
  const weather = useWeather();

  const getIcon = () => {
    const iconStyleKey = iconStyle + (iconAnimate ? 'Animated' : 'Static');
    const iconUrl = weather.info.current.iconUrl[iconStyleKey];
    if (!iconUrl) {
      return null;
    }
    if (iconStyle === 'mono') {
      const monoStyles = {
        '--icon-mono-url': `url(${iconUrl})`,
        '--icon-mono-color': iconMonoColor
      };
      return <div 
        className={classNames(styles.DockedWeather__icon, styles['DockedWeather__icon--mono'])}
        style={monoStyles}></div>;
    }
    else {
      return <img 
        className={styles.DockedWeather__icon} 
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
        {getIcon()}
        <span className={styles.DockedWeather__temp}>{info.current.temp}°</span>
      </div>
    );
  }
  else {
    return null;
  }
};

export default DockedWeather;
