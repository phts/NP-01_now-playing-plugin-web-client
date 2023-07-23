export interface LocalizationSettings {
  geoCoordinates?: string;
  locale?: string;
  resolvedLocale?: string | null;
  timezone?: string;
  resolvedTimezone?: string | null;
  unitSystem?: 'metric' | 'imperial';
}

export const DefaultLocalizationSettings: Required<LocalizationSettings> = {
  geoCoordinates: '',
  locale: '',
  resolvedLocale: null,
  timezone: '',
  resolvedTimezone: null,
  unitSystem: 'metric'
};
