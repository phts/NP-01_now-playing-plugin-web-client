import { useEffect } from 'react';
import { useLocale } from '../contexts/SettingsProvider';
import i18n from './i18n';

function I18nLoader() {
  const locale = useLocale();

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [ locale ]);

  return null;
}

export default I18nLoader;
