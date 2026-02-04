import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, KeyRound, LogOut, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useAllPermissions } from "@/hooks/usePermission";
import { useNewRegistrationsCount } from "@/hooks/useNewRegistrationsCount";
import { usePendingArticlesCount } from "@/hooks/usePendingArticlesCount";
import { adminNavConfig, type NavItem } from "./adminNavConfig";

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, role, isSuperAdmin, signOut } = useAdminAuth();
  const { hasPermission } = useAllPermissions();
  const pendingArticlesCount = usePendingArticlesCount();
  const newRegistrationsCount = useNewRegistrationsCount();

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    // Auto-expand groups that have active children
    const initial: Record<string, boolean> = {};
    adminNavConfig.forEach((item) => {
      if (item.children?.length) {
        const hasActiveChild = item.children.some(
          (c) => location.pathname === c.href || location.pathname.startsWith(c.href + "/")
        );
        if (hasActiveChild) initial[item.label] = true;
      }
    });
    return initial;
  });

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const getRoleLabel = () => {
    if (role === "super_admin") return "Super Admin";
    if (role === "admin") return "Admin";
    return "Moderator";
  };

  const getBadgeCount = (badgeKey?: string): number => {
    if (!badgeKey) return 0;
    if (badgeKey === "pendingArticles") return pendingArticlesCount;
    if (badgeKey === "newRegistrations") return newRegistrationsCount;
    return 0;
  };

  const filteredNav = useMemo(() => {
    const filterItems = (items: NavItem[]): NavItem[] => {
      return items
        .filter((item) => {
          if (isSuperAdmin) return true;
          if (!item.permissionKey) return true;
          return hasPermission(item.permissionKey, "view");
        })
        .map((item) => ({
          ...item,
          children: item.children ? filterItems(item.children) : undefined,
        }))
        .filter((item) => !item.children || item.children.length > 0);
    };
    return filterItems(adminNavConfig);
  }, [hasPermission, isSuperAdmin]);

  const isActive = (href: string) =>
    location.pathname === href || (href !== "/admin/dashboard" && location.pathname.startsWith(href + "/"));

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    );

  const handleSignOut = async () => {
    await signOut();
    onNavigate?.();
    navigate("/admin", { replace: true });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b shrink-0">
        <h1 className="text-lg font-bold">FIM Admin</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{getRoleLabel()}</p>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {filteredNav.map((item) => {
            const hasChildren = !!item.children?.length;
            const badgeCount = getBadgeCount(item.badgeKey);
            const isExpanded = expandedGroups[item.label] ?? false;

            if (!hasChildren) {
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onNavigate}
                  className={linkClass(isActive(item.href))}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {badgeCount > 0 && (
                    <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </Badge>
                  )}
                </Link>
              );
            }

            const hasActiveChild = item.children?.some((c) => isActive(c.href));

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    hasActiveChild
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {badgeCount > 0 && (
                    <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </Badge>
                  )}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>

                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l pl-2">
                    {item.children?.map((child) => {
                      const childBadge = getBadgeCount(child.badgeKey);
                      return (
                        <Link
                          key={child.href}
                          to={child.href}
                          onClick={onNavigate}
                          className={linkClass(isActive(child.href))}
                        >
                          <child.icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1">{child.label}</span>
                          {childBadge > 0 && (
                            <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                              {childBadge > 99 ? "99+" : childBadge}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-primary">
              {profile?.full_name?.[0] || profile?.username?.[0] || "A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {profile?.full_name || profile?.username}
            </p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
          </div>
        </div>

        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 h-8 text-xs"
            onClick={() => {
              onNavigate?.();
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
              onNavigate?.();
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
  );
}
