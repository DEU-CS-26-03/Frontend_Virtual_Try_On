// src/api/favoriteApi.ts
import { apiRequest, API_ROUTES } from "./client";

interface FavoriteWire {
  garment_id: string;
  status?: string;
  source_type?: string;
  category: string;
  filename?: string;
  file_url: string;
  brand_key?: string;
  favorited_at?: string;
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
    id: data.garment_id, // FavoritePage에서 key값 오류가 나지 않도록 고유한 garment_id를 id에 바인딩
    garmentId: data.garment_id,
    createdAt: data.favorited_at,
    garmentImageUrl: data.file_url,
    garmentCategory: data.category,
  };
}

export async function getFavorites(): Promise<FavoriteItem[]> {
  const data = await apiRequest<FavoriteWire[]>(API_ROUTES.FAVORITES, {
    method: "GET",  // 💡 [추가] HTTP 메서드 표기
    withAuth: true, // 💡 [추가] 로그인된 사용자의 토큰을 함께 보내기
  });
  return data.map(fromFavoriteWire);
}

// 2. 찜 추가하기
export async function addFavorite(garmentId: string | number): Promise<FavoriteItem> {
  const data = await apiRequest<FavoriteWire>(API_ROUTES.FAVORITES, {
    method: "POST",
    // 💡 [수정] 백엔드 컨트롤러 body.get("garmentId") 대소문자 스펙에 정확히 맞춤 (garmentid ❌ -> garmentId ⭕)
    body: JSON.stringify({ garmentId: String(garmentId) }),
    withAuth: true, // 🔥 [추가] 409 에러 해결의 핵심! 토큰을 함께 보냅니다.
  });
  return fromFavoriteWire(data);
}

export async function deleteFavorite(garmentId: string | number): Promise<void> {
  await apiRequest<void>(`${API_ROUTES.FAVORITES}/${garmentId}`, {
    method: "DELETE",
    withAuth: true, // 💡 [추가] 로그인된 사용자의 토큰을 함께 보내기
  });
}