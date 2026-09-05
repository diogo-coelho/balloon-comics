'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { getProfile } from '@/services/auth.service';
import { AuthUser } from '@/types/auth';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await getProfile();
        setUser(response.data as AuthUser);
      } catch {
        clearUser();
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [setUser, clearUser]);

  if (isLoading) {
    return null;
  }

  return <>{children}</>;
}