import { useContext } from "react";
import { PerformanceSettingsContext, PerformanceSettingsProvider } from "./settings/PerformanceSettingsProvider";
import { StylesContext, StylesProvider } from "./settings/StylesProvider";
import { ThemeContext, ThemeProvider } from "./settings/ThemeProvider";

const SettingsProvider = ({ children }) => {
  return (
    <PerformanceSettingsProvider>
      <ThemeProvider>
        <StylesProvider>
          {children}
        </StylesProvider>
      </ThemeProvider>
    </PerformanceSettingsProvider>
  );
};

const useTheme = () => useContext(ThemeContext);
const useCustomStyles = () => useContext(StylesContext);
const usePerformanceSettings = () => useContext(PerformanceSettingsContext);

export { useTheme, useCustomStyles, usePerformanceSettings, SettingsProvider };
