import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useWeatherService } from './ServiceProvider';
import { WeatherData } from '../services/WeatherService';

export type WeatherState = {
  status: 'fetched';
  info: WeatherData;
} | {
  status: 'error';
  error: { message: string; };
} | {
  status: 'unavailable';
}

export type WeatherContextValue = WeatherState;

const WeatherContext = createContext({} as WeatherContextValue);

const WeatherProvider = ({ children }: { children: React.ReactNode }) => {
  const weatherService = useWeatherService();
  const [ weather, setWeatherState ] = useState<WeatherState>({status: 'unavailable'});

  const fetchIfReady = useCallback(() => {
    if (weatherService && weatherService.isReady()) {
      weatherService.getInfo();
    }
    else {
      setWeatherState({
        status: 'unavailable'
      });
    }
  }, [ weatherService, setWeatherState ]);

  useEffect(() => {
    if (weatherService) {
      const handleWeatherFetched = (data: WeatherData) => {
        setWeatherState({
          status: 'fetched',
          info: data
        });
      };

      const handleError = (message: string) => {
        setWeatherState({
          status: 'error',
          error: {message}
        });
      };

      weatherService.on('fetched', handleWeatherFetched);
      weatherService.on('error', handleError);
      weatherService.on('readyStateChange', fetchIfReady);

      fetchIfReady();

      return () => {
        weatherService.off('fetched', handleWeatherFetched);
        weatherService.off('error', handleError);
        weatherService.off('readyStateChange', fetchIfReady);
      };
    }
  }, [ weatherService, setWeatherState, fetchIfReady ]);

  useEffect(() => {
    const refreshTimer = setTimeout(fetchIfReady, 600000);

    return () => {
      clearTimeout(refreshTimer);
    };
  }, [ weather, fetchIfReady ]);

  return (
    <WeatherContext.Provider value={weather}>
      {children}
    </WeatherContext.Provider>
  );
};

const useWeather = () => useContext(WeatherContext);

export { useWeather, WeatherProvider };
