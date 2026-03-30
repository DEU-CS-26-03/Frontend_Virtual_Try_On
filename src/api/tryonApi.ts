import { API_ROUTES } from "./client";

export const createTryOn = async (userImageId: string, garmentId: string) => {
  const res = await fetch(API_ROUTES.TRYONS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_image_id: userImageId, garment_id: garmentId }),
  });
  return res.json();
};

export const getTryOnStatus = async (tryonId: string) => {
  const res = await fetch(`${API_ROUTES.TRYONS}/${tryonId}`);
  return res.json();
};