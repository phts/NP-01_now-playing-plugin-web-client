import React, { createContext } from 'react';
import { useAppContext } from '../AppContextProvider';
import { useSettings } from '../SettingsProvider';
import { CommonSettingsCategory } from 'now-playing-common';

export interface PerformanceContextValue {
  disableTransitions: boolean;
}

const PerformanceContext = createContext<PerformanceContextValue>({ disableTransitions: false });

const PerformanceContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { isKiosk } = useAppContext();
  const { settings } = useSettings(CommonSettingsCategory.Performance);

  const disableTransitions = !((isKiosk && settings.transitionEffectsKiosk) ||
    (!isKiosk && settings.transitionEffectsOtherDevices));

  return (
    <PerformanceContext.Provider
      value={{ disableTransitions }}>
      {children}
    </PerformanceContext.Provider>
  );
};

export { PerformanceContext, PerformanceContextProvider };
