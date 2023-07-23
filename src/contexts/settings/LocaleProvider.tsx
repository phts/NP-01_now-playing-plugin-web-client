import React, { createContext } from 'react';
import { useRawSettings } from '../SettingsProvider';
import { LocalizationSettings } from '../../types/settings/LocalizationSettings';

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

const getSettingsLocale = (settings: LocalizationSettings) => {
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
