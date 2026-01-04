import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldX, ArrowLeft, Home } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <>
      <SEO title="403 - Akses Ditolak" noIndex />
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
        <div className="bg-destructive/10 rounded-full p-6 mb-6">
          <ShieldX className="h-16 w-16 text-destructive" />
        </div>
        
        <h1 className="text-4xl font-bold text-foreground mb-2">403</h1>
        <h2 className="text-xl font-semibold text-foreground mb-4">Akses Ditolak</h2>
        
        <p className="text-muted-foreground max-w-md mb-8">
          Anda tidak memiliki izin untuk mengakses halaman ini. 
          Halaman ini hanya dapat diakses oleh <span className="font-semibold text-primary">Super Admin</span>.
        </p>

        <div className="bg-muted/50 rounded-lg p-4 mb-8 max-w-md">
          <p className="text-sm text-muted-foreground">
            Jika Anda merasa ini adalah kesalahan, silakan hubungi Super Admin untuk meminta akses yang diperlukan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <Button onClick={() => navigate("/admin/dashboard")}>
            <Home className="h-4 w-4 mr-2" />
            Ke Dashboard
          </Button>
        </div>
      </div>
    </>
  );
}
