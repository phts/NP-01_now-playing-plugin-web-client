import React, { createContext, useContext, useMemo } from 'react';
import Store from '../utils/Store';

export type StoreContextValue = {
  session: Store;
  persistent: Store;
}

const StoreContext = createContext({} as StoreContextValue);

const StoreProvider = ({ children }: { children: React.ReactNode }) => {
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

const useStore = (type: keyof StoreContextValue = 'session') => useContext(StoreContext)[type];

export { useStore, StoreProvider };
