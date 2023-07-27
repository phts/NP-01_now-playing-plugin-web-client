import deepEqual from 'deep-equal';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { requestPluginApiEndpoint } from '../../utils/api';
import { getInitialSettings } from '../../utils/init';
import { useAppContext } from '../AppContextProvider';
import { useSocket } from '../SocketProvider';
import { SettingsContext } from '../SettingsProvider';
import { CommonSettingsCategory, CommonSettingsOf } from 'now-playing-common';

export interface SettingsProviderImplProps<T extends CommonSettingsCategory> {
  context: SettingsContext<T>;
  category: T;
  children: React.ReactNode;
}

const SettingsProviderImpl = <T extends CommonSettingsCategory>({ context, category, children }: SettingsProviderImplProps<T>) => {
  const { socket } = useSocket();
  const { pluginInfo } = useAppContext();
  const [ settings, updateSettings ] = useState(getInitialSettings(category));
  const currentSettingsRef = useRef(settings);
  const apiPath = pluginInfo ? pluginInfo.apiPath : null;

  const handlePushSettings = useCallback(<K extends CommonSettingsCategory>(newSettings: { category: K; data: CommonSettingsOf<K> }) => {
    if (newSettings.category as unknown === category && !deepEqual(currentSettingsRef.current, newSettings.data)) {
      currentSettingsRef.current = newSettings.data as unknown as CommonSettingsOf<T>;
      updateSettings(newSettings.data as unknown as CommonSettingsOf<T>);
    }
  }, [ category ]);

  const fetchAndUpdateSettings = useCallback(async (abortStatus: { aborted: boolean }) => {
    if (apiPath) {
      const result = await requestPluginApiEndpoint(apiPath, '/settings/getSettings', { category });
      if (result.success && !abortStatus.aborted && !deepEqual(currentSettingsRef.current, result.data)) {
        updateSettings(result.data as CommonSettingsOf<T>);
      }
    }
  }, [ apiPath, category ]);

  useEffect(() => {
    if (socket) {
      socket.on('nowPlayingPushSettings', handlePushSettings);

      return () => {
        socket.off('nowPlayingPushSettings', handlePushSettings);
      };
    }
  }, [ socket, handlePushSettings ]);

  useEffect(() => {
    if (apiPath) {
      const abortStatus = { aborted: false };
      fetchAndUpdateSettings(abortStatus);

      return () => {
        abortStatus.aborted = true;
      };
    }
  }, [ apiPath, fetchAndUpdateSettings ]);

  return (
    <context.Provider value={{ settings, updateSettings }}>
      {children}
    </context.Provider>
  );
};

export { SettingsProviderImpl };
