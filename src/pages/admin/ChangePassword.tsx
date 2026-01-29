import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, KeyRound, CheckCircle } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

const passwordSchema = z.object({
  password: z.string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung huruf besar")
    .regex(/[a-z]/, "Password harus mengandung huruf kecil")
    .regex(/[0-9]/, "Password harus mengandung angka"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

// Enum for password change type
type PasswordChangeType = "first_login" | "self_change" | "reset_by_admin";

export default function ChangePassword() {
  const { updatePassword, signOut, profile, refreshProfile } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Determine the type of password change
  const getPasswordChangeType = (): PasswordChangeType => {
    // Check if this is from a reset by admin (passed via location state)
    if (location.state?.resetByAdmin) {
      return "reset_by_admin";
    }
    // Check if this is first login (must_change_password flag)
    if (profile?.must_change_password) {
      return "first_login";
    }
    // Otherwise it's a self-initiated change
    return "self_change";
  };

  const passwordChangeType = getPasswordChangeType();

  const getTitle = () => {
    switch (passwordChangeType) {
      case "first_login":
        return "Buat Password Baru";
      case "reset_by_admin":
        return "Reset Password";
      case "self_change":
        return "Ubah Password";
    }
  };

  const getDescription = () => {
    switch (passwordChangeType) {
      case "first_login":
        return "Ini adalah login pertama Anda. Silakan buat password baru untuk keamanan akun.";
      case "reset_by_admin":
        return "Password Anda telah direset oleh administrator. Silakan buat password baru.";
      case "self_change":
        return "Buat password baru yang kuat untuk akun Anda.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate input
    const result = passwordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await updatePassword(password);
      
      if (updateError) {
        setError(updateError.message);
        setIsLoading(false);
        return;
      }

      // Different behavior based on password change type
      if (passwordChangeType === "reset_by_admin") {
        // Reset by admin: logout and redirect to login
        setSuccess(true);
        toast.success("Password berhasil diubah");
        
        setTimeout(async () => {
          await signOut();
        }, 2000);
      } else {
        // First login or self change: stay logged in, show success
        await refreshProfile();
        setSuccess(true);
        toast.success("Password berhasil diubah");
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/admin/dashboard", { replace: true });
        }, 2000);
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  const requirements = [
    { text: "Minimal 8 karakter", valid: password.length >= 8 },
    { text: "Mengandung huruf besar", valid: /[A-Z]/.test(password) },
    { text: "Mengandung huruf kecil", valid: /[a-z]/.test(password) },
    { text: "Mengandung angka", valid: /[0-9]/.test(password) },
  ];

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Password Berhasil Diubah!</h2>
            {passwordChangeType === "reset_by_admin" ? (
              <>
                <p className="text-muted-foreground">
                  Anda akan diarahkan ke halaman login untuk masuk dengan password baru.
                </p>
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mt-4" />
                <p className="text-sm text-muted-foreground">Mengalihkan ke halaman login...</p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">
                  Password Anda telah berhasil diperbarui.
                </p>
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mt-4" />
                <p className="text-sm text-muted-foreground">Mengalihkan ke dashboard...</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password Baru</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
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

              {/* Password requirements */}
              <div className="mt-3 space-y-1">
                {requirements.map((req) => (
                  <div
                    key={req.text}
                    className={`flex items-center gap-2 text-xs ${
                      req.valid ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                    }`}
                  >
                    <CheckCircle className={`h-3 w-3 ${req.valid ? "opacity-100" : "opacity-30"}`} />
                    {req.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !requirements.every(r => r.valid)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Password"
              )}
            </Button>

            {/* Only show back link for self-change, not for first login or reset */}
            {passwordChangeType === "self_change" && (
              <div className="text-center mt-4">
                <Link 
                  to="/admin/profile" 
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Kembali ke Pengaturan Profil
                </Link>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
