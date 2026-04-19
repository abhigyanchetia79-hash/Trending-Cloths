import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  showAdminLogin: boolean;
  setShowAdminLogin: (show: boolean) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLoginInternal] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("showAdminLogin");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin");
    setIsAdmin(!!data && data.length > 0);
  };

  const setShowAdminLogin = async (show: boolean) => {
    setShowAdminLoginInternal(show);
    localStorage.setItem("showAdminLogin", JSON.stringify(show));
    
    // Store in database for persistence
    try {
      const { data: existing } = await supabase
        .from("admin_settings")
        .select("id")
        .single();
      
      if (existing) {
        await supabase
          .from("admin_settings")
          .update({ show_admin_login: show })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("admin_settings")
          .insert({ show_admin_login: show });
      }
    } catch (err) {
      console.warn("Could not sync admin settings to database:", err);
    }
  };

  useEffect(() => {
    const loadAdminSettings = async () => {
      try {
        const { data } = await supabase
          .from("admin_settings")
          .select("show_admin_login")
          .single();
        
        if (data && data.show_admin_login !== null) {
          setShowAdminLoginInternal(data.show_admin_login);
          localStorage.setItem("showAdminLogin", JSON.stringify(data.show_admin_login));
        }
      } catch (err) {
        console.warn("Could not load admin settings from database:", err);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => checkAdmin(session.user.id), 0);
          await loadAdminSettings();
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
        await loadAdminSettings();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, showAdminLogin, setShowAdminLogin, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
