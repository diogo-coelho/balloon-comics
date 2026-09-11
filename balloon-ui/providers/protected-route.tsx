"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const isAuthReady = useAuthStore(
    (state) => state.isAuthReady
  );

  useEffect(() => {
    if (isAuthReady && !isAuthenticated) {
      router.replace(
        `/login?redirect=${encodeURIComponent(pathname)}`
      );
    }
  }, [
    isAuthReady,
    isAuthenticated,
    pathname,
    router,
  ]);

  if (!isAuthReady) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}