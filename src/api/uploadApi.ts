import { API_ROUTES, ApiError } from "./client";

export interface UploadGarmentResult {
    garmentId?: string;
    name?: string;
    brandName?: string;
    category?: string;
    price?: number | string | null;
    fileUrl?: string;
}

// ★ 파라미터 타입 확장: name, brandName, price 추가
export async function uploadGarmentDirect(params: {
    file: File | null; // ★ 파일이 선택되지 않았을 때 null 허용
    category: string;
    name?: string;
    brandName?: string;
    price?: string;
    fileUrl?: string; // ★ URL 직접 입력 지원을 위한 선택적 필드
}): Promise<UploadGarmentResult> {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        throw new ApiError("로그인이 필요합니다.", 401);
    }

    const formData = new FormData();
    if (params.file) {
        formData.append("file", params.file);
    }
    formData.append("category", params.category);

    // ★ 추가: 텍스트 정보들을 FormData에 추가 (백엔드 파라미터명과 일치시켜야 함)
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
            // 주의: FormData를 보낼 때는 Content-Type을 직접 설정하지 않습니다. (브라우저가 자동으로 Boundary를 생성함)
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