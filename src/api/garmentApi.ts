import { apiRequest, API_ROUTES } from "./client";

export type GarmentCategory = "top" | "bottom" | "outer" | "dress" | "all";

interface GarmentWire {
    id?: string;
    garmentid?: string;
    garmentId?: string;
    garment_id?: string;

    fileUrl?: string;
    fileurl?: string;
    file_url?: string;

    thumbnailUrl?: string;
    thumbnailurl?: string;
    thumbnail_url?: string;

    category?: string;

    brandKey?: string;
    brandkey?: string;
    brand_key?: string;

    brandName?: string;
    brandname?: string;
    brand_name?: string;

    name?: string;
    garmentName?: string;
    garmentname?: string;
    garment_name?: string;

    price?: number | string | null;
    garmentPrice?: number | string | null;
    garmentprice?: number | string | null;
    garment_price?: number | string | null;

    createdAt?: string;
    createdat?: string;
    created_at?: string;
}

export interface GarmentItem {
    id: string;
    fileUrl: string;
    thumbnailUrl?: string;
    category: string;
    brandName?: string;
    name?: string;
    price?: number | string | null;
    createdAt?: string;
}

function normalizeText(value?: string | null): string | undefined {
    const normalized = String(value ?? "").trim();
    return normalized || undefined;
}

function normalizeFileUrl(url?: string | null): string {
    return String(url ?? "").trim();
}

function normalizeCategory(category?: string | null): string {
    const cat = String(category ?? "").trim().toLowerCase();
    return cat === "upper" ? "top" : cat; // ★ 수정된 부분
}

function normalizePrice(value?: number | string | null): number | string | null | undefined {
    if (value === null || value === undefined || value === "") return null;

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }

    const trimmed = String(value).trim();
    if (!trimmed) return null;

    const numeric = Number(trimmed.replace(/,/g, ""));
    if (Number.isFinite(numeric)) {
        return numeric;
    }

    return trimmed;
}

function fromGarmentWire(data: GarmentWire): GarmentItem {
    return {
        id: String(data.id ?? data.garmentid ?? data.garmentId ?? data.garment_id ?? ""),
        fileUrl: normalizeFileUrl(data.fileUrl ?? data.fileurl ?? data.file_url),
        thumbnailUrl: normalizeText(
            data.thumbnailUrl ?? data.thumbnailurl ?? data.thumbnail_url
        ),
        category: normalizeCategory(data.category),
        brandName: normalizeText(
            data.brandName ??
            data.brandname ??
            data.brand_name ??
            data.brandKey ??
            data.brandkey ??
            data.brand_key
        ),
        name: normalizeText(
            data.name ??
            data.garmentName ??
            data.garmentname ??
            data.garment_name
        ),
        price: normalizePrice(
            data.price ??
            data.garmentPrice ??
            data.garmentprice ??
            data.garment_price
        ),
        createdAt: normalizeText(data.createdAt ?? data.createdat ?? data.created_at),
    };
}

export async function getGarments(category?: GarmentCategory): Promise<GarmentItem[]> {

    // DB 저장 양식(소문자)에 맞게 프론트엔드의 탭 단어를 완벽하게 번역합니다.
    let searchCategory: string | undefined = category;

    if (category) {
        const lowerCat = category.toLowerCase();

        // 프론트 탭 -> 백엔드 DB 단어 변환
        if (lowerCat === "top") {
            searchCategory = "upper";
        } else if (lowerCat === "bottom") {
            searchCategory = "bottom";
        } else if (lowerCat === "outer") {
            searchCategory = "outer";
        } else if (lowerCat === "dress") {
            searchCategory = "dress";
        }
    }

    const query =
        searchCategory && searchCategory !== "all"
            ? `?category=${encodeURIComponent(searchCategory)}`
            : "";

    const data = await apiRequest<GarmentWire[]>(`${API_ROUTES.GARMENTS}${query}`);
    return data.map(fromGarmentWire);
}

export async function createGarment(params: {
    fileUrl: string;
    category: Exclude<GarmentCategory, "all">;
    brandName?: string;
}): Promise<GarmentItem> {
    const data = await apiRequest<GarmentWire>(API_ROUTES.GARMENTS, {
        method: "POST",
        withAuth: true,
        body: JSON.stringify({
            fileUrl: params.fileUrl,
            category: params.category,
            brandName: params.brandName,
        }),
    });

    return fromGarmentWire(data);
}

export async function deleteGarment(garmentId: string): Promise<void> {
    let token = "";

    // 1. 1순위: 기존 로직대로 'user' 객체에서 토큰을 꼼꼼하게 찾아봅니다.
    const savedUser = sessionStorage.getItem("user");
    if (savedUser) {
        try {
            const parsed = JSON.parse(savedUser);
            // 백엔드 응답에 따라 키 이름이 다를 수 있으니 accessToken과 token을 모두 검사
            token = parsed.accessToken || parsed.token || "";
        } catch (e) {
            console.error("sessionStorage 'user' 파싱 실패:", e);
        }
    }

    // 2. 2순위: 혹시 user 객체에 토큰이 없다면, 스토리지에 단독으로 저장된 토큰이 있는지 싹 다 뒤집니다.
    if (!token) {
        token = sessionStorage.getItem("token") ||
            sessionStorage.getItem("accessToken") ||
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") || "";
    }

    // 3. (캡스톤 방어 코드) 토큰이 진짜 아예 없다면 굳이 에러 낼 서버까지 안 가고 여기서 컷합니다.
    if (!token) {
        alert("로그인 정보가 만료되었습니다. 다시 로그인해 주세요.");
        throw new Error("인증 토큰이 없습니다.");
    }

    // 4. 안전하게 찾은 토큰을 실어서 백엔드로 삭제(DELETE) 요청
    const response = await fetch(`${API_ROUTES.GARMENTS}/${garmentId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // ★ 정상적인 꽉 찬 토큰이 전달됨
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `삭제 실패 (Status: ${response.status})`);
    }
}

export async function getGarmentById(garmentId: string): Promise<GarmentItem> {
    const data = await apiRequest<GarmentWire>(`${API_ROUTES.GARMENTS}/${garmentId}`);
    return fromGarmentWire(data);
}