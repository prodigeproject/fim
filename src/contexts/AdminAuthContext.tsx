import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { adminSupabase as supabase } from "@/integrations/supabase/adminClient";

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
  const fetchProfileAndRole = useCallback(async (userId: string): Promise<AppRole | null> => {
    console.debug("[AdminAuth] fetchProfileAndRole for", userId);
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        console.warn("[AdminAuth] Profile fetch error:", profileError.message);
      }
      setProfile((profileData as AdminProfile) ?? null);
      console.debug("[AdminAuth] profile loaded:", !!profileData);

      // Fetch role via RPC (security definer; avoids RLS issues on user_roles)
      const [superRes, adminRes, modRes] = await Promise.all([
        supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
        supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
        supabase.rpc("has_role", { _user_id: userId, _role: "moderator" }),
      ]);

      if (superRes.error || adminRes.error || modRes.error) {
        console.warn("[AdminAuth] RPC role check error:", superRes.error || adminRes.error || modRes.error);
        // Fallback: jika punya profile, anggap admin; jika tidak, bukan admin.
        const fallbackRole: AppRole | null = profileData ? "admin" : null;
        setRole(fallbackRole);
        console.debug("[AdminAuth] role fallback:", fallbackRole);
        return fallbackRole;
      }

      const isSuper = Boolean(superRes.data);
      const isAdmin = Boolean(adminRes.data);
      const isMod = Boolean(modRes.data);

      const resolved: AppRole | null =
        isSuper ? "super_admin" : isAdmin ? "admin" : isMod ? "moderator" : (profileData ? "admin" : null);

      setRole(resolved);
      console.debug("[AdminAuth] role resolved:", resolved);
      return resolved;
    } catch (error) {
      console.error("[AdminAuth] fetchProfileAndRole error:", error);
      setRole(null);
      return null;
    }
  }, []);

  // Initialize auth state - Admin panel uses separate session tracking
  // to avoid conflicts with registration panel
  useEffect(() => {
    let isMounted = true;
    console.debug("[AdminAuth] initializeAuth start");
    
    const initializeAuth = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        console.debug("[AdminAuth] existing session?", !!existingSession);
        
        if (!isMounted) return;
        
        if (existingSession?.user) {
          const resolvedRole = await fetchProfileAndRole(existingSession.user.id);
          if (!isMounted) return;

          // Hydrate admin context only if user has admin role.
          if (resolvedRole) {
            console.debug("[AdminAuth] hydrating admin session");
            setSession(existingSession);
            setUser(existingSession.user);
          } else {
            console.debug("[AdminAuth] no admin role, clearing admin context");
            setSession(null);
            setUser(null);
            setProfile(null);
            setRole(null);
          }
        }
        
        if (isMounted) {
          console.debug("[AdminAuth] setIsLoading(false)");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("[AdminAuth] initializeAuth error:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    initializeAuth();

    // Set up auth state listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;
        
        // Handle sign out
        if (event === "SIGNED_OUT") {
          setSession(null);
          setUser(null);
          setProfile(null);
          setRole(null);
          return;
        }
        
        // Handle sign in or token refresh
        if (currentSession?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
          const resolvedRole = await fetchProfileAndRole(currentSession.user.id);
          if (!isMounted) return;

          if (resolvedRole) {
            setSession(currentSession);
            setUser(currentSession.user);
          } else {
            // Ini session pendaftar (atau user tanpa role admin)
            setSession(null);
            setUser(null);
            setProfile(null);
            setRole(null);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
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

      // Hydrate context segera supaya UI tidak stuck menunggu listener.
      if (data.user) setUser(data.user as User);
      if (data.session) setSession(data.session as Session);
      if (data.profile) setProfile(data.profile as AdminProfile);
      if (data.role) setRole(data.role as AppRole);

      // Pastikan role ter-set (fallback via RPC +/atau profile)
      if (!data.role && data.user?.id) {
        await fetchProfileAndRole(data.user.id);
      }

      return { error: null };
    } catch (err) {
      console.error("Login error:", err);
      return { error: err as Error };
    }
  };

  // Sign in with username instead of email
  const signInWithUsername = async (username: string, password: string) => {
    try {
      // First, look up the email by username
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", username.toLowerCase())
        .single();

      if (profileError || !profileData) {
        return { error: new Error("Username tidak ditemukan") };
      }

      // Now sign in with the email
      return signIn(profileData.email, password);
    } catch (err) {
      return { error: err as Error };
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