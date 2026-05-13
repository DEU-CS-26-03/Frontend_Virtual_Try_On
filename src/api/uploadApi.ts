import { API_ROUTES, ApiError } from "./client";

export interface UploadGarmentResult {
    garment_id?: string;
    garmentId?: string;
    status?: string;
    source_type?: string;
    sourceType?: string;
    category?: string;
    name?: string;
    price?: number | string | null;
    content_type?: string;
    contentType?: string;
    file_url?: string;
    fileUrl?: string;
    brand_key?: string;
    brandKey?: string;
    created_at?: string;
    createdAt?: string;
}

export async function uploadGarmentDirect(params: {
    file: File;
    category: string;
}): Promise<UploadGarmentResult> {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        throw new ApiError("로그인이 필요합니다.", 401);
    }

    const formData = new FormData();
    formData.append("file", params.file);
    formData.append("category", params.category);

    const response = await fetch(API_ROUTES.GARMENTS, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    let data: unknown;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const message =
            data &&
            typeof data === "object" &&
            "message" in data &&
            typeof (data as { message?: unknown }).message === "string"
                ? (data as { message: string }).message
                : "의류 업로드에 실패했습니다.";

        throw new ApiError(message, response.status, data);
    }

    return (data ?? {}) as UploadGarmentResult;
}