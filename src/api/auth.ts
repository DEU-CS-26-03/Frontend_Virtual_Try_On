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
  const data = await apiRequest<MyInfoWire>(API_ROUTES.ME);

  return {
    id: data.id,
    email: data.email || "",
    name: data.nickname || data.name || data.username || "USER",
  };
};