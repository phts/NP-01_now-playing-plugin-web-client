import React, { createContext, useContext } from 'react';
import { LocaleContext, LocaleProvider } from './settings/LocaleProvider';
import { PerformanceContext, PerformanceContextProvider } from './settings/PerformanceContextProvider';
import { SettingsProviderImpl } from './settings/SettingsProviderImpl';
import { ThemeContext, ThemeProvider } from './settings/ThemeProvider';
import { TimezoneContext, TimezoneProvider } from './settings/TimezoneProvider';
import { CommonSettingsCategory, CommonSettingsOf } from 'now-playing-common';

export interface SettingsContextValue<T extends CommonSettingsCategory> {
  settings: CommonSettingsOf<T>;
  updateSettings: (settings: CommonSettingsOf<T>) => void;
}

export type SettingsContext<T extends CommonSettingsCategory> = React.Context<SettingsContextValue<T>>;

const contexts: Record<CommonSettingsCategory, any> = {
  [CommonSettingsCategory.Startup]: createContext({} as SettingsContextValue<CommonSettingsCategory.Startup>),
  [CommonSettingsCategory.Theme]: createContext({} as SettingsContextValue<CommonSettingsCategory.Theme>),
  [CommonSettingsCategory.Performance]: createContext({} as SettingsContextValue<CommonSettingsCategory.Performance>),
  [CommonSettingsCategory.Localization]: createContext({} as SettingsContextValue<CommonSettingsCategory.Localization>),
  [CommonSettingsCategory.Background]: createContext({} as SettingsContextValue<CommonSettingsCategory.Background>),
  [CommonSettingsCategory.ActionPanel]: createContext({} as SettingsContextValue<CommonSettingsCategory.ActionPanel>),
  [CommonSettingsCategory.ContentRegion]: createContext({} as SettingsContextValue<CommonSettingsCategory.ContentRegion>),
  [CommonSettingsCategory.NowPlayingScreen]: createContext({} as SettingsContextValue<CommonSettingsCategory.NowPlayingScreen>),
  [CommonSettingsCategory.IdleScreen]: createContext({} as SettingsContextValue<CommonSettingsCategory.IdleScreen>)
};

const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  return Object.values(CommonSettingsCategory).reduce<React.JSX.Element | null>((prevProvider, category) => {
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

const useSettings = <T extends CommonSettingsCategory>(category: T): SettingsContextValue<T> => useContext(contexts[category]);
const usePerformanceContext = () => useContext(PerformanceContext);
const useTheme = () => useContext(ThemeContext);
const useLocale = () => useContext(LocaleContext);
const useTimezone = () => useContext(TimezoneContext);

export {
  SettingsProvider,
  useSettings,
  usePerformanceContext,
  useTheme,
  useLocale,
  useTimezone
};
