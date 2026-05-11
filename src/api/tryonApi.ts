import { apiRequest, API_ROUTES } from "./client";

export type TryonStatus = "queued" | "processing" | "completed" | "failed";

export interface TryonError {
  code: string;
  message: string;
}

// ★ 의류 카테고리 타입 명시
export type ClothCategory = "upper" | "lower" | "overall";

export interface CreateTryonParams {
  personImage: File;
  clothImage: File;
  clothType: ClothCategory; // ★ string 대신 명확한 타입 적용
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
  data?: TryonResponsePayload;
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
  // ★ 프론트엔드(Fitting.tsx)에서 선택한 값이 그대로 담김
  formData.append("clothType", params.clothType);

  const data = await apiRequest<TryonResponsePayload>(API_ROUTES.TRYONS, {
    method: "POST",
    body: formData,
    isFormData: true,
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

function fromTryonWire(payload: TryonResponsePayload): TryonJob {
  const data = payload?.data ? payload.data : payload;

  return {
    tryonId: String(data?.tryonid ?? data?.tryonId ?? data?.tryon_id ?? data?.id ?? ""),
    userId: data?.userId ?? data?.user_id ?? 0,
    status: normalizeStatus(data?.status),
    progress: Number(data?.progress ?? 0),
    userImageId: data?.userimageid ?? data?.userImageId ?? data?.user_image_id,
    garmentId: data?.garmentid ?? data?.garmentId ?? data?.garment_id,
    resultId: data?.resultid ?? data?.resultId ?? data?.result_id,
    resultImageUrl: data?.resultimageurl ?? data?.resultImageUrl ?? data?.result_image_url,
    message: data?.message,
    error: data?.error,
    createdAt: data?.createdat ?? data?.createdAt ?? data?.created_at,
    updatedAt: data?.updatedat ?? data?.updatedAt ?? data?.updated_at,
  };
}

export async function getTryon(tryonId: string): Promise<TryonJob> {
  const data = await apiRequest<TryonResponsePayload>(`${API_ROUTES.TRYONS}/${tryonId}`);
  return fromTryonWire(data);
}

export async function getTryonList(): Promise<TryonJob[]> {
  const data = await apiRequest<TryonResponsePayload[]>(API_ROUTES.TRYONS);
  return (data || []).map(fromTryonWire);
}

export async function deleteTryon(tryonId: string): Promise<void> {
  await apiRequest<void>(`${API_ROUTES.TRYONS}/${tryonId}`, {
    method: "DELETE",
  });
}

export const createTryonJob = createTryon;
export const getTryonStatus = getTryon;