import { createContext, useMemo } from "react";
import Store from "../utils/store";

const StoreContext = createContext();

const StoreProvider = ({ children }) => {
  const store = useMemo(() => new Store(), []);

  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
};

export { StoreContext, StoreProvider };
