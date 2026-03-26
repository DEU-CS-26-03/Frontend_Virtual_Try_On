const BASE_URL = "http://localhost:8080";

// ✅ 1. 의류 업로드
export const uploadGarment = async (
  file: File,
  category?: string
) => {
  const formData = new FormData();
  formData.append("file", file);

  if (category) {
    formData.append("category", category);
  }

  const res = await fetch(`${BASE_URL}/garments`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("의류 업로드 실패");

  return res.json();
};

// ✅ 2. 의류 목록 조회
export const getGarments = async (params?: {
  category?: string;
  gender?: string;
  page?: number;
}) => {
  const query = new URLSearchParams();

  if (params?.category) query.append("category", params.category);
  if (params?.gender) query.append("gender", params.gender);
  if (params?.page) query.append("page", String(params.page));

  const res = await fetch(`${BASE_URL}/garments?${query.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) throw new Error("의류 목록 조회 실패");

  return res.json();
};

// ✅ 3. 의류 상세 조회
export const getGarmentById = async (id: string) => {
  const res = await fetch(`${BASE_URL}/garments/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) throw new Error("의류 조회 실패");

  return res.json();
};

// ✅ 4. 의류 삭제
export const deleteGarment = async (id: string) => {
  const res = await fetch(`${BASE_URL}/garments/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("삭제 실패");
};