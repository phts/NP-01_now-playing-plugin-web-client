import React, { createContext } from 'react';
import { useSettings } from '../SettingsProvider';
import { CommonSettingsCategory, CommonSettingsOf, LocalizationSettings } from 'now-playing-common';

export type LocaleContextValue = string;

const LocaleContext = createContext('');

const sanitizeLocale = (locale: string) => {
  try {
    const supported = Intl.DateTimeFormat.supportedLocalesOf(locale);
    return supported[0];
  }
  catch (e) {
    return null;
  }
};

const getClientLocale = () => {
  return Intl.DateTimeFormat().resolvedOptions().locale;
};

const getSettingsLocale = (settings: CommonSettingsOf<LocalizationSettings>) => {
  let locale = settings.resolvedLocale;
  if (!locale) {
    locale = getClientLocale();
  }
  else {
    locale = sanitizeLocale(locale) || getClientLocale();
  }
  return locale;
};

const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const { settings } = useSettings(CommonSettingsCategory.Localization);
  const locale = getSettingsLocale(settings);

  return (
    <LocaleContext.Provider
      value={locale}>
      {children}
    </LocaleContext.Provider>
  );
};

export { LocaleContext, LocaleProvider };
