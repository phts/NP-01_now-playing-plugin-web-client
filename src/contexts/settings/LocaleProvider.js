import { createContext } from "react";
import { useRawSettings } from "../SettingsProvider";

const LocaleContext = createContext();

const sanitizeLocale = (locale) => {
  try {
    const supported = Intl.DateTimeFormat.supportedLocalesOf(locale);
    return supported[0];
  } catch (e) {
    return null;
  }
};

const getClientLocale = () => {
  return Intl.DateTimeFormat().resolvedOptions().locale;
}

const getSettingsLocale = (settings) => {
  let locale;
  switch(settings.localeType) {
    case 'volumio':
      locale = settings.volumioLocale;
      break;
    case 'custom':
      locale = settings.locale;
      break;
    default:
      locale = null;
  }
  if (!locale) {
    locale = getClientLocale();
  }
  else {
    locale = sanitizeLocale(locale) || getClientLocale();
  }
  return locale;
}

const LocaleProvider = ({ children }) => {
  const {settings} = useRawSettings('localization');
  const locale = getSettingsLocale(settings);
  
  return (
    <LocaleContext.Provider 
      value={locale}>
      {children}
    </LocaleContext.Provider>
  );
};

export { LocaleContext, LocaleProvider };
