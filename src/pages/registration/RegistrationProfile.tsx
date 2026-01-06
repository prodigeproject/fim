import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegistrationAuth } from "@/contexts/RegistrationAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  Loader2, 
  ArrowLeft, 
  User, 
  Lock, 
  Camera,
  CheckCircle,
  Phone,
  Save,
  AlertCircle
} from "lucide-react";
import { SEO } from "@/components/SEO";
import logoFim from "@/assets/logo-fim.png";

// Indonesian phone number validation
const validateIndonesianPhone = (phone: string): { valid: boolean; message: string } => {
  const cleanedPhone = phone.replace(/\D/g, "");
  
  if (cleanedPhone.startsWith("08")) {
    if (cleanedPhone.length >= 10 && cleanedPhone.length <= 13) {
      return { valid: true, message: "" };
    }
    return { valid: false, message: "Nomor telepon harus 10-13 digit" };
  }
  
  if (cleanedPhone.startsWith("628")) {
    if (cleanedPhone.length >= 11 && cleanedPhone.length <= 14) {
      return { valid: true, message: "" };
    }
    return { valid: false, message: "Nomor telepon harus 11-14 digit" };
  }
  
  if (cleanedPhone.startsWith("8")) {
    if (cleanedPhone.length >= 9 && cleanedPhone.length <= 12) {
      return { valid: true, message: "" };
    }
    return { valid: false, message: "Nomor telepon harus 9-12 digit" };
  }
  
  return { valid: false, message: "Nomor telepon harus dimulai dengan 08, 628, atau 8" };
};

const normalizePhoneNumber = (phone: string): string => {
  const cleanedPhone = phone.replace(/\D/g, "");
  
  if (cleanedPhone.startsWith("628")) {
    return "0" + cleanedPhone.substring(2);
  }
  
  if (cleanedPhone.startsWith("8")) {
    return "0" + cleanedPhone;
  }
  
  return cleanedPhone;
};

