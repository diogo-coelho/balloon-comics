"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { AuthUser } from "@/types/auth";
import { HttpResponse } from "@/types/response";

export const useLogin = () => {
  const queryClient = useQueryClient();

  const setUser = useAuthStore((state) => state.setUser);
  
  return useMutation({
    mutationFn: login,

    onSuccess: (data: HttpResponse<AuthUser>) => {
      setUser(data.data as AuthUser);
      
       queryClient.setQueryData(
        ['auth', 'login'],
        data
      );
    }
  });
}