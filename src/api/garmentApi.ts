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

// 💡 1. 백엔드에서 온 중구난방 카테고리를 프론트 탭에 맞게 완벽히 정리
export function normalizeCategory(category?: string | null): string {
    const cat = String(category ?? "").trim().toLowerCase();

    if (cat === "upper" || cat === "top") return "top";
    if (cat === "lower" || cat === "bottom") return "bottom";
    if (cat === "overall" || cat === "dress") return "dress";
    if (cat === "outer") return "outer";

    return cat || "top";
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

// 💡 2. 완벽하게 하나로 통합된 getGarments 함수
export async function getGarments(category?: string): Promise<GarmentItem[]> {
    // ① 전체 의류 목록을 조건 없이 다 가져옵니다. (의류 목록 조회는 보통 토큰 없이도 가능하도록 설계됨)
    const data = await apiRequest<GarmentWire[]>(API_ROUTES.GARMENTS);

    // ② 가져온 데이터들의 카테고리를 프론트 기준(top, bottom, outer, dress)으로 전부 예쁘게 정리합니다.
    const allGarments = data.map(fromGarmentWire);

    // ③ 'all' 탭이거나 카테고리가 없으면 전부 보여줍니다.
    if (!category || category === "all") {
        return allGarments;
    }

    // ④ 특정 탭을 눌렀을 때는 해당 탭의 이름과 정확히 일치하는 옷만 걸러서 보여줍니다.
    const targetCategory = category.toLowerCase();
    return allGarments.filter(item => item.category === targetCategory);
}

// 💡 3. 옷 등록 API (반드시 withAuth: true 필요)
export async function createGarment(params: {
    fileUrl: string;
    category: Exclude<GarmentCategory, "all">;
    brandName?: string;
}): Promise<GarmentItem> {
    const data = await apiRequest<GarmentWire>(API_ROUTES.GARMENTS, {
        method: "POST",
        withAuth: true, // ★ 로그인 토큰 자동 포함
        body: JSON.stringify({
            fileUrl: params.fileUrl,
            category: params.category,
            brandName: params.brandName,
        }),
    });

    return fromGarmentWire(data);
}

// 💡 4. 옷 삭제 API (지저분한 로직 버리고 apiRequest로 통일!)
export async function deleteGarment(garmentId: string): Promise<void> {
    await apiRequest(`${API_ROUTES.GARMENTS}/${garmentId}`, {
        method: "DELETE",
        withAuth: true, // ★ 로그인 토큰 자동 포함 (401 에러 방지)
    });
}

// 💡 5. 특정 옷 상세 조회 API
export async function getGarmentById(garmentId: string): Promise<GarmentItem> {
    const data = await apiRequest<GarmentWire>(`${API_ROUTES.GARMENTS}/${garmentId}`);
    return fromGarmentWire(data);
}