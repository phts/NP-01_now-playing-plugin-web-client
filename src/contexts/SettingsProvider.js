import { createContext, useContext } from "react";
import { PerformanceContext, PerformanceContextProvider } from "./settings/PerformanceContextProvider";
import { SettingsProviderImpl } from "./settings/SettingsProviderImpl";
import { ThemeContext, ThemeProvider } from "./settings/ThemeProvider";

const contexts = {};
const namespaces = ['theme', 'performance', 'background', 'screen.nowPlaying'];
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
  
export { SettingsProvider, useRawSettings, usePerformanceContext, useTheme };
