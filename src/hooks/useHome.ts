// src/hooks/useHome.ts
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createImagePresign, uploadByToken } from "../api/uploadApi";
import { createGarment, getGarments, type GarmentItem } from "../api/garmentApi";

export const CATEGORIES = ["all", "top", "bottom", "outer"] as const;

export function useHome() {
    const navigate = useNavigate();

    // 목록 상태
    const [category, setCategory] = useState("all");
    const [garments, setGarments] = useState<GarmentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 업로드 상태
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadCategory, setUploadCategory] = useState("top");
    const [brandName, setBrandName] = useState("");
    const [uploading, setUploading] = useState(false);

    // ── API: 의류 목록 조회 ──────────────────────────────────
    const loadGarments = async (selectedCategory = "all") => {
        try {
            setLoading(true);
            setError(null);
            const data = await getGarments(selectedCategory);
            setGarments(data);
        } catch (err) {
            console.error("의류 목록 조회 실패:", err);
            setError("의류 목록을 불러오지 못했습니다. 서버 연결을 확인해주세요.");
            setGarments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGarments(category);
    }, [category]);

    // 카테고리 필터링은 API에서 처리하지만, 클라이언트 사이드 필터도 보조
    const filteredGarments = useMemo(() => {
        if (category === "all") return garments;
        return garments.filter((item) => item.category === category);
    }, [category, garments]);

    // ── API: 의류 등록 ────────────────────────────────────────
    const handleRegisterGarment = async () => {
        if (!uploadFile) {
            alert("업로드할 의류 이미지를 선택해주세요.");
            return;
        }

        try {
            setUploading(true);

            // 1) presign URL 발급 (Spring → Oracle Object Storage)
            const presign = await createImagePresign();
            // 2) 이미지 업로드
            const uploaded = await uploadByToken(presign.uploadToken, uploadFile);
            // 3) garments 테이블 등록
            await createGarment({
                fileUrl: uploaded.fileUrl,
                category: uploadCategory,
                brandName: brandName.trim(),
            });

            alert("의류 등록이 완료되었습니다.");
            setUploadFile(null);
            setBrandName("");
            setUploadCategory("top");
            await loadGarments(category);
        } catch (err) {
            console.error("의류 등록 실패:", err);
            alert("의류 등록에 실패했습니다.");
        } finally {
            setUploading(false);
        }
    };

    // ── 피팅 페이지 이동 ─────────────────────────────────────
    const handleSelectGarment = (item: GarmentItem) => {
        navigate("/fitting", {
            state: {
                cloth: item.fileUrl,
                garmentId: item.id,
            },
        });
    };

    return {
        // 목록
        category,
        setCategory,
        filteredGarments,
        loading,
        error,
        // 업로드 폼
        uploadFile,
        setUploadFile,
        uploadCategory,
        setUploadCategory,
        brandName,
        setBrandName,
        uploading,
        // 핸들러
        handleRegisterGarment,
        handleSelectGarment,
    };
}