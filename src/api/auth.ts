// src/api/auth.ts
import { API_ROUTES, apiRequest } from "./client";

interface MyInfoWire {
  id?: number;
  email?: string;
  name?: string;
  nickname?: string;
  username?: string;
}

export interface MyInfo {
  id?: number;
  email: string;
  name: string;
  nickname?: string;
}

export const getMyInfo = async (): Promise<MyInfo> => {
  const data = await apiRequest<MyInfoWire>(API_ROUTES.AUTH_LOGIN);

  return {
    id: data.id,
    email: data.email || "",
    name: data.nickname || data.name || data.username || "USER",
  };
};

type RegisterRequest = {
  email: string;
  password: string;
  name?: string;
  username?: string;
};

type RegisterResponse = {
  id?: string;
  email?: string;
  name?: string;
  username?: string;
  accessToken?: string;
  message?: string;
};

export const registerUser = async (
    userData: RegisterRequest
): Promise<RegisterResponse> => {
  const REGISTER_URL = API_ROUTES.AUTH_LOGIN.replace("/login", "/register");

  return await apiRequest(REGISTER_URL, {
    method: "POST",
    body: JSON.stringify(userData),
  });
};