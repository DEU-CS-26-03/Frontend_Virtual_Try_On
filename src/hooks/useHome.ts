import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadGarmentDirect } from "../api/uploadApi";
import {
    getGarments,
    type GarmentItem,
    type GarmentCategory,
} from "../api/garmentApi";

export const CATEGORIES = ["all", "top", "bottom", "outer"] as const;
type HomeCategory = "all" | GarmentCategory;
type UploadCategory = "top" | "bottom" | "outer";

export function useHome() {
    const navigate = useNavigate();

    // 목록 상태
    const [category, setCategory] = useState<HomeCategory>("all");
    const [garments, setGarments] = useState<GarmentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 업로드 상태
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadCategory, setUploadCategory] = useState<UploadCategory>("top");
    const [brandName, setBrandName] = useState("");
    const [uploading, setUploading] = useState(false);

    // ── API: 의류 목록 조회 ──────────────────────────────────
    const loadGarments = async (selectedCategory: HomeCategory = "all") => {
        try {
            setLoading(true);
            setError(null);

            const data = await getGarments(
                selectedCategory === "all" ? undefined : selectedCategory
            );

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
        void loadGarments(category);
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

        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("로그인 후 의류를 등록할 수 있습니다.");
            navigate("/login");
            return;
        }

        try {
            setUploading(true);

            await uploadGarmentDirect({
                file: uploadFile,
                category: uploadCategory,
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
        category,
        setCategory,
        filteredGarments,
        loading,
        error,
        uploadFile,
        setUploadFile,
        uploadCategory,
        setUploadCategory,
        brandName,
        setBrandName,
        uploading,
        handleRegisterGarment,
        handleSelectGarment,
    };
}