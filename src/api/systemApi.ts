import { API_ROUTES } from "./client";

export const getResultById = async (resultId: string) => {
  /* [실제 구현부]
  const res = await fetch(`${API_ROUTES.RESULTS}/${resultId}`);
  if (!res.ok) throw new Error("결과 조회 실패");
  return res.json();
  */
  return { result_id: resultId, image_url: "https://picsum.photos/seed/res/800/1000" };
};