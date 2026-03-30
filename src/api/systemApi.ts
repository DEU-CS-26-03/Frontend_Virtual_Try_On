import { API_ROUTES } from "./client";

export const getResultById = async (resultId: string) => {
  const res = await fetch(`${API_ROUTES.RESULTS}/${resultId}`);
  if (!res.ok) throw new Error("결과 조회 실패");
  return res.json();
};