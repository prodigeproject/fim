import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegistrationAuth } from "@/contexts/RegistrationAuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { 
  Loader2, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Send,
  CheckCircle,
  Plus,
  Trash2,
  Clock,
  Upload,
  FileText,
  X
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { WordCountTextarea } from "@/components/WordCountTextarea";
import { RecommendationStep } from "@/components/registration/RecommendationStep";
import { AutosaveIndicator } from "@/components/AutosaveIndicator";
import { RadialProgress } from "@/components/RadialProgress";
import logoFim from "@/assets/logo-fim.png";

interface OrganizationalExperience {
  organization: string;
  position: string;
  year: string;
  description: string;
}

interface Achievement {
  title: string;
  year: string;
  description: string;
}

interface TrainingFormData {
  // Biodata
  birth_date: string;
  birth_place: string;
  gender: string;
  address: string;
  city: string;
  province: string;
  education: string;
  institution: string;
  major: string;
  graduation_year: string;
  occupation: string;
  organization: string;
  nik: string;
  // Pengalaman
  organizational_experience: OrganizationalExperience[];
  // Prestasi
  achievements: Achievement[];
  // Motivasi
  motivation: string;
  how_did_you_know: string;
  why_join_fim: string;
  // Kepedulian Sosial
  social_issue_concern: string;
  social_contribution_experience: string;
  // Kontribusi Strategis
  strategic_contribution_plan: string;
  impact_expected: string;
  // Rekomendasi
  recommender_name: string;
  recommender_duration: string;
  recommender_position: string;
  recommender_email: string;
  recommender_phone: string;
  recommendation_file_url: string;
}

const STEPS = [
  { id: 1, title: "Biodata Diri", fields: ["birth_date", "birth_place", "gender", "nik", "address", "city", "province", "education", "institution", "major", "graduation_year", "occupation", "organization"] },
  { id: 2, title: "Pengalaman Organisasi", fields: ["organizational_experience"] },
  { id: 3, title: "5 Prestasi Terbaik", fields: ["achievements"] },
  { id: 4, title: "Motivasi", fields: ["motivation", "how_did_you_know", "why_join_fim"] },
  { id: 5, title: "Kepedulian Sosial", fields: ["social_issue_concern", "social_contribution_experience"] },
  { id: 6, title: "Kontribusi Strategis", fields: ["strategic_contribution_plan", "impact_expected"] },
  { id: 7, title: "Rekomendasi", fields: ["recommender_name", "recommender_duration", "recommender_position", "recommender_email", "recommender_phone", "recommendation_file_url"] },
];

const initialFormData: TrainingFormData = {
  birth_date: "",
  birth_place: "",
  gender: "",
  address: "",
  city: "",
  province: "",
  education: "",
  institution: "",
  major: "",
  graduation_year: "",
  occupation: "",
  organization: "",
  nik: "",
  organizational_experience: [{ organization: "", position: "", year: "", description: "" }],
  achievements: Array(5).fill({ title: "", year: "", description: "" }),
  motivation: "",
  how_did_you_know: "",
  why_join_fim: "",
  social_issue_concern: "",
  social_contribution_experience: "",
  strategic_contribution_plan: "",
  impact_expected: "",
  recommender_name: "",
  recommender_duration: "",
  recommender_position: "",
  recommender_email: "",
  recommender_phone: "",
  recommendation_file_url: "",
};

