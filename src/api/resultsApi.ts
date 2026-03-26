const BASE_URL = "http://localhost:8000";

// 🔥 결과 상세 조회
export const getResultById = async (resultId: string) => {
  const res = await fetch(`${BASE_URL}/results/${resultId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("결과 조회 실패");
  }

  return res.json();
};