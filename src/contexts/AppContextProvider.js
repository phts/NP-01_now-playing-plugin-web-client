import deepEqual from "deep-equal";
import { createContext, useContext, useReducer, useState } from "react";
import { checkKiosk, getInitialHost, getInitialPluginInfo } from "../utils/init";

const AppContext = createContext();

const pluginInfoReducer = (currentPluginInfo, newPluginInfo) => deepEqual(currentPluginInfo, newPluginInfo) ? currentPluginInfo : newPluginInfo;

const AppContextProvider = ({ children }) => {
  const [host, setHost] = useState(getInitialHost());
  const [pluginInfo, setPluginInfo] = useReducer(pluginInfoReducer, getInitialPluginInfo());
  const [isKiosk, setKiosk] = useState(checkKiosk());

  return (
    <AppContext.Provider 
      value={{host, setHost, pluginInfo, setPluginInfo, isKiosk, setKiosk}}>
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => useContext(AppContext);

export { useAppContext, AppContextProvider };
