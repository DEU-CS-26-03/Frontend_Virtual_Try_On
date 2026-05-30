// src/api/favoriteApi.ts
import { apiRequest, API_ROUTES } from "./client";

interface FavoriteWire {
  id: string | number;
  garmentid: string;
  createdat?: string;
  garmentimageurl?: string;
  garmentcategory?: string;
}

export interface FavoriteItem {
  id: string | number;
  garmentId: string;
  createdAt?: string;
  garmentImageUrl?: string;
  garmentCategory?: string;
}

function fromFavoriteWire(data: FavoriteWire): FavoriteItem {
  return {
    id: data.id,
    garmentId: data.garmentid,
    createdAt: data.createdat,
    garmentImageUrl: data.garmentimageurl,
    garmentCategory: data.garmentcategory,
  };
}

export async function getFavorites(): Promise<FavoriteItem[]> {
  const data = await apiRequest<FavoriteWire[]>(API_ROUTES.FAVORITES, {
    method: "GET",  // 💡 [추가] HTTP 메서드 표기
    withAuth: true, // 💡 [추가] 로그인된 사용자의 토큰을 함께 보내기
  });
  return data.map(fromFavoriteWire);
}

export async function addFavorite(garmentId: string | number): Promise<FavoriteItem> {
  const data = await apiRequest<FavoriteWire>(API_ROUTES.FAVORITES, {
    method: "POST",
    body: JSON.stringify({ garmentid: String(garmentId) }),
  });
  return fromFavoriteWire(data);
}

export async function deleteFavorite(garmentId: string | number): Promise<void> {
  await apiRequest<void>(`${API_ROUTES.FAVORITES}/${garmentId}`, {
    method: "DELETE",
  });
}