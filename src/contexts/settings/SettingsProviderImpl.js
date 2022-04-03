import deepEqual from "deep-equal";
import { useEffect, useReducer } from "react";
import { requestPluginApiEndpoint } from "../../utils/api";
import { getInitialSettings } from "../../utils/init";
import { useAppContext } from "../AppContextProvider";
import { useSocket } from "../SocketProvider";

const settingsReducer = (currentSettings, newSettings) => deepEqual(currentSettings, newSettings) ? currentSettings : newSettings;

const SettingsProviderImpl = ({ context, namespace, children }) => {
  const {socket} = useSocket();
  const {pluginInfo} = useAppContext();
  const [settings, updateSettings] = useReducer(settingsReducer, getInitialSettings(namespace));

  useEffect(() => {
    const handlePushSettings = (settings) => {
      if (settings.namespace === namespace) {
        updateSettings(settings.data);
      }
    };

    if (socket) {
      socket.on('nowPlayingPushSettings', handlePushSettings);

      return () => {
        socket.off('nowPlayingPushSettings', handlePushSettings);
      };
    }
  }, [namespace, socket, updateSettings]);

  const apiPath = pluginInfo ? pluginInfo.apiPath : null;

  useEffect(() => {
    let aborted = false;

    const fetchAndUpdateSettings = async() => {
      const result = await requestPluginApiEndpoint(apiPath, '/settings/getSettings', {namespace});
      if (result.success && !aborted) {
        updateSettings(result.data);
      }
    };

    if (apiPath) {
      fetchAndUpdateSettings();

      return () => {
        aborted = true;
      };
    }
  }, [namespace, apiPath, updateSettings]);

  return (
    <context.Provider value={{settings, updateSettings}}>
      {children}
    </context.Provider>
  );
};

export { SettingsProviderImpl };
