import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, UserPlus, Shield, ShieldCheck, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersManagement() {
  const { isSuperAdmin, user } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<"super_admin" | "moderator">("moderator");
  const [newUserPassword, setNewUserPassword] = useState("");

  // Fetch users (profiles)
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          id,
          username,
          full_name,
          email,
          is_active,
          last_login_at,
          created_at
        `
        )
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
      if (!users?.length) return {} as Record<string, "super_admin" | "moderator">;

      const ids = users.map((u) => u.id);
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", ids);

      if (error) throw error;

      const map: Record<string, "super_admin" | "moderator"> = {};
      (data ?? []).forEach((r: any) => {
        // If a user ever has multiple rows, prefer super_admin
        if (map[r.user_id] === "super_admin") return;
        map[r.user_id] = r.role;
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
      role: "super_admin" | "moderator";
    }) => {
      const { data, error } = await supabase.functions.invoke("admin-create-user", {
        body: {
          email: payload.email.trim(),
          password: payload.password,
          full_name: payload.full_name.trim(),
          role: payload.role,
        },
      });

      if (error) throw error;
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
        p_user_id: user?.id,
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
                <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as "super_admin" | "moderator")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderator">Moderator</SelectItem>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
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
                       {rolesMap?.[userItem.id] === "super_admin" ? (
                         <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                           <ShieldCheck className="h-3 w-3 mr-1" />
                           Super Admin
                         </Badge>
                       ) : (
                         <Badge variant="secondary">
                           <Shield className="h-3 w-3 mr-1" />
                           Moderator
                         </Badge>
                       )}
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
                      {userItem.id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActiveMutation.mutate({
                            userId: userItem.id,
                            isActive: userItem.is_active,
                          })}
                          disabled={toggleActiveMutation.isPending}
                        >
                          {toggleActiveMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : userItem.is_active ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserPlus className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Belum ada pengguna
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}