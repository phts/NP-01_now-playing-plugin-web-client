import deepEqual from 'deep-equal';
import React, { Reducer, createContext, useContext, useReducer, useState } from 'react';
import { checkKiosk, getInitialHost, getInitialPluginInfo } from '../utils/init';

export interface PluginInfo {
  apiPath: string;
  appPort: number;
  appUrl: string;
  previewUrl: string;
  version: string;
}

export interface AppContextValue {
  host: string;
  setHost: (host: string) => void;
  pluginInfo: PluginInfo | null;
  setPluginInfo: (pluginInfo: PluginInfo) => void;
  isKiosk: boolean;
  setKiosk: (kiosk: boolean) => void;
  manuallyShowIdleScreen: boolean;
  setManuallyShowIdleScreen: (value: boolean) => void;
}

const AppContext = createContext({} as AppContextValue);

const pluginInfoReducer: Reducer<PluginInfo | null, PluginInfo | null> = (currentPluginInfo, newPluginInfo) =>
  deepEqual(currentPluginInfo, newPluginInfo) ? currentPluginInfo : newPluginInfo;

const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [ host, setHost ] = useState(getInitialHost());
  const [ pluginInfo, setPluginInfo ] = useReducer(pluginInfoReducer, getInitialPluginInfo());
  const [ isKiosk, setKiosk ] = useState(checkKiosk());
  const [ manuallyShowIdleScreen, setManuallyShowIdleScreen ] = useState(false);

  return (
    <AppContext.Provider
      value={{ host, setHost, pluginInfo, setPluginInfo, isKiosk, setKiosk, manuallyShowIdleScreen, setManuallyShowIdleScreen }}>
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => useContext(AppContext);

export { useAppContext, AppContextProvider };
