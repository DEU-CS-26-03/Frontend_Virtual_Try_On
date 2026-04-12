import { API_ROUTES } from "./client";

export const registerUser = async (data: any) => {
  const res = await fetch(`${API_ROUTES.AUTH}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const loginUser = async (data: any) => {
  const res = await fetch(`${API_ROUTES.AUTH}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getMyInfo = async () => {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${API_ROUTES.AUTH}/me`, { // 백엔드 경로 확인 필요 (보통 /me 또는 /api/user/me)
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return res.json();
};