// src/api/client.ts
export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://apivirtualtryon.p-e.kr:8080";

export const API_ROUTES = {
  LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
  ME: `${API_BASE_URL}/api/v1/users/me`,
  FAVORITES: `${API_BASE_URL}/api/v1/favorites`,
  TRYONS: `${API_BASE_URL}/api/v1/tryons`,
  IMAGES_PRESIGN: `${API_BASE_URL}/api/v1/images/presign`,
  USER_IMAGES: `${API_BASE_URL}/api/v1/user-images`,
  GARMENTS: `${API_BASE_URL}/api/v1/garments`,
  UPLOADS: `${API_BASE_URL}/api/v1/uploads`,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorMessage(data: unknown): string {
  if (isRecord(data) && typeof data.message === "string") {
    return data.message;
  }
  return "API 요청 실패";
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest<T>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("accessToken");

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data: unknown;
  const text = await response.text();

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("accessToken");
    }
    throw new ApiError(getErrorMessage(data), response.status, data);
  }

  return data as T;
}