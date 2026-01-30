import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { usePermission } from "@/hooks/usePermission";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import Forbidden from "@/pages/admin/Forbidden";

interface RequireAdminProps {
  children: React.ReactNode;
  permissionKey?: string; // Permission key for dynamic permission checking
}

/**
 * RequireAdmin - Checks dynamic permissions from database
 * If permissionKey is provided, checks if user has 'view' permission for that key
 * Super admins bypass all permission checks
 */
export function RequireAdmin({ children, permissionKey }: RequireAdminProps) {
  const { isSuperAdmin, isLoading, user, role, profile } = useAdminAuth();
  const location = useLocation();
  const hasLoggedRef = useRef(false);
  
  // Get dynamic permission if permissionKey is provided
  const { canView, isLoading: isPermissionLoading } = usePermission(permissionKey || "");

  // Super admin always has access
  const hasAccess = isSuperAdmin || (permissionKey ? canView : role === "admin" || role === "moderator");

  // Log unauthorized access attempt
  useEffect(() => {
    const logUnauthorizedAccess = async () => {
      if (!isLoading && !isPermissionLoading && user && role && !hasAccess && !hasLoggedRef.current) {
        hasLoggedRef.current = true;
        
        try {
          await supabase.rpc("log_audit_event", {
            p_action: "unauthorized_access_attempt",
            p_resource_type: "admin_page",
            p_details: {
              attempted_path: location.pathname,
              user_role: role,
              permission_key: permissionKey,
              message: "User attempted to access page without required permission",
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
  }, [isLoading, isPermissionLoading, user, role, hasAccess, location.pathname, profile, permissionKey]);

  useEffect(() => {
    hasLoggedRef.current = false;
  }, [location.pathname]);

  if (isLoading || (permissionKey && isPermissionLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return <Forbidden />;
  }

  return <>{children}</>;
}

/**
 * RequirePermission - Check dynamic permissions from database
 * This is an alias for RequireAdmin with a required permissionKey
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
  
  // Get dynamic permission
  const { canView, canCreate, canEdit, canDelete, isLoading: isPermissionLoading } = usePermission(permissionKey);

  // Check the specific action
  const hasPermission = (() => {
    if (isSuperAdmin) return true;
    switch (action) {
      case "view": return canView;
      case "create": return canCreate;
      case "edit": return canEdit;
      case "delete": return canDelete;
      default: return false;
    }
  })();

  // Log unauthorized access attempt
  useEffect(() => {
    const logUnauthorizedAccess = async () => {
      if (!isLoading && !isPermissionLoading && user && role && !hasPermission && !hasLoggedRef.current) {
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
  }, [isLoading, isPermissionLoading, user, role, hasPermission, location.pathname, profile, permissionKey, action]);

  useEffect(() => {
    hasLoggedRef.current = false;
  }, [location.pathname]);

  if (isLoading || isPermissionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasPermission) {
    return <Forbidden />;
  }

  return <>{children}</>;
}