export default function RegistrationProfile() {
  const navigate = useNavigate();
  const { user, registration, isLoading, refreshRegistration } = useRegistrationAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    fullName: "",
    phone: "",
  });
  const [phoneError, setPhoneError] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/daftar", { replace: true });
    }
  }, [isLoading, user, navigate]);

  // Load profile data
  useEffect(() => {
    if (registration) {
      setProfileData({
        fullName: registration.full_name || "",
        phone: registration.phone || "",
      });
      // Fetch photo URL from registration
      fetchPhotoUrl();
    }
  }, [registration]);

  const fetchPhotoUrl = async () => {
    if (!registration?.id) return;
    
    const { data } = await supabase
      .from("fim_registrations")
      .select("photo_url")
      .eq("id", registration.id)
      .single();
    
    if (data?.photo_url) {
      setPhotoUrl(data.photo_url);
    }
  };

  const handlePhoneChange = (value: string) => {
    setProfileData(prev => ({ ...prev, phone: value }));
    if (value) {
      const validation = validateIndonesianPhone(value);
      setPhoneError(validation.valid ? "" : validation.message);
    } else {
      setPhoneError("Nomor telepon wajib diisi");
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileData.fullName) {
      toast.error("Nama lengkap wajib diisi");
      return;
    }

    if (!profileData.phone) {
      toast.error("Nomor telepon wajib diisi");
      return;
    }

    // Validate phone
    const phoneValidation = validateIndonesianPhone(profileData.phone);
    if (!phoneValidation.valid) {
      toast.error(phoneValidation.message);
      setPhoneError(phoneValidation.message);
      return;
    }

    setIsUpdatingProfile(true);

    try {
      const normalizedPhone = normalizePhoneNumber(profileData.phone);
      
      const { error } = await supabase
        .from("fim_registrations")
        .update({
          full_name: profileData.fullName,
          phone: normalizedPhone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", registration?.id);

      if (error) throw error;

      await refreshRegistration();
      toast.success("Profil berhasil diperbarui");
    } catch (error: any) {
      toast.error("Gagal memperbarui profil: " + error.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Semua field password harus diisi");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Password baru dan konfirmasi tidak cocok");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      // Verify current password by re-signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: registration?.email || "",
        password: passwordData.currentPassword,
      });

      if (signInError) {
        toast.error("Password saat ini salah");
        setIsUpdatingPassword(false);
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast.success("Password berhasil diubah");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error("Gagal mengubah password: " + error.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !registration) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/photo.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("registration-photos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("registration-photos")
        .getPublicUrl(fileName);

      const newPhotoUrl = urlData.publicUrl;

      // Update registration record
      const { error: updateError } = await supabase
        .from("fim_registrations")
        .update({ photo_url: newPhotoUrl })
        .eq("id", registration.id);

      if (updateError) throw updateError;

      setPhotoUrl(newPhotoUrl + "?t=" + Date.now()); // Add timestamp to bust cache
      toast.success("Foto berhasil diupload");
    } catch (error: any) {
      toast.error("Gagal upload foto: " + error.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !registration) {
    return null;
  }

  return (
    <>
      <SEO
        title="Pengaturan Profil - Pendaftaran FIM"
        description="Kelola profil akun pendaftaran Forum Indonesia Muda"
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        {/* Header */}
        <header className="bg-card border-b">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/daftar/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Link to="/">
                <img src={logoFim} alt="FIM Logo" className="h-8" />
              </Link>
              <h1 className="font-semibold">Pengaturan Profil</h1>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {/* Photo Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Foto Profil
              </CardTitle>
              <CardDescription>
                Upload foto untuk keperluan pendaftaran
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={photoUrl || undefined} alt={registration.full_name} />
                <AvatarFallback className="text-3xl">
                  {registration.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
              >
                {isUploadingPhoto ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4 mr-2" />
                )}
                {photoUrl ? "Ganti Foto" : "Upload Foto"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Format: JPG, PNG. Maksimal 2MB.
              </p>
            </CardContent>
          </Card>

          {/* Profile & Password Tabs */}
          <Card>
            <Tabs defaultValue="profile">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile" className="gap-2">
                    <User className="h-4 w-4" />
                    Profil
                  </TabsTrigger>
                  <TabsTrigger value="password" className="gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <TabsContent value="profile">
                <form onSubmit={handleProfileUpdate}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nama Lengkap *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          value={profileData.fullName}
                          onChange={(e) =>
                            setProfileData((prev) => ({ ...prev, fullName: e.target.value }))
                          }
                          className="pl-10"
                          disabled={isUpdatingProfile}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="08xxxxxxxxxx"
                          value={profileData.phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          className={`pl-10 ${phoneError ? "border-destructive" : ""}`}
                          disabled={isUpdatingProfile}
                        />
                      </div>
                      {phoneError ? (
                        <div className="flex items-center gap-1 text-xs text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          <span>{phoneError}</span>
                        </div>
                      ) : profileData.phone ? (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          <span>Format nomor valid</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={registration.email} disabled className="bg-muted" />
                      <p className="text-xs text-muted-foreground">
                        Email tidak dapat diubah
                      </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={isUpdatingProfile || !!phoneError}>
                      {isUpdatingProfile ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Simpan Perubahan
                    </Button>
                  </CardContent>
                </form>
              </TabsContent>

              <TabsContent value="password">
                <form onSubmit={handlePasswordUpdate}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Password Saat Ini</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="currentPassword"
                          type="password"
                          placeholder="••••••••"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          className="pl-10"
                          disabled={isUpdatingPassword}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Password Baru</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="••••••••"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          className="pl-10"
                          disabled={isUpdatingPassword}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Minimal 6 karakter</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          className="pl-10"
                          disabled={isUpdatingPassword}
                        />
                      </div>
                      {passwordData.newPassword && passwordData.confirmPassword && (
                        <div className="flex items-center gap-1 text-xs">
                          {passwordData.newPassword === passwordData.confirmPassword ? (
                            <>
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-green-500">Password cocok</span>
                            </>
                          ) : (
                            <span className="text-destructive">Password tidak cocok</span>
                          )}
                        </div>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isUpdatingPassword}>
                      {isUpdatingPassword ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Lock className="h-4 w-4 mr-2" />
                      )}
                      Ubah Password
                    </Button>
                  </CardContent>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </main>
      </div>
    </>
  );
}
