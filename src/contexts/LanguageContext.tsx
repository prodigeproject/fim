import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import id from "@/locales/id.json";
import en from "@/locales/en.json";

type Language = "id" | "en";
type Translations = Record<string, any>;

const locales: Record<Language, Translations> = { id, en };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getNestedValue(obj: any, path: string): string | undefined {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

function getLanguageFromHash(): Language | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace("#", "").toLowerCase();
  if (hash === "en") return "en";
  if (hash === "id") return "id";
  return null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      // Check hash first (e.g. /#en)
      const hashLang = getLanguageFromHash();
      if (hashLang) return hashLang;
      const saved = localStorage.getItem("language") as Language | null;
      if (saved && (saved === "id" || saved === "en")) return saved;
      const browserLang = navigator.language.split("-")[0];
      return browserLang === "en" ? "en" : "id";
    }
    return "id";
  });

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hashLang = getLanguageFromHash();
      if (hashLang && hashLang !== language) {
        setLanguageState(hashLang);
        localStorage.setItem("language", hashLang);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    // Also check on mount
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    // Update hash without scrolling
    const url = new URL(window.location.href);
    url.hash = lang === "en" ? "en" : "";
    window.history.replaceState(null, "", url.toString());
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const value = getNestedValue(locales[language], key);
      if (value !== undefined && typeof value === "string") return value;
      // Fallback to Indonesian
      const fallbackValue = getNestedValue(locales.id, key);
      if (fallbackValue !== undefined && typeof fallbackValue === "string") return fallbackValue;
      return fallback ?? key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
