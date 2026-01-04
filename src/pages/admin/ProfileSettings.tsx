import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, Save, User } from "lucide-react";
import { z } from "zod";

const usernameSchema = z.string()
  .min(3, "Username minimal 3 karakter")
  .max(30, "Username maksimal 30 karakter")
  .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore");

export default function ProfileSettings() {
  const { user, profile } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState(profile?.username || "");
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile?.avatar_url || null);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { username?: string; full_name?: string; avatar_url?: string }) => {
      if (!user) throw new Error("User not found");

      // Check username uniqueness if changed
      if (data.username && data.username !== profile?.username) {
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", data.username)
          .neq("id", user.id)
          .single();

        if (existingUser) {
          throw new Error("Username sudah digunakan");
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", user.id);

      if (error) throw error;

      // Log audit
      await supabase.rpc("log_audit_event", {
        p_user_id: user.id,
        p_action: "update_profile",
        p_resource_type: "profile",
        p_resource_id: user.id,
        p_details: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
      toast({ title: "Profil berhasil diperbarui" });
      // Refresh page to update context
      window.location.reload();
    },
    onError: (error) => {
      toast({ 
        title: "Gagal memperbarui profil", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ 
        title: "File tidak valid", 
        description: "Hanya file gambar yang diperbolehkan",
        variant: "destructive" 
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({ 
        title: "File terlalu besar", 
        description: "Ukuran maksimal 2MB",
        variant: "destructive" 
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("article-images")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("article-images")
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      await updateProfileMutation.mutateAsync({ avatar_url: publicUrl });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ 
        title: "Upload gagal", 
        description: "Terjadi kesalahan saat mengupload foto",
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate username
    const usernameResult = usernameSchema.safeParse(username);
    if (!usernameResult.success) {
      toast({ 
        title: "Username tidak valid", 
        description: usernameResult.error.errors[0].message,
        variant: "destructive" 
      });
      return;
    }

    updateProfileMutation.mutate({
      username: username.toLowerCase(),
      full_name: fullName || null,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan Profil</h1>
        <p className="text-muted-foreground">Kelola informasi profil Anda</p>
      </div>

      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Foto Profil</CardTitle>
          <CardDescription>Klik pada foto untuk mengubah</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <AvatarImage src={previewUrl || undefined} />
                <AvatarFallback className="text-2xl bg-primary/10">
                  {profile?.full_name?.[0] || profile?.username?.[0] || <User className="h-8 w-8" />}
                </AvatarFallback>
              </Avatar>
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
              <button
                type="button"
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg hover:bg-primary/90"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                JPG, PNG atau GIF. Maksimal 2MB.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Profil</CardTitle>
          <CardDescription>Perbarui informasi dasar profil Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
              />
              <p className="text-xs text-muted-foreground">
                Username dapat digunakan untuk login
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama lengkap Anda"
              />
            </div>

            <Button 
              type="submit" 
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
