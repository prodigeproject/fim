import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Loader2 } from "lucide-react";

interface RequireSuperAdminProps {
  children: React.ReactNode;
}

export function RequireSuperAdmin({ children }: RequireSuperAdminProps) {
  const { isSuperAdmin, isLoading, user, role } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;
    
    // If user is logged in but not super admin, redirect to dashboard
    if (user && role && !isSuperAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isSuperAdmin, isLoading, user, role, navigate]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not super admin, don't render anything (will redirect)
  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
        <div className="bg-destructive/10 text-destructive rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold mb-2">Akses Ditolak</h2>
          <p className="text-sm">Anda tidak memiliki izin untuk mengakses halaman ini. Halaman ini hanya dapat diakses oleh Super Admin.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
