import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { ErrorCodes, getErrorSeverity } from "@/lib/errors";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

async function logErrorToServer(
  error: Error,
  errorInfo: ErrorInfo,
  context?: Record<string, unknown>
) {
  try {
    // Get current user if available
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from("error_logs").insert({
      error_code: ErrorCodes.SYSTEM_UNKNOWN,
      category: "system",
      message: error.message,
      stack_trace: error.stack,
      user_id: user?.id,
      context: {
        componentStack: errorInfo.componentStack,
        ...context,
      },
      severity: getErrorSeverity(ErrorCodes.SYSTEM_UNKNOWN),
      url: window.location.href,
      user_agent: navigator.userAgent,
    });
  } catch (logError) {
    console.error("Failed to log error to server:", logError);
  }
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error to server
    logErrorToServer(error, errorInfo, {
      route: window.location.pathname,
      timestamp: new Date().toISOString(),
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleReportBug = () => {
    const { error, errorInfo } = this.state;
    const subject = encodeURIComponent(`Bug Report: ${error?.message || "Unknown Error"}`);
    const body = encodeURIComponent(`
Deskripsi Bug:
[Jelaskan apa yang terjadi]

URL: ${window.location.href}
Waktu: ${new Date().toLocaleString("id-ID")}
Browser: ${navigator.userAgent}

Error Message: ${error?.message}

Stack Trace:
${error?.stack}

Component Stack:
${errorInfo?.componentStack}
    `);
    
    window.location.href = `mailto:support@forumindonesiamuda.org?subject=${subject}&body=${body}`;
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background p-4">
          <Card className="max-w-lg w-full shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Oops! Terjadi Kesalahan</CardTitle>
              <CardDescription>
                Maaf, terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu dan sedang menangani masalah ini.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="bg-muted rounded-lg p-4 text-xs font-mono overflow-auto max-h-40">
                  <p className="font-semibold text-destructive mb-2">
                    {this.state.error.message}
                  </p>
                  <pre className="text-muted-foreground whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Coba Lagi
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className="flex-1"
                  variant="outline"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Ke Beranda
                </Button>
              </div>

              <Button
                onClick={this.handleReportBug}
                variant="ghost"
                className="w-full text-muted-foreground"
              >
                <Bug className="h-4 w-4 mr-2" />
                Laporkan Masalah
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Error ID: {Date.now().toString(36).toUpperCase()}
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Hook version for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((err: Error) => {
    setError(err);
    logErrorToServer(err, { componentStack: "" } as ErrorInfo, {
      route: window.location.pathname,
    });
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  if (error) {
    throw error;
  }

  return { handleError, resetError };
}
