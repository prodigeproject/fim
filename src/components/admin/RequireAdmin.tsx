import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { adminSupabase as supabase } from "@/integrations/supabase/adminClient";
import { Loader2 } from "lucide-react";
import Forbidden from "@/pages/admin/Forbidden";

interface RequireAdminProps {
  children: React.ReactNode;
  permissionKey?: string; // Optional permission key for dynamic permission checking
}

/**
 * RequireAdmin - Allows access for super_admin and admin roles only (not moderator)
 * Optionally checks dynamic permissions if permissionKey is provided
 */
export function RequireAdmin({ children, permissionKey }: RequireAdminProps) {
  const { isSuperAdmin, isLoading, user, role, profile } = useAdminAuth();
  const location = useLocation();
  const hasLoggedRef = useRef(false);

  // Check if user has admin or super_admin role
  const isAdminOrSuperAdmin = role === "super_admin" || (role as string) === "admin";

  // Log unauthorized access attempt
  useEffect(() => {
    const logUnauthorizedAccess = async () => {
      if (!isLoading && user && role && !isAdminOrSuperAdmin && !hasLoggedRef.current) {
        hasLoggedRef.current = true;
        
        try {
          await supabase.rpc("log_audit_event", {
            p_action: "unauthorized_access_attempt",
            p_resource_type: "admin_page",
            p_details: {
              attempted_path: location.pathname,
              user_role: role,
              message: "User attempted to access admin only page",
            },
          });

          await supabase.functions.invoke("notify-unauthorized-access", {
            body: {
              userId: user.id,
              username: profile?.username || "Unknown",
              email: profile?.email || user.email || "Unknown",
              attemptedPath: location.pathname,
              userRole: role,
              ipAddress: null,
              userAgent: navigator.userAgent,
            },
          });
        } catch (error) {
          console.error("Failed to log unauthorized access:", error);
        }
      }
    };

    logUnauthorizedAccess();
  }, [isLoading, user, role, isAdminOrSuperAdmin, location.pathname, profile]);

  useEffect(() => {
    hasLoggedRef.current = false;
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdminOrSuperAdmin) {
    return <Forbidden />;
  }

  return <>{children}</>;
}

/**
 * RequirePermission - Check dynamic permissions from database
 * Falls back to role check if permission not found
 */
interface RequirePermissionProps {
  children: React.ReactNode;
  permissionKey: string;
  action?: "view" | "create" | "edit" | "delete";
}

export function RequirePermission({ children, permissionKey, action = "view" }: RequirePermissionProps) {
  const { isSuperAdmin, isLoading, user, role, profile } = useAdminAuth();
  const location = useLocation();
  const hasLoggedRef = useRef(false);

  // Super admin always has access
  if (!isLoading && isSuperAdmin) {
    return <>{children}</>;
  }

  // Check if user has admin or super_admin role as fallback
  const isAdminOrSuperAdmin = role === "super_admin" || (role as string) === "admin";

  // Log unauthorized access attempt
  useEffect(() => {
    const logUnauthorizedAccess = async () => {
      if (!isLoading && user && role && !isAdminOrSuperAdmin && !hasLoggedRef.current) {
        hasLoggedRef.current = true;
        
        try {
          await supabase.rpc("log_audit_event", {
            p_action: "unauthorized_access_attempt",
            p_resource_type: "admin_page",
            p_details: {
              attempted_path: location.pathname,
              user_role: role,
              permission_key: permissionKey,
              action: action,
              message: "User attempted to access page without permission",
            },
          });

          await supabase.functions.invoke("notify-unauthorized-access", {
            body: {
              userId: user.id,
              username: profile?.username || "Unknown",
              email: profile?.email || user.email || "Unknown",
              attemptedPath: location.pathname,
              userRole: role,
              ipAddress: null,
              userAgent: navigator.userAgent,
            },
          });
        } catch (error) {
          console.error("Failed to log unauthorized access:", error);
        }
      }
    };

    logUnauthorizedAccess();
  }, [isLoading, user, role, isAdminOrSuperAdmin, location.pathname, profile, permissionKey, action]);

  useEffect(() => {
    hasLoggedRef.current = false;
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdminOrSuperAdmin) {
    return <Forbidden />;
  }

  return <>{children}</>;
}