import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import pt_pt from "./locales/pt-pt.json";
import pt_br from "./locales/pt-br.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";

const resources = {
  en: { translation: en },
  pt_br: { translation: pt_br },
  pt_pt: { translation: pt_pt },
  fr: { translation: fr },
  es: { translation: es },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
