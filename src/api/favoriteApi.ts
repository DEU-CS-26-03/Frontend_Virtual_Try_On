// src/api/favoriteApi.ts
import { apiRequest, API_ROUTES } from "./client";

const normalizeFileUrl = (url?: string | null): string => {
  if (!url) return "";
  if (url.startsWith("https://") || url.startsWith("data:")) return url;
  if (url.startsWith("http://217.142.255.158")) {
    return url.replace("http://217.142.255.158", "https://apivirtualtryon.p-e.kr");
  }
  const backendBase = "https://apivirtualtryon.p-e.kr";
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${backendBase}${cleanUrl}`;
};

// 💡 [핵심] 이미지 URL에서 진짜 의상의 파일명을 추출해 이쁜 이름으로 바꿔주는 함수
const extractNameFromUrl = (url: string, category: string): string => {
  if (!url) return "이름 없는 상품";

  // 1. URL의 맨 마지막 파일명 부분만 자릅니다. (예: .../pink_Tshirt.png -> pink_Tshirt.png)
  const parts = url.split("/");
  const lastPart = parts[parts.length - 1] || "";

  // 2. .png 나 .jpg 같은 확장자를 제거합니다. (예: pink_Tshirt.png -> pink_Tshirt)
  let cleanName = lastPart.split(".")[0] || lastPart;

  // 3. 언더바(_)나 하이픈(-)을 보기 좋게 공백으로 치환합니다. (예: pink_Tshirt -> pink Tshirt)
  cleanName = cleanName.replace(/[_-]/g, " ").trim();

  // 4. 만약 파일명이 카테고리명과 똑같다면 (예: top -> TOP ITEM) 보정해 줍니다.
  if (!cleanName || cleanName.toLowerCase() === category.toLowerCase()) {
    return `${category.toUpperCase()} ITEM`;
  }

  return cleanName;
};

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
  garmentName?: string;
}

function fromFavoriteWire(data: FavoriteWire): FavoriteItem {
  const normalizedUrl = normalizeFileUrl(data.file_url);

  return {
    id: data.garment_id,
    garmentId: data.garment_id,
    createdAt: data.favorited_at,
    garmentImageUrl: normalizedUrl,
    garmentCategory: data.category,
    // 💡 백엔드 데이터 대신에 100% 신뢰할 수 있는 이미지 URL에서 진짜 이름을 파싱해옵니다!
    garmentName: extractNameFromUrl(normalizedUrl, data.category),
  };
}

export async function getFavorites(): Promise<FavoriteItem[]> {
  const data = await apiRequest<FavoriteWire[]>(API_ROUTES.FAVORITES, {
    method: "GET",
    withAuth: true,
  });
  return data.map(fromFavoriteWire);
}

export async function addFavorite(garmentId: string | number): Promise<FavoriteItem> {
  const data = await apiRequest<FavoriteWire>(API_ROUTES.FAVORITES, {
    method: "POST",
    body: JSON.stringify({ garmentId: String(garmentId), garment_id: String(garmentId) }),
    withAuth: true,
  });
  return fromFavoriteWire(data);
}

export async function deleteFavorite(garmentId: string | number): Promise<void> {
  await apiRequest<void>(`${API_ROUTES.FAVORITES}/${garmentId}`, {
    method: "DELETE",
    withAuth: true,
  });
}