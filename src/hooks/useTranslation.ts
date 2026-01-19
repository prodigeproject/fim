import { useLanguage } from "@/contexts/LanguageContext";
import idLocale from "@/locales/id.json";
import enLocale from "@/locales/en.json";

type TranslationKeys = typeof idLocale;

export function useTranslation() {
  const { language } = useLanguage();
  
  const translations: Record<string, TranslationKeys> = {
    id: idLocale,
    en: enLocale as TranslationKeys,
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback to Indonesian if key not found
        value = translations.id;
        for (const fallbackKey of keys) {
          if (value && typeof value === "object" && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return the key if not found at all
          }
        }
        break;
      }
    }
    
    return typeof value === "string" ? value : key;
  };

  return { t, language };
}
