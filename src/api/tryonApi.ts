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
  // 기존 string에서 ClothCategory로 변경하여 안정성 강화
  clothType: ClothCategory;
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

// ★ 추가됨: any를 대체하기 위해 백엔드의 모든 응답 케이스를 커버하는 인터페이스 선언
interface TryonResponsePayload {
  data?: TryonResponsePayload; // { data: { ... } } 형태로 올 경우 방어
  tryonid?: string;
  tryonId?: string;
  tryon_id?: string;
  id?: string;
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

// any 대신 명시적 타입 적용
function fromTryonWire(payload: TryonResponsePayload): TryonJob {
  const data = payload?.data ? payload.data : payload;

  return {
    tryonId: String(data?.tryonid ?? data?.tryonId ?? data?.tryon_id ?? data?.id ?? ""),
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
  // any 대신 명시적 타입 적용
  const data = await apiRequest<TryonResponsePayload>(`${API_ROUTES.TRYONS}/${tryonId}`);
  return fromTryonWire(data);
}

export async function getTryonList(): Promise<TryonJob[]> {
  // any[] 대신 명시적 배열 타입 적용
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