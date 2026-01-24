import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegistrationAuth } from "@/contexts/RegistrationAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, ArrowRight, CheckCircle, AlertCircle, Eye, EyeOff, X, Check } from "lucide-react";
import { SEO } from "@/components/SEO";
import logoFim from "@/assets/logo-fim.png";
import PhoneInput from "@/components/PhoneInput";
import { ReCaptcha, useReCaptcha } from "@/components/ReCaptcha";

const RECAPTCHA_SITE_KEY = "6Lf9kFMsAAAAAKpNUXjDFZ1ngh03qOLUOIWG7ELj";

// Password strength checker
const checkPasswordStrength = (password: string) => {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
  
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const isValid = checks.minLength && checks.hasUppercase && checks.hasNumber && checks.hasSpecial;
  
  return { checks, passedChecks, isValid };
};

export default function RegistrationSignup() {
  const navigate = useNavigate();
  const { signUp, isLoading, user, registration } = useRegistrationAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    phoneCountryCode: "+62",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  
  // reCAPTCHA
  const { isVerified: isCaptchaVerified, handleVerify, handleExpire, handleError } = useReCaptcha();

  // Redirect if already logged in
  useEffect(() => {
    if (user && registration) {
      navigate("/daftar/dashboard", { replace: true });
    }
  }, [user, registration, navigate]);

  const passwordStrength = useMemo(() => checkPasswordStrength(formData.password), [formData.password]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === "email") {
      setEmailError("");
    }
  };

  // Check if email already exists (debounced)
  useEffect(() => {
    const checkEmail = async () => {
      if (!formData.email || !formData.email.includes("@")) {
        setEmailError("");
        return;
      }
      
      setIsCheckingEmail(true);
      try {
        const { data, error } = await supabase
          .from("fim_registrations")
          .select("id")
          .eq("email", formData.email.toLowerCase().trim())
          .maybeSingle();
        
        if (data) {
          setEmailError("Email ini sudah terdaftar. Silakan gunakan email lain atau login.");
        } else {
          // Also check blocked users
          const { data: blocked } = await supabase
            .from("blocked_users")
            .select("id")
            .eq("email", formData.email.toLowerCase().trim())
            .maybeSingle();
          
          if (blocked) {
            setEmailError("Email ini tidak dapat digunakan untuk pendaftaran.");
          } else {
            setEmailError("");
          }
        }
      } catch (error) {
        console.error("Email check error:", error);
      } finally {
        setIsCheckingEmail(false);
      }
    };

    const timer = setTimeout(checkEmail, 500);
    return () => clearTimeout(timer);
  }, [formData.email]);

  const handlePhoneChange = (phone: string, countryCode: string) => {
    setFormData(prev => ({ ...prev, phone, phoneCountryCode: countryCode }));
    // Validate phone - at least 6 digits
    const cleanedPhone = phone.replace(/\D/g, "");
    if (cleanedPhone.length > 0 && cleanedPhone.length < 6) {
      setPhoneError("Nomor telepon minimal 6 digit");
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.phone) {
      toast.error("Nama lengkap, email, nomor telepon, dan password wajib diisi");
      return;
    }

    // Validate phone number - at least 6 digits
    const cleanedPhone = formData.phone.replace(/\D/g, "");
    if (cleanedPhone.length < 6) {
      toast.error("Nomor telepon minimal 6 digit");
      setPhoneError("Nomor telepon minimal 6 digit");
      return;
    }

    // Validate password strength
    if (!passwordStrength.isValid) {
      toast.error("Password harus memenuhi semua persyaratan keamanan");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Password dan konfirmasi password tidak cocok");
      return;
    }

    // Validate reCAPTCHA
    if (!isCaptchaVerified) {
      toast.error("Harap selesaikan verifikasi reCAPTCHA");
      return;
    }

    setIsSubmitting(true);
    
    // Format phone number with country code
    const phoneWithoutLeadingZero = cleanedPhone.startsWith("0") ? cleanedPhone.substring(1) : cleanedPhone;
    const formattedPhone = `${formData.phoneCountryCode}${phoneWithoutLeadingZero}`;
    
    const { error } = await signUp(
      formData.email, 
      formData.password, 
      formData.fullName, 
      formattedPhone
    );

    if (error) {
      toast.error("Pendaftaran gagal: " + error.message);
      setIsSubmitting(false);
    } else {
      // Redirect to success page with message, then user logs in manually
      navigate("/daftar/success");
    }
  };

  const PasswordRequirement = ({ met, label }: { met: boolean; label: string }) => (
    <div className={`flex items-center gap-1.5 text-xs ${met ? "text-green-600" : "text-muted-foreground"}`}>
      {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      <span>{label}</span>
    </div>
  );

  return (
    <>
      <SEO 
        title="Daftar Pendaftaran FIM" 
        description="Daftar akun untuk mengikuti program Forum Indonesia Muda"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/">
              <img src={logoFim} alt="FIM Logo" className="h-16 mx-auto mb-4" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              Pendaftaran Forum Indonesia Muda
            </h1>
            <p className="text-muted-foreground mt-2">
              Buat akun untuk memulai pendaftaran
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Buat Akun</CardTitle>
              <CardDescription>
                Isi data dasar untuk membuat akun pendaftaran
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nama Lengkap *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className={`pl-10 ${emailError ? "border-destructive" : ""}`}
                      disabled={isSubmitting}
                    />
                    {isCheckingEmail && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {emailError && (
                    <div className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      <span>{emailError}</span>
                    </div>
                  )}
                </div>

                <PhoneInput
                  value={formData.phone}
                  countryCode={formData.phoneCountryCode}
                  onChange={handlePhoneChange}
                  disabled={isSubmitting}
                  required
                  error={phoneError}
                />

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      className="pl-10 pr-10"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
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
                  <div className="mt-2 p-3 bg-muted/50 rounded-lg space-y-1">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Persyaratan Password:</p>
                    <PasswordRequirement met={passwordStrength.checks.minLength} label="Minimal 8 karakter" />
                    <PasswordRequirement met={passwordStrength.checks.hasUppercase} label="Mengandung huruf kapital (A-Z)" />
                    <PasswordRequirement met={passwordStrength.checks.hasLowercase} label="Mengandung huruf kecil (a-z)" />
                    <PasswordRequirement met={passwordStrength.checks.hasNumber} label="Mengandung angka (0-9)" />
                    <PasswordRequirement met={passwordStrength.checks.hasSpecial} label="Mengandung karakter khusus (!@#$%^&*)" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                      className="pl-10 pr-10"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {formData.password && formData.confirmPassword && (
                    <div className="flex items-center gap-1 text-xs">
                      {formData.password === formData.confirmPassword ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-green-500">Password cocok</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 text-destructive" />
                          <span className="text-destructive">Password tidak cocok</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                {/* reCAPTCHA */}
                <div className="w-full flex justify-center">
                  <ReCaptcha
                    siteKey={RECAPTCHA_SITE_KEY}
                    onVerify={handleVerify}
                    onExpire={handleExpire}
                    onError={handleError}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || !!phoneError || !!emailError || !passwordStrength.isValid || isCheckingEmail || !isCaptchaVerified}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  Daftar
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Sudah punya akun? </span>
                  <Link 
                    to="/daftar" 
                    className="text-primary hover:underline font-medium"
                  >
                    Masuk di sini
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>

          <div className="text-center mt-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
