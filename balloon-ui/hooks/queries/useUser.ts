"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "@/services/user.service";

export const useCreatedUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["createdUser"] });

      return data;
    }
  });

}