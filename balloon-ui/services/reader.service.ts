import { api } from "../lib/api";
import { HttpResponse } from "@/types/response";
import { ReaderData } from "@/types/reader";

const getCurrentReader = async (): Promise<HttpResponse<ReaderData>> => { 
  try {
    const response = await api.get("/readers/me");
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateCurrentReader = async (
  data: Partial<ReaderData>
): Promise<HttpResponse<ReaderData>> => {
  try {
    const response = await api.patch("/readers/me", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { getCurrentReader, updateCurrentReader };