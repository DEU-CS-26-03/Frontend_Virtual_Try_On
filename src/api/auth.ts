import { apiRequest, API_ROUTES } from "./client";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken?: string;
  tokenType?: string;
  user?: {
    id: number;
    email: string;
    nickname: string;
    role: string;
  };
  message?: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  nickname: string;
};

export type RegisterResponse = {
  message?: string;
  user?: {
    id: number;
    email: string;
    nickname: string;
    role: string;
  };
};

export const loginUser = async (
    loginData: LoginRequest
): Promise<LoginResponse> => {
  return apiRequest<LoginResponse>(API_ROUTES.AUTH_LOGIN, {
    method: "POST",
    body: JSON.stringify(loginData),
  });
};

export const registerUser = async (
    userData: RegisterRequest
): Promise<RegisterResponse> => {
  return apiRequest<RegisterResponse>(API_ROUTES.AUTH_REGISTER, {
    method: "POST",
    body: JSON.stringify(userData),
  });
};