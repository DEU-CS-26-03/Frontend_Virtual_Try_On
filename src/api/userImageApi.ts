// src/api/userImageApi.ts
import { apiRequest, API_ROUTES } from "./client";

export type UserImageView = "FRONT" | "BACK";

interface UserImageWire {
  id?: string;
  imageid?: string;
  imageId?: string;
  fileUrl?: string;
  fileurl?: string;
  objectKey?: string;
  objectkey?: string;
  view?: string;
  filename?: string;
  createdAt?: string;
  createdat?: string;
}

export interface UserImage {
  id: string;
  fileUrl: string;
  objectKey?: string;
  view: UserImageView;
  filename?: string;
  createdAt?: string;
}

function normalizeFileUrl(url?: string): string {
  const value = String(url ?? "").trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;

  const base = String(import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
  if (!base) return value.startsWith("/") ? value : `/${value}`;

  return `${base}${value.startsWith("/") ? value : `/${value}`}`;
}

function normalizeView(view?: string): UserImageView {
  return String(view ?? "FRONT").toUpperCase() === "BACK" ? "BACK" : "FRONT";
}

function fromUserImageWire(data: UserImageWire): UserImage {
  return {
    id: String(data.id ?? data.imageid ?? data.imageId ?? ""),
    fileUrl: normalizeFileUrl(data.fileUrl ?? data.fileurl),
    objectKey: data.objectKey ?? data.objectkey,
    view: normalizeView(data.view),
    filename: data.filename,
    createdAt: data.createdAt ?? data.createdat,
  };
}

export async function createUserImage(params: {
  file: File;
  view?: UserImageView;
}): Promise<UserImage> {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("view", (params.view ?? "FRONT").toLowerCase());

  const data = await apiRequest<UserImageWire>(API_ROUTES.USER_IMAGES, {
    method: "POST",
    body: formData,
    isFormData: true,
  });

  return fromUserImageWire(data);
}

export async function getUserImages(): Promise<UserImage[]> {
  const data = await apiRequest<UserImageWire[]>(API_ROUTES.USER_IMAGES);
  return data.map(fromUserImageWire);
}

export async function getUserImage(imageId: string): Promise<UserImage> {
  const data = await apiRequest<UserImageWire>(`${API_ROUTES.USER_IMAGES}/${imageId}`);
  return fromUserImageWire(data);
}