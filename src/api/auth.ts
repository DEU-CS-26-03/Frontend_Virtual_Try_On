import { API_ROUTES } from "./client";

export const registerUser = async (data: any) => {
  /* [실제 구현부]
  const res = await fetch(`${API_ROUTES.AUTH}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
  */
  return { success: true, message: "회원가입 성공" };
};

export const loginUser = async (data: any) => {
  /* [실제 구현부]
  const res = await fetch(`${API_ROUTES.AUTH}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
  */
  return { token: "dummy-jwt-token" };
};

export const getMyInfo = async () => {
  /* [실제 구현부]
  const res = await fetch(API_ROUTES.ME);
  return res.json();
  */
  return { id: 1, email: "user@example.com", nickname: "yj", profileImageUrl: "https://i.pravatar.cc/150?u=yj" };
};