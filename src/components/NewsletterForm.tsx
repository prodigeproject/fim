import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, CheckCircle } from "lucide-react";

interface NewsletterFormProps {
  variant?: "default" | "compact";
  className?: string;
}

export default function NewsletterForm({ variant = "default", className = "" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "Email tidak valid",
        description: "Masukkan alamat email yang benar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("newsletter-subscribe", {
        body: { email: email.trim(), name: name.trim() || undefined },
      });

      if (error) throw error;

      setIsSuccess(true);
      setEmail("");
      setName("");
      
      toast({
        title: "Berhasil! 🎉",
        description: data.message || "Anda berhasil berlangganan newsletter FIM",
      });

      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error: any) {
      console.error("Newsletter error:", error);
      toast({
        title: "Gagal berlangganan",
        description: error.message || "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl ${className}`}>
        <CheckCircle className="h-12 w-12 text-green-600" />
        <p className="text-green-700 dark:text-green-400 font-semibold text-center">
          Terima kasih telah berlangganan!
        </p>
        <p className="text-sm text-green-600 dark:text-green-500 text-center">
          Cek email Anda untuk konfirmasi
        </p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          placeholder="Email Anda"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          disabled={isLoading}
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="text"
          placeholder="Nama Anda (opsional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1"
          disabled={isLoading}
        />
        <Input
          type="email"
          placeholder="Email Anda *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          disabled={isLoading}
          required
        />
      </div>
      <Button 
        type="submit" 
        className="w-full sm:w-auto" 
        disabled={isLoading}
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Mendaftar...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4 mr-2" />
            Berlangganan Newsletter
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        Dengan berlangganan, Anda setuju menerima email dari Forum Indonesia Muda.
      </p>
    </form>
  );
}
