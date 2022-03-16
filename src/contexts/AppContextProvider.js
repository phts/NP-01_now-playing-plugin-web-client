import { createContext, useState } from "react";
import { getInitialHost, getInitialPluginInfo } from "../utils/init";

const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [host, setHost] = useState(getInitialHost());
  const [pluginInfo, setPluginInfo] = useState(getInitialPluginInfo());

  return (
    <AppContext.Provider value={{host, setHost, pluginInfo, setPluginInfo}}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };
