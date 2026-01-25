import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminSupabase as supabase } from "@/integrations/supabase/adminClient";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ArticleCommentsProps {
  articleId: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user?: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function ArticleComments({ articleId }: ArticleCommentsProps) {
  const { user, isSuperAdmin } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  // Fetch comments
  const { data: comments, isLoading } = useQuery({
    queryKey: ["article-comments", articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("article_comments")
        .select("id, content, created_at, user_id")
        .eq("article_id", articleId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch user profiles
      const userIds = [...new Set(data?.map((c) => c.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", userIds);

      const profileMap = profiles?.reduce((acc, p) => {
        acc[p.id] = { username: p.username, full_name: p.full_name, avatar_url: p.avatar_url };
        return acc;
      }, {} as Record<string, { username: string; full_name: string | null; avatar_url: string | null }>);

      return data?.map((c) => ({
        ...c,
        user: profileMap?.[c.user_id],
      })) as Comment[];
    },
  });

  // Add comment mutation
  const addMutation = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase.from("article_comments").insert({
        article_id: articleId,
        user_id: user?.id,
        content,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article-comments", articleId] });
      setNewComment("");
      toast({ title: "Komentar ditambahkan" });
    },
    onError: (error) => {
      toast({
        title: "Gagal menambahkan komentar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete comment mutation
  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("article_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article-comments", articleId] });
      toast({ title: "Komentar dihapus" });
    },
    onError: (error) => {
      toast({
        title: "Gagal menghapus komentar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addMutation.mutate(newComment.trim());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <MessageSquare className="h-4 w-4" />
        Diskusi Internal ({comments?.length || 0})
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {isLoading ? (
          <>
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`flex gap-3 p-3 rounded-lg ${
                comment.user_id === user?.id
                  ? "bg-primary/5 border border-primary/20"
                  : "bg-muted"
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.user?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {comment.user?.full_name?.[0] || comment.user?.username?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {comment.user?.full_name || comment.user?.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.created_at), "dd MMM, HH:mm", { locale: id })}
                    </span>
                  </div>
                  {(comment.user_id === user?.id || isSuperAdmin) && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => deleteMutation.mutate(comment.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  )}
                </div>
                <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Belum ada komentar. Mulai diskusi!
          </p>
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          placeholder="Tulis komentar..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={2}
          className="flex-1 resize-none"
        />
        <Button
          type="submit"
          size="icon"
          disabled={addMutation.isPending || !newComment.trim()}
          className="self-end"
        >
          {addMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
