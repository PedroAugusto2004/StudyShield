import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { userDataService } from '@/services/userDataService';

const KEYS_TO_REMOVE_ON_SIGN_OUT = ['userName', 'userPhoto', 'userGoals'] as const;

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const lastLoadedUserIdRef = useRef<string | null>(null);

  const setLocalStorageItemIfChanged = (key: string, value: string) => {
    try {
      const current = localStorage.getItem(key);
      if (current !== value) {
        localStorage.setItem(key, value);
      }
    } catch {
      // Ignore storage errors (e.g., private mode)
    }
  };

  const dispatchNameUpdated = (name: string) => {
    try {
      const event = new CustomEvent('nameUpdated', { detail: { name } });
      window.dispatchEvent(event);
    } catch {
      // Ignore if CustomEvent is not available in environment
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          // Store name from user metadata if available
          if (session.user.user_metadata?.name) {
            setLocalStorageItemIfChanged('userName', session.user.user_metadata.name);
            dispatchNameUpdated(session.user.user_metadata.name);
          }
          // Store profile picture from user metadata if available
          if (session.user.user_metadata?.avatar_url) {
            setLocalStorageItemIfChanged('userPhoto', session.user.user_metadata.avatar_url);
          }
          // Load user data from database and wait for it
          if (lastLoadedUserIdRef.current !== session.user.id) {
            await userDataService.loadUserData(session.user.id);
            lastLoadedUserIdRef.current = session.user.id;
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
      
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Keep loading true while syncing data
          setLoading(true);
          setUser(session.user);
          
          try {
            // Store name from user metadata if available
            if (session.user.user_metadata?.name) {
              setLocalStorageItemIfChanged('userName', session.user.user_metadata.name);
              dispatchNameUpdated(session.user.user_metadata.name);
            }
            // Store profile picture from user metadata if available
            if (session.user.user_metadata?.avatar_url) {
              setLocalStorageItemIfChanged('userPhoto', session.user.user_metadata.avatar_url);
            }
            // Load user data from database and wait for it
            if (lastLoadedUserIdRef.current !== session.user.id) {
              await userDataService.loadUserData(session.user.id);
              lastLoadedUserIdRef.current = session.user.id;
            }
          } catch (error) {
            console.error('Error loading user data on sign in:', error);
          }
          
          setLoading(false);
          

        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          lastLoadedUserIdRef.current = null;
          // Clear localStorage on sign out (but preserve language preference)
          for (const key of KEYS_TO_REMOVE_ON_SIGN_OUT) {
            localStorage.removeItem(key);
          }
          setLoading(false);
        } else {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};