export default function TrainingRegistration() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, registration, isLoading: authLoading } = useRegistrationAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TrainingFormData>(initialFormData);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [trainingId, setTrainingId] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/portal/login", { replace: true });
    }
  }, [authLoading, user, navigate]);

  // Fetch existing training data
  const { data: existingData, isLoading: isLoadingData } = useQuery({
    queryKey: ["training-registration", registration?.id],
    queryFn: async () => {
      if (!registration?.id) return null;
      
      const { data, error } = await supabase
        .from("fim_training_registrations")
        .select("*")
        .eq("registration_id", registration.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return data;
    },
    enabled: !!registration?.id,
  });

  // Populate form with existing data
  useEffect(() => {
    if (existingData) {
      setTrainingId(existingData.id);
      setFormData({
        birth_date: existingData.birth_date || "",
        birth_place: existingData.birth_place || "",
        gender: existingData.gender || "",
        address: existingData.address || "",
        city: existingData.city || "",
        province: existingData.province || "",
        education: existingData.education || "",
        institution: existingData.institution || "",
        major: existingData.major || "",
        graduation_year: existingData.graduation_year || "",
        occupation: existingData.occupation || "",
        organization: existingData.organization || "",
        nik: (existingData as any).nik || "",
        organizational_experience: (existingData.organizational_experience as unknown as OrganizationalExperience[]) || initialFormData.organizational_experience,
        achievements: (existingData.achievements as unknown as Achievement[]) || initialFormData.achievements,
        motivation: existingData.motivation || "",
        how_did_you_know: existingData.how_did_you_know || "",
        why_join_fim: existingData.why_join_fim || "",
        social_issue_concern: existingData.social_issue_concern || "",
        social_contribution_experience: existingData.social_contribution_experience || "",
        strategic_contribution_plan: existingData.strategic_contribution_plan || "",
        impact_expected: existingData.impact_expected || "",
        recommender_name: (existingData as any).recommender_name || "",
        recommender_duration: (existingData as any).recommender_duration || "",
        recommender_position: (existingData as any).recommender_position || "",
        recommender_email: (existingData as any).recommender_email || "",
        recommender_phone: (existingData as any).recommender_phone || "",
        recommendation_file_url: (existingData as any).recommendation_file_url || "",
      });
      
      if (existingData.last_saved_at) {
        setLastSaved(new Date(existingData.last_saved_at));
      }

      // If already submitted, redirect to dashboard
      if (existingData.is_submitted) {
        navigate("/portal/dashboard", { replace: true });
      }
    }
  }, [existingData, navigate]);

  // Calculate completion percentage
  const calculateCompletion = useCallback(() => {
    let filled = 0;
    let total = 0;

    // Biodata fields
    const biodataFields = ["birth_date", "birth_place", "gender", "nik", "address", "city", "province", "education", "institution", "major", "graduation_year", "occupation"];
    biodataFields.forEach(field => {
      total++;
      if (formData[field as keyof TrainingFormData]) filled++;
    });

    // Organizational experience (at least 1)
    total++;
    if (formData.organizational_experience.some(exp => exp.organization && exp.position)) filled++;

    // Achievements (all 5)
    total += 5;
    formData.achievements.forEach(ach => {
      if (ach.title && ach.year) filled++;
    });

    // Motivasi
    total += 3;
    if (formData.motivation) filled++;
    if (formData.how_did_you_know) filled++;
    if (formData.why_join_fim) filled++;

    // Kepedulian sosial
    total += 2;
    if (formData.social_issue_concern) filled++;
    if (formData.social_contribution_experience) filled++;

    // Kontribusi strategis
    total += 2;
    if (formData.strategic_contribution_plan) filled++;
    if (formData.impact_expected) filled++;

    // Rekomendasi
    total += 4;
    if (formData.recommender_name) filled++;
    if (formData.recommender_duration) filled++;
    if (formData.recommender_position) filled++;
    if (formData.recommendation_file_url) filled++;

    return Math.round((filled / total) * 100);
  }, [formData]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { formData: TrainingFormData; isSubmit?: boolean }) => {
      const completion = calculateCompletion();
      
      const saveData = {
        registration_id: registration!.id,
        ...data.formData,
        organizational_experience: data.formData.organizational_experience as unknown as any,
        achievements: data.formData.achievements as unknown as any,
        completion_percentage: completion,
        last_saved_at: new Date().toISOString(),
        is_submitted: data.isSubmit || false,
        submitted_at: data.isSubmit ? new Date().toISOString() : null,
      };

      if (trainingId) {
        const { error } = await supabase
          .from("fim_training_registrations")
          .update(saveData as any)
          .eq("id", trainingId);
        if (error) throw error;
      } else {
        const { data: newData, error } = await supabase
          .from("fim_training_registrations")
          .insert(saveData as any)
          .select("id")
          .single();
        if (error) throw error;
        setTrainingId(newData.id);
      }

      // Update registration status
      if (data.isSubmit) {
        await supabase
          .from("fim_registrations")
          .update({ registration_status: "completed" })
          .eq("id", registration!.id);
      }

      return { isSubmit: data.isSubmit };
    },
    onSuccess: (result) => {
      setLastSaved(new Date());
      queryClient.invalidateQueries({ queryKey: ["training-registration"] });
      
      if (result.isSubmit) {
        toast.success("Pendaftaran berhasil dikirim!");
        navigate("/portal/dashboard");
      }
    },
    onError: (error) => {
      console.error("Save error:", error);
      toast.error("Gagal menyimpan data");
    },
  });

  // Auto-save every 10 seconds
  useEffect(() => {
    if (!registration?.id || !trainingId && !existingData) return;

    const timer = setInterval(() => {
      saveMutation.mutate({ formData });
    }, 10000);

    return () => clearInterval(timer);
  }, [formData, registration?.id, trainingId, existingData]);

  const updateField = (field: keyof TrainingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateExperience = (index: number, field: keyof OrganizationalExperience, value: string) => {
    const updated = [...formData.organizational_experience];
    updated[index] = { ...updated[index], [field]: value };
    updateField("organizational_experience", updated);
  };

  const addExperience = () => {
    if (formData.organizational_experience.length < 10) {
      updateField("organizational_experience", [
        ...formData.organizational_experience,
        { organization: "", position: "", year: "", description: "" }
      ]);
    }
  };

  const removeExperience = (index: number) => {
    if (formData.organizational_experience.length > 1) {
      const updated = formData.organizational_experience.filter((_, i) => i !== index);
      updateField("organizational_experience", updated);
    }
  };

  const updateAchievement = (index: number, field: keyof Achievement, value: string) => {
    const updated = [...formData.achievements];
    updated[index] = { ...updated[index], [field]: value };
    updateField("achievements", updated);
  };

  const handleSave = () => {
    saveMutation.mutate({ formData });
    toast.success("Data tersimpan");
  };

  // Find missing required fields and their step
  const getMissingFields = useCallback(() => {
    const missing: { field: string; label: string; step: number }[] = [];

    // Step 1: Biodata
    const biodataRequired: { key: keyof TrainingFormData; label: string }[] = [
      { key: "birth_date", label: "Tanggal Lahir" },
      { key: "birth_place", label: "Tempat Lahir" },
      { key: "gender", label: "Jenis Kelamin" },
      { key: "nik", label: "NIK" },
      { key: "address", label: "Alamat" },
      { key: "city", label: "Kota" },
      { key: "province", label: "Provinsi" },
      { key: "education", label: "Pendidikan" },
      { key: "institution", label: "Institusi" },
      { key: "major", label: "Jurusan" },
      { key: "graduation_year", label: "Tahun Lulus" },
      { key: "occupation", label: "Pekerjaan" },
    ];
    biodataRequired.forEach(({ key, label }) => {
      if (!formData[key]) missing.push({ field: key, label, step: 1 });
    });

    // Step 2: Organizational experience (at least 1 complete)
    const hasCompleteExperience = formData.organizational_experience.some(
      exp => exp.organization && exp.position && exp.year
    );
    if (!hasCompleteExperience) {
      missing.push({ field: "organizational_experience", label: "Pengalaman Organisasi (min. 1 lengkap)", step: 2 });
    }

    // Step 3: Achievements (all 5 must have title and year)
    formData.achievements.forEach((ach, idx) => {
      if (!ach.title || !ach.year) {
        missing.push({ field: `achievements_${idx}`, label: `Prestasi ke-${idx + 1}`, step: 3 });
      }
    });

    // Step 4: Motivasi
    if (!formData.motivation) missing.push({ field: "motivation", label: "Motivasi", step: 4 });
    if (!formData.how_did_you_know) missing.push({ field: "how_did_you_know", label: "Dari Mana Mengetahui FIM", step: 4 });
    if (!formData.why_join_fim) missing.push({ field: "why_join_fim", label: "Alasan Bergabung FIM", step: 4 });

    // Step 5: Kepedulian Sosial
    if (!formData.social_issue_concern) missing.push({ field: "social_issue_concern", label: "Isu Sosial yang Dipedulikan", step: 5 });
    if (!formData.social_contribution_experience) missing.push({ field: "social_contribution_experience", label: "Pengalaman Kontribusi Sosial", step: 5 });

    // Step 6: Kontribusi Strategis
    if (!formData.strategic_contribution_plan) missing.push({ field: "strategic_contribution_plan", label: "Rencana Kontribusi Strategis", step: 6 });
    if (!formData.impact_expected) missing.push({ field: "impact_expected", label: "Dampak yang Diharapkan", step: 6 });

    // Step 7: Rekomendasi
    if (!formData.recommender_name) missing.push({ field: "recommender_name", label: "Nama Pemberi Rekomendasi", step: 7 });
    if (!formData.recommender_duration) missing.push({ field: "recommender_duration", label: "Lama Mengenal", step: 7 });
    if (!formData.recommender_position) missing.push({ field: "recommender_position", label: "Jabatan Pemberi Rekomendasi", step: 7 });
    if (!formData.recommendation_file_url) missing.push({ field: "recommendation_file_url", label: "File Surat Rekomendasi", step: 7 });

    return missing;
  }, [formData]);

  const handleSubmit = () => {
    const missingFields = getMissingFields();
    
    if (missingFields.length > 0) {
      // Group missing fields by step
      const groupedByStep = missingFields.reduce((acc, field) => {
        if (!acc[field.step]) acc[field.step] = [];
        acc[field.step].push(field.label);
        return acc;
      }, {} as Record<number, string[]>);

      // Find first step with missing fields
      const firstIncompleteStep = Math.min(...Object.keys(groupedByStep).map(Number));
      const stepTitle = STEPS[firstIncompleteStep - 1].title;
      const fieldsInStep = groupedByStep[firstIncompleteStep];

      toast.error(
        `Formulir belum lengkap 100%. Silakan lengkapi bagian "${stepTitle}": ${fieldsInStep.slice(0, 3).join(", ")}${fieldsInStep.length > 3 ? `, dan ${fieldsInStep.length - 3} lainnya` : ""}`,
        {
          duration: 6000,
          action: {
            label: "Buka Halaman",
            onClick: () => setCurrentStep(firstIncompleteStep),
          },
        }
      );
      return;
    }
    
    setIsSubmitDialogOpen(true);
  };

  const confirmSubmit = () => {
    saveMutation.mutate({ formData, isSubmit: true });
    setIsSubmitDialogOpen(false);
  };

  if (authLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !registration) {
    return null;
  }

  const completionPercentage = calculateCompletion();

  return (
    <>
      <SEO 
        title="Formulir Pelatihan FIM" 
        description="Formulir pendaftaran pelatihan Forum Indonesia Muda"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        {/* Header */}
        <header className="bg-card border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <Link to="/portal/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Kembali</span>
              </Link>
              <img src={logoFim} alt="FIM Logo" className="h-8" />
              <div className="flex items-center gap-3">
                <AutosaveIndicator
                  status={saveMutation.isPending ? "saving" : saveMutation.isError ? "error" : lastSaved ? "saved" : "idle"}
                  lastSaved={lastSaved}
                />
                <Button variant="outline" size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Radial Progress + Step Info */}
            <div className="flex items-center gap-4">
              <RadialProgress value={completionPercentage} size={64} strokeWidth={5} showLabel={true} className="flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Step {currentStep} dari {STEPS.length}</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
            </div>

            {/* Step Indicators */}
            <div className="relative mt-4">
              <div className="flex justify-between overflow-x-auto pb-2 scrollbar-hide">
              {STEPS.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex flex-col items-center min-w-[80px] ${
                    currentStep === step.id ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step.id 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  }`}>
                    {step.id}
                  </div>
                  <span className="text-xs mt-1 text-center">{step.title}</span>
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
              <CardDescription>
                {currentStep === 1 && "Lengkapi data biodata diri Anda"}
                {currentStep === 2 && "Ceritakan pengalaman organisasi yang pernah Anda ikuti"}
                {currentStep === 3 && "Sebutkan 5 prestasi atau pencapaian terbaik Anda"}
                {currentStep === 4 && "Jelaskan motivasi Anda bergabung dengan FIM"}
                {currentStep === 5 && "Jelaskan kepedulian sosial Anda"}
                {currentStep === 6 && "Jelaskan rencana kontribusi Anda"}
                {currentStep === 7 && "Lengkapi informasi pemberi rekomendasi"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Biodata */}
              {currentStep === 1 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="birth_place">Tempat Lahir *</Label>
                    <Input
                      id="birth_place"
                      value={formData.birth_place}
                      onChange={(e) => updateField("birth_place", e.target.value)}
                      placeholder="Jakarta"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Tanggal Lahir *</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => updateField("birth_date", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Jenis Kelamin *</Label>
                    <Select value={formData.gender} onValueChange={(v) => updateField("gender", v)}>
                      <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Laki-laki</SelectItem>
                        <SelectItem value="female">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nik">NIK (Nomor Induk Kependudukan) *</Label>
                    <Input
                      id="nik"
                      value={formData.nik}
                      onChange={(e) => updateField("nik", e.target.value.replace(/\D/g, '').slice(0, 16))}
                      placeholder="16 digit NIK"
                      maxLength={16}
                    />
                    <p className="text-xs text-muted-foreground">NIK terdiri dari 16 digit angka</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="education">Pendidikan Terakhir *</Label>
                    <Select value={formData.education} onValueChange={(v) => updateField("education", v)}>
                      <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sma">SMA/SMK</SelectItem>
                        <SelectItem value="d3">D3</SelectItem>
                        <SelectItem value="s1">S1</SelectItem>
                        <SelectItem value="s2">S2</SelectItem>
                        <SelectItem value="s3">S3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Alamat Lengkap *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      placeholder="Alamat lengkap"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Kota *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="Jakarta"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Provinsi *</Label>
                    <Input
                      id="province"
                      value={formData.province}
                      onChange={(e) => updateField("province", e.target.value)}
                      placeholder="DKI Jakarta"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institution">Institusi/Kampus *</Label>
                    <Input
                      id="institution"
                      value={formData.institution}
                      onChange={(e) => updateField("institution", e.target.value)}
                      placeholder="Universitas Indonesia"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="major">Jurusan *</Label>
                    <Input
                      id="major"
                      value={formData.major}
                      onChange={(e) => updateField("major", e.target.value)}
                      placeholder="Teknik Informatika"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="graduation_year">Tahun Lulus *</Label>
                    <Input
                      id="graduation_year"
                      value={formData.graduation_year}
                      onChange={(e) => updateField("graduation_year", e.target.value)}
                      placeholder="2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Pekerjaan Saat Ini *</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => updateField("occupation", e.target.value)}
                      placeholder="Mahasiswa/Karyawan"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="organization">Organisasi Saat Ini (opsional)</Label>
                    <Input
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => updateField("organization", e.target.value)}
                      placeholder="Nama organisasi"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Pengalaman Organisasi */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  {formData.organizational_experience.map((exp, index) => (
                    <Card key={index} className="relative">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">Pengalaman {index + 1}</Badge>
                          {formData.organizational_experience.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeExperience(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Nama Organisasi *</Label>
                          <Input
                            value={exp.organization}
                            onChange={(e) => updateExperience(index, "organization", e.target.value)}
                            placeholder="BEM Fakultas"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Jabatan *</Label>
                          <Input
                            value={exp.position}
                            onChange={(e) => updateExperience(index, "position", e.target.value)}
                            placeholder="Ketua"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tahun</Label>
                          <Input
                            value={exp.year}
                            onChange={(e) => updateExperience(index, "year", e.target.value)}
                            placeholder="2023-2024"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Deskripsi Singkat</Label>
                          <Textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(index, "description", e.target.value)}
                            placeholder="Jelaskan peran dan pencapaian Anda"
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {formData.organizational_experience.length < 10 && (
                    <Button variant="outline" className="w-full" onClick={addExperience}>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Pengalaman
                    </Button>
                  )}
                </div>
              )}

              {/* Step 3: Prestasi */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  {formData.achievements.map((ach, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <Badge variant="secondary">Prestasi {index + 1}</Badge>
                      </CardHeader>
                      <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Judul Prestasi *</Label>
                          <Input
                            value={ach.title}
                            onChange={(e) => updateAchievement(index, "title", e.target.value)}
                            placeholder="Juara 1 Lomba Debat Nasional"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tahun *</Label>
                          <Input
                            value={ach.year}
                            onChange={(e) => updateAchievement(index, "year", e.target.value)}
                            placeholder="2023"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Deskripsi</Label>
                          <Textarea
                            value={ach.description}
                            onChange={(e) => updateAchievement(index, "description", e.target.value)}
                            placeholder="Jelaskan pencapaian Anda"
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Step 4: Motivasi */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="how_did_you_know">Dari mana Anda mengetahui FIM? *</Label>
                    <Textarea
                      id="how_did_you_know"
                      value={formData.how_did_you_know}
                      onChange={(e) => updateField("how_did_you_know", e.target.value)}
                      placeholder="Media sosial, teman, website, dll."
                      rows={2}
                    />
                  </div>
                  <WordCountTextarea
                    id="why_join_fim"
                    label="Mengapa Anda ingin bergabung dengan FIM?"
                    value={formData.why_join_fim}
                    onChange={(value) => updateField("why_join_fim", value)}
                    placeholder="Jelaskan alasan Anda"
                    minWords={50}
                    rows={4}
                    required
                  />
                  <WordCountTextarea
                    id="motivation"
                    label="Jelaskan motivasi Anda mengikuti pelatihan FIM"
                    value={formData.motivation}
                    onChange={(value) => updateField("motivation", value)}
                    placeholder="Jelaskan motivasi Anda secara detail..."
                    minWords={200}
                    rows={8}
                    required
                  />
                </div>
              )}

              {/* Step 5: Kepedulian Sosial */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <WordCountTextarea
                    id="social_issue_concern"
                    label="Isu sosial apa yang paling Anda pedulikan dan mengapa?"
                    value={formData.social_issue_concern}
                    onChange={(value) => updateField("social_issue_concern", value)}
                    placeholder="Jelaskan isu sosial yang Anda pedulikan..."
                    minWords={100}
                    rows={6}
                    required
                  />
                  <WordCountTextarea
                    id="social_contribution_experience"
                    label="Ceritakan pengalaman kontribusi sosial yang pernah Anda lakukan"
                    value={formData.social_contribution_experience}
                    onChange={(value) => updateField("social_contribution_experience", value)}
                    placeholder="Jelaskan pengalaman kontribusi sosial Anda..."
                    minWords={100}
                    rows={6}
                    required
                  />
                </div>
              )}

              {/* Step 6: Kontribusi Strategis */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <WordCountTextarea
                    id="strategic_contribution_plan"
                    label="Apa rencana kontribusi Anda untuk FIM dan masyarakat?"
                    value={formData.strategic_contribution_plan}
                    onChange={(value) => updateField("strategic_contribution_plan", value)}
                    placeholder="Jelaskan rencana kontribusi Anda..."
                    minWords={100}
                    rows={6}
                    required
                  />
                  <WordCountTextarea
                    id="impact_expected"
                    label="Dampak apa yang Anda harapkan dari kontribusi tersebut?"
                    value={formData.impact_expected}
                    onChange={(value) => updateField("impact_expected", value)}
                    placeholder="Jelaskan dampak yang diharapkan..."
                    minWords={100}
                    rows={6}
                    required
                  />
                </div>
              )}

              {/* Step 7: Rekomendasi */}
              {currentStep === 7 && (
                <RecommendationStep 
                  formData={formData}
                  updateField={updateField}
                  registrationId={registration?.id || ""}
                />
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Sebelumnya
            </Button>

            {currentStep < STEPS.length ? (
              <Button onClick={() => setCurrentStep(prev => Math.min(STEPS.length, prev + 1))}>
                Selanjutnya
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Kirim Pendaftaran
              </Button>
            )}
          </div>
        </main>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Pengiriman</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengirim pendaftaran? Setelah dikirim, data tidak dapat diubah lagi.
              <br /><br />
              Progress pengisian: <strong>{completionPercentage}%</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Ya, Kirim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}