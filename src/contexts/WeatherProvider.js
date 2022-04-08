import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useWeatherService } from "./ServiceProvider";

const WeatherContext = createContext();

const WeatherProvider = ({ children }) => {
  const weatherService = useWeatherService();
  const [weather, setWeatherInfo] = useState({status: 'unavailable'});

  const fetchIfReady = useCallback(() => {
    if (weatherService && weatherService.isReady()) {
      weatherService.getInfo();
    }
    else {
      setWeatherInfo({
        status: 'unavailable'
      });
    }
  }, [weatherService, setWeatherInfo]);

  useEffect(() => {
    if (weatherService) {
      const handleWeatherFetched = (data) => {
        setWeatherInfo({
          status: 'fetched',
          info: data
        });
      };

      const handleError = (message) => {
        setWeatherInfo({
          status: 'error',
          error: {message},
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
      }
    }
  }, [weatherService, setWeatherInfo, fetchIfReady]);

  useEffect(() => {
    const refreshTimer = setTimeout(fetchIfReady, 600000);
    
    return () => {
      clearTimeout(refreshTimer);
    }
  }, [weather, fetchIfReady]);

  return (
    <WeatherContext.Provider value={weather}>
      {children}
    </WeatherContext.Provider>
  );
};

const useWeather = () => useContext(WeatherContext);

export { useWeather, WeatherProvider };
