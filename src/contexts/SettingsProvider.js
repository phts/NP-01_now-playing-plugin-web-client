import { createContext, useContext } from "react";
import { LocaleContext, LocaleProvider } from "./settings/LocaleProvider";
import { PerformanceContext, PerformanceContextProvider } from "./settings/PerformanceContextProvider";
import { SettingsProviderImpl } from "./settings/SettingsProviderImpl";
import { ThemeContext, ThemeProvider } from "./settings/ThemeProvider";
import { TimezoneContext, TimezoneProvider } from "./settings/TimezoneProvider";

const contexts = {};
const namespaces = ['theme', 'performance', 'localization', 'background', 'screen.nowPlaying'];
namespaces.forEach(ns => {
  contexts[ns] = createContext();
});

const SettingsProvider = ({ children }) => {
  return namespaces.reduce((prevProvider, ns) => {
    const wrapped = (ns === 'performance') ? 
      <PerformanceContextProvider>{prevProvider || children}</PerformanceContextProvider> 
      :
      (ns === 'theme') ? <ThemeProvider>{prevProvider || children}</ThemeProvider>
      :
      (ns === 'localization') ? <LocaleProvider><TimezoneProvider>{prevProvider || children}</TimezoneProvider></LocaleProvider>
      :
      prevProvider || children;

    return (
      <SettingsProviderImpl key={ns} context={contexts[ns]} namespace={ns}>
        {wrapped}
      </SettingsProviderImpl>
    );
  }, null);
};

const useRawSettings = (namespace) => useContext(contexts[namespace]);
const usePerformanceContext = () => useContext(PerformanceContext);
const useTheme = () => useContext(ThemeContext);
const useLocale = () => useContext(LocaleContext);
const useTimezone = () => useContext(TimezoneContext);
  
export { SettingsProvider, useRawSettings, usePerformanceContext, useTheme, useLocale, useTimezone };
