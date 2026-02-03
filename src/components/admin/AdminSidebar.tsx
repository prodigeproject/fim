import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useAllPermissions } from "@/hooks/usePermission";
import { useNewRegistrationsCount } from "@/hooks/useNewRegistrationsCount";
import { usePendingArticlesCount } from "@/hooks/usePendingArticlesCount";
import { KeyRound, LogOut, UserCircle } from "lucide-react";
import { adminNavItems, type AdminNavItem } from "./adminNav";

interface AdminSidebarProps {
  onNavigate?: () => void;
}

const OPEN_MENUS_KEY = "admin-open-menus";
const SCROLL_KEY = "admin-sidebar-scroll";

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, role, isSuperAdmin, signOut } = useAdminAuth();
  const { hasPermission } = useAllPermissions();
  const pendingArticlesCount = usePendingArticlesCount();
  const newRegistrationsCount = useNewRegistrationsCount();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [openMenus, setOpenMenus] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(OPEN_MENUS_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(OPEN_MENUS_KEY, JSON.stringify(openMenus));
  }, [openMenus]);

  // Restore scroll synchronously to avoid visible jump.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (!saved) return;
    const pos = Number.parseInt(saved, 10);
    if (Number.isFinite(pos)) el.scrollTop = pos;
  }, []);

  // Persist scroll on unmount/path change.
  useEffect(() => {
    return () => {
      const el = scrollRef.current;
      if (!el) return;
      sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop));
    };
  }, [location.pathname]);

  const getRoleLabel = () => {
    if (role === "super_admin") return "Super Admin";
    if ((role as string) === "admin") return "Admin";
    return "Moderator";
  };

  const getBadgeCount = (badgeKey?: string): number => {
    if (!badgeKey) return 0;
    if (badgeKey === "pendingArticles") return pendingArticlesCount;
    if (badgeKey === "newRegistrations") return newRegistrationsCount;
    return 0;
  };

  const filteredNavItems = useMemo(() => {
    const filterItems = (items: AdminNavItem[]): AdminNavItem[] => {
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
    return filterItems(adminNavItems);
  }, [hasPermission, isSuperAdmin]);

  // Auto-open parent groups if a child is active.
  useEffect(() => {
    const currentPath = location.pathname;
    const parentNames: string[] = [];
    const walk = (items: AdminNavItem[]) => {
      for (const it of items) {
        if (!it.children?.length) continue;
        const hasActiveChild = it.children.some(
          (c) => currentPath === c.href || currentPath.startsWith(c.href + "/"),
        );
        if (hasActiveChild) parentNames.push(it.name);
        walk(it.children);
      }
    };
    walk(filteredNavItems);
    if (parentNames.length) {
      setOpenMenus((prev) => Array.from(new Set([...prev, ...parentNames])));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leafLinkClass = (isActive: boolean) =>
    `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

  const Group = ({ item }: { item: AdminNavItem }) => {
    const hasActiveChild = !!item.children?.some(
      (c) => location.pathname === c.href || location.pathname.startsWith(c.href + "/"),
    );
    const badgeCount = getBadgeCount(item.badgeKey);

    return (
      <AccordionItem value={item.name} className="border-0">
        <AccordionTrigger
          className={`px-2.5 py-1.5 rounded-md text-sm font-medium hover:no-underline transition-colors ${
            hasActiveChild ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-2">
            <item.icon className="h-4 w-4 shrink-0" />
            {item.name}
          </span>
          {badgeCount > 0 && (
            <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5 text-xs flex items-center justify-center">
              {badgeCount > 99 ? "99+" : badgeCount}
            </Badge>
          )}
        </AccordionTrigger>
        <AccordionContent className="pb-0 pt-0">
          <div className="pl-4 space-y-0.5">
            {item.children?.map((child) => {
              const isActive =
                location.pathname === child.href ||
                (child.href !== "/admin/dashboard" && location.pathname.startsWith(child.href + "/"));
              const childBadge = getBadgeCount(child.badgeKey);

              return (
                <Tooltip key={child.href}>
                  <TooltipTrigger asChild>
                    <Link
                      to={child.href}
                      onClick={onNavigate}
                      className={leafLinkClass(isActive)}
                    >
                      <child.icon className="h-4 w-4 shrink-0" />
                      {child.name}
                      {childBadge > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-auto h-5 min-w-5 px-1.5 text-xs flex items-center justify-center"
                        >
                          {childBadge > 99 ? "99+" : childBadge}
                        </Badge>
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="lg:hidden">
                    <p>{child.name}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b shrink-0">
          <h1 className="text-lg font-bold text-foreground">FIM Admin</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{getRoleLabel()}</p>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto"
          style={{ overflowAnchor: "none", scrollBehavior: "auto" }}
        >
          <nav className="p-2 space-y-0.5">
            <Accordion type="multiple" value={openMenus} onValueChange={setOpenMenus} className="space-y-0.5">
              {filteredNavItems.map((item) => {
                const hasChildren = !!item.children?.length;
                if (hasChildren) return <Group key={item.name} item={item} />;

                const isActive =
                  location.pathname === item.href ||
                  (item.href !== "/admin/dashboard" && location.pathname.startsWith(item.href + "/"));
                const badgeCount = getBadgeCount(item.badgeKey);

                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link to={item.href} onClick={onNavigate} className={leafLinkClass(isActive)}>
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
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="lg:hidden">
                      <p>{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </Accordion>
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
              <p className="text-sm font-medium text-foreground truncate">{profile?.full_name || profile?.username}</p>
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
              onClick={async () => {
                await signOut();
                onNavigate?.();
                navigate("/admin", { replace: true });
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Keluar
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
