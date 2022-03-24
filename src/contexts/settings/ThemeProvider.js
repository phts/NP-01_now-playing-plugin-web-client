import { createContext, useState, useEffect, useCallback, useRef } from "react";
import defaultTheme from '../../themes/default';
import glassTheme from '../../themes/glass';
import { requestPluginApiEndpoint } from "../../utils/api";
import { getInitialThemeName } from "../../utils/init";
import { useAppContext } from "../AppContextProvider";
import { useSocket } from "../SocketProvider";

const ThemeContext = createContext();

const themes = {
  'default': defaultTheme,
  'glass': glassTheme
};

const ThemeProvider = ({ children }) => {
  const {socket} = useSocket();
  const {pluginInfo} = useAppContext()
  const [theme, applyTheme] = useState(themes[getInitialThemeName()] || defaultTheme);
  const currentTheme = useRef(theme);

  const setTheme = useCallback((themeName) => {
    applyTheme(themes[themeName]);
  }, [applyTheme]);

  useEffect(() => {
    if (socket) {
      socket.on('nowPlayingSetTheme', setTheme);

      return () => {
        socket.off('nowPlayingSetTheme', setTheme);
      };
    }
  }, [socket, setTheme]);

  const apiPath = pluginInfo ? pluginInfo.apiPath : null;

  useEffect(() => {
    let aborted = false;

    const fetchAndSetTheme = async() => {
      const result = await requestPluginApiEndpoint(apiPath, '/settings/getTheme');
      if (result.success && !aborted) {
        setTheme(result.data);
      }
    };

    if (apiPath) {
      fetchAndSetTheme();

      return () => {
        aborted = true;
      };
    }
  }, [apiPath, setTheme]);

  useEffect(() => {
    document.body.classList.remove(...currentTheme.current.className.split(' '))
    document.body.classList.add(...theme.className.split(' '));
    currentTheme.current = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{theme, setTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
