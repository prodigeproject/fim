import { useEffect, useRef } from "react";

export const TURNSTILE_BYPASS_TOKEN = "__TURNSTILE_BYPASS__";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string;

/** Injects the Turnstile script once and returns a promise that resolves when ready. */
let turnstileScriptPromise: Promise<void> | null = null;
function loadTurnstileScript(): Promise<void> {
  if (turnstileScriptPromise) return turnstileScriptPromise;
  if (window.turnstile) return (turnstileScriptPromise = Promise.resolve());

  turnstileScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      turnstileScriptPromise = null; // allow retry
      reject(new Error("Failed to load Turnstile script"));
    };
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

export function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
  theme = "auto",
  size = "normal",
  className = "",
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbacksRef = useRef({ onVerify, onExpire, onError });

  // Keep callbacks ref up to date without causing re-renders
  callbacksRef.current = { onVerify, onExpire, onError };

  // If Turnstile site key is not configured (e.g. custom hosting without the env var),
  // auto-bypass so login is not permanently blocked.
  useEffect(() => {
    if (!SITE_KEY) {
      callbacksRef.current.onVerify(TURNSTILE_BYPASS_TOKEN);
    }
  }, []);

  // Don't render anything if site key is not configured
  if (!SITE_KEY) return null;

  useEffect(() => {
    let cancelled = false;

    const renderWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile) return;

      // Clean up previous widget
      if (widgetIdRef.current) {
        try { window.turnstile.remove(widgetIdRef.current); } catch {}
        widgetIdRef.current = null;
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        theme,
        size,
        callback: (token: string) => callbacksRef.current.onVerify(token),
        "expired-callback": () => callbacksRef.current.onExpire?.(),
        "error-callback": () => callbacksRef.current.onError?.(),
      });
    };

    // Lazy-load the Turnstile script then render
    loadTurnstileScript()
      .then(() => { if (!cancelled) renderWidget(); })
      .catch(() => { if (!cancelled) callbacksRef.current.onError?.(); });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch {}
      }
    };
  }, [theme, size]); // Only re-render when theme/size change

  return <div ref={containerRef} className={className} />;
}
