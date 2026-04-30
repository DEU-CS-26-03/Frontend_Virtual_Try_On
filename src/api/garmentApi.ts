// src/api/garmentApi.ts
import { apiRequest, API_ROUTES } from "./client";

export type GarmentCategory = "top" | "bottom" | "outer" | "all";

interface GarmentWire {
    id?: string;
    garmentid?: string;
    fileUrl?: string;
    file_url?: string;
    category?: string;
    brandName?: string;
    brand_name?: string;
    createdAt?: string;
}

export interface GarmentItem {
    id: string;
    fileUrl: string;
    category: string;
    brandName?: string;
    createdAt?: string;
}

function fromGarmentWire(data: GarmentWire): GarmentItem {
    return {
        id: String(data.id ?? data.garmentid ?? ""),
        fileUrl: String(data.fileUrl ?? data.file_url ?? ""),
        category: String(data.category ?? ""),
        brandName: data.brandName ?? data.brand_name,
        createdAt: data.createdAt,
    };
}

export async function getGarments(category?: string): Promise<GarmentItem[]> {
    const query = category && category !== "all" ? `?category=${encodeURIComponent(category)}` : "";
    const data = await apiRequest<GarmentWire[]>(`${API_ROUTES.GARMENTS}${query}`);
    return data.map(fromGarmentWire);
}

export async function createGarment(params: {
    fileUrl: string;
    category: string;
    brandName?: string;
}): Promise<GarmentItem> {
    const data = await apiRequest<GarmentWire>(API_ROUTES.GARMENTS, {
        method: "POST",
        body: JSON.stringify({
            fileUrl: params.fileUrl,
            category: params.category,
            brandName: params.brandName ?? "",
        }),
    });

    return fromGarmentWire(data);
}

export async function getGarmentById(garmentId: string): Promise<GarmentItem> {
    const data = await apiRequest<GarmentWire>(`${API_ROUTES.GARMENTS}/${garmentId}`);
    return fromGarmentWire(data);
}