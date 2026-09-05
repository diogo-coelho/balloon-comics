import { api } from "../lib/api";
import { HttpResponse } from "@/types/response";
import { AuthUser, LoginData } from "@/types/auth";

const login = async (
  loginData: LoginData
): Promise<HttpResponse<AuthUser>> => {
  try {
    const response = await api.post("/auth/login", loginData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getProfile = async (): Promise<HttpResponse<AuthUser>> => {
  const response = await api.get("/auth/me");
  return response.data;
};

export { login, getProfile };