import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminSupabase as supabase } from "@/integrations/supabase/adminClient";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, UserPlus, Shield, ShieldCheck, UserX, Key, Copy, ShieldAlert, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface DynamicRole {
  id: string;
  name: string;
  label: string;
  description: string | null;
  is_system: boolean;
}

async function extractFunctionErrorMessage(err: any): Promise<string> {
  try {
    const ctx = err?.context;
    if (ctx && typeof ctx === "object" && typeof ctx.text === "function") {
      const text = await ctx.text();
      if (text) {
        try {
          const parsed = JSON.parse(text);
          return parsed?.error || parsed?.message || text;
        } catch {
          return text;
        }
      }
    }
  } catch {
    // ignore
  }
  return err?.message || "Terjadi kesalahan";
}

export default function UsersManagement() {
  const { isSuperAdmin, user } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedDynamicRoleId, setSelectedDynamicRoleId] = useState<string>("");
  const [resetResult, setResetResult] = useState<{ email: string; temporaryPassword: string } | null>(null);

  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<"super_admin" | "moderator" | "admin">("moderator");
  const [newUserPassword, setNewUserPassword] = useState("");

  // Fetch users (profiles)
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          username,
          full_name,
          email,
          is_active,
          last_login_at,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isSuperAdmin,
  });

  // Fetch roles separately (avoid relying on FK joins)
  const { data: rolesMap } = useQuery({
    queryKey: ["admin-users-roles", users?.map((u) => u.id).join(",")],
    queryFn: async () => {
      if (!users?.length) return {} as Record<string, "super_admin" | "moderator" | "admin">;

      const ids = users.map((u) => u.id);
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", ids);

      if (error) throw error;

      const map: Record<string, "super_admin" | "moderator" | "admin"> = {};
      (data ?? []).forEach((r: any) => {
        // If a user ever has multiple rows, prefer super_admin
        if (map[r.user_id] === "super_admin") return;
        map[r.user_id] = r.role;
      });
      return map;
    },
    enabled: isSuperAdmin && !!users?.length,
  });

  // Fetch dynamic roles
  const { data: dynamicRoles } = useQuery({
    queryKey: ["dynamic-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dynamic_roles")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as DynamicRole[];
    },
    enabled: isSuperAdmin,
  });

  // Fetch user dynamic roles
  const { data: userDynamicRoles } = useQuery({
    queryKey: ["user-dynamic-roles", users?.map((u) => u.id).join(",")],
    queryFn: async () => {
      if (!users?.length) return {} as Record<string, string[]>;

      const ids = users.map((u) => u.id);
      const { data, error } = await supabase
        .from("user_dynamic_roles")
        .select("user_id, role_id, dynamic_roles(name, label)")
        .in("user_id", ids);

      if (error) throw error;

      const map: Record<string, { roleId: string; name: string; label: string }[]> = {};
      (data ?? []).forEach((r: any) => {
        if (!map[r.user_id]) map[r.user_id] = [];
        if (r.dynamic_roles) {
          map[r.user_id].push({
            roleId: r.role_id,
            name: r.dynamic_roles.name,
            label: r.dynamic_roles.label,
          });
        }
      });
      return map;
    },
    enabled: isSuperAdmin && !!users?.length,
  });

  // Create admin/moderator user
  const createUserMutation = useMutation({
    mutationFn: async (payload: {
      email: string;
      password: string;
      full_name: string;
      role: "super_admin" | "moderator" | "admin";
    }) => {
      const { data, error } = await supabase.functions.invoke("admin-create-user", {
        body: {
          email: payload.email.trim(),
          password: payload.password,
          full_name: payload.full_name.trim(),
          role: payload.role,
        },
      });

      if (error) {
        throw new Error(await extractFunctionErrorMessage(error));
      }

      // Some functions may return 200 with an error payload
      if ((data as any)?.success === false) {
        throw new Error((data as any)?.error || "Gagal membuat pengguna");
      }

      return data as { success: boolean; user_id: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-roles"] });
      setIsAddOpen(false);
      setNewUserEmail("");
      setNewUserName("");
      setNewUserPassword("");
      setNewUserRole("moderator");
      toast({ title: "Pengguna berhasil dibuat" });
    },
    onError: (error) => {
      toast({
        title: "Gagal membuat pengguna",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, email }: { userId: string; email: string }) => {
      const { data, error } = await supabase.functions.invoke("admin-reset-password", {
        body: { user_id: userId },
      });

      if (error) {
        throw new Error(await extractFunctionErrorMessage(error));
      }

      const temporaryPassword = (data as any)?.temporary_password as string | undefined;
      if (!temporaryPassword) {
        throw new Error("Password sementara tidak diterima dari server");
      }

      return { email, temporaryPassword };
    },
    onSuccess: (res) => {
      setResetResult(res);
      setIsResetOpen(true);
      toast({ title: "Password berhasil direset" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      toast({
        title: "Gagal reset password",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle user active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !isActive })
        .eq("id", userId);
      
      if (error) throw error;

      // Log audit
      await supabase.rpc("log_audit_event", {
        p_action: isActive ? "deactivate_user" : "activate_user",
        p_resource_type: "user",
        p_resource_id: userId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Status pengguna diperbarui",
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal memperbarui status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Delete user's dynamic roles
      await supabase
        .from("user_dynamic_roles")
        .delete()
        .eq("user_id", userId);
      
      // Delete user's roles
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);
      
      // Delete admin sessions
      await supabase
        .from("admin_sessions")
        .delete()
        .eq("user_id", userId);
      
      // Delete profile
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);
      
      if (error) throw error;

      // Log audit
      await supabase.rpc("log_audit_event", {
        p_action: "delete_user",
        p_resource_type: "user",
        p_resource_id: userId,
      });

      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-roles"] });
      queryClient.invalidateQueries({ queryKey: ["user-dynamic-roles"] });
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      toast({
        title: "Pengguna berhasil dihapus",
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal menghapus pengguna",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Assign dynamic role to user
  const assignDynamicRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      // Check if already assigned
      const { data: existing } = await supabase
        .from("user_dynamic_roles")
        .select("id")
        .eq("user_id", userId)
        .eq("role_id", roleId)
        .single();

      if (existing) {
        throw new Error("Role sudah di-assign ke user ini");
      }

      const { error } = await supabase
        .from("user_dynamic_roles")
        .insert({
          user_id: userId,
          role_id: roleId,
          assigned_by: user?.id,
        });

      if (error) throw error;

      // Log audit
      await supabase.rpc("log_audit_event", {
        p_action: "assign_dynamic_role",
        p_resource_type: "user",
        p_resource_id: userId,
        p_details: { role_id: roleId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-dynamic-roles"] });
      setIsRoleDialogOpen(false);
      setSelectedUserId(null);
      setSelectedDynamicRoleId("");
      toast({ title: "Role berhasil di-assign" });
    },
    onError: (error) => {
      toast({
        title: "Gagal assign role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove dynamic role from user
  const removeDynamicRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const { error } = await supabase
        .from("user_dynamic_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role_id", roleId);

      if (error) throw error;

      // Log audit
      await supabase.rpc("log_audit_event", {
        p_action: "remove_dynamic_role",
        p_resource_type: "user",
        p_resource_id: userId,
        p_details: { role_id: roleId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-dynamic-roles"] });
      toast({ title: "Role berhasil dihapus" });
    },
    onError: (error) => {
      toast({
        title: "Gagal hapus role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openRoleDialog = (userId: string) => {
    setSelectedUserId(userId);
    setSelectedDynamicRoleId("");
    setIsRoleDialogOpen(true);
  };

  const openDeleteDialog = (userItem: any) => {
    setUserToDelete(userItem);
    setIsDeleteDialogOpen(true);
  };

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Akses Ditolak</h2>
        <p className="text-muted-foreground">
          Hanya Super Admin yang dapat mengakses halaman ini
        </p>
      </div>
    );
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "super_admin":
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Super Admin
          </Badge>
        );
      case "admin":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            <ShieldAlert className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Shield className="h-3 w-3 mr-1" />
            Moderator
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
          <p className="text-muted-foreground">
            Kelola akun admin dan moderator
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Pengguna
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Pengguna Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="user@forumindonesiamuda.org"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input
                  placeholder="Nama lengkap"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Password Awal</Label>
                <Input
                  type="password"
                  placeholder="Password sementara"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Pengguna akan diminta mengganti password saat login pertama
                </p>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as "super_admin" | "moderator" | "admin")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                onClick={() =>
                  createUserMutation.mutate({
                    email: newUserEmail,
                    password: newUserPassword,
                    full_name: newUserName,
                    role: newUserRole,
                  })
                }
                disabled={
                  createUserMutation.isPending ||
                  !newUserEmail.trim() ||
                  !newUserName.trim() ||
                  newUserPassword.length < 8
                }
              >
                {createUserMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Buat Pengguna
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Akun akan aktif, dan diminta mengganti password saat login pertama.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Password Reset Result Dialog */}
        <Dialog
          open={isResetOpen}
          onOpenChange={(open) => {
            setIsResetOpen(open);
            if (!open) setResetResult(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Password Sementara</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Berikan password ini ke <span className="font-medium">{resetResult?.email}</span>. Saat login pertama,
              pengguna akan diminta mengganti password.
            </p>
            <div className="flex items-center gap-2">
              <Input readOnly value={resetResult?.temporaryPassword || ""} />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={async () => {
                  if (!resetResult?.temporaryPassword) return;
                  await navigator.clipboard.writeText(resetResult.temporaryPassword);
                  toast({ title: "Password tersalin" });
                }}
                disabled={!resetResult?.temporaryPassword}
                aria-label="Salin password"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assign Dynamic Role Dialog */}
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Role Dinamis</DialogTitle>
              <DialogDescription>
                Pilih role dinamis untuk di-assign ke pengguna ini
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Role Dinamis</Label>
                <Select value={selectedDynamicRoleId} onValueChange={setSelectedDynamicRoleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {dynamicRoles?.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  if (selectedUserId && selectedDynamicRoleId) {
                    assignDynamicRoleMutation.mutate({
                      userId: selectedUserId,
                      roleId: selectedDynamicRoleId,
                    });
                  }
                }}
                disabled={!selectedDynamicRoleId || assignDynamicRoleMutation.isPending}
              >
                {assignDynamicRoleMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ShieldAlert className="h-4 w-4 mr-2" />
                )}
                Assign Role
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : users?.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Role Dinamis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Login Terakhir</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userItem: any) => (
                    <TableRow key={userItem.id}>
                      <TableCell>
                        <div className="font-medium">{userItem.full_name || userItem.username}</div>
                        <div className="text-xs text-muted-foreground">@{userItem.username}</div>
                      </TableCell>
                      <TableCell>{userItem.email}</TableCell>
                      <TableCell>
                        {getRoleDisplay(rolesMap?.[userItem.id] || "moderator")}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {userDynamicRoles?.[userItem.id]?.map((dr) => (
                            <Badge
                              key={dr.roleId}
                              variant="outline"
                              className="cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => {
                                if (userItem.id !== user?.id) {
                                  removeDynamicRoleMutation.mutate({
                                    userId: userItem.id,
                                    roleId: dr.roleId,
                                  });
                                }
                              }}
                              title={userItem.id !== user?.id ? "Klik untuk hapus" : ""}
                            >
                              {dr.label}
                              {userItem.id !== user?.id && (
                                <span className="ml-1 text-xs">×</span>
                              )}
                            </Badge>
                          )) || (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {userItem.is_active ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Nonaktif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {userItem.last_login_at 
                          ? new Date(userItem.last_login_at).toLocaleString("id-ID")
                          : "Belum pernah"
                        }
                      </TableCell>
                      <TableCell>
                        {userItem.id !== user?.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openRoleDialog(userItem.id)}
                              title="Assign role dinamis"
                            >
                              <ShieldAlert className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                resetPasswordMutation.mutate({ userId: userItem.id, email: userItem.email })
                              }
                              disabled={resetPasswordMutation.isPending}
                              title="Reset password"
                            >
                              {resetPasswordMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Key className="h-4 w-4" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                toggleActiveMutation.mutate({
                                  userId: userItem.id,
                                  isActive: userItem.is_active,
                                })
                              }
                              disabled={toggleActiveMutation.isPending}
                              title={userItem.is_active ? "Nonaktifkan" : "Aktifkan"}
                            >
                              {toggleActiveMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : userItem.is_active ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserPlus className="h-4 w-4" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => openDeleteDialog(userItem)}
                              title="Hapus pengguna"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Belum ada pengguna
            </p>
          )}
        </CardContent>
      </Card>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Hapus Pengguna
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengguna <strong>{userToDelete?.full_name || userToDelete?.username}</strong> ({userToDelete?.email})? 
              <br /><br />
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait termasuk role dan sesi login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => userToDelete && deleteUserMutation.mutate(userToDelete.id)}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
