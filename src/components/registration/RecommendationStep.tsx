import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, FileText, X, Loader2 } from "lucide-react";

interface RecommendationStepProps {
  formData: {
    recommender_name: string;
    recommender_duration: string;
    recommender_position: string;
    recommender_email: string;
    recommender_phone: string;
    recommendation_file_url: string;
  };
  updateField: (field: string, value: string) => void;
  registrationId: string;
}

export function RecommendationStep({ formData, updateField, registrationId }: RecommendationStepProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format file tidak didukung. Gunakan PDF, JPG, atau PNG.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      // Use a safe filename without special characters
      const safeFileName = `recommendation-${Date.now()}.${fileExt}`;
      const filePath = `${registrationId}/${safeFileName}`;

      // Upload with upsert to handle overwrites
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("registration-photos")
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error("Upload error details:", uploadError);
        throw new Error(uploadError.message || "Upload failed");
      }

      // Get signed URL since bucket is not public
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("registration-photos")
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiry

      if (signedUrlError) {
        console.error("Signed URL error:", signedUrlError);
        // Fallback to path reference
        updateField("recommendation_file_url", filePath);
      } else {
        updateField("recommendation_file_url", signedUrlData.signedUrl);
      }
      
      toast.success("File berhasil diupload");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Gagal mengupload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    updateField("recommendation_file_url", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Mohon sertakan informasi tentang pemberi rekomendasi Anda. Pemberi rekomendasi sebaiknya 
            adalah orang yang mengenal Anda dengan baik dan dapat memberikan penilaian objektif 
            tentang potensi dan karakter Anda.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="recommender_name">Nama Pemberi Rekomendasi *</Label>
          <Input
            id="recommender_name"
            value={formData.recommender_name}
            onChange={(e) => updateField("recommender_name", e.target.value)}
            placeholder="Dr. Ahmad Syafii, M.Pd."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recommender_position">Posisi/Jabatan Pemberi Rekomendasi *</Label>
          <Input
            id="recommender_position"
            value={formData.recommender_position}
            onChange={(e) => updateField("recommender_position", e.target.value)}
            placeholder="Dosen Pembimbing / Kepala Divisi"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recommender_email">Email Pemberi Rekomendasi *</Label>
          <Input
            id="recommender_email"
            type="email"
            value={formData.recommender_email || ""}
            onChange={(e) => updateField("recommender_email", e.target.value)}
            placeholder="email@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recommender_phone">No. Telepon Pemberi Rekomendasi *</Label>
          <Input
            id="recommender_phone"
            type="tel"
            value={formData.recommender_phone || ""}
            onChange={(e) => updateField("recommender_phone", e.target.value)}
            placeholder="08123456789"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="recommender_duration">Lama Mengenal Pemberi Rekomendasi *</Label>
          <Select 
            value={formData.recommender_duration} 
            onValueChange={(v) => updateField("recommender_duration", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih lama mengenal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kurang_1_tahun">Kurang dari 1 tahun</SelectItem>
              <SelectItem value="1_2_tahun">1-2 tahun</SelectItem>
              <SelectItem value="2_3_tahun">2-3 tahun</SelectItem>
              <SelectItem value="3_5_tahun">3-5 tahun</SelectItem>
              <SelectItem value="lebih_5_tahun">Lebih dari 5 tahun</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Upload Surat Rekomendasi *</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Format yang diterima: PDF, JPG, PNG. Maksimal 5MB.
        </p>
        
        {formData.recommendation_file_url ? (
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/50">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Surat Rekomendasi</p>
              <a 
                href={formData.recommendation_file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Lihat file
              </a>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRemoveFile}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div 
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Mengupload...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Klik untuk upload file</p>
                <p className="text-xs text-muted-foreground">atau drag & drop</p>
              </div>
            )}
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}