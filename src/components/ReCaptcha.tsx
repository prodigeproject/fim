import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

interface ReCaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

export function ReCaptcha({ siteKey, onVerify, onExpire, onError }: ReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load reCAPTCHA script if not already loaded
    const loadScript = () => {
      if (window.grecaptcha && window.grecaptcha.render) {
        setIsReady(true);
        return;
      }

      // Check if script is already loading
      if (document.querySelector('script[src*="recaptcha"]')) {
        window.onRecaptchaLoad = () => setIsReady(true);
        return;
      }

      window.onRecaptchaLoad = () => setIsReady(true);

      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    loadScript();
  }, []);

  useEffect(() => {
    if (!isReady || !containerRef.current) return;

    // Render reCAPTCHA widget
    if (widgetIdRef.current === null) {
      try {
        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          callback: onVerify,
          "expired-callback": onExpire,
          "error-callback": onError,
        });
      } catch (error) {
        console.error("Failed to render reCAPTCHA:", error);
      }
    }
  }, [isReady, siteKey, onVerify, onExpire, onError]);

  return <div ref={containerRef} className="flex justify-center" />;
}

export function useReCaptcha() {
  const [token, setToken] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = (token: string) => {
    setToken(token);
    setIsVerified(true);
  };

  const handleExpire = () => {
    setToken(null);
    setIsVerified(false);
  };

  const handleError = () => {
    setToken(null);
    setIsVerified(false);
  };

  const reset = () => {
    setToken(null);
    setIsVerified(false);
    if (window.grecaptcha) {
      try {
        window.grecaptcha.reset();
      } catch (e) {
        // Ignore
      }
    }
  };

  return {
    token,
    isVerified,
    handleVerify,
    handleExpire,
    handleError,
    reset,
  };
}
