import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import Forbidden from "@/pages/admin/Forbidden";

interface RequireSuperAdminProps {
  children: React.ReactNode;
}

export function RequireSuperAdmin({ children }: RequireSuperAdminProps) {
  const { isSuperAdmin, isLoading, user, role, profile } = useAdminAuth();
  const location = useLocation();
  const hasLoggedRef = useRef(false);

  // Log unauthorized access attempt and notify via edge function
  useEffect(() => {
    const logUnauthorizedAccess = async () => {
      // Only log if: not loading, user exists, has role, is NOT super admin, and hasn't logged yet
      if (!isLoading && user && role && !isSuperAdmin && !hasLoggedRef.current) {
        hasLoggedRef.current = true;
        
        try {
          // Log to audit_logs
          await supabase.rpc("log_audit_event", {
            p_action: "unauthorized_access_attempt",
            p_resource_type: "admin_page",
            p_details: {
              attempted_path: location.pathname,
              user_role: role,
              message: "Moderator attempted to access super admin only page",
            },
          });

          // Notify via edge function (tracks attempts and sends email after threshold)
          const response = await supabase.functions.invoke("notify-unauthorized-access", {
            body: {
              userId: user.id,
              username: profile?.username || "Unknown",
              email: profile?.email || user.email || "Unknown",
              attemptedPath: location.pathname,
              userRole: role,
              ipAddress: null, // Would need a service to get real IP
              userAgent: navigator.userAgent,
            },
          });

          if (response.error) {
            console.error("Failed to notify unauthorized access:", response.error);
          } else {
            console.log("Unauthorized access tracked:", response.data);
          }
        } catch (error) {
          console.error("Failed to log unauthorized access:", error);
        }
      }
    };

    logUnauthorizedAccess();
  }, [isLoading, user, role, isSuperAdmin, location.pathname, profile]);

  // Reset log flag when path changes
  useEffect(() => {
    hasLoggedRef.current = false;
  }, [location.pathname]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not super admin, show 403 page
  if (!isSuperAdmin) {
    return <Forbidden />;
  }

  return <>{children}</>;
}
