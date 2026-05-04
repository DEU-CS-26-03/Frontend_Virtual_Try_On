// src/api/garmentApi.ts
import { apiRequest, API_ROUTES } from "./client";

export type GarmentCategory = "top" | "bottom" | "outer" | "all";

interface GarmentWire {
    id?: string;
    garmentid?: string;
    garmentId?: string;
    fileUrl?: string;
    fileurl?: string;
    file_url?: string;
    category?: string;
    brandName?: string;
    brandname?: string;
    brand_name?: string;
    createdAt?: string;
    createdat?: string;
}

export interface GarmentItem {
    id: string;
    fileUrl: string;
    category: string;
    brandName?: string;
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

function normalizeCategory(category?: string): string {
    return String(category ?? "").trim().toLowerCase();
}

function fromGarmentWire(data: GarmentWire): GarmentItem {
    return {
        id: String(data.id ?? data.garmentid ?? data.garmentId ?? ""),
        fileUrl: normalizeFileUrl(data.fileUrl ?? data.fileurl ?? data.file_url),
        category: normalizeCategory(data.category),
        brandName: data.brandName ?? data.brandname ?? data.brand_name,
        createdAt: data.createdAt ?? data.createdat,
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
    file: File;
    category: Exclude<GarmentCategory, "all">;
    brandName?: string;
}): Promise<GarmentItem> {
    const formData = new FormData();
    formData.append("file", params.file);
    formData.append("category", params.category);
    if (params.brandName) {
        formData.append("brandName", params.brandName);
    }

    const data = await apiRequest<GarmentWire>(API_ROUTES.GARMENTS, {
        method: "POST",
        body: formData,
        isFormData: true,
    });

    return fromGarmentWire(data);
}

export async function getGarmentById(garmentId: string): Promise<GarmentItem> {
    const data = await apiRequest<GarmentWire>(`${API_ROUTES.GARMENTS}/${garmentId}`);
    return fromGarmentWire(data);
}