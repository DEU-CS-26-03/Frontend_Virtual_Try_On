import { API_ROUTES } from "./client";

export const createTryOnJob = async () => {
  const res = await fetch(`${API_ROUTES.TRYONS}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error(`Job 생성 실패: ${res.status}`);
  return res.json(); 
};

export const uploadToStorage = async (presignedUrl: string, file: File) => {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type, // 파일의 실제 MIME 타입 (image/jpeg 등)
    },
  });

  if (!res.ok) throw new Error(`스토리지 업로드 실패: ${res.status}`);
  return true;
};

export const startInference = async (jobId: string) => {
  const res = await fetch(`${API_ROUTES.TRYONS}/jobs/${jobId}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error(`추론 시작 요청 실패: ${res.status}`);
  return res.json();
};

export const getJobStatus = async (jobId: string) => {
  const res = await fetch(`${API_ROUTES.TRYONS}/jobs/${jobId}`, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });

  if (!res.ok) throw new Error(`상태 조회 실패: ${res.status}`);
  return res.json(); 
};