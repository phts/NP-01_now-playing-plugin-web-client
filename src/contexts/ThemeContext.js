import { createContext, useState, useEffect, useCallback, useRef, useContext } from "react";
import defaultTheme from '../themes/default';
import glassTheme from '../themes/glass';
import { getInitialThemeName } from "../utils/init";
import { SocketContext } from "./SocketProvider";

const ThemeContext = createContext();

const themes = {
  'default': defaultTheme,
  'glass': glassTheme
};

const ThemeProvider = ({ children }) => {
  const socket = useContext(SocketContext);
  const [theme, applyTheme] = useState(themes[getInitialThemeName()] || defaultTheme);
  const currentTheme = useRef(theme);

  const setTheme = useCallback((themeName) => {
    applyTheme(themes[themeName]);
  }, [applyTheme]);

  useEffect(() => {
    if (socket) {
      socket.on('nowPlayingSetTheme', setTheme)

      return () => {
        socket.off('nowPlayingSetTheme', setTheme)
      };
    }
  }, [socket, setTheme]);

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