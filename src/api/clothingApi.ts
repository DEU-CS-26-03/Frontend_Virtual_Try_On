import { API_ROUTES } from "./client";

// 의류 목록 조회 (필터링 포함)
export const getGarments = async (params?: {
  category?: string;
  gender?: string;
  page?: number;
}) => {
  /* [실제 구현부] 백엔드 연결 시 아래 주석을 해제하세요.
  const query = new URLSearchParams();
  if (params?.category && params.category !== "all") query.append("category", params.category);
  if (params?.gender) query.append("gender", params.gender);
  if (params?.page) query.append("page", String(params.page));

  const res = await fetch(`${API_ROUTES.GARMENTS}?${query.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error("의류 목록 조회 실패");
  return res.json();
  */

  // ---------------------------------------------------------
  // [UI 테스트용 더미 데이터] 실제 서버가 없어도 화면을 확인할 수 있게 합니다.
  // ---------------------------------------------------------
  const dummyData = [
    { garment_id: "gar_001", file_url: "https://picsum.photos/seed/c1/400/600", category: "top", name: "Classic White Shirt", price: "₩35,000" },
    { garment_id: "gar_002", file_url: "https://picsum.photos/seed/c2/400/600", category: "top", name: "Summer Graphic Tee", price: "₩22,000" },
    { garment_id: "gar_003", file_url: "https://picsum.photos/seed/c3/400/600", category: "bottom", name: "Slim Fit Chinos", price: "₩48,000" },
    { garment_id: "gar_004", file_url: "https://picsum.photos/seed/c4/400/600", category: "outer", name: "Light Windbreaker", price: "₩75,000" },
    { garment_id: "gar_005", file_url: "https://picsum.photos/seed/c5/400/600", category: "bottom", name: "Denim Shorts", price: "₩32,000" },
  ];

  // 카테고리 필터링 시뮬레이션
  if (params?.category && params.category !== "all") {
    return dummyData.filter(item => item.category === params.category);
  }

  return dummyData;
};

// 의류 상세 조회
export const getGarmentById = async (id: string) => {
  /* [실제 구현부]
  const res = await fetch(`${API_ROUTES.GARMENTS}/${id}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("의류 조회 실패");
  return res.json();
  */

  return { garment_id: id, file_url: "https://picsum.photos/seed/detail/400/600", category: "top", name: "Detailed Item", price: "₩99,000" };
};

// 의류 업로드
export const uploadGarment = async (file: File, category?: string) => {
  /* [실제 구현부]
  const formData = new FormData();
  formData.append("file", file);
  if (category) formData.append("category", category);

  const res = await fetch(API_ROUTES.GARMENTS, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("의류 업로드 실패");
  return res.json();
  */

  console.log("더미 업로드 완료:", file.name);
  return { success: true, message: "업로드 성공(더미)" };
};

// 의류 삭제
export const deleteGarment = async (id: string) => {
  /* [실제 구현부]
  const res = await fetch(`${API_ROUTES.GARMENTS}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("삭제 실패");
  */
  console.log("더미 삭제 완료:", id);
};