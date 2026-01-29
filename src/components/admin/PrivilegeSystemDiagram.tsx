import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  FileText, 
  Mail, 
  Settings, 
  BarChart3, 
  ClipboardList,
  Eye,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2
} from "lucide-react";

interface DynamicRole {
  id: string;
  name: string;
  label: string;
  description: string | null;
  is_system: boolean;
}

interface RolePermission {
  id: string;
  role_id: string;
  permission_key: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

// System roles definition
const systemRoles = [
  {
    name: "super_admin",
    label: "Super Admin",
    icon: ShieldCheck,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    description: "Akses penuh ke semua fitur sistem",
    permissions: [
      "Manajemen semua artikel",
      "Persetujuan artikel",
      "Manajemen user & role",
      "Newsletter & email",
      "Data organisasi",
      "Pendaftaran FIM",
      "Pengaturan sistem",
      "Audit logs & security",
      "Dokumentasi teknis",
    ],
  },
  {
    name: "admin",
    label: "Admin",
    icon: ShieldAlert,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    description: "Akses admin tanpa manajemen user",
    permissions: [
      "Manajemen semua artikel",
      "Persetujuan artikel",
      "Newsletter & email",
      "Data organisasi",
      "Pendaftaran FIM",
      "Audit logs",
    ],
  },
  {
    name: "moderator",
    label: "Moderator",
    icon: Shield,
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-900/30",
    description: "Akses terbatas untuk moderasi konten",
    permissions: [
      "Membuat & edit artikel sendiri",
      "Melihat data pendaftar",
      "Melihat kalender wawancara",
      "Melihat sesi aktif",
    ],
  },
];

// Feature permission keys with labels
const featurePermissions = [
  { key: "articles", label: "Artikel", icon: FileText },
  { key: "newsletter", label: "Newsletter", icon: Mail },
  { key: "registrations", label: "Pendaftaran", icon: ClipboardList },
  { key: "users", label: "Pengguna", icon: Users },
  { key: "settings", label: "Pengaturan", icon: Settings },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
];

export function PrivilegeSystemDiagram() {
  // Fetch dynamic roles
  const { data: dynamicRoles, isLoading: rolesLoading } = useQuery({
    queryKey: ["dynamic-roles-diagram"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dynamic_roles")
        .select("*")
        .order("is_system", { ascending: false })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as DynamicRole[];
    },
  });

  // Fetch role permissions
  const { data: rolePermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ["role-permissions-diagram"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*");
      if (error) throw error;
      return data as RolePermission[];
    },
  });

  const isLoading = rolesLoading || permissionsLoading;

  // Group permissions by role
  const permissionsByRole = rolePermissions?.reduce((acc, perm) => {
    if (!acc[perm.role_id]) acc[perm.role_id] = [];
    acc[perm.role_id].push(perm);
    return acc;
  }, {} as Record<string, RolePermission[]>) || {};

  const PermissionIcon = ({ allowed }: { allowed: boolean }) => (
    allowed ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-red-400" />
    )
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-4">
        <h2 className="text-xl font-bold">Sistem Hak Akses</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Diagram realtime tentang role dan hak akses di sistem admin FIM
        </p>
      </div>

      {/* System Roles Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Sistem Bawaan
          </CardTitle>
          <CardDescription>
            Role sistem yang tidak dapat dihapus dan memiliki privilege tetap
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {systemRoles.map((role) => (
              <div 
                key={role.name}
                className={`p-4 rounded-lg border ${role.bgColor}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <role.icon className={`h-5 w-5 ${role.color}`} />
                  <span className="font-semibold">{role.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {role.description}
                </p>
                <Separator className="my-2" />
                <ul className="text-xs space-y-1">
                  {role.permissions.map((perm, idx) => (
                    <li key={idx} className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-green-500" />
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Roles Section */}
      {dynamicRoles && dynamicRoles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Role Dinamis
            </CardTitle>
            <CardDescription>
              Role kustom yang dibuat admin dengan permission granular
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <div className="min-w-[600px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium">Role</th>
                      {featurePermissions.map((fp) => (
                        <th key={fp.key} className="text-center py-2 px-1">
                          <div className="flex flex-col items-center gap-1">
                            <fp.icon className="h-4 w-4" />
                            <span className="text-xs">{fp.label}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dynamicRoles.map((role) => {
                      const perms = permissionsByRole[role.id] || [];
                      const permMap = perms.reduce((acc, p) => {
                        acc[p.permission_key] = p;
                        return acc;
                      }, {} as Record<string, RolePermission>);

                      return (
                        <tr key={role.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={role.is_system ? "default" : "outline"}>
                                {role.label}
                              </Badge>
                            </div>
                            {role.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {role.description}
                              </p>
                            )}
                          </td>
                          {featurePermissions.map((fp) => {
                            const perm = permMap[fp.key];
                            return (
                              <td key={fp.key} className="py-3 px-1 text-center">
                                {perm ? (
                                  <div className="flex items-center justify-center gap-0.5">
                                    <span title="View" className={perm.can_view ? "text-green-500" : "text-gray-300"}>
                                      <Eye className="h-3 w-3" />
                                    </span>
                                    <span title="Create" className={perm.can_create ? "text-green-500" : "text-gray-300"}>
                                      <Plus className="h-3 w-3" />
                                    </span>
                                    <span title="Edit" className={perm.can_edit ? "text-green-500" : "text-gray-300"}>
                                      <Pencil className="h-3 w-3" />
                                    </span>
                                    <span title="Delete" className={perm.can_delete ? "text-green-500" : "text-gray-300"}>
                                      <Trash2 className="h-3 w-3" />
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-300">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </ScrollArea>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
              <span className="font-medium">Keterangan:</span>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" /> View
              </div>
              <div className="flex items-center gap-1">
                <Plus className="h-3 w-3" /> Create
              </div>
              <div className="flex items-center gap-1">
                <Pencil className="h-3 w-3" /> Edit
              </div>
              <div className="flex items-center gap-1">
                <Trash2 className="h-3 w-3" /> Delete
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-500">●</span> Diizinkan
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-300">●</span> Tidak diizinkan
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Access Flow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alur Akses Sistem</CardTitle>
          <CardDescription>
            Bagaimana sistem menentukan akses berdasarkan role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-4">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 w-40">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold mb-2">1</div>
              <span className="text-sm font-medium">Login</span>
              <span className="text-xs text-muted-foreground">User melakukan autentikasi</span>
            </div>

            <div className="hidden md:block text-2xl text-muted-foreground">→</div>
            <div className="md:hidden text-2xl text-muted-foreground">↓</div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 w-40">
              <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold mb-2">2</div>
              <span className="text-sm font-medium">Cek Role</span>
              <span className="text-xs text-muted-foreground">Sistem membaca user_roles</span>
            </div>

            <div className="hidden md:block text-2xl text-muted-foreground">→</div>
            <div className="md:hidden text-2xl text-muted-foreground">↓</div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 w-40">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold mb-2">3</div>
              <span className="text-sm font-medium">RLS Policy</span>
              <span className="text-xs text-muted-foreground">Database filter data</span>
            </div>

            <div className="hidden md:block text-2xl text-muted-foreground">→</div>
            <div className="md:hidden text-2xl text-muted-foreground">↓</div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 w-40">
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold mb-2">4</div>
              <span className="text-sm font-medium">Akses Diberikan</span>
              <span className="text-xs text-muted-foreground">Sesuai privilege</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}