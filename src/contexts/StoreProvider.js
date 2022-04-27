import { createContext, useContext, useMemo } from "react";
import Store from "../utils/store";

const StoreContext = createContext();

const StoreProvider = ({ children }) => {
  const store = useMemo(() => ({
    session: new Store('session'),
    persistent: new Store('persistent')
  }), []);

  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
};

const useStore = (type = 'session') => useContext(StoreContext)[type];

export { useStore, StoreProvider };
