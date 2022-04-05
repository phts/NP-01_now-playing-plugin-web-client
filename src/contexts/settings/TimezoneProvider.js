import { createContext } from "react";
import { useRawSettings } from "../SettingsProvider";

const TimezoneContext = createContext();

const getClientTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

const getSettingsTimezone = (settings) => {
  let timezone;
  switch(settings.timezoneType) {
    case 'custom':
      timezone = settings.timezone;
      break;
    default:
      timezone = null;
  }
  if (!timezone) {
    timezone = getClientTimezone();
  }
  return timezone;
}

const TimezoneProvider = ({ children }) => {
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
