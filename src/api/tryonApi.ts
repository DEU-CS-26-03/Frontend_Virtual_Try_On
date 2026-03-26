const BASE_URL = "http://localhost:8080";

// ✅ 작업 생성
export const createTryonJob = async (
  userImageId: string,
  garmentId: string
) => {
  const res = await fetch(`${BASE_URL}/tryons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_image_id: userImageId,
      garment_id: garmentId,
    }),
  });

  if (!res.ok) throw new Error("피팅 작업 생성 실패");

  return res.json();
};

// ✅ 상태 조회
export const getTryonJobStatus = async (tryonId: string) => {
  const res = await fetch(`${BASE_URL}/tryons/${tryonId}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) throw new Error("상태 조회 실패");

  return res.json();
};

// ✅ 삭제 (옵션)
export const deleteTryonJob = async (tryonId: string) => {
  const res = await fetch(`${BASE_URL}/tryons/${tryonId}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("삭제 실패");
};