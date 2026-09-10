"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getCurrentReader, updateCurrentReader } from "@/services/reader.service";

export const useCurrentReader = () => {
  return useQuery({
    queryKey: ['readers', 'me'],
    queryFn: getCurrentReader,
  });
}

export const useUpdateCurrentReader = () => {
  return useMutation({
    mutationFn: updateCurrentReader,

    onSuccess: (data) => {
      return data;
    }
  });
};