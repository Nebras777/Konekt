import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import type { Profile } from '@/constants/types';

import {
  clearCurrentProfile,
  getCurrentProfile,
  setCurrentProfile,
} from '../../services/currentProfile';

type AuthContextValue = {
  /** null while still checking storage, undefined-like "not signed in" is represented as null too once checked. */
  profile: Profile | null;
  loading: boolean;
  /** Sign in as this profile — persists it and updates the app immediately. */
  signIn: (profile: Profile) => Promise<void>;
  /**
   * Sign out. The root layout guards the tabs on `profile`, so clearing it
   * routes back to the welcome screen on its own.
   */
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentProfile()
      .then(setProfile)
      .finally(() => setLoading(false));
  }, []);

  async function signIn(next: Profile) {
    await setCurrentProfile(next);
    setProfile(next);
  }

  async function signOut() {
    await clearCurrentProfile();
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
