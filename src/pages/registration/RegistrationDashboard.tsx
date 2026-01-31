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
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  MessageSquare
} from "lucide-react";
import { SEO } from "@/components/SEO";
import logoFim from "@/assets/logo-fim.png";

const SELECTION_STAGES = [
  { key: "administrasi", label: "Seleksi Administrasi", icon: FileText },
  { key: "wawancara", label: "Seleksi Wawancara", icon: MessageSquare },
  { key: "pengumuman", label: "Pengumuman", icon: CheckCircle2 },
];

export default function RegistrationDashboard() {
  const navigate = useNavigate();
  const { user, registration, isLoading, signOut, refreshRegistration } = useRegistrationAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/portal/login", { replace: true });
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
    navigate("/portal");
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

  const completionPercentage = trainingData?.completion_percentage || 0;
  const currentStage = registration.selection_stage || "administrasi";
  const currentStageIndex = SELECTION_STAGES.findIndex(s => s.key === currentStage);
  const finalResult = registration.final_result;
  const selectionPassed = registration.selection_passed;
  const noteVisible = registration.note_visible_to_applicant;
  const adminNote = registration.admin_selection_note;
  const interviewNote = registration.interview_note;
  
  // Calculate progress percentage based on stage and status
  const getStageProgress = () => {
    if (finalResult === "lolos") return 100;
    if (finalResult === "tidak_lolos") return currentStageIndex * 33.33;
    if (currentStage === "administrasi" && selectionPassed === true) return 30;
    if (currentStage === "administrasi") return 10;
    if (currentStage === "wawancara") return 50;
    if (currentStage === "pengumuman") return 85;
    return 0;
  };

  const getStatusInfo = () => {
    if (finalResult === "lolos") {
      return {
        label: "Diterima",
        color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        icon: CheckCircle2,
        description: "Selamat! Anda telah diterima sebagai peserta Forum Indonesia Muda"
      };
    }
    if (finalResult === "tidak_lolos") {
      return {
        label: "Tidak Lolos",
        color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        icon: XCircle,
        description: "Maaf, Anda belum lolos seleksi pada periode ini"
      };
    }
    if (currentStage === "pengumuman") {
      return {
        label: "Menunggu Pengumuman",
        color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        icon: Clock,
        description: "Hasil seleksi sedang dalam proses pengumuman"
      };
    }
    if (currentStage === "wawancara") {
      return {
        label: "Tahap Wawancara",
        color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
        icon: MessageSquare,
        description: registration.interview_date 
          ? `Jadwal wawancara: ${new Date(registration.interview_date).toLocaleDateString("id-ID", { dateStyle: "full" })}`
          : "Menunggu jadwal wawancara"
      };
    }
    if (currentStage === "administrasi" && selectionPassed === true) {
      return {
        label: "Lolos Administrasi",
        color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
        icon: CheckCircle2,
        description: "Selamat! Anda lolos tahap administrasi. Menunggu jadwal wawancara."
      };
    }
    return {
      label: "Seleksi Administrasi",
      color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      icon: FileText,
      description: trainingData?.is_submitted 
        ? "Data Anda sedang dalam proses review" 
        : "Silakan lengkapi data pelatihan untuk melanjutkan"
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

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
                onClick={() => navigate("/portal/profile")}
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
                    {statusInfo.description}
                  </CardDescription>
                </div>
                <Badge className={`gap-1 ${statusInfo.color}`}>
                  <StatusIcon className="h-3 w-3" />
                  {statusInfo.label}
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
                    <span>{registration.phone_country_code || "+62"}{registration.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selection Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Status Seleksi
              </CardTitle>
              <CardDescription>
                Pantau perkembangan proses seleksi Anda secara real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress Seleksi</span>
                  <span className="font-medium">{Math.round(getStageProgress())}%</span>
                </div>
                <Progress 
                  value={getStageProgress()} 
                  className="h-3"
                />
              </div>

              {/* Stage Steps */}
              <div className="relative">
                <div className="flex justify-between">
                  {SELECTION_STAGES.map((stage, index) => {
                    const isPassed = index < currentStageIndex || (index === currentStageIndex && finalResult === "lolos");
                    const isCurrent = index === currentStageIndex && !finalResult;
                    const isFailed = index === currentStageIndex && finalResult === "tidak_lolos";
                    const StageIcon = stage.icon;
                    
                    return (
                      <div key={stage.key} className="flex flex-col items-center text-center flex-1">
                        <div 
                          className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                            isPassed 
                              ? "bg-green-500 border-green-500 text-white" 
                              : isFailed
                              ? "bg-red-500 border-red-500 text-white"
                              : isCurrent
                              ? "bg-primary border-primary text-primary-foreground animate-pulse"
                              : "bg-muted border-muted-foreground/30 text-muted-foreground"
                          }`}
                        >
                          {isPassed ? (
                            <CheckCircle className="h-6 w-6" />
                          ) : isFailed ? (
                            <XCircle className="h-6 w-6" />
                          ) : (
                            <StageIcon className="h-6 w-6" />
                          )}
                        </div>
                        <p className={`mt-2 text-xs font-medium ${
                          isPassed || isCurrent ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {stage.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
                
                {/* Progress Line */}
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-muted -z-10">
                  <div 
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (currentStageIndex / (SELECTION_STAGES.length - 1)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Interview Date if available */}
              {registration.interview_date && currentStage === "wawancara" && !finalResult && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center gap-4">
                  <Calendar className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Jadwal Wawancara</p>
                    <p className="text-lg font-bold text-primary">
                      {new Date(registration.interview_date).toLocaleDateString("id-ID", { 
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Reviewer Notes - if visible to applicant */}
              {noteVisible && (adminNote || interviewNote) && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-700 dark:text-blue-300">Catatan dari Tim Seleksi</span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {currentStage === "wawancara" || finalResult ? interviewNote : adminNote}
                  </p>
                </div>
              )}

              {/* Final Result Message */}
              {finalResult && (
                <div className={`rounded-lg p-4 ${
                  finalResult === "lolos" 
                    ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800" 
                    : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
                }`}>
                  <div className="flex items-center gap-2">
                    {finalResult === "lolos" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-medium ${
                      finalResult === "lolos" ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                    }`}>
                      {finalResult === "lolos" 
                        ? "Selamat! Anda diterima sebagai peserta FIM" 
                        : "Maaf, Anda belum lolos pada periode ini"}
                    </span>
                  </div>
                  {finalResult === "lolos" && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      Tim FIM akan segera menghubungi Anda untuk informasi lebih lanjut.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Card - Only show if not submitted */}
          {!trainingData?.is_submitted && !finalResult && (
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

                <Button 
                  className="w-full" 
                  onClick={() => navigate("/portal/pelatihan")}
                >
                  {trainingData ? "Lanjutkan Pengisian" : "Mulai Isi Data"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                {trainingData?.last_saved_at && (
                  <p className="text-xs text-muted-foreground text-center">
                    Terakhir disimpan: {new Date(trainingData.last_saved_at).toLocaleString("id-ID")}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submitted Info */}
          {trainingData?.is_submitted && !finalResult && (
            <Card>
              <CardContent className="pt-6">
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Data telah dikirim</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Terima kasih! Data Anda sedang dalam proses review oleh tim FIM.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Penting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Status seleksi akan diperbarui secara otomatis.</p>
              <p>• Anda akan menerima notifikasi email setiap ada perubahan status.</p>
              <p>• Pastikan untuk memeriksa email Anda secara berkala.</p>
              <p>• Jika ada pertanyaan, silakan hubungi tim FIM melalui email.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}