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
    return String(category ?? "").trim().toLowerCase();
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
    const query =
        category && category !== "all"
            ? `?category=${encodeURIComponent(category)}`
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

export async function getGarmentById(garmentId: string): Promise<GarmentItem> {
    const data = await apiRequest<GarmentWire>(`${API_ROUTES.GARMENTS}/${garmentId}`);
    return fromGarmentWire(data);
}