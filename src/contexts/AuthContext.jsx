'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/services/firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import { getCurrentUser } from '@/lib/auth';
import Cookies from 'js-cookie';
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
        <div className='h-dvh min-h-dvh w-dvw flex flex-col items-center justify-center bg-default-900 bg-opacity-90 z-50'>
          <LoadingState message='' />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
