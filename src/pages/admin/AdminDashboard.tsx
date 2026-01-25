import { useEffect, useState, useCallback } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useRealtimeLoginNotifications } from "@/hooks/useRealtimeLoginNotifications";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { usePendingArticlesCount } from "@/hooks/usePendingArticlesCount";
import { useNewRegistrationsCount } from "@/hooks/useNewRegistrationsCount";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  ShieldAlert,
  Video,
  Handshake,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SEO } from "@/components/SEO";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { NotificationDropdown } from "@/components/admin/NotificationDropdown";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  superAdminOnly?: boolean;
  adminOnly?: boolean; // New: accessible to admin but not moderator
  hideFromAdmin?: boolean; // New: hide from admin role (user management)
  children?: NavItem[];
  badgeKey?: string;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { 
    name: "Artikel", 
    href: "/admin/articles", 
    icon: FileText,
    children: [
      { name: "Manajemen Artikel", href: "/admin/articles", icon: FileText },
      { name: "Persetujuan", href: "/admin/approvals", icon: ClipboardList, badgeKey: "pendingArticles" },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ]
  },
  { 
    name: "Newsletter", 
    href: "/admin/newsletter", 
    icon: Mail,
    children: [
      { name: "Subscribers", href: "/admin/newsletter", icon: Mail },
      { name: "Email Settings", href: "/admin/email-settings", icon: Settings },
    ]
  },
  { name: "FIM Club", href: "/admin/clubs", icon: UsersRound },
  { name: "Regional", href: "/admin/regionals", icon: MapPin },
  { name: "Alumni", href: "/admin/alumni", icon: Users },
  { name: "Video Featured", href: "/admin/featured-videos", icon: Video },
  { name: "Mitra", href: "/admin/partners", icon: Handshake },
  { 
    name: "Registrasi FIM", 
    href: "/admin/registrations", 
    icon: ClipboardList, 
    badgeKey: "newRegistrations",
    children: [
      { name: "Data Pendaftar", href: "/admin/registrations", icon: ClipboardList, badgeKey: "newRegistrations" },
      { name: "Kalender Wawancara", href: "/admin/interview-calendar", icon: ClipboardList },
      { name: "Penugasan Rekruter", href: "/admin/recruiter-assignments", icon: Users },
      { name: "Pengaturan Batch", href: "/admin/registration-settings", icon: Settings },
      { name: "Statistik", href: "/admin/registration-stats", icon: BarChart3 },
    ]
  },
  { name: "Template Email", href: "/admin/email-templates", icon: Mail },
  { 
    name: "Pengguna", 
    href: "/admin/users", 
    icon: Users,
    superAdminOnly: true,
    children: [
      { name: "Manajemen User", href: "/admin/users", icon: Users, superAdminOnly: true },
      { name: "Manajemen Role", href: "/admin/roles", icon: ShieldAlert, superAdminOnly: true },
      { name: "Admin Online", href: "/admin/online", icon: Monitor },
      { name: "Login Monitoring", href: "/admin/login-monitoring", icon: ShieldAlert },
    ]
  },
  { 
    name: "Sesi Aktif", 
    href: "/admin/sessions", 
    icon: Monitor,
  },
  { 
    name: "Logs", 
    href: "/admin/audit-logs", 
    icon: ClipboardList,
    children: [
      { name: "Audit Log", href: "/admin/audit-logs", icon: ClipboardList },
      { name: "Security", href: "/admin/security-dashboard", icon: ShieldAlert },
      { name: "PRD & Docs", href: "/admin/prd", icon: BookOpen, superAdminOnly: true },
      { name: "Technical Docs", href: "/admin/documentation", icon: FileText, superAdminOnly: true },
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

  // Get pending articles count for badge
  const pendingArticlesCount = usePendingArticlesCount();
  const newRegistrationsCount = useNewRegistrationsCount();

  // Enable realtime login notifications for super admins
  useRealtimeLoginNotifications();
  
  // Enable push notifications for super admins
  usePushNotifications();

  // Check if user is admin (has admin role) - note: "admin" role needs DB migration to take effect
  const isAdmin = role === "super_admin" || (role as string) === "admin";

  // Auto-expand parent menu if child is active - only on mount
  useEffect(() => {
    const initialOpenMenus: string[] = [];
    navItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => 
          location.pathname === child.href || location.pathname.startsWith(child.href + "/")
        );
        if (hasActiveChild) {
          initialOpenMenus.push(item.name);
        }
      }
    });
    if (initialOpenMenus.length > 0) {
      setOpenMenus(prev => {
        const newMenus = initialOpenMenus.filter(m => !prev.includes(m));
        return newMenus.length > 0 ? [...prev, ...newMenus] : prev;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount, not on every pathname change

  // Single effect to handle all auth redirects with proper timing
  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) {
      console.debug("[AdminDashboard] waiting for isLoading...");
      return;
    }

    // Mark that we've done the auth check
    setAuthChecked(true);
    console.debug("[AdminDashboard] authChecked, user:", !!user, "role:", role);

    // Not logged in at all - redirect to login
    if (!user) {
      console.debug("[AdminDashboard] no user, redirecting to /admin");
      navigate("/admin", { replace: true });
      return;
    }

    // User exists but role is null → still fetching or not admin
    if (!role) {
      console.debug("[AdminDashboard] user exists but no role yet, waiting...");
      // Give profile & role fetch more time before redirecting.
      const timer = setTimeout(() => {
        console.warn("[AdminDashboard] no role after timeout, redirecting to /admin");
        navigate("/admin", { replace: true });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [user, role, isLoading, navigate]);

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

  // Show loading while role is being fetched (user exists but role is null)
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

  // Not authenticated or no role - let redirect effect handle it
  if (!user || !role) {
    return null;
  }

  const getRoleLabel = () => {
    if (role === "super_admin") return "Super Admin";
    if ((role as string) === "admin") return "Admin";
    return "Moderator";
  };

  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items
      .filter(item => {
        // superAdminOnly means only super_admin can see it
        if (item.superAdminOnly && !isSuperAdmin) return false;
        // hideFromAdmin means admin role cannot see it (only super_admin)
        if (item.hideFromAdmin && (role as string) === "admin") return false;
        // adminOnly means super_admin and admin can see, but not moderator
        if (item.adminOnly && role === "moderator") return false;
        return true;
      })
      .map(item => ({
        ...item,
        children: item.children ? filterNavItems(item.children) : undefined,
      }))
      .filter(item => !item.children || item.children.length > 0);
  };

  const filteredNavItems = filterNavItems(navItems);

  // Get badge count for nav items
  const getBadgeCount = (badgeKey?: string): number => {
    if (!badgeKey) return 0;
    if (badgeKey === "pendingArticles") return pendingArticlesCount;
    if (badgeKey === "newRegistrations") return newRegistrationsCount;
    return 0;
  };

  const NavItemComponent = ({ item, depth = 0 }: { item: NavItem; depth?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus.includes(item.name);
    const isActive = location.pathname === item.href || 
      (!hasChildren && item.href !== "/admin/dashboard" && location.pathname.startsWith(item.href));
    const hasActiveChild = hasChildren && item.children!.some(child => 
      location.pathname === child.href || location.pathname.startsWith(child.href + "/")
    );
    const badgeCount = getBadgeCount(item.badgeKey);

    if (hasChildren) {
      return (
        <Collapsible open={isOpen} onOpenChange={() => toggleMenu(item.name)}>
          <CollapsibleTrigger asChild>
            <button
              className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                hasActiveChild || isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4 shrink-0" />
                {item.name}
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 mt-0.5 space-y-0.5">
            {item.children!.map((child) => (
              <NavItemComponent key={child.href} item={child} depth={depth + 1} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

     return (
       <Tooltip>
         <TooltipTrigger asChild>
           <Link
             to={item.href}
             onClick={() => setMobileOpen(false)}
             className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
               isActive
                 ? "bg-primary text-primary-foreground"
                 : "text-muted-foreground hover:bg-muted hover:text-foreground"
             }`}
           >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.name}
            {badgeCount > 0 && (
              <Badge 
                variant="destructive" 
                className="ml-auto h-5 min-w-5 px-1.5 text-xs flex items-center justify-center"
              >
                {badgeCount > 99 ? "99+" : badgeCount}
              </Badge>
            )}
            {isActive && badgeCount === 0 && <ChevronRight className="h-4 w-4 ml-auto" />}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="lg:hidden">
          <p>{item.name}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  const Sidebar = () => (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b shrink-0">
          <h1 className="text-lg font-bold text-foreground">FIM Admin</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {getRoleLabel()}
          </p>
        </div>

        {/* Navigation - lovable.dev style scroll */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50">
          <nav className="p-2 space-y-0.5">
            {filteredNavItems.map((item) => (
              <NavItemComponent key={item.href} item={item} />
            ))}
          </nav>
        </div>

        <div className="p-3 border-t shrink-0">
          <div className="flex items-center gap-2 mb-3">
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

          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 h-8 text-xs"
              onClick={() => {
                setMobileOpen(false);
                navigate("/admin/profile");
              }}
            >
              <UserCircle className="h-3.5 w-3.5" />
              Profil
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 h-8 text-xs"
              onClick={() => {
                setMobileOpen(false);
                navigate("/admin/change-password");
              }}
            >
              <KeyRound className="h-3.5 w-3.5" />
              Ubah Password
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 h-8 text-xs text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-3.5 w-3.5" />
              Keluar
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );

  return (
    <>
      <SEO title="Admin Dashboard" description="Panel admin FIM" noIndex={true} />
      
      <div className="min-h-screen flex bg-muted">
        {/* Desktop Sidebar - Fixed height with internal scroll */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-card border-r h-screen sticky top-0">
          <Sidebar />
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
                  <Sidebar />
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
