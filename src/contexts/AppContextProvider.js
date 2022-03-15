import { createContext, useState } from "react";
import { getApiPath, getInitialHost } from "../utils/init";

const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [host, setHost] = useState(getInitialHost());
  const apiPath = getApiPath();

  return (
    <AppContext.Provider value={{host, setHost, apiPath}}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };
