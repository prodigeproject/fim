import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface Permission {
  permission_key: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export function usePermission(permissionKey: string) {
  const { user, role, isSuperAdmin } = useAdminAuth();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ["user-permissions", user?.id, permissionKey],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Super admin has all permissions
      if (isSuperAdmin) {
        return {
          can_view: true,
          can_create: true,
          can_edit: true,
          can_delete: true,
        };
      }

      // Check via has_permission function
      const { data: canView } = await supabase.rpc("has_permission", {
        _user_id: user.id,
        _permission_key: permissionKey,
        _action: "view",
      });

      const { data: canCreate } = await supabase.rpc("has_permission", {
        _user_id: user.id,
        _permission_key: permissionKey,
        _action: "create",
      });

      const { data: canEdit } = await supabase.rpc("has_permission", {
        _user_id: user.id,
        _permission_key: permissionKey,
        _action: "edit",
      });

      const { data: canDelete } = await supabase.rpc("has_permission", {
        _user_id: user.id,
        _permission_key: permissionKey,
        _action: "delete",
      });

      return {
        can_view: canView ?? false,
        can_create: canCreate ?? false,
        can_edit: canEdit ?? false,
        can_delete: canDelete ?? false,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 10, // 10 seconds for more responsive updates
    refetchOnWindowFocus: true,
  });

  return {
    isLoading,
    canView: isSuperAdmin || permissions?.can_view || false,
    canCreate: isSuperAdmin || permissions?.can_create || false,
    canEdit: isSuperAdmin || permissions?.can_edit || false,
    canDelete: isSuperAdmin || permissions?.can_delete || false,
  };
}

export function useAllPermissions() {
  const { user, isSuperAdmin } = useAdminAuth();
  const queryClient = useQueryClient();

  const { data: permissions, isLoading, refetch } = useQuery({
    queryKey: ["all-user-permissions", user?.id],
    queryFn: async () => {
      if (!user?.id) return {};
      
      // Get user's role ID
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const { data: userDynamicRoles } = await supabase
        .from("user_dynamic_roles")
        .select("role_id")
        .eq("user_id", user.id);

      const roleIds = userDynamicRoles?.map(r => r.role_id) || [];
      
      // Also get role IDs from legacy user_roles
      if (userRoles) {
        const { data: legacyRoles } = await supabase
          .from("dynamic_roles")
          .select("id")
          .in("name", userRoles.map(r => r.role));
        
        if (legacyRoles) {
          roleIds.push(...legacyRoles.map(r => r.id));
        }
      }

      // Get all permissions for these roles
      const { data: rolePermissions } = await supabase
        .from("role_permissions")
        .select("permission_key, can_view, can_create, can_edit, can_delete")
        .in("role_id", roleIds);

      // Merge permissions (any true = true)
      const permissionMap: Record<string, Permission> = {};
      rolePermissions?.forEach(p => {
        if (!permissionMap[p.permission_key]) {
          permissionMap[p.permission_key] = { ...p };
        } else {
          permissionMap[p.permission_key].can_view = permissionMap[p.permission_key].can_view || p.can_view;
          permissionMap[p.permission_key].can_create = permissionMap[p.permission_key].can_create || p.can_create;
          permissionMap[p.permission_key].can_edit = permissionMap[p.permission_key].can_edit || p.can_edit;
          permissionMap[p.permission_key].can_delete = permissionMap[p.permission_key].can_delete || p.can_delete;
        }
      });

      return permissionMap;
    },
    enabled: !!user?.id && !isSuperAdmin,
    staleTime: 1000 * 10, // 10 seconds for more real-time updates
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  });

  // Supabase Realtime subscription for permission changes
  useEffect(() => {
    if (!user?.id || isSuperAdmin) return;

    const channel = supabase
      .channel('role-permissions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'role_permissions' },
        () => {
          // Refetch permissions when any change occurs
          queryClient.invalidateQueries({ queryKey: ["all-user-permissions", user.id] });
          queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_dynamic_roles' },
        (payload) => {
          // Refetch when user's role assignment changes
          if (payload.new && (payload.new as any).user_id === user.id) {
            queryClient.invalidateQueries({ queryKey: ["all-user-permissions", user.id] });
            queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
          }
          if (payload.old && (payload.old as any).user_id === user.id) {
            queryClient.invalidateQueries({ queryKey: ["all-user-permissions", user.id] });
            queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isSuperAdmin, queryClient]);

  const hasPermission = (key: string, action: "view" | "create" | "edit" | "delete" = "view") => {
    if (isSuperAdmin) return true;
    const perm = permissions?.[key];
    if (!perm) return false;
    
    switch (action) {
      case "view": return perm.can_view;
      case "create": return perm.can_create;
      case "edit": return perm.can_edit;
      case "delete": return perm.can_delete;
      default: return false;
    }
  };

  return {
    permissions,
    isLoading,
    hasPermission,
    refetch,
  };
}
