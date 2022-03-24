import { useContext } from "react";
import { StylesContext, StylesProvider } from "./settings/StylesProvider";
import { ThemeContext, ThemeProvider } from "./settings/ThemeProvider";

const SettingsProvider = ({ children }) => {
  return (
    <ThemeProvider>
      <StylesProvider>
        {children}
      </StylesProvider>
    </ThemeProvider>
  );
};

const useTheme = () => useContext(ThemeContext);
const useCustomStyles = () => useContext(StylesContext);

export { useTheme, useCustomStyles, SettingsProvider };
