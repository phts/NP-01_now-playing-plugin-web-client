import { createContext, useEffect } from "react";
import defaultTheme from '../../themes/default';
import glassTheme from '../../themes/glass';
import { useRawSettings } from "../SettingsProvider";

const ThemeContext = createContext();

const themes = {
  'default': defaultTheme,
  'glass': glassTheme
};

const ThemeProvider = ({ children }) => {
  const {settings: themeName, updateSettings} = useRawSettings('theme');
  const theme = themes[themeName];

  useEffect(() => {
    document.body.classList.add(...theme.className.split(' '));

    return () => {
      document.body.classList.remove(...theme.className.split(' '))
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{theme, setTheme: updateSettings}}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
