import i18next from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";
import fallbackSpecifics from './fallback-specifics.json';

const cachedFallbacks = {};

i18next
  .use(initReactI18next)
  .use(resourcesToBackend((language, namespace, callback) => {
    import(`./translations/${language}/${namespace}.json`)
      .then(({ default: resources }) => {
        callback(null, resources)
      })
      .catch((error) => {
        callback(error, null)
      });
  }))
  .init({
    load: 'currentOnly',

    fallbackLng: (code) => {
      if (cachedFallbacks[code]) {
        return cachedFallbacks[code];
      }

      if (!code || code === 'en') return ['en'];
      const fallbacks = [code];

      const specific = fallbackSpecifics.find(_specific => _specific.locales && _specific.locales.includes(code));
      if (specific && specific.fallback) {
        fallbacks.push(specific.fallback);
      }

      // add pure lang
      const langPart = code.split('-')[0];
      if (langPart !== code && langPart !== 'en') fallbacks.push(langPart);

      fallbacks.push('en');

      cachedFallbacks[code] = fallbacks;

      return fallbacks;
    },

    debug: false,

    interpolation: {
      escapeValue: false
    },
  });

export default i18next;
