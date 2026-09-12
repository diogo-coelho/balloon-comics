import { api } from "../lib/api";
import { HttpResponse } from "@/types/response";
import { CreatedUserData, CreateUserData } from "@/types/user";

const createUser = async (
  userData: CreateUserData
): Promise<HttpResponse<CreatedUserData>> => {
  try {
    const response = await api.post("/users/me", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { createUser };