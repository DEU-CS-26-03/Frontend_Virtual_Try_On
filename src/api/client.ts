// src/api/client.ts
export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://apivirtualtryon.p-e.kr:8080";

export const API_ROUTES = {
  AUTH_LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
  AUTH_REGISTER: `${API_BASE_URL}/api/v1/auth/register`,
  AUTH_ME: `${API_BASE_URL}/api/v1/users/me`,
  USER_IMAGES: `${API_BASE_URL}/api/v1/user-images`,
  GARMENTS: `${API_BASE_URL}/api/v1/garments`,
  FAVORITES: `${API_BASE_URL}/api/v1/favorites`,
  TRYONS: `${API_BASE_URL}/api/v1/tryons`,
  RESULTS: `${API_BASE_URL}/api/v1/results`,
  HEALTH: `${API_BASE_URL}/api/v1/model-health`,
  IMAGES_PRESIGN: `${API_BASE_URL}/api/v1/images/presign`,
  UPLOADS: `${API_BASE_URL}/api/v1/uploads`,
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
  token?: string | null;
};

function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
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
    token = getAccessToken(),
    headers,
    ...restOptions
  } = options;

  const finalHeaders = new Headers(headers);

  if (token) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
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