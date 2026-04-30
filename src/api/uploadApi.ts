// src/api/uploadApi.ts
import { apiRequest, API_ROUTES } from "./client";

interface ImagePresignWire {
    uploadUrl?: string;
    uploadToken?: string;
    objectKey?: string;
    uploadurl?: string;
    uploadtoken?: string;
    objectkey?: string;
}

interface UploadResultWire {
    objectKey?: string;
    fileUrl?: string;
    objectkey?: string;
    fileurl?: string;
}

export interface ImagePresignResponse {
    uploadUrl: string;
    uploadToken: string;
    objectKey: string;
}

export interface UploadResult {
    objectKey: string;
    fileUrl: string;
}

function fromPresignWire(data: ImagePresignWire): ImagePresignResponse {
    return {
        uploadUrl: String(data.uploadUrl ?? data.uploadurl ?? ""),
        uploadToken: String(data.uploadToken ?? data.uploadtoken ?? ""),
        objectKey: String(data.objectKey ?? data.objectkey ?? ""),
    };
}

function fromUploadWire(data: UploadResultWire): UploadResult {
    return {
        objectKey: String(data.objectKey ?? data.objectkey ?? ""),
        fileUrl: String(data.fileUrl ?? data.fileurl ?? ""),
    };
}

export async function createImagePresign(): Promise<ImagePresignResponse> {
    const data = await apiRequest<ImagePresignWire>(API_ROUTES.IMAGES_PRESIGN, {
        method: "POST",
    });
    return fromPresignWire(data);
}

export async function uploadByToken(
    uploadToken: string,
    file: File
): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const data = await apiRequest<UploadResultWire>(
        `${API_ROUTES.UPLOADS}/${uploadToken}`,
        {
            method: "PUT",
            body: formData,
        }
    );

    return fromUploadWire(data);
}