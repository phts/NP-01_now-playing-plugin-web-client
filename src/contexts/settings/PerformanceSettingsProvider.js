import deepEqual from "deep-equal";
import { createContext, useEffect, useReducer } from "react";
import { requestPluginApiEndpoint } from "../../utils/api";
import { DEFAULT_PERFORMANCE_SETTINGS, getInitialPerformanceSettings } from "../../utils/init";
import { useAppContext } from "../AppContextProvider";
import { useSocket } from "../SocketProvider";

const PerformanceSettingsContext = createContext();

const settingsReducer = (currentSettings, newSettings) => deepEqual(currentSettings, newSettings) ? currentSettings : newSettings;

const PerformanceSettingsProvider = ({ children }) => {
  const { socket } = useSocket();
  const { pluginInfo, isKiosk } = useAppContext();
  const [performanceSettings, setPerformanceSettings] = useReducer(settingsReducer, getInitialPerformanceSettings());

  const disableTransitions = !((isKiosk && performanceSettings.transitionEffectsKiosk) || 
    (!isKiosk && (performanceSettings.transitionEffectsOtherDevices !== undefined ? performanceSettings.transitionEffectsOtherDevices : true)));

  useEffect(() => {
    const doSetPerformanceSettings = (data) => {
      setPerformanceSettings(data || DEFAULT_PERFORMANCE_SETTINGS);
    };

    if (socket) {
      socket.on('nowPlayingSetPerformanceSettings', doSetPerformanceSettings);

      return () => {
        socket.off('nowPlayingSetPerformanceSettings', doSetPerformanceSettings);
      };
    }
  }, [socket, setPerformanceSettings]);

  const apiPath = pluginInfo ? pluginInfo.apiPath : null;

  useEffect(() => {
    let aborted = false;

    const fetchAndSet = async () => {
      const result = await requestPluginApiEndpoint(apiPath, '/settings/getPerformanceSettings');
      if (result.success && !aborted) {
        setPerformanceSettings(result.data || DEFAULT_PERFORMANCE_SETTINGS);
      }
    };

    if (apiPath) {
      fetchAndSet();

      return () => {
        aborted = true;
      };
    }
  }, [apiPath, setPerformanceSettings]);

  return (
    <PerformanceSettingsContext.Provider value={{performanceSettings, disableTransitions}}>
      {children}
    </PerformanceSettingsContext.Provider>
  );
};

export { PerformanceSettingsContext, PerformanceSettingsProvider };
