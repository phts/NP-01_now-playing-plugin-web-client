import * as PIXI from 'pixi.js';
import React, { createContext, useContext, useEffect, useRef } from 'react';

export interface VUMeterPixiTickerContextValue {
  ticker: PIXI.Ticker;
}

const VUMeterPixiTickerContext = createContext({} as VUMeterPixiTickerContextValue);

const createTicker = () => {
  const ticker = new PIXI.Ticker();
  ticker.autoStart = true;
  return ticker;
};

const VUMeterPixiTickerProvider = ({ children }: { children: React.ReactNode }) => {
  const tickerRef = useRef(createTicker());

  useEffect(() => {
    return () => {
      tickerRef.current.stop();
    };
  }, []);

  return (
    <VUMeterPixiTickerContext.Provider
      value={{ ticker: tickerRef.current }}>
      {children}
    </VUMeterPixiTickerContext.Provider>
  );
};

const useVUMeterTicker = () => useContext(VUMeterPixiTickerContext);

export { useVUMeterTicker, VUMeterPixiTickerProvider };
