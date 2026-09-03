import { ReaderData } from "@/types/reader";
import { api } from "../lib/api";
import { HttpResponse } from "@/types/response";

const getCurrentReader = async (): Promise<HttpResponse<ReaderData>> => {
  try {
    const response = await api.get("/reader/me");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { getCurrentReader };