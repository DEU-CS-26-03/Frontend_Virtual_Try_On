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
  result_url?: string; // 💡 백엔드 결과 매핑 방어용
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
    withAuth: true, // ✨ 핵심 해결: 이제 이 요청에 로그인 토큰이 실려서 날아갑니다!
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

// 💡 [추가됨]: 백엔드의 물리적 경로(/data/uploads/...)를 웹에서 볼 수 있는 진짜 URL로 변환해주는 마법의 함수
const parseBackendPathToUrl = (dbPath?: string): string => {
  if (!dbPath) return "";
  if (dbPath.startsWith("http") || dbPath.startsWith("data:") || dbPath.startsWith("blob:")) return dbPath;

  const filename = dbPath.split('/').pop() || "";
  const baseUrl = "https://apivirtualtryon.p-e.kr";
  if (filename.startsWith("result_")) return `${baseUrl}/uploads/results/${filename}`;
  return `${baseUrl}/uploads/${filename}`;
};

// 💡 [수정됨]: userImageId와 garmentId를 파싱할 때 변환 함수(parseBackendPathToUrl)를 거치도록 씌워줍니다!
function fromTryonWire(payload: TryonResponsePayload): TryonJob {
  const data = payload?.data ? payload.data : payload;

  return {
    tryonId: String(data?.tryonid ?? data?.tryonId ?? data?.tryon_id ?? data?.id ?? ""),
    userId: data?.userId ?? data?.user_id ?? 0,
    status: normalizeStatus(data?.status),
    progress: Number(data?.progress ?? 0),

    // ✨ 핵심: 여기서 백엔드의 엉터리 로컬 경로를 웹 주소로 완벽하게 포장해서 리턴합니다!
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
    withAuth: true, // ✨ 상태 조회 시에도 내 권한 증명
  });
  return fromTryonWire(data);
}

export async function getTryonList(): Promise<TryonJob[]> {
  const data = await apiRequest<TryonResponsePayload[]>(API_ROUTES.TRYONS, {
    withAuth: true, // ✨ 목록 조회 시에도 내 권한 증명
  });
  return (data || []).map(fromTryonWire);
}

export async function deleteTryon(tryonId: string): Promise<void> {
  await apiRequest<void>(`${API_ROUTES.TRYONS}/${tryonId}`, {
    method: "DELETE",
    withAuth: true, // ✨ 삭제 시에도 내 권한 증명
  });
}

export const createTryonJob = createTryon;
export const getTryonStatus = getTryon;