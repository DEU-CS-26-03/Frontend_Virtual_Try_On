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
  const res = await fetch(API_ROUTES.ME);
  return res.json();
};