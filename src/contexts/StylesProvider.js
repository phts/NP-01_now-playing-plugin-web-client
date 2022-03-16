import { createContext, useState, useEffect, useContext } from "react";
import { requestPluginApiEndpoint } from "../utils/api";
import { getInitialCustomStyles } from "../utils/init";
import { AppContext } from "./AppContextProvider";
import { SocketContext } from "./SocketProvider";

const StylesContext = createContext();

const StylesProvider = ({ children }) => {
  const {socket} = useContext(SocketContext);
  const {pluginInfo} = useContext(AppContext);
  const [customStyles, setCustomStyles] = useState(getInitialCustomStyles());

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
