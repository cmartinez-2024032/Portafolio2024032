import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { es, en } from "./locales";

const LANG_KEY = "forge-lang";

const dictionaries = { es, en };

const LanguageContext = createContext(null);

function readStored(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    const stored = readStored(LANG_KEY, "es");
    return stored === "en" ? "en" : "es";
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      localStorage.setItem(LANG_KEY, locale);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent("forge:locale", { detail: { locale } }));
  }, [locale]);

  const value = useMemo(() => {
    const t = dictionaries[locale] || es;
    return {
      locale,
      t,
      setLocale: (next) => setLocaleState(next === "en" ? "en" : "es"),
      toggleLocale: () => setLocaleState((prev) => (prev === "es" ? "en" : "es")),
    };
  }, [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      locale: "es",
      t: es,
      setLocale: () => {},
      toggleLocale: () => {},
    };
  }
  return ctx;
}

export function getDictionary(locale = "es") {
  return dictionaries[locale] || es;
}
