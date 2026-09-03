"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentReader } from "@/services/reader.service";

export const useCurrentReader = () => {
  return useQuery({
    queryKey: ['reader', 'me'],
    queryFn: getCurrentReader,
  });
}