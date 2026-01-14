import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Registration {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  phone_country_code: string | null;
  registration_status: string;
  auth_user_id: string;
  created_at: string;
  updated_at: string;
  email_verified?: boolean;
  selection_stage: string | null;
  final_result: string | null;
  interview_date: string | null;
  interview_note: string | null;
  admin_selection_note: string | null;
  batch_id: string | null;
}

interface RegistrationAuthContextType {
  user: User | null;
  session: Session | null;
  registration: Registration | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshRegistration: () => Promise<void>;
}

const RegistrationAuthContext = createContext<RegistrationAuthContextType | undefined>(undefined);

export function RegistrationAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRegistration = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("fim_registrations")
        .select("*")
        .eq("auth_user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching registration:", error);
        return null;
      }

      return data as Registration | null;
    } catch (error) {
      console.error("Error fetching registration:", error);
      return null;
    }
  }, []);

  const refreshRegistration = useCallback(async () => {
    if (user) {
      const reg = await fetchRegistration(user.id);
      setRegistration(reg);
    }
  }, [user, fetchRegistration]);

  useEffect(() => {
    // Set up auth state listener FIRST (avoid deadlocks)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        // Defer Supabase calls
        setTimeout(() => {
          fetchRegistration(nextSession.user.id).then(setRegistration);
        }, 0);
      } else {
        setRegistration(null);
      }

      setIsLoading(false);
    });

    // THEN check for existing session
    supabase.auth
      .getSession()
      .then(({ data: { session: existingSession } }) => {
        setSession(existingSession);
        setUser(existingSession?.user ?? null);

        if (existingSession?.user) {
          fetchRegistration(existingSession.user.id).then(setRegistration);
        }

        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchRegistration]);

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      setIsLoading(true);

      // Fetch current open batch
      const { data: batchData } = await supabase
        .from("registration_settings")
        .select("id")
        .eq("is_registration_open", true)
        .eq("is_active", true)
        .maybeSingle();

      // Sign up with Auth but don't auto-sign in
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed");

      // Generate verification token with 24-hour expiration
      const verificationToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      // Create registration record with token expiration and batch_id
      const { data: regData, error: regError } = await supabase
        .from("fim_registrations")
        .insert({
          email: email.toLowerCase().trim(),
          full_name: fullName,
          phone: phone || null,
          auth_user_id: authData.user.id,
          registration_status: "pending",
          email_verified: false,
          email_verification_token: verificationToken,
          email_verification_expires_at: expiresAt,
          verification_attempts: 0,
          batch_id: batchData?.id || null,
        })
        .select("*")
        .single();

      if (regError) throw regError;

      // Send verification email
      try {
        await supabase.functions.invoke("send-verification-email", {
          body: {
            email: email.toLowerCase().trim(),
            name: fullName,
            token: verificationToken,
          },
        });
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
      }

      // Notify super admin (fire-and-forget)
      supabase.functions
        .invoke("notify-new-registration", {
          body: {
            registrationId: regData.id,
            fullName,
            email,
          },
        })
        .catch(() => {
          // ignore notification failures
        });

      // Sign out immediately after signup - user should login manually
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setRegistration(null);

      return { error: null };
    } catch (error) {
      console.error("Signup error:", error);
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // Check if user is an admin (has role in user_roles table)
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", (await supabase.auth.signInWithPassword({ email, password })).data?.user?.id || "")
        .maybeSingle();

      // First do the actual sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if this user has an admin role
      if (data.user) {
        const { data: adminRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (adminRole) {
          // This is an admin user trying to login to registration portal
          await supabase.auth.signOut();
          throw new Error("Akun admin tidak dapat digunakan untuk login pendaftaran. Silakan gunakan /admin untuk login admin.");
        }

        const reg = await fetchRegistration(data.user.id);
        
        if (!reg) {
          // No registration found for this user
          await supabase.auth.signOut();
          throw new Error("Akun tidak terdaftar sebagai pendaftar FIM");
        }

        setRegistration(reg);
      }

      return { error: null };
    } catch (error) {
      console.error("Signin error:", error);
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRegistration(null);
  };

  return (
    <RegistrationAuthContext.Provider
      value={{
        user,
        session,
        registration,
        isLoading,
        signUp,
        signIn,
        signOut,
        refreshRegistration,
      }}
    >
      {children}
    </RegistrationAuthContext.Provider>
  );
}

export function useRegistrationAuth() {
  const context = useContext(RegistrationAuthContext);
  if (context === undefined) {
    throw new Error("useRegistrationAuth must be used within a RegistrationAuthProvider");
  }
  return context;
}
