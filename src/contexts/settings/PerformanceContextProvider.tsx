import React, { createContext } from 'react';
import { useAppContext } from '../AppContextProvider';
import { useRawSettings } from '../SettingsProvider';

export interface PerformanceContextValue {
  disableTransitions: boolean;
}

const PerformanceContext = createContext<PerformanceContextValue>({ disableTransitions: false });

const PerformanceContextProvider = ({ children }: { children: React.ReactNode }) => {
  const {isKiosk} = useAppContext();
  const {settings} = useRawSettings('performance');

  const disableTransitions = !((isKiosk && settings.transitionEffectsKiosk) ||
    (!isKiosk && (settings.transitionEffectsOtherDevices !== undefined ? settings.transitionEffectsOtherDevices : true)));

  return (
    <PerformanceContext.Provider
      value={{disableTransitions}}>
      {children}
    </PerformanceContext.Provider>
  );
};

export { PerformanceContext, PerformanceContextProvider };
