import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type AppRole = "super_admin" | "admin" | "moderator";

interface AdminProfile {
  id: string;
  username: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  must_change_password: boolean;
  is_active: boolean;
}

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  profile: AdminProfile | null;
  role: AppRole | null;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithUsername: (username: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Fetch profile and role
  const fetchProfileAndRole = useCallback(async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setProfile(null);
      } else {
        setProfile(profileData as AdminProfile);
      }

      // Fetch role via RPC (avoids RLS issues on user_roles)
      const { data: isSuper, error: superError } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "super_admin",
      });

      const { data: isAdminRole, error: adminError } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });

      const { data: isModerator, error: modError } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "moderator",
      });

      if (superError || adminError || modError) {
        console.error("Error fetching role via RPC:", superError || adminError || modError);
        setRole(null);
        return;
      }

      setRole(isSuper ? "super_admin" : isAdminRole ? "admin" : isModerator ? "moderator" : null);
    } catch (error) {
      console.error("Error in fetchProfileAndRole:", error);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Defer Supabase calls
          setTimeout(() => {
            fetchProfileAndRole(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
        }
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        fetchProfileAndRole(existingSession.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfileAndRole]);

  // Idle timeout
  useEffect(() => {
    if (!session) return;

    const handleActivity = () => {
      setLastActivity(Date.now());
    };

    const checkIdle = setInterval(() => {
      if (Date.now() - lastActivity > IDLE_TIMEOUT) {
        signOut();
      }
    }, 60000); // Check every minute

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);

    return () => {
      clearInterval(checkIdle);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
    };
  }, [session, lastActivity]);

  const signIn = async (email: string, password: string) => {
    try {
      // Use server-side Edge Function for rate limiting and authentication
      const response = await supabase.functions.invoke("admin-auth-login", {
        body: { email, password },
      });

      if (response.error) {
        console.error("Login function error:", response.error);
        return { error: new Error(response.error.message || "Login gagal") };
      }

      const data = response.data;

      // Check for error response
      if (data.error) {
        return { 
          error: new Error(data.error),
          blocked: data.blocked,
          shouldShowCaptcha: data.shouldShowCaptcha,
          remainingAttempts: data.remainingAttempts,
        };
      }

      // Set session from Edge Function response
      if (data.session?.access_token && data.session?.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      return { error: null };
    } catch (err) {
      console.error("Login error:", err);
      return { error: err as Error };
    }
  };

  // Sign in with username instead of email
  // Uses generic error message to prevent username enumeration attacks
  const signInWithUsername = async (username: string, password: string) => {
    try {
      // First, look up the email by username
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", username.toLowerCase())
        .single();

      if (profileError || !profileData) {
        // Use generic error message to prevent username enumeration
        return { error: new Error("Username atau password salah") };
      }

      // Now sign in with the email
      const result = await signIn(profileData.email, password);
      
      // Normalize error message to prevent email enumeration via different error messages
      if (result.error) {
        return { error: new Error("Username atau password salah") };
      }
      
      return result;
    } catch (err) {
      // Generic error for any failures
      return { error: new Error("Username atau password salah") };
    }
  };

  const signOut = async () => {
    if (user) {
      // Log audit
      await supabase.rpc("log_audit_event", {
        p_action: "logout",
      });
      
      // Delete all active sessions for this user
      await supabase
        .from("admin_sessions")
        .delete()
        .eq("user_id", user.id);
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (!error && user && profile) {
      // Check if this was the first password change (first login)
      const wasFirstLogin = profile.must_change_password;
      
      await supabase
        .from("profiles")
        .update({ must_change_password: false })
        .eq("id", user.id);
      
      setProfile(prev => prev ? { ...prev, must_change_password: false } : null);

      // If it was first login and user is a moderator, notify super admin
      if (wasFirstLogin && role === "moderator") {
        supabase.functions.invoke("notify-first-login", {
          body: {
            moderatorEmail: profile.email,
            moderatorUsername: profile.username,
            moderatorFullName: profile.full_name,
            ipAddress: "client",
            userAgent: navigator.userAgent,
            loginTime: new Date().toISOString(),
          },
        }).catch((err) => {
          console.error("Failed to send first login notification:", err);
        });
      }
    }
    
    return { error };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileAndRole(user.id);
    }
  };

  const value = {
    user,
    session,
    profile,
    role,
    isLoading,
    isSuperAdmin: role === "super_admin",
    isAdmin: role === "admin",
    isModerator: role === "moderator",
    signIn,
    signInWithUsername,
    signOut,
    updatePassword,
    refreshProfile,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}