import { createContext, useState } from "react";
import { getInitialHost } from "../utils/init";

const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [host, setHost] = useState(getInitialHost());

  return (
    <AppContext.Provider value={{host, setHost}}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };
