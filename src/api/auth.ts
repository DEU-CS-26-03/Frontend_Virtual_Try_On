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
  const res = await fetch(`${API_ROUTES.AUTH}/me`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  // res.ok가 아닐 때(401, 500 등) 에러를 직접 던져줘야 함
  if (!res.ok) {
    const error = new Error('인증 실패');
    (error as any).status = res.status; // status 심어주기
    throw error;
  }

  return res.json();
};