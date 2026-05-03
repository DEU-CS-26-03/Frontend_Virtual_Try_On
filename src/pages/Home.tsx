// src/pages/Home.tsx
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createImagePresign, uploadByToken } from "../api/uploadApi";
import { createGarment, getGarments, type GarmentItem } from "../api/garmentApi";
import HomePage, { type HomeBanner, type HomeDisplayGarment } from "./HomePage";

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

const UI_CATEGORIES = [
  { label: "전체", value: "all" },
  { label: "상의", value: "top" },
  { label: "하의", value: "bottom" },
  { label: "아우터", value: "outer" },
] as const;

const CATEGORY_LABEL_MAP: Record<string, string> = {
  all: "전체",
  top: "상의",
  bottom: "하의",
  outer: "아우터",
};

const getApiCategory = (label: string) =>
    UI_CATEGORIES.find((item) => item.label === label)?.value ?? "all";

const toDisplayGarment = (item: GarmentItem): HomeDisplayGarment => ({
  garmentId: item.id,
  name: item.brandName?.trim() || "등록 의상",
  category: CATEGORY_LABEL_MAP[item.category] || item.category || "기타",
  fileUrl: item.fileUrl || "",
  price: "N/A",
});

const Home = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState("전체");
  const [currentBanner, setCurrentBanner] = useState(0);
  const [garments, setGarments] = useState<GarmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const selectedApiCategory = useMemo(() => getApiCategory(category), [category]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNER_DATA.length);
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  const loadGarments = async (selectedCategory = selectedApiCategory) => {
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
  };

  useEffect(() => {
    void loadGarments(selectedApiCategory);
  }, [selectedApiCategory]);

  const displayGarments = useMemo(
      () => garments.map(toDisplayGarment),
      [garments]
  );

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

    const uploadCategory = selectedApiCategory === "all" ? "top" : selectedApiCategory;
    const brandNameFromFile =
        file.name.replace(/\.[^.]+$/, "").trim() || "사용자 업로드 의상";

    try {
      setUploading(true);

      const presign = await createImagePresign();
      const uploaded = await uploadByToken(presign.uploadToken, file);
      const created = await createGarment({
        fileUrl: uploaded.fileUrl,
        category: uploadCategory,
        brandName: brandNameFromFile,
      });

      await loadGarments(selectedApiCategory);
      handleFittingClick(toDisplayGarment(created));
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
              setCurrentBanner(
                  (prev) => (prev - 1 + BANNER_DATA.length) % BANNER_DATA.length
              )
          }
          onNextBanner={() =>
              setCurrentBanner((prev) => (prev + 1) % BANNER_DATA.length)
          }
          categories={UI_CATEGORIES.map((item) => item.label)}
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