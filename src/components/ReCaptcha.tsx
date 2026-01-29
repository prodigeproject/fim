import { useEffect, useRef, useCallback, useState } from "react";

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      render: (container: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'expired-callback': () => void;
        'error-callback': () => void;
        theme?: 'light' | 'dark';
        size?: 'compact' | 'normal';
      }) => number;
      reset: (widgetId: number) => void;
    };
    onRecaptchaLoad?: () => void;
  }
}

interface ReCaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: 'light' | 'dark';
  size?: 'compact' | 'normal';
  className?: string;
}

let scriptLoaded = false;
let scriptLoading = false;
const loadCallbacks: (() => void)[] = [];

function loadRecaptchaScript(): Promise<void> {
  return new Promise((resolve) => {
    if (scriptLoaded) {
      resolve();
      return;
    }

    if (scriptLoading) {
      loadCallbacks.push(resolve);
      return;
    }

    scriptLoading = true;
    
    window.onRecaptchaLoad = () => {
      scriptLoaded = true;
      scriptLoading = false;
      resolve();
      loadCallbacks.forEach(cb => cb());
      loadCallbacks.length = 0;
    };

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });
}

export function ReCaptcha({ 
  siteKey, 
  onVerify, 
  onExpire, 
  onError, 
  theme = 'light',
  size = 'normal',
  className 
}: ReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  const handleVerify = useCallback((token: string) => {
    onVerify(token);
  }, [onVerify]);

  const handleExpire = useCallback(() => {
    onExpire?.();
  }, [onExpire]);

  const handleError = useCallback(() => {
    onError?.();
  }, [onError]);

  useEffect(() => {
    if (!siteKey) return;

    let mounted = true;

    loadRecaptchaScript().then(() => {
      if (!mounted || !containerRef.current) return;

      window.grecaptcha.ready(() => {
        if (!mounted || !containerRef.current) return;
        
        // Clear previous widget if exists
        if (widgetIdRef.current !== null) {
          try {
            window.grecaptcha.reset(widgetIdRef.current);
          } catch {
            // Widget might not exist anymore
          }
        }

        // Clear container
        containerRef.current.innerHTML = '';

        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          callback: handleVerify,
          'expired-callback': handleExpire,
          'error-callback': handleError,
          theme,
          size,
        });

        setIsReady(true);
      });
    });

    return () => {
      mounted = false;
    };
  }, [siteKey, handleVerify, handleExpire, handleError, theme, size]);

  if (!siteKey) {
    return null;
  }

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ minHeight: size === 'compact' ? 78 : 78 }}
    />
  );
}

export function resetRecaptcha(widgetId: number) {
  if (window.grecaptcha) {
    try {
      window.grecaptcha.reset(widgetId);
    } catch {
      // Widget might not exist
    }
  }
}
