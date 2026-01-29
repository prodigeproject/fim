import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Check, 
  Reply, 
  Trash2, 
  Loader2, 
  Send,
  X 
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";

interface InlineComment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  selected_text: string | null;
  selection_start: number | null;
  selection_end: number | null;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string | null;
  user?: {
    username: string;
    full_name: string | null;
  };
  replies?: InlineComment[];
}

interface ArticleInlineCommentsProps {
  articleId: string;
  selectedText?: string;
  selectionRange?: { start: number; end: number };
  onCommentAdded?: () => void;
}

export function ArticleInlineComments({
  articleId,
  selectedText,
  selectionRange,
  onCommentAdded,
}: ArticleInlineCommentsProps) {
  const { user, profile } = useAdminAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // Fetch inline comments
  const { data: comments, isLoading } = useQuery({
    queryKey: ["article-inline-comments", articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("article_inline_comments")
        .select("*")
        .eq("article_id", articleId)
        .is("parent_comment_id", null)
        .order("created_at", { ascending: false });

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

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        data?.map(async (comment) => {
          const { data: replies } = await supabase
            .from("article_inline_comments")
            .select("*")
            .eq("parent_comment_id", comment.id)
            .order("created_at", { ascending: true });

          return {
            ...comment,
            user: profileMap?.[comment.user_id],
            replies: replies?.map((r) => ({
              ...r,
              user: profileMap?.[r.user_id],
            })) || [],
          } as InlineComment;
        }) || []
      );

      return commentsWithReplies;
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (data: {
      content: string;
      selectedText?: string;
      selectionRange?: { start: number; end: number };
      parentCommentId?: string;
    }) => {
      const { error } = await supabase
        .from("article_inline_comments")
        .insert({
          article_id: articleId,
          user_id: user?.id || "",
          content: data.content,
          selected_text: data.selectedText || null,
          selection_start: data.selectionRange?.start || null,
          selection_end: data.selectionRange?.end || null,
          parent_comment_id: data.parentCommentId || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article-inline-comments", articleId] });
      setNewComment("");
      setReplyContent("");
      setReplyTo(null);
      toast.success("Komentar ditambahkan");
      onCommentAdded?.();
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambahkan komentar: ${error.message}`);
    },
  });

  // Resolve comment mutation
  const resolveMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("article_inline_comments")
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
        })
        .eq("id", commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article-inline-comments", articleId] });
      toast.success("Komentar diselesaikan");
    },
    onError: (error: Error) => {
      toast.error(`Gagal menyelesaikan komentar: ${error.message}`);
    },
  });

  // Delete comment mutation
  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("article_inline_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article-inline-comments", articleId] });
      toast.success("Komentar dihapus");
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus komentar: ${error.message}`);
    },
  });

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate({
      content: newComment,
      selectedText,
      selectionRange,
    });
  };

  const handleReply = (parentId: string) => {
    if (!replyContent.trim()) return;
    addCommentMutation.mutate({
      content: replyContent,
      parentCommentId: parentId,
    });
  };

  const getInitials = (name: string | null | undefined, username: string) => {
    if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* Add new comment */}
      <div className="space-y-2">
        {selectedText && (
          <div className="p-2 bg-muted rounded text-sm">
            <span className="text-muted-foreground">Teks dipilih: </span>
            <span className="italic">"{selectedText.slice(0, 50)}{selectedText.length > 50 ? "..." : ""}"</span>
          </div>
        )}
        <Textarea
          placeholder="Tulis komentar review..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
        />
        <Button
          size="sm"
          onClick={handleAddComment}
          disabled={addCommentMutation.isPending || !newComment.trim()}
        >
          {addCommentMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Kirim Komentar
        </Button>
      </div>

      {/* Comments list */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-4 pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-3 rounded-lg border ${
                  comment.is_resolved 
                    ? "bg-muted/50 border-muted" 
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(comment.user?.full_name, comment.user?.username || "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {comment.user?.full_name || comment.user?.username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), "dd MMM HH:mm", { locale: localeId })}
                      </span>
                      {comment.is_resolved && (
                        <Badge variant="secondary" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Selesai
                        </Badge>
                      )}
                    </div>

                    {comment.selected_text && (
                      <p className="text-xs text-muted-foreground italic mt-1 p-1 bg-accent/20 rounded">
                        "{comment.selected_text.slice(0, 100)}{comment.selected_text.length > 100 ? "..." : ""}"
                      </p>
                    )}

                    <p className="text-sm mt-1">{comment.content}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-2">
                      {!comment.is_resolved && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                            className="h-7 text-xs"
                          >
                            <Reply className="h-3 w-3 mr-1" />
                            Balas
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resolveMutation.mutate(comment.id)}
                            disabled={resolveMutation.isPending}
                            className="h-7 text-xs text-green-600 hover:text-green-700"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Selesai
                          </Button>
                        </>
                      )}
                      {(comment.user_id === user?.id || profile?.username === "superadmin") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(comment.id)}
                          disabled={deleteMutation.isPending}
                          className="h-7 text-xs text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Hapus
                        </Button>
                      )}
                    </div>

                    {/* Reply form */}
                    {replyTo === comment.id && (
                      <div className="mt-3 space-y-2">
                        <Textarea
                          placeholder="Tulis balasan..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          rows={2}
                          className="text-sm"
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReply(comment.id)}
                            disabled={addCommentMutation.isPending || !replyContent.trim()}
                            className="h-7"
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Kirim
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setReplyTo(null);
                              setReplyContent("");
                            }}
                            className="h-7"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Batal
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 ml-4 space-y-2 border-l-2 border-muted pl-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {getInitials(reply.user?.full_name, reply.user?.username || "?")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-xs">
                                  {reply.user?.full_name || reply.user?.username}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(reply.created_at), "dd MMM HH:mm", { locale: localeId })}
                                </span>
                              </div>
                              <p className="text-xs mt-0.5">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada komentar review</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
