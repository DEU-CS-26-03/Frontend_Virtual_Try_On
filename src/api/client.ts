export const API_ORIGIN =
    import.meta.env.VITE_API_BASE_URL || "https://apivirtualtryon.p-e.kr";

export const API_BASE_URL = `${API_ORIGIN}/api/v1`;

export const API_ROUTES = {
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_REGISTER: `${API_BASE_URL}/auth/register`,
  AUTH_ME: `${API_BASE_URL}/users/me`,
  USER_IMAGES: `${API_BASE_URL}/user-images`,
  GARMENTS: `${API_BASE_URL}/garments`,
  FAVORITES: `${API_BASE_URL}/favorites`,
  TRYONS: `${API_BASE_URL}/tryons`,
  RESULTS: `${API_BASE_URL}/results`,
  HEALTH: `${API_BASE_URL}/model-health`,
  IMAGES_PRESIGN: `${API_BASE_URL}/images/presign`,
  UPLOADS: `${API_BASE_URL}/uploads`,
};

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type ApiRequestOptions = RequestInit & {
  isFormData?: boolean;
  withAuth?: boolean;
  token?: string | null;
};

// 💡 [핵심 수정]: 토큰 파싱 안전성 강화 (sessionStorage 최우선)
function getAccessToken(): string | null {
  try {
    let token = sessionStorage.getItem("accessToken");

    if (!token) {
      const savedUser = sessionStorage.getItem("user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        token = parsed.accessToken || parsed.token || "";
      }
    }

    if (!token) {
      token = localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
    }

    return token ? token : null;
  } catch {
    return null;
  }
}

async function parseResponse(res: Response) {
  const contentType = res.headers.get("content-type") ?? "";

  if (res.status === 204) return null;
  if (contentType.includes("application/json")) return res.json();
  return res.text();
}

export async function apiRequest<T = unknown>(
    url: string,
    options: ApiRequestOptions = {}
): Promise<T> {
  const {
    isFormData = false,
    withAuth = false,
    token,
    headers,
    ...restOptions
  } = options;

  const finalHeaders = new Headers(headers);

  // 💡 [핵심]: withAuth가 true일 때만 토큰을 찾고, 없으면 에러 던짐
  if (withAuth) {
    const accessToken = token ?? getAccessToken();
    if (!accessToken) {
      throw new ApiError("로그인이 필요합니다.", 401);
    }
    finalHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  if (!isFormData && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...restOptions,
    headers: finalHeaders,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
        typeof data === "object" && data !== null && "message" in data
            ? String((data as { message?: unknown }).message ?? `HTTP ${response.status}`)
            : typeof data === "string" && data
                ? data
                : `HTTP ${response.status}`;

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}