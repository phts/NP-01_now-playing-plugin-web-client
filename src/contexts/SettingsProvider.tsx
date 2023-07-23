import React, { createContext, useContext } from 'react';
import { LocaleContext, LocaleProvider } from './settings/LocaleProvider';
import { PerformanceContext, PerformanceContextProvider } from './settings/PerformanceContextProvider';
import { SettingsProviderImpl } from './settings/SettingsProviderImpl';
import { ThemeContext, ThemeProvider } from './settings/ThemeProvider';
import { TimezoneContext, TimezoneProvider } from './settings/TimezoneProvider';
import { SettingsCategory, SettingsOf } from '../types/settings/Settings';

export interface SettingsContextValue<T extends SettingsCategory> {
  settings: SettingsOf<T>;
  updateSettings: (settings: SettingsOf<T>) => void;
}

const categories: SettingsCategory[] = [
  'theme',
  'performance',
  'localization',
  'background',
  'actionPanel',
  'screen.nowPlaying',
  'screen.idle'
];

export type SettingsContext<T extends SettingsCategory> = React.Context<SettingsContextValue<T>>;

const contexts: Record<SettingsCategory, SettingsContext<SettingsCategory>> = {
  theme: createContext({} as SettingsContextValue<'theme'>),
  performance: createContext({} as SettingsContextValue<'performance'>),
  localization: createContext({} as SettingsContextValue<'localization'>),
  background: createContext({} as SettingsContextValue<'background'>),
  actionPanel: createContext({} as SettingsContextValue<'actionPanel'>),
  'screen.nowPlaying': createContext({} as SettingsContextValue<'screen.nowPlaying'>),
  'screen.idle': createContext({} as SettingsContextValue<'screen.idle'>)
};

const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  return categories.reduce<React.JSX.Element | null>((prevProvider, category) => {
    const wrapped = (category === 'performance') ?
      <PerformanceContextProvider>{prevProvider || children}</PerformanceContextProvider>
      :
      (category === 'theme') ? <ThemeProvider>{prevProvider || children}</ThemeProvider>
        :
        (category === 'localization') ? <LocaleProvider><TimezoneProvider>{prevProvider || children}</TimezoneProvider></LocaleProvider>
          :
          prevProvider || children;

    return (
      <SettingsProviderImpl key={category} context={contexts[category]} category={category}>
        {wrapped}
      </SettingsProviderImpl>
    );
  }, null) as React.JSX.Element;
};

const useRawSettings = <T extends SettingsCategory>(category: T): SettingsContextValue<T> => useContext(contexts[category]);
const usePerformanceContext = () => useContext(PerformanceContext);
const useTheme = () => useContext(ThemeContext);
const useLocale = () => useContext(LocaleContext);
const useTimezone = () => useContext(TimezoneContext);

export {
  SettingsProvider,
  useRawSettings,
  usePerformanceContext,
  useTheme,
  useLocale,
  useTimezone
};
