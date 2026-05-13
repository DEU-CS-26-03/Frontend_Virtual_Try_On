// src/pages/Home.tsx
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { uploadGarmentDirect } from "../api/uploadApi";
import { getGarments, type GarmentItem } from "../api/garmentApi";
import HomePage, {
  type HomeBanner,
  type HomeCategory,
  type HomeDisplayGarment,
} from "./HomePage";

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

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://apivirtualtryon.p-e.kr";

type ExtendedGarmentItem = GarmentItem & {
  id?: string;
  garmentId?: string;
  name?: string | null;
  brandName?: string | null;
  category?: string | null;
  fileUrl?: string | null;
  thumbnailUrl?: string | null;
  price?: number | string | null;
};

const normalizeFileUrl = (url?: string | null) => {
  if (!url) return "";

  if (url.startsWith("https://")) return url;

  if (url.startsWith("http://217.142.255.158")) {
    return url.replace("http://217.142.255.158", API_BASE_URL);
  }

  if (url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }

  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  return `${API_BASE_URL}/${url}`;
};

const normalizeCategory = (category?: string | null): HomeCategory => {
  const value = (category ?? "").trim().toLowerCase();

  if (value === "top" || value === "상의" || value === "shirt" || value === "shirts") {
    return "top";
  }

  if (
      value === "bottom" ||
      value === "하의" ||
      value === "바지" ||
      value === "pants" ||
      value === "pant" ||
      value === "shorts" ||
      value === "trousers"
  ) {
    return "bottom";
  }

  if (value === "outer" || value === "아우터" || value === "jacket" || value === "coat") {
    return "outer";
  }

  if (
      value === "dress" ||
      value === "원피스" ||
      value === "onepiece" ||
      value === "one-piece" ||
      value === "skirt" ||
      value === "치마" ||
      value === "원피스/스커트"
  ) {
    return "dress";
  }

  return "all";
};

const getDisplayName = (item: GarmentItem) => {
  const garment = item as ExtendedGarmentItem;

  const dbName = garment.name?.trim();
  if (dbName) return dbName;

  const brandName = garment.brandName?.trim();
  if (brandName) return brandName;

  return "이름 없음";
};

const getDisplayPrice = (price?: number | string | null) => {
  if (price === null || price === undefined || price === "") return "N/A";

  if (typeof price === "number") {
    return Number.isFinite(price) ? price.toLocaleString("ko-KR") : "N/A";
  }

  const raw = String(price).trim();
  if (!raw) return "N/A";

  const numeric = Number(raw.replace(/,/g, ""));
  if (Number.isFinite(numeric)) {
    return numeric.toLocaleString("ko-KR");
  }

  return "N/A";
};

const getDisplayGarmentId = (item: GarmentItem) => {
  const garment = item as ExtendedGarmentItem;
  return garment.id || garment.garmentId || "";
};

const toDisplayGarment = (item: GarmentItem): HomeDisplayGarment => {
  const garment = item as ExtendedGarmentItem;
  const normalizedCategory = normalizeCategory(garment.category);

  return {
    garmentId: getDisplayGarmentId(item),
    name: getDisplayName(item),
    category: CATEGORY_LABEL_MAP[normalizedCategory],
    fileUrl: normalizeFileUrl(garment.thumbnailUrl || garment.fileUrl),
    price: getDisplayPrice(garment.price),
  };
};

const Home = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<HomeCategory>("all");
  const [currentBanner, setCurrentBanner] = useState(0);
  const [garments, setGarments] = useState<GarmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const selectedApiCategory = useMemo(() => category, [category]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNER_DATA.length);
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  const loadGarments = useCallback(
      async (selectedCategory: HomeCategory = selectedApiCategory) => {
        try {
          setLoading(true);
          const data = await getGarments(selectedCategory);
          setGarments(data);
        } catch (error) {
          console.error("의류 목록 조회 실패:", error);
          setGarments([]);
          alert("의류 목록을 불러오지 못했습니다.");
        } finally {
          setLoading(false);
        }
      },
      [selectedApiCategory]
  );

  useEffect(() => {
    void loadGarments(selectedApiCategory);
  }, [selectedApiCategory, loadGarments]);

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

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인 후 의상을 업로드할 수 있습니다.");
      navigate("/login");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const uploadCategory: HomeCategory =
        selectedApiCategory === "all" ? "top" : selectedApiCategory;

    try {
      setUploading(true);

      await uploadGarmentDirect({
        file,
        category: uploadCategory,
      });

      await loadGarments(selectedApiCategory);
    } catch (error) {
      console.error("의류 업로드 실패:", error);
      alert("의류 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
      <HomePage
          banners={BANNER_DATA}
          currentBanner={currentBanner}
          onPrevBanner={() =>
              setCurrentBanner((prev) => (prev - 1 + BANNER_DATA.length) % BANNER_DATA.length)
          }
          onNextBanner={() =>
              setCurrentBanner((prev) => (prev + 1) % BANNER_DATA.length)
          }
          categories={UI_CATEGORIES.map((item) => item.value)}
          category={category}
          setCategory={setCategory}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
          garments={displayGarments}
          loading={loading}
          uploading={uploading}
          handleFittingClick={handleFittingClick}
      />
  );
};

export default Home;