// src/api/tryonApi.ts

import { apiRequest, API_ROUTES } from "./client";

export type TryonStatus = "queued" | "processing" | "completed" | "failed";

export interface TryonError {
  code: string;
  message: string;
}

export type ClothCategory = "upper" | "lower" | "overall";

export interface CreateTryonParams {
  personImage: File;
  clothImage: File;
  clothType: ClothCategory;
}

export interface TryonJob {
  tryonId: string;
  userId?: number;
  status: TryonStatus;
  progress: number;
  userImageId?: string;
  garmentId?: string;
  resultId?: string;
  resultImageUrl?: string;
  message?: string;
  error?: TryonError;
  createdAt?: string;
  updatedAt?: string;
}

interface TryonResponsePayload {
  data?: TryonResponsePayload[] | TryonResponsePayload;
  tryonid?: string;
  tryonId?: string;
  tryon_id?: string;
  id?: string;
  userId?: number;
  user_id?: number;
  status?: string;
  progress?: number;
  userimageid?: string;
  userImageId?: string;
  user_image_id?: string;
  garmentid?: string;
  garmentId?: string;
  garment_id?: string;
  resultid?: string;
  resultId?: string;
  result_id?: string;
  resultimageurl?: string;
  resultImageUrl?: string;
  result_image_url?: string;
  result_url?: string;
  message?: string;
  error?: TryonError;
  createdat?: string;
  createdAt?: string;
  created_at?: string;
  updatedat?: string;
  updatedAt?: string;
  updated_at?: string;
}

export async function createTryon(params: CreateTryonParams): Promise<TryonJob> {
  const formData = new FormData();
  formData.append("personImage", params.personImage);
  formData.append("clothImage", params.clothImage);
  formData.append("clothType", params.clothType);

  const data = await apiRequest<TryonResponsePayload>(API_ROUTES.TRYONS, {
    method: "POST",
    body: formData,
    isFormData: true,
    withAuth: true,
  });

  return fromTryonWire(data);
}

function normalizeStatus(status?: string): TryonStatus {
  const value = String(status || "").toLowerCase();
  if (value === "queued") return "queued";
  if (value === "processing") return "processing";
  if (value === "completed" || value === "success") return "completed";
  if (value === "failed") return "failed";
  return "queued";
}

// 💡 핵심 디벨롭: 가짜 blob 주소를 무시하고 진짜 백엔드 저장소 경로로 연결하여 엑스박스 방지
const parseBackendPathToUrl = (dbPath?: string): string => {
  if (!dbPath) return "";

  // 외부 링크(https://...)는 통과하되, 휘발성 blob: 이나 data: 주소는 필터링
  if (dbPath.startsWith("http") && !dbPath.includes("blob:")) return dbPath;

  const filename = dbPath.split('/').pop() || "";
  const baseUrl = "https://apivirtualtryon.p-e.kr";

  if (filename.startsWith("result_") || dbPath.includes("results")) {
    return `${baseUrl}/uploads/results/${filename}`;
  }
  if (dbPath.includes("user-images")) {
    return `${baseUrl}/uploads/user-images/${filename}`;
  }
  if (dbPath.includes("garments")) {
    return `${baseUrl}/uploads/garments/${filename}`;
  }

  return `${baseUrl}/uploads/${filename}`;
};

function fromTryonWire(payload: TryonResponsePayload): TryonJob {
  const data = payload?.data && !Array.isArray(payload.data) ? payload.data : payload;

  return {
    tryonId: String(data?.tryonid ?? data?.tryonId ?? data?.tryon_id ?? data?.id ?? ""),
    userId: data?.userId ?? data?.user_id ?? 0,
    status: normalizeStatus(data?.status),
    progress: Number(data?.progress ?? 0),

    userImageId: parseBackendPathToUrl(data?.userimageid ?? data?.userImageId ?? data?.user_image_id),
    garmentId: parseBackendPathToUrl(data?.garmentid ?? data?.garmentId ?? data?.garment_id),
    resultImageUrl: parseBackendPathToUrl(data?.resultimageurl ?? data?.resultImageUrl ?? data?.result_image_url ?? data?.result_url),

    resultId: data?.resultid ?? data?.resultId ?? data?.result_id,
    message: data?.message,
    error: data?.error,
    createdAt: data?.createdat ?? data?.createdAt ?? data?.created_at,
    updatedAt: data?.updatedat ?? data?.updatedAt ?? data?.updated_at,
  };
}

export async function getTryon(tryonId: string): Promise<TryonJob> {
  const data = await apiRequest<TryonResponsePayload>(`${API_ROUTES.TRYONS}/${tryonId}`, {
    withAuth: true,
  });
  return fromTryonWire(data);
}

// 💡 2차 디벨롭: 백엔드에서 배열을 {data: []} 로 감싸주든 그냥 []로 주든 다운되지 않게 방어
export async function getTryonList(): Promise<TryonJob[]> {
  const response = await apiRequest<TryonResponsePayload[] | { data?: TryonResponsePayload[] }>(API_ROUTES.TRYONS, {
    withAuth: true,
  });

  let dataArray: TryonResponsePayload[] = [];

  if (Array.isArray(response)) {
    dataArray = response;
  } else if (response && typeof response === 'object' && Array.isArray(response.data)) {
    dataArray = response.data;
  }

  return dataArray.map((item: TryonResponsePayload) => fromTryonWire(item));
}

export async function deleteTryon(tryonId: string): Promise<void> {
  await apiRequest<void>(`${API_ROUTES.TRYONS}/${tryonId}`, {
    method: "DELETE",
    withAuth: true,
  });
}

export const createTryonJob = createTryon;
export const getTryonStatus = getTryon;