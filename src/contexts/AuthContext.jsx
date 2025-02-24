'use client';

import Cookies from 'js-cookie';
import { onAuthStateChanged } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';

import { getCurrentUser } from '@/lib/auth';
import { auth } from '@/services/firebase.config';
import LoadingState from '@/components/ui/LoadingState';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();

          Cookies.set('auth-token', token, {
            secure: true,
            sameSite: 'strict',
          });

          const userData = await getCurrentUser();
          setUser(userData);
        } else {
          Cookies.remove('auth-token');
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {loading ? (
        <LoadingState message='Loading user data...' fullHeight />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
