import { createContext, useState } from "react";
import { getInitialHost, getInitialPluginInfo, getLocationQueryParam } from "../utils/init";

const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [host, setHost] = useState(getInitialHost());
  const [pluginInfo, setPluginInfo] = useState(getInitialPluginInfo());
  const [isKiosk, setKiosk] = useState(getLocationQueryParam('kiosk', false));

  return (
    <AppContext.Provider 
      value={{host, setHost, pluginInfo, setPluginInfo, isKiosk, setKiosk}}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };
