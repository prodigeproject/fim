import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { SEO } from "@/components/SEO";
import { z } from "zod";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const { signIn, user, role, isLoading: authLoading } = useAdminAuth();
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [redirecting, setRedirecting] = useState(false);

  // Redirect if already logged in with role
  useEffect(() => {
    if (!authLoading && user && role) {
      setRedirecting(true);
      // Small delay to prevent flash
      const timer = setTimeout(() => {
        navigate("/admin/dashboard", { replace: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, role, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate input
    const result = loginSchema.safeParse({ identifier, password });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    // Check if blocked
    if (attempts >= 5) {
      setError("Terlalu banyak percobaan login. Coba lagi dalam 15 menit.");
      return;
    }

    setIsLoading(true);

    try {
      // Sign in with email only
      const signInResult = await signIn(identifier.trim(), password);
      
      if (signInResult.error) {
        setAttempts(prev => prev + 1);
        
        // Handle blocked status
        if ((signInResult as any).blocked) {
          setError("Terlalu banyak percobaan login. Coba lagi dalam 15 menit.");
        } else if ((signInResult as any).remainingAttempts !== undefined) {
          setError(`Email atau password salah. Tersisa ${(signInResult as any).remainingAttempts} percobaan.`);
        } else {
          // Generic error message for security
          setError("Email atau password salah. Silakan coba lagi.");
        }
        setIsLoading(false);
      }
      // Don't set isLoading to false on success - let redirect happen
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  if (authLoading || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">
            {redirecting ? "Mengalihkan..." : "Memuat..."}
          </p>
        </div>
      </div>
    );
  }

  // Already logged in, show loading while redirect happens
  if (user && role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Admin Login" 
        description="Login ke panel admin FIM"
        noIndex={true}
      />
      
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
            <CardDescription>
              Masuk ke panel administrasi FIM
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {attempts >= 3 && attempts < 5 && (
                <Alert>
                  <AlertDescription>
                    Tersisa {5 - attempts} percobaan login
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="identifier">Email</Label>
                <Input
                  id="identifier"
                  type="email"
                  placeholder="email@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading || attempts >= 5}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || attempts >= 5}
                    autoComplete="current-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || attempts >= 5}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Masuk...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>

              <a
                href="/admin/forgot-password"
                className="block text-center text-sm text-muted-foreground hover:text-primary mt-4"
              >
                Lupa password?
              </a>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Halaman ini hanya untuk administrator FIM. 
              <br />
              Sesi akan berakhir otomatis setelah 30 menit tidak aktif.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
