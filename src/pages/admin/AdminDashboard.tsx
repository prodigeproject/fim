import { useEffect, useState, useMemo } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useRealtimeLoginNotifications } from "@/hooks/useRealtimeLoginNotifications";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Menu,
  Loader2,
  Monitor,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SEO } from "@/components/SEO";
import { NotificationDropdown } from "@/components/admin/NotificationDropdown";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminNavConfig } from "@/components/admin/adminNavConfig";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, role, isLoading, signOut, isSuperAdmin } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Resolve current page title from nav config
  const pageTitle = useMemo(() => {
    const path = location.pathname;
    for (const item of adminNavConfig) {
      if (item.href === path) return item.label;
      if (item.children) {
        for (const child of item.children) {
          if (child.href === path || path.startsWith(child.href + "/")) return child.label;
        }
      }
    }
    // Fallback for special pages
    if (path.includes("/profile")) return "Profil";
    if (path.includes("/change-password")) return "Ubah Password";
    if (path.includes("/article-editor")) return "Editor Artikel";
    return "";
  }, [location.pathname]);

  // Enable realtime login notifications for super admins
  useRealtimeLoginNotifications();
  
  // Enable push notifications for super admins
  usePushNotifications();

  // Check if user is admin (has admin role)
  const isAdmin = role === "super_admin" || (role as string) === "admin";


  // Single effect to handle all auth redirects with proper timing
  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return;

    // Mark that we've done the auth check
    setAuthChecked(true);

    // Not logged in at all - redirect to login
    if (!user) {
      navigate("/admin", { replace: true });
      return;
    }
  }, [user, isLoading, navigate]);

  // Separate effect for role check - only redirect if explicitly no role after sufficient time
  useEffect(() => {
    if (!authChecked || isLoading || !user) return;

    // Only redirect if we're sure there's no role (profile loaded but no role)
    // Don't redirect during initial load or if profile is still loading
    if (profile && !role) {
      const timer = setTimeout(() => {
        console.log("No admin role found for user with loaded profile, redirecting to login");
        navigate("/admin", { replace: true });
      }, 3000); // Wait 3 seconds for role to load

      return () => clearTimeout(timer);
    }
  }, [authChecked, user, role, profile, isLoading, navigate]);

  // Check if must change password
  useEffect(() => {
    if (profile?.must_change_password && location.pathname !== "/admin/change-password") {
      navigate("/admin/change-password", { replace: true });
    }
  }, [profile?.must_change_password, location.pathname, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin", { replace: true });
  };

  // Show loading while auth is being checked
  if (isLoading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Memuat...</p>
        </div>
      </div>
    );
  }

  // Show loading while role is being fetched
  if (user && !role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user || !role) {
    return null;
  }


  return (
    <>
      <SEO title="Admin Dashboard" description="Panel admin FIM" noIndex={true} />
      
      <div className="min-h-screen flex bg-muted">
        {/* Desktop Sidebar - Fixed height with internal scroll */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-card border-r h-screen sticky top-0">
          <AdminSidebar />
        </aside>

        {/* Mobile Header */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="lg:hidden flex items-center justify-between p-4 bg-card border-b sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <AdminSidebar onNavigate={() => setMobileOpen(false)} />
                </SheetContent>
              </Sheet>
              <h1 className="text-lg font-bold">FIM Admin</h1>
            </div>
            <NotificationDropdown />
          </header>

          {/* Desktop Header with Notification */}
          <header className="hidden lg:flex items-center justify-end p-4 border-b bg-card">
            <NotificationDropdown />
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-8 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
