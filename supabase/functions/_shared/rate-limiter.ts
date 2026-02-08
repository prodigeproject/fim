import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  "auth/login": { maxRequests: 5, windowSeconds: 60 },
  "auth/signup": { maxRequests: 3, windowSeconds: 60 },
  "auth/reset-password": { maxRequests: 3, windowSeconds: 300 },
  "newsletter/subscribe": { maxRequests: 5, windowSeconds: 3600 },
  "contact/submit": { maxRequests: 3, windowSeconds: 300 },
  "api/default": { maxRequests: 100, windowSeconds: 60 },
};

export async function checkRateLimit(
  supabaseUrl: string,
  serviceRoleKey: string,
  identifier: string,
  endpoint: string
): Promise<RateLimitResult> {
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const config = DEFAULT_LIMITS[endpoint] || DEFAULT_LIMITS["api/default"];

  try {
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_identifier: identifier,
      p_endpoint: endpoint,
      p_max_requests: config.maxRequests,
      p_window_seconds: config.windowSeconds,
    });

    if (error) {
      console.error("Rate limit check error:", error);
      // Allow request on error to prevent blocking legitimate users
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetAt: new Date(Date.now() + config.windowSeconds * 1000),
      };
    }

    const result = data?.[0];
    return {
      allowed: result?.allowed ?? true,
      remaining: result?.remaining ?? config.maxRequests,
      resetAt: result?.reset_at ? new Date(result.reset_at) : new Date(Date.now() + config.windowSeconds * 1000),
    };
  } catch (err) {
    console.error("Rate limit error:", err);
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: new Date(Date.now() + config.windowSeconds * 1000),
    };
  }
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.resetAt.toISOString(),
  };
}

export function rateLimitExceededResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded",
      message: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
      retryAfter: Math.ceil((result.resetAt.getTime() - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": Math.ceil((result.resetAt.getTime() - Date.now()) / 1000).toString(),
        ...getRateLimitHeaders(result),
      },
    }
  );
}
