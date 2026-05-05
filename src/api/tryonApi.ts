
// src/api/tryonApi.ts
import { apiRequest, API_ROUTES } from "./client";

export type TryonStatus = "queued" | "processing" | "completed" | "failed";

export interface TryonError {
  code: string;
  message: string;
}

export interface CreateTryonParams {
  personImage: File;
  clothImage: File;
  clothType?: string;
}

interface TryonWire {
  tryonid?: string;
  tryonId?: string;

  status?: string;
  progress?: number;

  userimageid?: string;
  userImageId?: string;

  garmentid?: string;
  garmentId?: string;

  resultid?: string;
  resultId?: string;

  resultimageurl?: string;
  resultImageUrl?: string;

  message?: string;
  error?: TryonError;

  createdat?: string;
  createdAt?: string;

  updatedat?: string;
  updatedAt?: string;
}

export interface TryonJob {
  tryonId: string;
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

export async function createTryon(params: CreateTryonParams): Promise<TryonJob> {
  const formData = new FormData();
  formData.append("personImage", params.personImage);
  formData.append("clothImage", params.clothImage);
  if (params.clothType) {
    formData.append("clothType", params.clothType);
  }

  const data = await apiRequest<TryonWire>(API_ROUTES.TRYONS, {
    method: "POST",
    body: formData,
    isFormData: true, // client.ts에 FormData 전송 처리가 되어있어야 합니다 (보통 Content-Type 자동 생략)
  });

  return fromTryonWire(data);
}

function normalizeStatus(status?: string): TryonStatus {
  const value = String(status || "").toLowerCase();

  if (value === "queued") return "queued";
  if (value === "processing") return "processing";
  if (value === "completed") return "completed";
  if (value === "failed") return "failed";

  return "queued";
}

function fromTryonWire(data: TryonWire): TryonJob {
  return {
    tryonId: String(data.tryonid ?? data.tryonId ?? ""),
    status: normalizeStatus(data.status),
    progress: Number(data.progress ?? 0),
    userImageId: data.userimageid ?? data.userImageId,
    garmentId: data.garmentid ?? data.garmentId,
    resultId: data.resultid ?? data.resultId,
    resultImageUrl: data.resultimageurl ?? data.resultImageUrl,
    message: data.message,
    error: data.error,
    createdAt: data.createdat ?? data.createdAt,
    updatedAt: data.updatedat ?? data.updatedAt,
  };
}



export async function getTryon(tryonId: string): Promise<TryonJob> {
  const data = await apiRequest<TryonWire>(`${API_ROUTES.TRYONS}/${tryonId}`);
  return fromTryonWire(data);
}

export async function getTryonList(): Promise<TryonJob[]> {
  const data = await apiRequest<TryonWire[]>(API_ROUTES.TRYONS);
  return data.map(fromTryonWire);
}

export async function deleteTryon(tryonId: string): Promise<void> {
  await apiRequest<void>(`${API_ROUTES.TRYONS}/${tryonId}`, {
    method: "DELETE",
  });
}

/* 페이지에서 쓰는 이름 그대로 alias export */
export const createTryonJob = createTryon;
export const getTryonStatus = getTryon;