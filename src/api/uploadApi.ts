import { API_ROUTES, ApiError } from "./client";

export interface UploadGarmentResult {
    garmentId?: string;
    name?: string;
    brandName?: string;
    category?: string;
    price?: number | string | null;
    fileUrl?: string;
}

export async function uploadGarmentDirect(params: {
    file: File | null;
    category: string;
    name?: string;
    brandName?: string;
    price?: string;
    fileUrl?: string;
}): Promise<UploadGarmentResult> {

    // 💡 [수정된 부분]: 완벽한 토큰 탐색 로직 (user 파싱 포함)
    let token = "";
    const savedUser = sessionStorage.getItem("user");
    if (savedUser) {
        try {
            const parsed = JSON.parse(savedUser);
            token = parsed.accessToken || parsed.token || "";
        } catch (e) {
            console.error("토큰 파싱 에러:", e);
        }
    }
    if (!token) {
        token = sessionStorage.getItem("token") ||
            sessionStorage.getItem("accessToken") ||
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") || "";
    }

    if (!token) {
        throw new ApiError("로그인이 필요합니다.", 401);
    }

    const formData = new FormData();
    if (params.file) {
        formData.append("file", params.file);
    }
    formData.append("category", params.category);

    if (params.name) formData.append("name", params.name);
    if (params.brandName) formData.append("brandName", params.brandName);
    if (params.price) formData.append("price", params.price);
    if (params.fileUrl) {
        formData.append("fileUrl", params.fileUrl);
    }

    const response = await fetch(API_ROUTES.GARMENTS, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            // 주의: FormData를 보낼 때는 Content-Type을 직접 설정하지 않습니다.
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
        const message = data && typeof data === "object" && "message" in data
            ? String((data as { message: string }).message)
            : "의류 업로드에 실패했습니다.";
        throw new ApiError(message, response.status, data);
    }

    return (data ?? {}) as UploadGarmentResult;
}