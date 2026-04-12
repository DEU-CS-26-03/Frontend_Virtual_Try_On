import { API_ROUTES } from "./client";
export type CreateTryOnJobRequest = {
  garmentId: string | number;
  fileName: string;
  contentType: string;
};

export const createTryOnJob = async (data: CreateTryOnJobRequest) => {
  const res = await fetch(API_ROUTES.TRYONS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(`Job 생성 실패: ${res.status}`);
  return res.json();
};

export const uploadToStorage = async (presignedUrl: string, file: File) => {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!res.ok) throw new Error(`스토리지 업로드 실패: ${res.status}`);
  return true;
};

export const startInference = async (jobId: string) => {
  const res = await fetch(`${API_ROUTES.TRYONS}/${jobId}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error(`추론 시작 요청 실패: ${res.status}`);
  return res.json();
};

export const getJobStatus = async (jobId: string) => {
  const res = await fetch(`${API_ROUTES.TRYONS}/${jobId}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`상태 조회 실패: ${res.status}`);
  return res.json();
};

export const getTryOnResult = async (jobId: string) => {
  const res = await fetch(`${API_ROUTES.TRYONS}/${jobId}/result`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`결과 조회 실패: ${res.status}`);
  return res.json();
};