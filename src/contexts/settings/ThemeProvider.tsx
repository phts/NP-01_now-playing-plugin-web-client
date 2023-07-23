import React, { createContext, useEffect } from 'react';
import defaultTheme from '../../themes/default';
import glassTheme from '../../themes/glass';
import { SettingsContextValue, useRawSettings } from '../SettingsProvider';
import { DefaultThemeSettings } from '../../types/settings/ThemeSettings';

export interface Theme {
  name: string;
  className: string;
}

export interface ThemeContextValue {
  theme: Theme;
  setTheme: SettingsContextValue<'theme'>['updateSettings'];
}

const ThemeContext = createContext({} as ThemeContextValue);

const themes: Record<string, Theme> = {
  'default': defaultTheme,
  'glass': glassTheme
};

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const {settings: themeName, updateSettings} = useRawSettings('theme');
  const theme = themes[themeName || DefaultThemeSettings];

  useEffect(() => {
    document.body.classList.add(...theme.className.split(' '));

    return () => {
      document.body.classList.remove(...theme.className.split(' '));
    };
  }, [ theme ]);

  return (
    <ThemeContext.Provider value={{theme, setTheme: updateSettings}}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
