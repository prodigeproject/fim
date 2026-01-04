import { useEffect, useState } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useRealtimeLoginNotifications } from "@/hooks/useRealtimeLoginNotifications";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  Menu,
  ChevronRight,
  ChevronDown,
  Loader2,
  KeyRound,
  BarChart3,
  Mail,
  MapPin,
  UsersRound,
  Monitor,
  Settings,
  BookOpen,
  ClipboardList,
  UserCircle,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SEO } from "@/components/SEO";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  superAdminOnly?: boolean;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/fim-admin-portal-2024/dashboard", icon: LayoutDashboard },
  { name: "Artikel", href: "/fim-admin-portal-2024/articles", icon: FileText },
  { name: "Persetujuan", href: "/fim-admin-portal-2024/approvals", icon: ClipboardList, superAdminOnly: true },
  { name: "Analytics", href: "/fim-admin-portal-2024/analytics", icon: BarChart3 },
  { 
    name: "Newsletter", 
    href: "/fim-admin-portal-2024/newsletter", 
    icon: Mail,
    superAdminOnly: true,
    children: [
      { name: "Subscribers", href: "/fim-admin-portal-2024/newsletter", icon: Mail, superAdminOnly: true },
      { name: "Email Settings", href: "/fim-admin-portal-2024/email-settings", icon: Settings, superAdminOnly: true },
    ]
  },
  { name: "FIM Club", href: "/fim-admin-portal-2024/clubs", icon: UsersRound, superAdminOnly: true },
  { name: "Regional", href: "/fim-admin-portal-2024/regionals", icon: MapPin, superAdminOnly: true },
  { name: "Pengguna", href: "/fim-admin-portal-2024/users", icon: Users, superAdminOnly: true },
  { name: "Admin Online", href: "/fim-admin-portal-2024/online", icon: Monitor, superAdminOnly: true },
  { name: "Sesi Aktif", href: "/fim-admin-portal-2024/sessions", icon: Monitor, superAdminOnly: true },
  { 
    name: "Logs", 
    href: "/fim-admin-portal-2024/audit-logs", 
    icon: ClipboardList,
    superAdminOnly: true,
    children: [
      { name: "Audit Log", href: "/fim-admin-portal-2024/audit-logs", icon: ClipboardList, superAdminOnly: true },
      { name: "PRD & Docs", href: "/fim-admin-portal-2024/prd", icon: BookOpen, superAdminOnly: true },
    ]
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, role, isLoading, signOut, isSuperAdmin } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  // Enable realtime login notifications for super admins
  useRealtimeLoginNotifications();
  
  // Enable push notifications for super admins
  usePushNotifications();

  // Auto-expand parent menu if child is active
  useEffect(() => {
    navItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => 
          location.pathname === child.href || location.pathname.startsWith(child.href + "/")
        );
        if (hasActiveChild && !openMenus.includes(item.name)) {
          setOpenMenus(prev => [...prev, item.name]);
        }
      }
    });
  }, [location.pathname]);

  // Single effect to handle all auth redirects with proper timing
  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return;

    // Mark that we've done the auth check
    setAuthChecked(true);

    // Not logged in at all - redirect to login
    if (!user) {
      navigate("/fim-admin-portal-2024", { replace: true });
      return;
    }
  }, [user, isLoading, navigate]);

  // Separate effect for role check with delay to allow async role fetch
  useEffect(() => {
    if (!authChecked || isLoading || !user) return;

    // Give role time to load - only redirect after a short delay if still no role
    const timer = setTimeout(() => {
      if (!role) {
        console.log("No admin role found for user, redirecting to login");
        navigate("/fim-admin-portal-2024", { replace: true });
      }
    }, 2000); // Wait 2 seconds for role to load

    return () => clearTimeout(timer);
  }, [authChecked, user, role, isLoading, navigate]);

  // Check if must change password
  useEffect(() => {
    if (profile?.must_change_password && location.pathname !== "/fim-admin-portal-2024/change-password") {
      navigate("/fim-admin-portal-2024/change-password", { replace: true });
    }
  }, [profile?.must_change_password, location.pathname, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/fim-admin-portal-2024", { replace: true });
  };

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => 
      prev.includes(name) 
        ? prev.filter(n => n !== name)
        : [...prev, name]
    );
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

  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items
      .filter(item => !item.superAdminOnly || isSuperAdmin)
      .map(item => ({
        ...item,
        children: item.children ? filterNavItems(item.children) : undefined,
      }))
      .filter(item => !item.children || item.children.length > 0);
  };

  const filteredNavItems = filterNavItems(navItems);

  const NavItemComponent = ({ item, depth = 0 }: { item: NavItem; depth?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus.includes(item.name);
    const isActive = location.pathname === item.href || 
      (!hasChildren && item.href !== "/fim-admin-portal-2024/dashboard" && location.pathname.startsWith(item.href));
    const hasActiveChild = hasChildren && item.children!.some(child => 
      location.pathname === child.href || location.pathname.startsWith(child.href + "/")
    );

    if (hasChildren) {
      return (
        <Collapsible open={isOpen} onOpenChange={() => toggleMenu(item.name)}>
          <CollapsibleTrigger asChild>
            <button
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                hasActiveChild
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
              {isOpen ? (
                <ChevronDown className="h-4 w-4 ml-auto" />
              ) : (
                <ChevronRight className="h-4 w-4 ml-auto" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 mt-1 space-y-1">
            {item.children!.map((child) => (
              <NavItemComponent key={child.href} item={child} depth={depth + 1} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Link
        to={item.href}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <item.icon className="h-4 w-4" />
        {item.name}
        {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
      </Link>
    );
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-foreground">FIM Admin</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {role === "super_admin" ? "Super Admin" : "Moderator"}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <NavItemComponent key={item.href} item={item} />
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-primary">
              {profile?.full_name?.[0] || profile?.username?.[0] || "A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {profile?.full_name || profile?.username}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.email}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => {
              setMobileOpen(false);
              navigate("/fim-admin-portal-2024/profile");
            }}
          >
            <UserCircle className="h-4 w-4" />
            Pengaturan Profil
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => {
              setMobileOpen(false);
              navigate("/fim-admin-portal-2024/change-password");
            }}
          >
            <KeyRound className="h-4 w-4" />
            Ubah Password
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SEO title="Admin Dashboard" description="Panel admin FIM" noIndex={true} />
      
      <div className="min-h-screen flex bg-muted">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-card border-r">
          <Sidebar />
        </aside>

        {/* Mobile Header */}
        <div className="flex-1 flex flex-col">
          <header className="lg:hidden flex items-center gap-4 p-4 bg-card border-b">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <Sidebar />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-bold">FIM Admin</h1>
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
