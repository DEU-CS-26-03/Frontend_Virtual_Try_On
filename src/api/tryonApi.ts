import { API_ROUTES } from "./client";

export const createTryOn = async (userImageId: string, garmentId: string) => {
  /* [실제 구현부]
  const res = await fetch(API_ROUTES.TRYONS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_image_id: userImageId, garment_id: garmentId }),
  });
  return res.json();
  */
  return { tryon_id: "mock_tryon_789" };
};

export const getTryOnStatus = async (tryonId: string) => {
  /* [실제 구현부]
  const res = await fetch(`${API_ROUTES.TRYONS}/${tryonId}`);
  return res.json();
  */
  // 시뮬레이션을 위해 "완료" 상태 바로 반환
  return { status: "COMPLETED", result_image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800" };
};