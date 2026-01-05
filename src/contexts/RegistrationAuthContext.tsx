import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Registration {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  registration_status: string;
  auth_user_id: string;
  created_at: string;
  updated_at: string;
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchRegistration(session.user.id).then(setRegistration);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const reg = await fetchRegistration(session.user.id);
          setRegistration(reg);
        } else {
          setRegistration(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchRegistration]);

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      setIsLoading(true);

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed");

      // Create registration record
      const { error: regError } = await supabase
        .from("fim_registrations")
        .insert({
          email,
          full_name: fullName,
          phone: phone || null,
          auth_user_id: authData.user.id,
          registration_status: "pending",
        });

      if (regError) throw regError;

      // Fetch the new registration
      const reg = await fetchRegistration(authData.user.id);
      setRegistration(reg);

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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const reg = await fetchRegistration(data.user.id);
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