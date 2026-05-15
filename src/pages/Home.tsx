import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadGarmentDirect } from "../api/uploadApi";
import { getGarments, deleteGarment, type GarmentItem } from "../api/garmentApi";
import HomePage, { type HomeBanner, type HomeCategory } from "./HomePage";
import UploadModal, { type UploadFormData } from "../components/upload/UploadModal";

const BANNER_DATA: HomeBanner[] = [
  { id: 1, title: "상상하던 스타일, 실시간 AI 가상 피팅으로 확인하세요", sub: "모델에게 옷을 입히듯 스타일을 즉시 확인하세요.", img: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1600", tag: "AI VIRTUAL TRY-ON" },
  { id: 2, title: "클릭 한 번으로 완성되는 나만의 가상 드레스룸", sub: "원하는 옷을 고르고 즉시 피팅 결과를 확인하세요.", img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600", tag: "SMART FITTING" },
];

const CATEGORY_API_MAP: Record<HomeCategory, "upper" | "lower" | "overall"> = {
  all: "upper", top: "upper", bottom: "lower", outer: "upper", dress: "overall"
};

const Home = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<HomeCategory>("all");
  const [garments, setGarments] = useState<GarmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // 1. 관리자 여부 확인
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setIsAdmin(payload.role === "admin" || payload.role === "ADMIN");
      } catch { setIsAdmin(false); }
    }
  }, []);

  // 2. 의류 목록 로드
  const loadGarments = useCallback(async (selCat: HomeCategory) => {
    try {
      setLoading(true);
      const data = await getGarments(selCat);
      setGarments(data);
    } catch { setGarments([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadGarments(category); }, [category, loadGarments]);

  // 3. 삭제 처리
  const handleDeleteGarment = async (id: string) => {
    if (!window.confirm("정말 이 의류를 삭제하시겠습니까?")) return;
    try {
      await deleteGarment(id);
      alert("삭제되었습니다.");
      loadGarments(category);
    } catch { alert("삭제 실패"); }
  };

  // 4. 업로드 처리
  const handleModalUpload = async (formData: UploadFormData) => {
    try {
      setUploading(true);
      await uploadGarmentDirect({
        file: formData.file,
        category: CATEGORY_API_MAP[formData.category],
        name: formData.name,
        brandName: formData.brandName,
        price: formData.price,
      });
      loadGarments(category);
      setIsUploadModalOpen(false);
    } catch { alert("업로드 실패"); } finally { setUploading(false); }
  };

  return (
      <>
        <HomePage
            banners={BANNER_DATA}
            currentBanner={0}
            onPrevBanner={() => {}}
            onNextBanner={() => {}}
            categories={["all", "top", "bottom", "outer", "dress"]}
            category={category}
            setCategory={setCategory}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            garments={garments.map(g => ({
              garmentId: g.id,
              name: g.name || "이름 없음",
              category: g.category,
              fileUrl: g.fileUrl,
              price: g.price?.toLocaleString() || "0"
            }))}
            loading={loading}
            uploading={uploading}
            handleFittingClick={(item) => navigate("/fitting", { state: { cloth: item.fileUrl, garmentId: item.garmentId } })}
            isAdmin={isAdmin}
            onDelete={handleDeleteGarment}
        />
        <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={handleModalUpload} />
      </>
  );
};

export default Home;