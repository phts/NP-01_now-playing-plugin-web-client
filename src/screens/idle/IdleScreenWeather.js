import styles from './IdleScreenWeather.module.scss';
import { useWeather } from '../../contexts/WeatherProvider';
import classNames from 'classnames';
import { useLocale, useRawSettings, useTimezone } from '../../contexts/SettingsProvider';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import Scrollbars from 'rc-scrollbars';
import { useCallback, useEffect, useState } from 'react';
import { useStore } from '../../contexts/StoreProvider';

const RESTORE_STATE_KEY = 'IdleScreen.Weather.restoreState';

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
  const store = useStore();
  const restoreState = store.get(RESTORE_STATE_KEY, {}, true);
  const [view, setView] = useState(restoreState.view || 'day');
  const {settings: screenSettings} = useRawSettings('screen.idle');
  const customFontSizes = screenSettings.fontSizes === 'custom';
  const customFontColors = screenSettings.fontColors === 'custom';
  const customIconSettings = screenSettings.weatherIconSettings === 'custom';
  const weatherCurrentColor = customFontColors && screenSettings.weatherCurrentColor ? screenSettings.weatherCurrentColor : null;
  const backgroundStyles = getBackgroundStyles(screenSettings);
  const currentWeatherStyles = {
    '--period-base-font-size': customFontSizes && screenSettings.weatherCurrentBaseFontSize ? screenSettings.weatherCurrentBaseFontSize : null,
    '--period-title-color': weatherCurrentColor,
    '--temp-range-color': weatherCurrentColor,
    '--current-temp-color': weatherCurrentColor,
    '--icon-size': customIconSettings && screenSettings.weatherCurrentIconSize ? screenSettings.weatherCurrentIconSize : null
  };
  const forecastWeatherStyles = {
    '--period-base-font-size': customFontSizes && screenSettings.weatherForecastBaseFontSize ? screenSettings.weatherForecastBaseFontSize : null,
    '--period-title-color': customFontColors && screenSettings.weatherForecastColor ? screenSettings.weatherForecastColor : null,
    '--temp-range-color': customFontColors && screenSettings.weatherForecastColor ? screenSettings.weatherForecastColor : null,
    '--icon-size': customIconSettings && screenSettings.weatherForecastIconSize ? screenSettings.weatherForecastIconSize : null
  };
  const iconSettings = {
    style: customIconSettings && screenSettings.weatherIconStyle ? screenSettings.weatherIconStyle : 'filled',
    currentIconAnimate: customIconSettings && screenSettings.weatherCurrentIconAnimate !== undefined ? screenSettings.weatherCurrentIconAnimate : false,
    currentMonoColor: customIconSettings && screenSettings.weatherCurrentIconMonoColor ? screenSettings.weatherCurrentIconMonoColor : null,
    forecastMonoColor: customIconSettings && screenSettings.weatherForecastIconMonoColor ? screenSettings.weatherForecastIconMonoColor : null,
  };
  const weather = useWeather();
  const timeZone = useTimezone();
  const locale = useLocale();
  
  const DAY_FORMAT = {
    weekday: 'short'
  };

  const TIME_FORMAT = {
    ...DateTime.TIME_SIMPLE,
    hour12: (screenSettings.timeFormat === undefined || 
      screenSettings.timeFormat === 'default' || !screenSettings.hour24) ? true : false
  };

  const DATE_FORMAT = {
    ...DateTime.DATE_SHORT,
    year: undefined
  };

  useEffect(() => {
    restoreState.view = view;
  }, [restoreState, view]);

  const getDayName = (millis) => {
    return DateTime
      .fromMillis(millis, {zone: timeZone, locale})
      .toLocaleString(DAY_FORMAT);
  };

  const getTimeOrDateString = (millis) => {
    const dt = DateTime.fromMillis(millis, {zone: timeZone, locale});
    const isMidnight = dt.hour === 0 && dt.minute === 0;
    const format = isMidnight ? DATE_FORMAT : TIME_FORMAT;
    return dt.toLocaleString(format);
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
      <div className={styles.Current} style={currentWeatherStyles} onClick={toggleView}>
        {getIcon(data, 'condition', 'Current__icon', iconSettings.currentMonoColor, iconSettings.currentIconAnimate)}
        <div className={styles.Current__info}>
          <div className={styles.Current__periodTitleWrapper}>
            <span className={styles.Current__periodTitle}>
              {view === 'day' ? t('weather.today') : t('weather.now')}
            </span>
          </div>
          <span className={styles.Current__currentTemp}>
            {data.temp.now.text}
          </span>
          {
            view === 'day' ? 
              <span className={styles.Current__tempRange}>
                {data.temp.min.shortText} / {data.temp.max.shortText}
              </span>
            : null
          }          
        </div>
      </div>
    )
  };

  const getForecastBlock = (data, key) => {
    return (
      <div key={key} className={styles.Forecast} style={forecastWeatherStyles}>
        <div className={styles.Forecast__periodTitleWrapper}>
          <span className={styles.Forecast__periodTitle}>
            {
              view === 'day' ? getDayName(data.dateTimeMillis) : getTimeOrDateString(data.dateTimeMillis)
            }
          </span>
        </div>
        {getIcon(data, 'condition', 'Forecast__icon', iconSettings.forecastMonoColor)}
        <div className={styles.Forecast__info}>
          {
            view === 'day' ?
              <span className={styles.Forecast__tempRange}>
                {data.temp.min.shortText} / {data.temp.max.shortText}
              </span>
            :
              <span className={styles.Forecast__temp}>
                {data.temp.shortText}
              </span>
          }
        </div>
      </div>
    )
  };

  const toggleView = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setView(view === 'day' ? 'hour' : 'day');
  }, [view]);

  const getDayViewContents = (weatherInfo) => {
    return (
      <div className={styles.Contents}>
        <div className={styles.Contents__currentWrapper}>
          {getCurrentBlock(weatherInfo.current)}
        </div>
        <div className={styles.Contents__forecastWrapper}>
          {
            weatherInfo.forecast.map((data, index) => 
              getForecastBlock(data, `forecast_${index}`)
            )
          }
        </div>
      </div>
    );
  };

  const getHourViewContents = (weatherInfo) => {
    const currentTime = (new Date()).getTime();
    return (
      <div className={styles.Contents}>
        <div className={styles.Contents__currentWrapper}>
          {getCurrentBlock(weatherInfo.current)}
        </div>
        <div className={styles.Contents__forecastWrapper}>
          {
            weatherInfo.hourly
              .filter(data => data.dateTimeMillis > currentTime)
              .map((data, index) => getForecastBlock(data, `forecast_${index}`))
          }
        </div>
      </div>
    );
  };

  if (weather.status === 'fetched') {
    const info = weather.info;
    return (
      <div className={styles.Layout} style={backgroundStyles}>
        <Scrollbars 
          classes={{
            thumbHorizontal: 'Scrollbar__handle'
          }}
          autoHide>
            {
              view === 'day' ? getDayViewContents(info) : getHourViewContents(info)
            }
        </Scrollbars>
      </div>
    );
  }
  else {
    return null;
  }
};

export default IdleScreenWeather;
