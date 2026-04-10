import { API_ROUTES } from "./client";

export const getFavorites = async () => {
  const res = await fetch(API_ROUTES.FAVORITES);
  return res.json();
};

export const addFavorite = async (garmentId: number) => {
  const res = await fetch(API_ROUTES.FAVORITES, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ garmentId }),
  });
  return res.json();
};

export const deleteFavorite = async (garmentId: number) => {
  await fetch(`${API_ROUTES.FAVORITES}/${garmentId}`, { method: "DELETE" });
};