import deepEqual from 'deep-equal';
import React, { useEffect, useState } from 'react';
import { requestPluginApiEndpoint } from '../../utils/api';
import { getInitialSettings } from '../../utils/init';
import { useAppContext } from '../AppContextProvider';
import { useSocket } from '../SocketProvider';
import { SettingsContext } from '../SettingsProvider';
import { SettingsCategory, SettingsOf } from '../../types/settings/Settings';

export interface SettingsProviderImplProps<T extends SettingsCategory> {
  context: SettingsContext<T>;
  category: T;
  children: React.ReactNode;
}

const SettingsProviderImpl = <T extends SettingsCategory>({ context, category, children }: SettingsProviderImplProps<T>) => {
  const {socket} = useSocket();
  const {pluginInfo} = useAppContext();
  const [ settings, updateSettings ] = useState(getInitialSettings(category));

  useEffect(() => {
    // TODO: Rename 'namespace' to 'category' after changing backend as well
    const handlePushSettings = <K extends SettingsCategory>(newSettings: { namespace: K; data: SettingsOf<K> }) => {
      if (newSettings.namespace as unknown === category && !deepEqual(settings, newSettings.data)) {
        updateSettings(newSettings.data as unknown as SettingsOf<T>);
      }
    };

    if (socket) {
      socket.on('nowPlayingPushSettings', handlePushSettings);

      return () => {
        socket.off('nowPlayingPushSettings', handlePushSettings);
      };
    }
  }, [ category, socket, updateSettings ]);

  const apiPath = pluginInfo ? pluginInfo.apiPath : null;

  useEffect(() => {
    let aborted = false;

    const fetchAndUpdateSettings = async() => {
      if (apiPath) {
        const result = await requestPluginApiEndpoint(apiPath, '/settings/getSettings', {namespace: category}); // TODO: change backend 'namespace' to 'category'
        if (result.success && !aborted && !deepEqual(settings, result.data)) {
          updateSettings(result.data as SettingsOf<T>);
        }
      }
    };

    if (apiPath) {
      fetchAndUpdateSettings();

      return () => {
        aborted = true;
      };
    }
  }, [ category, apiPath, updateSettings ]);

  return (
    <context.Provider value={{settings, updateSettings}}>
      {children}
    </context.Provider>
  );
};

export { SettingsProviderImpl };
