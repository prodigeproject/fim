import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Shield, Loader2, Save, Users, Lock, Unlock } from "lucide-react";

interface DynamicRole {
  id: string;
  name: string;
  label: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
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

const PERMISSION_LABELS: Record<string, { label: string; description: string }> = {
  dashboard: { label: "Dashboard", description: "Akses halaman dashboard utama" },
  articles: { label: "Artikel", description: "Manajemen artikel dan konten" },
  article_approvals: { label: "Persetujuan Artikel", description: "Approve/reject artikel" },
  newsletter: { label: "Newsletter", description: "Manajemen subscriber dan broadcast" },
  clubs: { label: "FIM Club", description: "Manajemen FIM Club" },
  regionals: { label: "Regional", description: "Manajemen regional" },
  alumni: { label: "Alumni", description: "Manajemen data alumni" },
  registrations: { label: "Registrasi FIM", description: "Manajemen pendaftaran" },
  users: { label: "Pengguna", description: "Manajemen user admin" },
  sessions: { label: "Sesi Aktif", description: "Lihat sesi login aktif" },
  audit_logs: { label: "Audit Log", description: "Lihat log aktivitas" },
  security: { label: "Security", description: "Dashboard keamanan" },
  roles: { label: "Manajemen Role", description: "Kelola role dan permission" },
  prd_docs: { label: "PRD & Docs", description: "Dokumentasi teknis" },
};

export default function RolesManagement() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<DynamicRole | null>(null);
  const [formData, setFormData] = useState({ name: "", label: "", description: "" });

