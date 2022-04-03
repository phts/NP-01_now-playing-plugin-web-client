import { createContext } from "react";
import { useAppContext } from "../AppContextProvider";
import { useRawSettings } from "../SettingsProvider";

const PerformanceContext = createContext();

const PerformanceContextProvider = ({ children }) => {
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
