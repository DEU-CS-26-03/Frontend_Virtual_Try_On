const BASE_URL = "http://localhost:8000"; // 백엔드 주소

export const uploadUserImage = async (file: File) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("view", "front"); // 명세에 있음

  const response = await fetch(`${BASE_URL}/user-images`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("업로드 실패");
  }

  return await response.json();
};