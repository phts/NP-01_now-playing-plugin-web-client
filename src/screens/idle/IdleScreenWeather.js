import styles from './IdleScreenWeather.module.scss';
import { useWeather } from '../../contexts/WeatherProvider';
import classNames from 'classnames';
import { useLocale, useRawSettings, useTimezone } from '../../contexts/SettingsProvider';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';

const getBackgroundStyles = (settings) => {
  const weatherBackgroundType = settings.weatherBackground || 'default';
  switch(weatherBackgroundType) {
    case 'none':
      return {
        '--background-display': 'none'
      };
    case 'customColor':
      return {
        '--background-color': settings.weatherBackgroundColor || null,
        '--background-opacity': settings.weatherBackgroundColorOpacity || null
      };
    case 'customGradient':
      return {
        '--background-gradient': settings.weatherBackgroundGradient || null,
        '--background-opacity': settings.weatherBackgroundGradientOpacity || null
      };
    default:
      return {};
  }
}

function IdleScreenWeather() {
  const {t} = useTranslation();
  const {settings: screenSettings} = useRawSettings('screen.idle');
  const customFontSizes = screenSettings.fontSizes === 'custom';
  const customFontColors = screenSettings.fontColors === 'custom';
  const customIconSettings = screenSettings.weatherIconSettings === 'custom';
  const weatherCurrentColor = customFontColors && screenSettings.weatherCurrentColor ? screenSettings.weatherCurrentColor : null;
  const backgroundStyles = getBackgroundStyles(screenSettings);
  const currentWeatherStyles = {
    '--day-base-font-size': customFontSizes && screenSettings.weatherCurrentBaseFontSize ? screenSettings.weatherCurrentBaseFontSize : null,
    '--day-title-color': weatherCurrentColor,
    '--temp-range-color': weatherCurrentColor,
    '--current-temp-color': weatherCurrentColor,
    '--icon-size': customIconSettings && screenSettings.weatherCurrentIconSize ? screenSettings.weatherCurrentIconSize : null
  };
  const forecastWeatherStyles = {
    '--day-base-font-size': customFontSizes && screenSettings.weatherForecastBaseFontSize ? screenSettings.weatherForecastBaseFontSize : null,
    '--day-title-color': customFontColors && screenSettings.weatherForecastColor ? screenSettings.weatherForecastColor : null,
    '--temp-range-color': customFontColors && screenSettings.weatherForecastColor ? screenSettings.weatherForecastColor : null,
    '--icon-size': customIconSettings && screenSettings.weatherForecastIconSize ? screenSettings.weatherForecastIconSize : null
  };
  const iconSettings = {
    style: customIconSettings && screenSettings.weatherIconStyle ? screenSettings.weatherIconStyle : 'filled',
    currentIconAnimate: customIconSettings && screenSettings.weatherCurrentIconAnimate !== undefined ? screenSettings.weatherCurrentIconAnimate : true,
    currentMonoColor: customIconSettings && screenSettings.weatherCurrentIconMonoColor ? screenSettings.weatherCurrentIconMonoColor : null,
    forecastMonoColor: customIconSettings && screenSettings.weatherForecastIconMonoColor ? screenSettings.weatherForecastIconMonoColor : null,
  };
  const weather = useWeather();
  const timeZone = useTimezone();
  const locale = useLocale();
  
  const DAY_FORMAT = {
    weekday: 'short'
  };

  const getDayName = (millis) => {
    return DateTime
      .fromMillis(millis, {zone: timeZone, locale})
      .toLocaleString(DAY_FORMAT);
  };

  const getIcon = (data, infoType, baseClassName, iconMonoColor, animate = false) => {
    const iconStyle = iconSettings.style;
    const iconStyleKey = iconStyle + (animate ? 'Animated' : 'Static');
    const iconUrl = data.iconUrl[infoType][iconStyleKey];
    if (!iconUrl) {
      return null;
    }
    if (iconStyle === 'mono') {
      const monoStyles = {
        '--icon-mono-url': `url(${iconUrl})`,
        '--icon-mono-color': iconMonoColor
      };
      return <div 
        className={classNames(styles[baseClassName], styles[`${baseClassName}--mono`])}
        style={monoStyles}></div>;
    }
    else {
      return <img 
        className={styles[baseClassName]}
        src={iconUrl} 
        alt="" />;
    }
  };

  const getCurrentBlock = (data) => {
    return (
      <div className={styles.Current} style={currentWeatherStyles}>
        {getIcon(data, 'condition', 'Current__icon', iconSettings.currentMonoColor, iconSettings.currentIconAnimate)}
        <div className={styles.Current__info}>
          <div className={styles.Current__dayTitleWrapper}>
            <span className={styles.Current__dayTitle}>
              {t('weather.today')}
            </span>
          </div>
          <span className={styles.Current__currentTemp}>
            {data.temp.now.text}
          </span>
          <span className={styles.Current__tempRange}>
            {data.temp.min.shortText} / {data.temp.max.shortText}
          </span>
        </div>
      </div>
    )
  };

  const getForecastBlock = (data, key) => {
    return (
      <div key={key} className={styles.Forecast} style={forecastWeatherStyles}>
        <div className={styles.Forecast__dayTitleWrapper}>
          <span className={styles.Forecast__dayTitle}>
            {getDayName(data.dateTimeMillis)}
          </span>
        </div>
        {getIcon(data, 'condition', 'Forecast__icon', iconSettings.forecastMonoColor)}
        <div className={styles.Forecast__info}>
          <span className={styles.Forecast__tempRange}>
            {data.temp.min.shortText} / {data.temp.max.shortText}
          </span>
        </div>
      </div>
    )
  };

  if (weather.status === 'fetched') {
    const info = weather.info;
    return (
      <div className={styles.Layout} style={backgroundStyles}>
        {getCurrentBlock(info.current)}
        {info.forecast.slice(0, 5).map((data, index) => 
          getForecastBlock(data, `forecast_${index}`)
        )}
      </div>
    );
  }
  else {
    return null;
  }
};

export default IdleScreenWeather;
