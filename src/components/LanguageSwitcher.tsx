import { Globe, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<"id" | "en">("id");

  useEffect(() => {
    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "id",
          includedLanguages: "id,en",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    // Add Google Translate script if not already present
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const script = document.createElement("script");
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const translatePage = (lang: "id" | "en") => {
    setCurrentLang(lang);
    
    // Find and trigger Google Translate
    const selectElement = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = lang;
      selectElement.dispatchEvent(new Event("change"));
    } else {
      // If Google Translate widget not loaded yet, wait and retry
      setTimeout(() => {
        const retrySelect = document.querySelector(".goog-te-combo") as HTMLSelectElement;
        if (retrySelect) {
          retrySelect.value = lang;
          retrySelect.dispatchEvent(new Event("change"));
        }
      }, 1000);
    }
  };

  return (
    <>
      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" className="hidden" />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Languages className="h-4 w-4" />
            <span className="sr-only">Toggle language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => translatePage("id")}
            className={currentLang === "id" ? "bg-muted" : ""}
          >
            🇮🇩 Indonesia
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => translatePage("en")}
            className={currentLang === "en" ? "bg-muted" : ""}
          >
            🇬🇧 English
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
