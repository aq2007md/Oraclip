import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  id: string;
  display_name: string | null;
  default_organization_id: string;
  onboarding_completed_at: string | null;
  creator_type: string | null;
  primary_niche: string | null;
  niche_custom: string | null;
  primary_goal: string | null;
  primary_goal_custom: string | null;
  audience_size: string | null;
  audience_description: string | null;
  posting_cadence: string | null;
  country: string | null;
  subscription_tier: string | null;
};

export type { Profile };

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) setProfile(null);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    for (let i = 0; i < 5; i++) {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, default_organization_id, onboarding_completed_at, creator_type, primary_niche, niche_custom, primary_goal, primary_goal_custom, audience_size, audience_description, posting_cadence, country, subscription_tier")
        .eq("id", userId)
        .maybeSingle();
      if (data) {
        setProfile(data as Profile);
        return;
      }
      await new Promise((r) => setTimeout(r, 300));
    }
  };

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      return;
    }
    const userId = session.user.id;
    let cancelled = false;
    (async () => {
      if (!cancelled) await fetchProfile(userId);
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);

    if (typeof window !== "undefined") {
      window.location.replace("/");
    }
  };

  const refreshProfile = async () => {
    if (session?.user) await fetchProfile(session.user.id);
  };

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
