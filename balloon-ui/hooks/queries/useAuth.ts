"use client";

import { useMutation } from "@tanstack/react-query";
import { login } from "@/services/auth.service";

export const useLogin = () => {
  return useMutation({
    mutationFn: login,

    onSuccess: (data) => {
      return data;
    }
  });
}