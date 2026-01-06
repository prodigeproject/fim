import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegistrationAuth } from "@/contexts/RegistrationAuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Loader2, 
  LogOut, 
  FileText, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  User,
  Mail,
  Phone,
  AlertCircle
} from "lucide-react";
import { SEO } from "@/components/SEO";
import logoFim from "@/assets/logo-fim.png";

export default function RegistrationDashboard() {
  const navigate = useNavigate();
  const { user, registration, isLoading, signOut, refreshRegistration } = useRegistrationAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/daftar", { replace: true });
    }
  }, [isLoading, user, navigate]);

  // Fetch training registration data
  const { data: trainingData, isLoading: isLoadingTraining } = useQuery({
    queryKey: ["training-registration", registration?.id],
    queryFn: async () => {
      if (!registration?.id) return null;
      
      const { data, error } = await supabase
        .from("fim_training_registrations")
        .select("*")
        .eq("registration_id", registration.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching training data:", error);
        return null;
      }

      return data;
    },
    enabled: !!registration?.id,
  });

  const handleSignOut = async () => {
    await signOut();
    toast.success("Berhasil keluar");
    navigate("/daftar");
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

  const statusConfig = {
    pending: { 
      label: "Menunggu", 
      variant: "secondary" as const,
      icon: Clock,
      description: "Silakan lengkapi data pelatihan untuk melanjutkan"
    },
    incomplete: { 
      label: "Belum Lengkap", 
      variant: "outline" as const,
      icon: AlertCircle,
      description: "Data pelatihan belum lengkap"
    },
    completed: { 
      label: "Selesai", 
      variant: "default" as const,
      icon: CheckCircle,
      description: "Pendaftaran Anda telah selesai"
    },
  };

  const status = statusConfig[registration.registration_status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  const completionPercentage = trainingData?.completion_percentage || 0;

  return (
    <>
      <SEO 
        title="Dashboard Pendaftaran FIM" 
        description="Dashboard pendaftaran Forum Indonesia Muda"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        {/* Header */}
        <header className="bg-card border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/">
              <img src={logoFim} alt="FIM Logo" className="h-10" />
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {registration.email}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/daftar/profile")}
              >
                <User className="h-4 w-4 mr-2" />
                Profil
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">
                    Selamat datang, {registration.full_name}!
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {status.description}
                  </CardDescription>
                </div>
                <Badge variant={status.variant} className="gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{registration.full_name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{registration.email}</span>
                </div>
                {registration.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{registration.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Data Pelatihan FIM
              </CardTitle>
              <CardDescription>
                Lengkapi semua data yang diperlukan untuk pendaftaran pelatihan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress Pengisian</span>
                  <span className="font-medium">{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>

              {trainingData?.is_submitted ? (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Data telah dikirim</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Terima kasih telah melengkapi pendaftaran. Tim kami akan menghubungi Anda.
                  </p>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={() => navigate("/daftar/pelatihan")}
                >
                  {trainingData ? "Lanjutkan Pengisian" : "Mulai Isi Data"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}

              {trainingData?.last_saved_at && !trainingData.is_submitted && (
                <p className="text-xs text-muted-foreground text-center">
                  Terakhir disimpan: {new Date(trainingData.last_saved_at).toLocaleString("id-ID")}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Penting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                • Data Anda akan tersimpan otomatis setiap beberapa saat saat mengisi formulir.
              </p>
              <p>
                • Pastikan semua data yang diisi sudah benar sebelum mengirim.
              </p>
              <p>
                • Setelah mengirim, data tidak dapat diubah kembali.
              </p>
              <p>
                • Jika ada pertanyaan, silakan hubungi tim FIM melalui email.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}