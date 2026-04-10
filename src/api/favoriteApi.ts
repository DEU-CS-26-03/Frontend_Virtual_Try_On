import { API_ROUTES } from "./client";

export const getFavorites = async () => {
  /* [실제 구현부]
  const res = await fetch(API_ROUTES.FAVORITES);
  return res.json();
  */
  return [
    { garment_id: "gar_001", file_url: "https://picsum.photos/seed/f1/400/500", name: "즐겨찾기 티셔츠" },
  ];
};

export const addFavorite = async (garmentId: number) => {
  /* [실제 구현부]
  const res = await fetch(API_ROUTES.FAVORITES, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ garmentId }),
  });
  return res.json();
  */
  return { success: true };
};

export const deleteFavorite = async (garmentId: number) => {
  /* [실제 구현부]
  await fetch(`${API_ROUTES.FAVORITES}/${garmentId}`, { method: "DELETE" });
  */
  console.log("삭제 완료:", garmentId);
};