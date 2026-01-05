import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";

export default function AdminNotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
      <div className="bg-muted rounded-full p-6 mb-6">
        <FileQuestion className="h-16 w-16 text-muted-foreground" />
      </div>
      
      <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
      <h2 className="text-xl font-semibold text-foreground mb-4">Halaman Tidak Ditemukan</h2>
      
      <p className="text-muted-foreground max-w-md mb-8">
        Halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
      </p>

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
  );
}
