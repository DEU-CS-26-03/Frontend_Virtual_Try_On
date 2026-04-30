// src/api/userImageApi.ts
import { apiRequest, API_ROUTES } from "./client";

export type UserImageView = "FRONT" | "BACK";

interface UserImageWire {
  id: string;
  fileUrl: string;
  objectKey: string;
  view: UserImageView;
  createdAt?: string;
}

export interface UserImage {
  id: string;
  fileUrl: string;
  objectKey: string;
  view: UserImageView;
  createdAt?: string;
}

function fromUserImageWire(data: UserImageWire): UserImage {
  return {
    id: data.id,
    fileUrl: data.fileUrl,
    objectKey: data.objectKey,
    view: data.view,
    createdAt: data.createdAt,
  };
}

export async function createUserImage(params: {
  fileUrl: string;
  objectKey: string;
  view: UserImageView;
}): Promise<UserImage> {
  const data = await apiRequest<UserImageWire>(API_ROUTES.USER_IMAGES, {
    method: "POST",
    body: JSON.stringify({
      fileUrl: params.fileUrl,
      objectKey: params.objectKey,
      view: params.view,
    }),
  });

  return fromUserImageWire(data);
}

export async function getUserImage(imageId: string): Promise<UserImage> {
  const data = await apiRequest<UserImageWire>(`${API_ROUTES.USER_IMAGES}/${imageId}`);
  return fromUserImageWire(data);
}