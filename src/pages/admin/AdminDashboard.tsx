import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useRealtimeLoginNotifications } from "@/hooks/useRealtimeLoginNotifications";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { usePendingArticlesCount } from "@/hooks/usePendingArticlesCount";
import { useNewRegistrationsCount } from "@/hooks/useNewRegistrationsCount";
import { useAllPermissions } from "@/hooks/usePermission";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  Menu,
  ChevronRight,
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
import { NotificationDropdown } from "@/components/admin/NotificationDropdown";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  badgeKey?: string;
  permissionKey?: string; // Dynamic permission key for fine-grained access control
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { 
    name: "Artikel", 
    href: "/admin/articles", 
    icon: FileText,
    permissionKey: "articles",
    children: [
      { name: "Manajemen Artikel", href: "/admin/articles", icon: FileText, permissionKey: "articles" },
      { name: "Persetujuan", href: "/admin/approvals", icon: ClipboardList, badgeKey: "pendingArticles", permissionKey: "article_approvals" },
      { name: "Kalender Jadwal", href: "/admin/article-calendar", icon: ClipboardList, permissionKey: "article_scheduling" },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3, permissionKey: "article_analytics" },
    ]
  },
  { 
    name: "Newsletter", 
    href: "/admin/newsletter", 
    icon: Mail,
    permissionKey: "newsletter",
    children: [
      { name: "Subscribers", href: "/admin/newsletter", icon: Mail, permissionKey: "newsletter" },
      { name: "Email Settings", href: "/admin/email-settings", icon: Settings, permissionKey: "email_settings" },
    ]
  },
  { 
    name: "Data Organisasi", 
    href: "/admin/clubs", 
    icon: UsersRound,
    children: [
      { name: "FIM Club", href: "/admin/clubs", icon: UsersRound, permissionKey: "clubs" },
      { name: "Regional", href: "/admin/regionals", icon: MapPin, permissionKey: "regionals" },
      { name: "Alumni", href: "/admin/alumni", icon: Users, permissionKey: "alumni" },
      { name: "Mitra", href: "/admin/partners", icon: Handshake, permissionKey: "partners" },
    ]
  },
  { name: "Video Featured", href: "/admin/featured-videos", icon: Video, permissionKey: "featured_videos" },
  { 
    name: "Registrasi FIM", 
    href: "/admin/registrations", 
    icon: ClipboardList, 
    badgeKey: "newRegistrations",
    permissionKey: "registrations",
    children: [
      { name: "Data Pendaftar", href: "/admin/registrations", icon: ClipboardList, badgeKey: "newRegistrations", permissionKey: "registrations" },
      { name: "Penugasan Rekruter", href: "/admin/recruiter-assignments", icon: Users, permissionKey: "recruiter_assignments" },
      { name: "Kalender Wawancara", href: "/admin/interview-calendar", icon: ClipboardList, permissionKey: "interview_calendar" },
      { name: "Pengaturan Batch", href: "/admin/registration-settings", icon: Settings, permissionKey: "registration_settings" },
      { name: "Statistik", href: "/admin/registration-stats", icon: BarChart3, permissionKey: "registration_stats" },
    ]
  },
  { name: "Template Email", href: "/admin/email-templates", icon: Mail, permissionKey: "email_templates" },
  { 
    name: "Pengguna", 
    href: "/admin/users", 
    icon: Users,
    permissionKey: "users",
    children: [
      { name: "Manajemen User", href: "/admin/users", icon: Users, permissionKey: "users" },
      { name: "Manajemen Role", href: "/admin/roles", icon: ShieldAlert, permissionKey: "roles" },
      { name: "Admin Online", href: "/admin/online", icon: Monitor, permissionKey: "online_admins" },
      { name: "Login Monitoring", href: "/admin/login-monitoring", icon: ShieldAlert, permissionKey: "login_monitoring" },
    ]
  },
  { 
    name: "Sesi Aktif", 
    href: "/admin/sessions", 
    icon: Monitor,
    permissionKey: "sessions",
  },
  { 
    name: "Logs", 
    href: "/admin/audit-logs", 
    icon: ClipboardList,
    permissionKey: "audit_logs",
    children: [
      { name: "Audit Log", href: "/admin/audit-logs", icon: ClipboardList, permissionKey: "audit_logs" },
      { name: "Security", href: "/admin/security-dashboard", icon: ShieldAlert, permissionKey: "security" },
      { name: "PRD & Docs", href: "/admin/prd", icon: BookOpen, permissionKey: "prd_docs" },
      { name: "Technical Docs", href: "/admin/documentation", icon: FileText, permissionKey: "technical_docs" },
    ]
  },
  {
    name: "Tools",
    href: "/admin/tools",
    icon: Settings,
    permissionKey: "tools_settings",
    children: [
      { name: "SEO & reCAPTCHA", href: "/admin/tools", icon: Settings, permissionKey: "tools_settings" },
    ]
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, role, isLoading, signOut, isSuperAdmin } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Use localStorage for persistent menu state across sessions
  const [openMenus, setOpenMenus] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("admin-open-menus");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  // Ref for sidebar scroll container
  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  
  // Track if we've done initial scroll restoration
  const hasRestoredScroll = useRef(false);

  // Get pending articles count for badge
  const pendingArticlesCount = usePendingArticlesCount();
  const newRegistrationsCount = useNewRegistrationsCount();
  
  // Get dynamic permissions for menu visibility
  const { hasPermission, isLoading: isPermissionLoading } = useAllPermissions();

  // Enable realtime login notifications for super admins
  useRealtimeLoginNotifications();
  
  // Enable push notifications for super admins
  usePushNotifications();

  // Check if user is admin (has admin role)
  const isAdmin = role === "super_admin" || (role as string) === "admin";

  // Persist open menus to localStorage
  useEffect(() => {
    localStorage.setItem("admin-open-menus", JSON.stringify(openMenus));
  }, [openMenus]);

  // Auto-expand parent menu if child is active - only on mount
  useEffect(() => {
    const currentPath = location.pathname;
    navItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => 
          currentPath === child.href || currentPath.startsWith(child.href + "/")
        );
        if (hasActiveChild && !openMenus.includes(item.name)) {
          setOpenMenus(prev => [...prev, item.name]);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Restore scroll position from sessionStorage after component mounts
  useEffect(() => {
    if (hasRestoredScroll.current) return;
    
    const scrollContainer = sidebarScrollRef.current;
    if (!scrollContainer) return;
    
    const savedPosition = sessionStorage.getItem("admin-sidebar-scroll");
    if (savedPosition) {
      const position = parseInt(savedPosition, 10);
      // Use requestAnimationFrame for smoother restoration
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (scrollContainer) {
            scrollContainer.scrollTop = position;
          }
        });
      });
    }
    hasRestoredScroll.current = true;
  }, []);

  // Save scroll position periodically using passive scroll listener
  useEffect(() => {
    const scrollContainer = sidebarScrollRef.current;
    if (!scrollContainer) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          sessionStorage.setItem("admin-sidebar-scroll", String(scrollContainer.scrollTop));
          ticking = false;
        });
        ticking = true;
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

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

  const toggleMenu = useCallback((name: string, e?: React.MouseEvent) => {
    // Prevent default to stop any scroll interference
    e?.preventDefault();
    e?.stopPropagation();
    
    // Save current scroll position before state change
    const scrollContainer = sidebarScrollRef.current;
    const currentScroll = scrollContainer?.scrollTop || 0;
    
    setOpenMenus(prev => {
      const isOpen = prev.includes(name);
      return isOpen ? prev.filter(n => n !== name) : [...prev, name];
    });
    
    // Restore scroll position after state change using microtask
    queueMicrotask(() => {
      if (scrollContainer) {
        scrollContainer.scrollTop = currentScroll;
      }
    });
  }, []);

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

  const getRoleLabel = () => {
    if (role === "super_admin") return "Super Admin";
    if ((role as string) === "admin") return "Admin";
    return "Moderator";
  };

  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items
      .filter(item => {
        // Super admin bypasses all permission checks
        if (isSuperAdmin) return true;
        
        // If no permissionKey, menu is accessible to all (e.g., Dashboard)
        if (!item.permissionKey) return true;
        
        // Dynamic permission check: check if user has view permission for this menu
        const canView = hasPermission(item.permissionKey, "view");
        return canView;
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
        <div className="space-y-0.5">
          <button
            onClick={(e) => toggleMenu(item.name, e)}
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
            <ChevronRight 
              className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} 
            />
          </button>
          {/* Simple CSS-based show/hide instead of Collapsible */}
          <div 
            className={`pl-4 space-y-0.5 overflow-hidden transition-all duration-200 ${
              isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            {item.children!.map((child) => (
              <NavItemComponent key={child.href} item={child} depth={depth + 1} />
            ))}
          </div>
        </div>
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

        {/* Navigation - scroll container with stable positioning */}
        <div 
          ref={sidebarScrollRef}
          className="flex-1 overflow-y-auto"
          style={{ 
            overflowAnchor: 'none',
            scrollBehavior: 'auto',
            contain: 'strict',
          }}
        >
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
