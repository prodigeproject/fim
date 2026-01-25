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
  selection_passed: boolean | null;
  note_visible_to_applicant: boolean | null;
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
    let isMounted = true;
    console.debug("[RegAuth] initializeAuth start");
    
    const initializeAuth = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        console.debug("[RegAuth] existing session?", !!existingSession);
        
        if (!isMounted) return;
        
        if (existingSession?.user) {
          // Check if this is a registration user (not an admin) by checking profiles table
          const { data: adminProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", existingSession.user.id)
            .maybeSingle();
          
          if (!isMounted) return;
          
          // Only set session for non-admin users (registrants)
          if (!adminProfile) {
            console.debug("[RegAuth] hydrating registrant session");
            setSession(existingSession);
            setUser(existingSession.user);
            const reg = await fetchRegistration(existingSession.user.id);
            if (isMounted) {
              setRegistration(reg);
            }
          } else {
            console.debug("[RegAuth] user has admin profile, clearing registrant context");
            setSession(null);
            setUser(null);
            setRegistration(null);
          }
        }
        
        if (isMounted) {
          console.debug("[RegAuth] setIsLoading(false)");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("[RegAuth] initializeAuth error:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    initializeAuth();

    // Set up auth state listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, nextSession) => {
        if (!isMounted) return;
        console.debug("[RegAuth] onAuthStateChange", event);
        
        // Handle sign out
        if (event === "SIGNED_OUT") {
          setSession(null);
          setUser(null);
          setRegistration(null);
          return;
        }
        
        // Handle sign in
        if (nextSession?.user && event === "SIGNED_IN") {
          // Check if this is a registration user (not an admin)
          const { data: adminProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", nextSession.user.id)
            .maybeSingle();
          
          if (!isMounted) return;
          
          // Only set session for non-admin users
          if (!adminProfile) {
            console.debug("[RegAuth] SIGNED_IN: hydrating registrant");
            setSession(nextSession);
            setUser(nextSession.user);
            const reg = await fetchRegistration(nextSession.user.id);
            if (isMounted) {
              setRegistration(reg);
            }
          } else {
            console.debug("[RegAuth] SIGNED_IN: admin user, ignoring in registrant context");
          }
        }
      }
    );

    return () => {
      isMounted = false;
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
      console.debug("[RegAuth] signIn start for", email);

      // First check if registration exists and is verified
      const { data: regCheck, error: regCheckError } = await supabase
        .from("fim_registrations")
        .select("id, email_verified, auth_user_id")
        .eq("email", email.toLowerCase().trim())
        .maybeSingle();

      if (regCheckError && regCheckError.code !== "PGRST116") {
        throw new Error("Gagal memeriksa data pendaftaran");
      }

      if (!regCheck) {
        throw new Error("Email tidak terdaftar sebagai pendaftar FIM. Silakan daftar terlebih dahulu.");
      }

      // Check email verification status BEFORE signing in
      if (!regCheck.email_verified) {
        throw new Error("UNVERIFIED_EMAIL");
      }

      // Now do the actual sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if this user has an admin role - admins should use /admin
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

        console.debug("[RegAuth] signIn success, hydrating");
        setUser(data.user);
        setSession(data.session);
        setRegistration(reg);
      }

      return { error: null };
    } catch (error) {
      console.error("[RegAuth] signIn error:", error);
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
