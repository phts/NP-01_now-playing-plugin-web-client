import React, { createContext } from 'react';
import { useRawSettings } from '../SettingsProvider';
import { LocalizationSettings } from '../../types/settings/LocalizationSettings';

export type TimezoneContextValue = string;

const TimezoneContext = createContext<TimezoneContextValue>('');

const getClientTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

const getSettingsTimezone = (settings: LocalizationSettings) => {
  let timezone = settings.resolvedTimezone;
  if (!timezone) {
    timezone = getClientTimezone();
  }
  return timezone;
};

const TimezoneProvider = ({ children }: { children: React.ReactNode }) => {
  const {settings} = useRawSettings('localization');
  const timezone = getSettingsTimezone(settings);

  return (
    <TimezoneContext.Provider
      value={timezone}>
      {children}
    </TimezoneContext.Provider>
  );
};

export { TimezoneContext, TimezoneProvider };
