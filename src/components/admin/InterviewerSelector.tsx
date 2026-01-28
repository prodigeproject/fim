import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Users, UserCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface InterviewerSelectorProps {
  registrationId: string;
  currentInterviewerName?: string;
  scheduleId?: string;
  onUpdate?: () => void;
}

interface AdminProfile {
  id: string;
  username: string;
  full_name: string | null;
  email: string;
  is_active: boolean;
}

export function InterviewerSelector({ 
  registrationId, 
  currentInterviewerName, 
  scheduleId,
  onUpdate 
}: InterviewerSelectorProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([]);

  // Fetch admin profiles (interviewers)
  const { data: admins, isLoading, refetch } = useQuery({
    queryKey: ["admin-interviewers"],
    queryFn: async () => {
      // Get profiles that have admin roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, full_name, email, is_active")
        .eq("is_active", true)
        .order("full_name");
      
      if (profilesError) throw profilesError;

      // Get roles for filtering admins
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");
      
      if (rolesError) throw rolesError;

      // Filter profiles to only include admins (super_admin, admin, or moderator)
      const adminUserIds = new Set(
        roles
          .filter(r => ["super_admin", "admin", "moderator"].includes(r.role))
          .map(r => r.user_id)
      );

      const adminProfiles = (profiles as AdminProfile[]).filter(p => adminUserIds.has(p.id));
      
      return adminProfiles;
    },
    enabled: isOpen,
  });

  // Update interviewer mutation
  const updateInterviewerMutation = useMutation({
    mutationFn: async ({ interviewerNames, interviewerIds }: { 
      interviewerNames: string; 
      interviewerIds: string[];
    }) => {
      if (!scheduleId) {
        throw new Error("No interview schedule found");
      }

      const { error } = await supabase
        .from("interview_schedules")
        .update({ 
          interviewer_name: interviewerNames,
          interviewer_ids: interviewerIds,
        })
        .eq("id", scheduleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pewawancara berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["interview-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["interview-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["all-interview-schedules"] });
      setIsOpen(false);
      onUpdate?.();
    },
    onError: (error: any) => {
      toast.error(`Gagal memperbarui pewawancara: ${error.message}`);
    },
  });

  const handleToggleInterviewer = (adminId: string) => {
    setSelectedInterviewers(prev => 
      prev.includes(adminId) 
        ? prev.filter(id => id !== adminId)
        : [...prev, adminId]
    );
  };

  const handleSave = () => {
    if (selectedInterviewers.length === 0) {
      toast.error("Pilih minimal satu pewawancara");
      return;
    }

    const selectedAdmins = admins?.filter(a => selectedInterviewers.includes(a.id)) || [];
    const names = selectedAdmins.map(a => a.full_name || a.username).join(", ");
    
    updateInterviewerMutation.mutate({
      interviewerNames: names,
      interviewerIds: selectedInterviewers,
    });
  };

  // Initialize selected interviewers when dialog opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Try to parse existing interviewer from current data
      setSelectedInterviewers([]);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium flex items-center gap-2">
        <Users className="h-4 w-4" />
        Pewawancara
      </Label>
      
      <div className="flex items-center gap-2">
        {currentInterviewerName ? (
          <Badge variant="secondary" className="gap-1">
            <UserCheck className="h-3 w-3" />
            {currentInterviewerName}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">Belum ditentukan</span>
        )}
        
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={!scheduleId}>
              {currentInterviewerName ? "Ubah" : "Pilih Pewawancara"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Pilih Pewawancara</DialogTitle>
              <DialogDescription>
                Pilih admin yang akan menjadi pewawancara untuk kandidat ini.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {admins?.length || 0} admin tersedia
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {admins?.map((admin) => (
                    <div 
                      key={admin.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleToggleInterviewer(admin.id)}
                    >
                      <Checkbox 
                        checked={selectedInterviewers.includes(admin.id)}
                        onCheckedChange={() => handleToggleInterviewer(admin.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {admin.full_name || admin.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {admin.email}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {admins?.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Tidak ada admin yang tersedia
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleSave}
                disabled={updateInterviewerMutation.isPending || selectedInterviewers.length === 0}
              >
                {updateInterviewerMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
