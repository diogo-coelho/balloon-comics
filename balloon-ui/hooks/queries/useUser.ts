"use client";

import { useMutation } from "@tanstack/react-query";
import { createUser } from "@/services/user.service";
import { useAuthStore } from "@/store/auth.store";

export const useCreatedUser = () => {
  const setUser = useAuthStore(
    (state) => state.setUser
  );
  
  return useMutation({
    mutationFn: createUser,

    onSuccess: (data) => {
      const user = data.data?.user;
      if (!user) return;
      setUser({
        id: user.id,
        email: user.email,
      });
    }
  });
}