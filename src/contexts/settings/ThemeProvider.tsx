import React, { createContext, useEffect } from 'react';
import defaultTheme from '../../themes/default/index';
import glassTheme from '../../themes/glass/index';
import { SettingsContextValue, useSettings } from '../SettingsProvider';
import { CommonSettingsCategory } from 'now-playing-common';

export interface Theme {
  name: string;
  className: string;
}

export interface ThemeContextValue {
  theme: Theme;
  setTheme: SettingsContextValue<CommonSettingsCategory.Theme>['updateSettings'];
}

const ThemeContext = createContext({} as ThemeContextValue);

const themes: Record<string, Theme> = {
  default: defaultTheme,
  glass: glassTheme
};

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { settings: themeSettings, updateSettings } = useSettings(CommonSettingsCategory.Theme);
  const theme = Reflect.has(themes, themeSettings.active) ? themes[themeSettings.active] : themes.default;

  useEffect(() => {
    document.body.classList.add(...theme.className.split(' '));

    return () => {
      document.body.classList.remove(...theme.className.split(' '));
    };
  }, [ theme ]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateSettings }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
