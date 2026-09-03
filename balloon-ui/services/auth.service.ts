import { api } from "../lib/api";
import { HttpResponse } from "@/types/response";
import { LoginData } from "@/types/auth";

const login = async (
  loginData: LoginData
): Promise<HttpResponse<void>> => {
  try {
    const response = await api.post("/auth/login", loginData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { login };