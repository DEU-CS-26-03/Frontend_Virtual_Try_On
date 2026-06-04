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
// +++ [디벨롭 1]: 하위 폴더(user-images, garments) 경로 증발 방지 및 엑박(404) 해결 +++
const parseBackendPathToUrl = (dbPath?: string): string => {
  if (!dbPath) return "";
  if (dbPath.startsWith("http") || dbPath.startsWith("data:") || dbPath.startsWith("blob:")) return dbPath;

  const filename = dbPath.split('/').pop() || "";
  const baseUrl = "https://apivirtualtryon.p-e.kr";

  // 백엔드 물리 경로 또는 DB 저장 값에 따라 안전하게 하위 디렉토리 복원
  if (filename.startsWith("result_") || dbPath.includes("results")) {
    return `${baseUrl}/uploads/results/${filename}`;
  }
  if (dbPath.includes("user-images")) {
    return `${baseUrl}/uploads/user-images/${filename}`;
  }
  if (dbPath.includes("garments")) {
    return `${baseUrl}/uploads/garments/${filename}`;
  }

  // 예외적인 기본 fallback
  return `${baseUrl}/uploads/${filename}`;
};

function fromTryonWire(payload: TryonResponsePayload): TryonJob {
  const data = payload?.data ? payload.data : payload;

  return {
    tryonId: String(data?.tryonid ?? data?.tryonId ?? data?.tryon_id ?? data?.id ?? ""),
    userId: data?.userId ?? data?.user_id ?? 0,
    status: normalizeStatus(data?.status),
    progress: Number(data?.progress ?? 0),

    // 파싱 함수 적용 (경로 복원 완료)
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

// +++ [디벨롭 2]: ESLint의 'any' 금지 에러 해결. 정확한 타입 검사로 Vercel 배포 억까 방어 +++
export async function getTryonList(): Promise<TryonJob[]> {
  // any 대신 명확하게 '배열' 또는 'data 객체 안에 배열'이 올 수 있다고 명시합니다.
  const response = await apiRequest<TryonResponsePayload[] | { data?: TryonResponsePayload[] }>(API_ROUTES.TRYONS, {
    withAuth: true,
  });

  let dataArray: TryonResponsePayload[] = [];

  // Spring 백엔드가 배열을 바로 줬는지, 객체로 감싸서 줬는지 타입에 맞게 안전하게 꺼냅니다.
  if (Array.isArray(response)) {
    dataArray = response;
  } else if (response && typeof response === 'object' && Array.isArray(response.data)) {
    dataArray = response.data;
  }

  // item: any 대신 TryonResponsePayload 타입을 사용하여 ESLint 에러를 완벽히 없앱니다.
  return dataArray.map((item: TryonResponsePayload) => fromTryonWire(item));
}

export async function deleteTryon(tryonId: string): Promise<void> {
  await apiRequest<void>(`${API_ROUTES.TRYONS}/${tryonId}`, {
    method: "DELETE",
    withAuth: true,
  });
}

// 명칭 매핑 내보내기 (이 부분에서 getTryon을 찾지 못했던 에러도 해결됩니다)
export const createTryonJob = createTryon;
export const getTryonStatus = getTryon;