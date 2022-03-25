import deepEqual from "deep-equal";
import { createContext, useEffect, useReducer } from "react";
import { requestPluginApiEndpoint } from "../../utils/api";
import { getInitialCustomStyles } from "../../utils/init";
import { useAppContext } from "../AppContextProvider";
import { useSocket } from "../SocketProvider";

const StylesContext = createContext();

const stylesReducer = (currentStyles, newStyles) => deepEqual(currentStyles, newStyles) ? currentStyles : newStyles;

const StylesProvider = ({ children }) => {
  const {socket} = useSocket();
  const {pluginInfo} = useAppContext()
  const [customStyles, setCustomStyles] = useReducer(stylesReducer, getInitialCustomStyles());

  useEffect(() => {
    if (socket) {
      socket.on('nowPlayingSetCustomCSS', setCustomStyles);

      return () => {
        socket.off('nowPlayingSetCustomCSS', setCustomStyles);
      };
    }
  }, [socket, setCustomStyles]);

  const apiPath = pluginInfo ? pluginInfo.apiPath : null;

  useEffect(() => {
    let aborted = false;

    const fetchAndSetCustomStyles = async() => {
      const result = await requestPluginApiEndpoint(apiPath, '/settings/getCustomStyles');
      if (result.success && !aborted) {
        setCustomStyles(result.data);
      }
    };

    if (apiPath) {
      fetchAndSetCustomStyles();

      return () => {
        aborted = true;
      };
    }
  }, [apiPath, setCustomStyles]);

  return (
    <StylesContext.Provider value={{customStyles, setCustomStyles}}>
      {children}
    </StylesContext.Provider>
  );
};

export { StylesContext, StylesProvider };
