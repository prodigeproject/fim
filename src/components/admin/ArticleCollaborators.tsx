import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Users, 
  UserPlus, 
  Crown, 
  Edit, 
  Eye,
  Trash2,
  Loader2 
} from "lucide-react";
import { toast } from "sonner";

interface Collaborator {
  id: string;
  article_id: string;
  user_id: string;
  role: string;
  can_edit: boolean;
  can_review: boolean;
  added_at: string;
  user?: {
    username: string;
    full_name: string | null;
  };
}

interface ArticleCollaboratorsProps {
  articleId: string;
  leadAuthorId?: string | null;
  isEditable?: boolean;
}

export function ArticleCollaborators({
  articleId,
  leadAuthorId,
  isEditable = true,
}: ArticleCollaboratorsProps) {
  const { user, isSuperAdmin } = useAdminAuth();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("contributor");

  // Fetch collaborators
  const { data: collaborators, isLoading } = useQuery({
    queryKey: ["article-collaborators", articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("article_collaborators")
        .select("*")
        .eq("article_id", articleId);

      if (error) throw error;

      // Fetch user profiles
      const userIds = [...new Set(data?.map((c) => c.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, full_name")
        .in("id", userIds);

      const profileMap = profiles?.reduce((acc, p) => {
        acc[p.id] = { username: p.username, full_name: p.full_name };
        return acc;
      }, {} as Record<string, { username: string; full_name: string | null }>);

      return data?.map((c) => ({
        ...c,
        user: profileMap?.[c.user_id],
      })) as Collaborator[];
    },
    enabled: !!articleId,
  });

  // Fetch available users (admin/moderators)
  const { data: availableUsers } = useQuery({
    queryKey: ["available-collaborators"],
    queryFn: async () => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id");

      const userIds = roles?.map((r) => r.user_id) || [];
      
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, username, full_name")
        .in("id", userIds);

      if (error) throw error;
      return profiles;
    },
  });

  // Add collaborator mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("article_collaborators")
        .insert({
          article_id: articleId,
          user_id: selectedUserId,
          role: selectedRole,
          can_edit: selectedRole === "contributor" || selectedRole === "editor",
          can_review: selectedRole === "reviewer" || selectedRole === "editor",
          added_by: user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article-collaborators", articleId] });
      setShowAddDialog(false);
      setSelectedUserId("");
      setSelectedRole("contributor");
      toast.success("Kolaborator ditambahkan");
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambahkan kolaborator: ${error.message}`);
    },
  });

  // Remove collaborator mutation
  const removeMutation = useMutation({
    mutationFn: async (collaboratorId: string) => {
      const { error } = await supabase
        .from("article_collaborators")
        .delete()
        .eq("id", collaboratorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article-collaborators", articleId] });
      toast.success("Kolaborator dihapus");
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus kolaborator: ${error.message}`);
    },
  });

  const getInitials = (name: string | null | undefined, username: string) => {
    if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    return username.slice(0, 2).toUpperCase();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "editor":
        return <Edit className="h-3 w-3" />;
      case "reviewer":
        return <Eye className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "editor":
        return "Editor";
      case "reviewer":
        return "Reviewer";
      default:
        return "Contributor";
    }
  };

  // Filter out already added collaborators
  const filteredUsers = availableUsers?.filter(
    (u) => 
      !collaborators?.find((c) => c.user_id === u.id) && 
      u.id !== leadAuthorId
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Kolaborator ({collaborators?.length || 0})
        </h3>
        {isEditable && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddDialog(true)}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Tambah
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : collaborators && collaborators.length > 0 ? (
        <div className="space-y-2">
          {collaborators.map((collab) => (
            <div
              key={collab.id}
              className="flex items-center justify-between p-2 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(collab.user?.full_name, collab.user?.username || "?")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {collab.user?.full_name || collab.user?.username}
                  </p>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {getRoleIcon(collab.role)}
                      <span className="ml-1">{getRoleLabel(collab.role)}</span>
                    </Badge>
                    {collab.user_id === leadAuthorId && (
                      <Badge className="text-xs bg-amber-500">
                        <Crown className="h-3 w-3 mr-1" />
                        Lead
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {isEditable && isSuperAdmin && collab.user_id !== leadAuthorId && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMutation.mutate(collab.id)}
                  disabled={removeMutation.isPending}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          Belum ada kolaborator
        </p>
      )}

      {/* Add Collaborator Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Kolaborator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pilih User</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih user..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredUsers?.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name || u.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contributor">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Contributor - Dapat mengedit konten
                    </div>
                  </SelectItem>
                  <SelectItem value="reviewer">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Reviewer - Dapat memberikan review
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Editor - Dapat mengedit dan review
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Batal
            </Button>
            <Button
              onClick={() => addMutation.mutate()}
              disabled={addMutation.isPending || !selectedUserId}
            >
              {addMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
