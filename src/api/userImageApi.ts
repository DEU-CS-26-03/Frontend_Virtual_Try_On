import { API_ROUTES } from "./client";

export const uploadUserImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("view", "front");

  const res = await fetch(API_ROUTES.USER_IMAGES, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("이미지 업로드 실패");
  return res.json();
};