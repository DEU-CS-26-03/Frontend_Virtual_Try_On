import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadGarmentDirect } from "../api/uploadApi";
import { getGarments, type GarmentItem } from "../api/garmentApi";
import HomePage, { type HomeBanner, type HomeCategory, type HomeDisplayGarment } from "./HomePage";
import UploadModal, { type UploadFormData } from "../components/upload/UploadModal";

// ★ 1. any 제거를 위한 백엔드 전용 카테고리 타입 선언
type ApiCategory = "upper" | "lower" | "overall";

const BANNER_DATA: HomeBanner[] = [
  {
    id: 1,
    title: "상상하던 스타일, 실시간 AI 가상 피팅으로 확인하세요",
    sub: "모델에게 옷을 입히듯, 당신의 사진 위에 새로운 스타일을 즉시 얹어보세요.",
    img: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1600",
    tag: "AI VIRTUAL TRY-ON",
  },
  {
    id: 2,
    title: "클릭 한 번으로 완성되는 나만의 가상 드레스룸",
    sub: "복잡한 시착 과정 없이 원하는 옷을 고르고 즉시 피팅 결과를 확인하세요.",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600",
    tag: "SMART FITTING",
  },
];

const UI_CATEGORIES: ReadonlyArray<{ label: string; value: HomeCategory }> = [
  { label: "전체", value: "all" },
  { label: "상의", value: "top" },
  { label: "바지", value: "bottom" },
  { label: "아우터", value: "outer" },
  { label: "원피스/스커트", value: "dress" },
];

const CATEGORY_LABEL_MAP: Record<HomeCategory, string> = {
  all: "전체",
  top: "상의",
  bottom: "바지",
  outer: "아우터",
  dress: "원피스/스커트",
};

// ★ 2. CATEGORY_API_MAP에 ApiCategory 타입을 명시하여 any 발생 방지
const CATEGORY_API_MAP: Record<HomeCategory, ApiCategory> = {
  all: "upper",
  top: "upper",
  bottom: "lower",
  outer: "upper",
  dress: "overall",
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://apivirtualtryon.p-e.kr";

type ExtendedGarmentItem = GarmentItem & {
  garmentId?: string;
  name?: string | null;
  brandName?: string | null;
  category?: string | null;
  fileUrl?: string | null;
  thumbnailUrl?: string | null;
  price?: number | string | null;
};

const normalizeFileUrl = (url?: string | null): string => {
  if (!url) return "";
  if (url.startsWith("https://")) return url;
  if (url.startsWith("http://217.142.255.158")) return url.replace("http://217.142.255.158", API_BASE_URL);
  if (url.startsWith("http://")) return url.replace("http://", "https://");
  if (url.startsWith("/")) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}/${url}`;
};

const normalizeCategory = (category?: string | null): HomeCategory => {
  const value = (category ?? "").trim().toLowerCase();
  if (["top", "상의", "shirt", "shirts"].includes(value)) return "top";
  if (["bottom", "하의", "바지", "pants", "pant", "shorts", "trousers"].includes(value)) return "bottom";
  if (["outer", "아우터", "jacket", "coat"].includes(value)) return "outer";
  if (["dress", "원피스", "onepiece", "one-piece", "skirt", "치마"].includes(value)) return "dress";
  return "all";
};

const getDisplayName = (item: GarmentItem): string => {
  const garment = item as ExtendedGarmentItem;
  return garment.name?.trim() || garment.brandName?.trim() || "이름 없음";
};

const getDisplayPrice = (price?: number | string | null): string => {
  if (price === null || price === undefined || price === "") return "N/A";
  if (typeof price === "number") return Number.isFinite(price) ? price.toLocaleString("ko-KR") : "N/A";
  const raw = String(price).trim();
  const numeric = Number(raw.replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric.toLocaleString("ko-KR") : "N/A";
};

const toDisplayGarment = (item: GarmentItem): HomeDisplayGarment => {
  const garment = (item as unknown) as ExtendedGarmentItem;
  const normalizedCategory = normalizeCategory(garment.category);

  return {
    garmentId: String(garment.id || garment.garmentId || ""),
    name: getDisplayName(item),
    category: CATEGORY_LABEL_MAP[normalizedCategory],
    fileUrl: normalizeFileUrl(garment.thumbnailUrl || garment.fileUrl),
    price: getDisplayPrice(garment.price),
  };
};

const Home = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<HomeCategory>("all");
  const [currentBanner, setCurrentBanner] = useState(0);
  const [garments, setGarments] = useState<GarmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNER_DATA.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const loadGarments = useCallback(async (selectedCategory: HomeCategory) => {
    try {
      setLoading(true);
      const data = await getGarments(selectedCategory);
      setGarments(data);
    } catch (error) {
      console.error("의류 목록 조회 실패:", error);
      setGarments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGarments(category);
  }, [category, loadGarments]);

  const displayGarments = useMemo(() => garments.map(toDisplayGarment), [garments]);

  const handleFittingClick = (item: HomeDisplayGarment) => {
    const token = localStorage.getItem("accessToken");
    navigate("/fitting", {
      state: {
        cloth: item.fileUrl,
        garmentId: item.garmentId,
        name: item.name,
        price: item.price,
        isGuest: !token,
      },
    });
  };

  // ★ 4. any 에러 해결된 업로드 핸들러
  const handleModalUpload = async (formData: UploadFormData) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      setUploading(true);
      const apiCategory = CATEGORY_API_MAP[formData.category];

      // ★ 수정: API 호출 시 모든 필드를 누락 없이 전달합니다.
      await uploadGarmentDirect({
        file: formData.file,
        category: apiCategory as unknown as string,
        name: formData.name,       // 추가됨
        brandName: formData.brandName, // 추가됨
        price: formData.price,      // 추가됨
      });

      await loadGarments(category); // 목록 새로고침
      alert("성공적으로 옷이 등록되었습니다!");
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error("업로드 에러:", error);
      alert("업로드 실패 (Spring 서버의 파라미터 설정을 확인해주세요)");
    } finally {
      setUploading(false);
    }
  };

  return (
      <>
        <HomePage
            banners={BANNER_DATA}
            currentBanner={currentBanner}
            onPrevBanner={() => setCurrentBanner((prev) => (prev - 1 + BANNER_DATA.length) % BANNER_DATA.length)}
            onNextBanner={() => setCurrentBanner((prev) => (prev + 1) % BANNER_DATA.length)}
            categories={UI_CATEGORIES.map((item) => item.value)}
            category={category}
            setCategory={setCategory}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            garments={displayGarments}
            loading={loading}
            uploading={uploading}
            handleFittingClick={handleFittingClick}
        />

        <UploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onUpload={handleModalUpload}
        />
      </>
  );
};

export default Home;