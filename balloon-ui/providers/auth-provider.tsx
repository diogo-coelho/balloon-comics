'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { getProfile } from '@/services/auth.service';
import { AuthUser } from '@/types/auth';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore(
    (state) => state.setUser
  );

  const clearUser = useAuthStore(
    (state) => state.clearUser
  );

  const setAuthReady = useAuthStore(
    (state) => state.setAuthReady
  );

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await getProfile();

        setUser(response.data as AuthUser);
      } catch {
        clearUser();
      } finally {
        setAuthReady(true);
      }
    }

    checkAuth();
  }, [ setUser, clearUser, setAuthReady ]);

  return <>{children}</>;
}