  // Fetch roles
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ["dynamic-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dynamic_roles")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as DynamicRole[];
    },
  });

  // Fetch permissions for selected role
  const { data: permissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ["role-permissions", selectedRole?.id],
    queryFn: async () => {
      if (!selectedRole) return [];
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*")
        .eq("role_id", selectedRole.id);
      if (error) throw error;
      return data as RolePermission[];
    },
    enabled: !!selectedRole,
  });

  // Fetch user count per role
  const { data: userCounts } = useQuery({
    queryKey: ["role-user-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role");
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach((ur) => {
        counts[ur.role] = (counts[ur.role] || 0) + 1;
      });
      return counts;
    },
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (data: { name: string; label: string; description: string }) => {
      const { data: role, error } = await supabase
        .from("dynamic_roles")
        .insert({
          name: data.name.toLowerCase().replace(/\s+/g, "_"),
          label: data.label,
          description: data.description || null,
        })
        .select()
        .single();
      if (error) throw error;

      // Create default permissions for new role
      const permissionKeys = Object.keys(PERMISSION_LABELS);
      const { error: permError } = await supabase
        .from("role_permissions")
        .insert(
          permissionKeys.map((key) => ({
            role_id: role.id,
            permission_key: key,
            can_view: false,
            can_create: false,
            can_edit: false,
            can_delete: false,
          }))
        );
      if (permError) throw permError;

      return role;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic-roles"] });
      toast.success("Role berhasil dibuat");
      setIsAddDialogOpen(false);
      setFormData({ name: "", label: "", description: "" });
    },
    onError: (error: Error) => {
      toast.error(`Gagal membuat role: ${error.message}`);
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async (data: { id: string; label: string; description: string }) => {
      const { error } = await supabase
        .from("dynamic_roles")
        .update({ label: data.label, description: data.description || null })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic-roles"] });
      toast.success("Role berhasil diupdate");
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Gagal update role: ${error.message}`);
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("dynamic_roles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic-roles"] });
      toast.success("Role berhasil dihapus");
      if (selectedRole?.id === selectedRole?.id) {
        setSelectedRole(null);
      }
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus role: ${error.message}`);
    },
  });

  // Update permission mutation
  const updatePermissionMutation = useMutation({
    mutationFn: async (data: { id: string; field: string; value: boolean }) => {
      const { error } = await supabase
        .from("role_permissions")
        .update({ [data.field]: data.value })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions", selectedRole?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Gagal update permission: ${error.message}`);
    },
  });

  const handleEditRole = (role: DynamicRole) => {
    setFormData({ name: role.name, label: role.label, description: role.description || "" });
    setSelectedRole(role);
    setIsEditDialogOpen(true);
  };

  if (rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Role</h1>
          <p className="text-muted-foreground">Kelola role dan hak akses pengguna</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Role Baru</DialogTitle>
              <DialogDescription>Buat role baru dengan permission default kosong</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Role (sistem)</Label>
                <Input
                  id="name"
                  placeholder="contoh: editor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Akan dikonversi ke lowercase dengan underscore
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="label">Label (tampilan)</Label>
                <Input
                  id="label"
                  placeholder="contoh: Editor Konten"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  placeholder="Deskripsi singkat tentang role ini..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </Button>
              <Button
                onClick={() => createRoleMutation.mutate(formData)}
                disabled={!formData.name || !formData.label || createRoleMutation.isPending}
              >
                {createRoleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Daftar Role</CardTitle>
            <CardDescription>Pilih role untuk mengatur permission</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {roles?.map((role) => (
              <div
                key={role.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedRole?.id === role.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedRole(role)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-medium">{role.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {role.is_system ? (
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Sistem
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <Unlock className="h-3 w-3 mr-1" />
                        Custom
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {userCounts?.[role.name] || 0} user
                  </Badge>
                </div>
                <div className="flex gap-1 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditRole(role);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  {!role.is_system && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Role?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Role "{role.label}" akan dihapus beserta semua permission-nya. User dengan
                            role ini akan kehilangan aksesnya.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteRoleMutation.mutate(role.id)}
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Permissions Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedRole ? `Permission: ${selectedRole.label}` : "Pilih Role"}
            </CardTitle>
            <CardDescription>
              {selectedRole
                ? "Atur hak akses untuk setiap fitur"
                : "Pilih role dari daftar untuk mengatur permission"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedRole ? (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Pilih role untuk melihat dan mengatur permission</p>
              </div>
            ) : permissionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Fitur</TableHead>
                      <TableHead className="text-center">Lihat</TableHead>
                      <TableHead className="text-center">Buat</TableHead>
                      <TableHead className="text-center">Edit</TableHead>
                      <TableHead className="text-center">Hapus</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions?.map((perm) => {
                      const permInfo = PERMISSION_LABELS[perm.permission_key] || {
                        label: perm.permission_key,
                        description: "",
                      };
                      return (
                        <TableRow key={perm.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{permInfo.label}</p>
                              <p className="text-xs text-muted-foreground">{permInfo.description}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={perm.can_view}
                              onCheckedChange={(checked) =>
                                updatePermissionMutation.mutate({
                                  id: perm.id,
                                  field: "can_view",
                                  value: checked,
                                })
                              }
                              disabled={selectedRole.is_system && selectedRole.name === "super_admin"}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={perm.can_create}
                              onCheckedChange={(checked) =>
                                updatePermissionMutation.mutate({
                                  id: perm.id,
                                  field: "can_create",
                                  value: checked,
                                })
                              }
                              disabled={selectedRole.is_system && selectedRole.name === "super_admin"}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={perm.can_edit}
                              onCheckedChange={(checked) =>
                                updatePermissionMutation.mutate({
                                  id: perm.id,
                                  field: "can_edit",
                                  value: checked,
                                })
                              }
                              disabled={selectedRole.is_system && selectedRole.name === "super_admin"}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={perm.can_delete}
                              onCheckedChange={(checked) =>
                                updatePermissionMutation.mutate({
                                  id: perm.id,
                                  field: "can_delete",
                                  value: checked,
                                })
                              }
                              disabled={selectedRole.is_system && selectedRole.name === "super_admin"}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update label dan deskripsi role</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Role (sistem)</Label>
              <Input value={formData.name} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Nama sistem tidak dapat diubah</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-label">Label (tampilan)</Label>
              <Input
                id="edit-label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Deskripsi</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={() =>
                selectedRole &&
                updateRoleMutation.mutate({
                  id: selectedRole.id,
                  label: formData.label,
                  description: formData.description,
                })
              }
              disabled={!formData.label || updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
