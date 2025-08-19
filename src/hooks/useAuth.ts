import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem('supabase-user');
    const storedSession = localStorage.getItem('supabase-session');

    if (storedUser && storedSession) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const parsedSession = JSON.parse(storedSession);
        
        // Verify session is still valid
        supabase.auth.setSession(parsedSession).then(({ data, error }) => {
          if (error || !data.session) {
            // Clear invalid session
            localStorage.removeItem('supabase-user');
            localStorage.removeItem('supabase-session');
            setUser(null);
          } else {
            setUser(parsedUser);
          }
          setLoading(false);
        });
      } catch (error) {
        // Clear corrupted data
        localStorage.removeItem('supabase-user');
        localStorage.removeItem('supabase-session');
        setUser(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          localStorage.setItem('supabase-user', JSON.stringify(session.user));
          localStorage.setItem('supabase-session', JSON.stringify(session));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('supabase-user');
          localStorage.removeItem('supabase-session');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, setUser };
}