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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        setTimeout(() => {
          fetchRegistration(nextSession.user.id).then(setRegistration);
        }, 0);
      } else {
        setRegistration(null);
      }
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        fetchRegistration(existingSession.user.id).then(setRegistration);
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchRegistration]);

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      setIsLoading(true);
      const normalizedEmail = email.toLowerCase().trim();

      // Fetch current open batch
      const { data: batchData } = await supabase
        .from("registration_settings")
        .select("id")
        .eq("is_registration_open", true)
        .eq("is_active", true)
        .maybeSingle();

      // Sign up with Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { data: { full_name: fullName } },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed");

      // Generate verification token
      const verificationToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      // Create registration record
      const { data: regData, error: regError } = await supabase
        .from("fim_registrations")
        .insert({
          email: normalizedEmail,
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
          body: { email: normalizedEmail, name: fullName, token: verificationToken },
        });
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
      }

      // Notify admin (fire-and-forget)
      supabase.functions.invoke("notify-new-registration", {
        body: { registrationId: regData.id, fullName, email: normalizedEmail },
      }).catch(() => {});

      // Sign out after signup - user must verify email first
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
      const normalizedEmail = email.toLowerCase().trim();

      // Step 1: Precheck via backend (bypasses RLS)
      const { data: precheckData, error: precheckError } = await supabase.functions.invoke(
        "portal-login-precheck",
        { body: { email: normalizedEmail } }
      );

      if (precheckError) {
        console.error("Precheck error:", precheckError);
        throw new Error("Gagal memeriksa data pendaftaran");
      }

      // Step 2: Handle precheck results
      if (!precheckData) {
        throw new Error("Gagal memeriksa data pendaftaran");
      }

      if (precheckData.is_blocked) {
        throw new Error(
          precheckData.blocked_reason
            ? `Akun Anda telah diblokir: ${precheckData.blocked_reason}`
            : "Akun Anda telah diblokir oleh administrator"
        );
      }

      if (!precheckData.exists) {
        throw new Error("Email tidak terdaftar sebagai pendaftar FIM. Silakan daftar terlebih dahulu.");
      }

      if (!precheckData.auth_user_id) {
        throw new Error("Akun belum terhubung dengan sistem autentikasi. Silakan hubungi admin.");
      }

      // Step 3: Check verification status
      if (!precheckData.email_verified) {
        throw new Error("UNVERIFIED_EMAIL");
      }

      // Step 4: Sync auth email confirmation if needed
      try {
        await supabase.functions.invoke("confirm-auth-email", {
          body: { registration_id: precheckData.registration_id },
        });
      } catch (syncErr) {
        console.warn("Auth sync warning:", syncErr);
      }

      // Step 5: Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          // Retry sync and login
          await supabase.functions.invoke("confirm-auth-email", {
            body: { registration_id: precheckData.registration_id, email: normalizedEmail },
          });
          await new Promise((r) => setTimeout(r, 500));
          
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });
          
          if (retryError) {
            if (retryError.message.includes("Invalid login credentials")) {
              throw new Error("Email atau password salah.");
            }
            throw new Error("UNVERIFIED_EMAIL");
          }
          
          if (retryData.user) {
            const reg = await fetchRegistration(retryData.user.id);
            if (reg) setRegistration(reg);
          }
          return { error: null };
        }

        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Email atau password salah.");
        }
        throw error;
      }

      // Step 6: Ensure this is not an admin account
      if (data.user) {
        const { data: adminRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (adminRole) {
          await supabase.auth.signOut();
          throw new Error("Akun admin tidak dapat digunakan untuk login pendaftaran. Silakan gunakan /admin.");
        }

        const reg = await fetchRegistration(data.user.id);
        if (!reg) {
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
      value={{ user, session, registration, isLoading, signUp, signIn, signOut, refreshRegistration }}
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
