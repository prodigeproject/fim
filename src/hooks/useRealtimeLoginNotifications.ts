import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export function useRealtimeLoginNotifications() {
  const { user, isSuperAdmin } = useAdminAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !isSuperAdmin) return;

    // Subscribe to realtime changes on audit_logs for login events
    const channel = supabase
      .channel('admin-login-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs',
          filter: `action=eq.login`,
        },
        async (payload) => {
          const newLog = payload.new as {
            user_id: string;
            action: string;
            details: { email?: string } | null;
            ip_address: string | null;
            created_at: string;
          };

          // Don't notify about own login
          if (newLog.user_id === user.id) return;

          // Fetch the user info
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name, email')
            .eq('id', newLog.user_id)
            .single();

          const displayName = profile?.full_name || profile?.username || 'Unknown user';

          toast({
            title: '🔔 Login Baru Terdeteksi',
            description: `${displayName} baru saja login ke admin panel`,
            duration: 10000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isSuperAdmin, toast]);
}
