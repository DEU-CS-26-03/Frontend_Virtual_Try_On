import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadGarmentDirect } from "../api/uploadApi";
import { getGarments, deleteGarment, type GarmentItem } from "../api/garmentApi"; // deleteGarment 추가
import HomePage, { type HomeBanner, type HomeCategory, type HomeDisplayGarment } from "./HomePage";
import UploadModal, { type UploadFormData } from "../components/upload/UploadModal";

type ApiCategory = "upper" | "lower" | "overall";

const BANNER_DATA: HomeBanner[] = [
  { id: 1, title: "상상하던 스타일, 실시간 AI 가상 피팅으로 확인하세요", sub: "모델에게 옷을 입히듯 스타일을 즉시 확인하세요.", img: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1600", tag: "AI VIRTUAL TRY-ON" },
  { id: 2, title: "클릭 한 번으로 완성되는 가상 드레스룸", sub: "원하는 옷을 고르고 즉시 피팅 결과를 확인하세요.", img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600", tag: "SMART FITTING" },
];

const CATEGORY_API_MAP: Record<HomeCategory, ApiCategory> = {
  all: "upper", top: "upper", bottom: "lower", outer: "upper", dress: "overall"
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://apivirtualtryon.p-e.kr";

type ExtendedGarmentItem = GarmentItem & { garmentId?: string; brandName?: string | null; };

const normalizeFileUrl = (url?: string | null): string => {
  if (!url) return "";
  if (url.startsWith("https://") || url.startsWith("data:")) return url;
  if (url.startsWith("http://217.142.255.158")) return url.replace("http://217.142.255.158", API_BASE_URL);
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

const toDisplayGarment = (item: GarmentItem): HomeDisplayGarment => {
  const garment = (item as unknown) as ExtendedGarmentItem;
  const price = garment.price ? (typeof garment.price === "number" ? garment.price.toLocaleString() : garment.price) : "N/A";

  return {
    garmentId: String(garment.id || garment.garmentId || ""),
    name: garment.name || "이름 없음",
    category: garment.category || "기타",
    fileUrl: normalizeFileUrl(garment.fileUrl),
    price: price,
  };
};

const Home = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<HomeCategory>("all");
  const [garments, setGarments] = useState<GarmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // ★ 관리자 여부

  // 관리자 권한 확인 (JWT 파싱)
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setIsAdmin(payload.role === "admin" || payload.role === "ADMIN");
      } catch { setIsAdmin(false); }
    }
  }, []);

  const loadGarments = useCallback(async (selCat: HomeCategory) => {
    try {
      setLoading(true);
      const data = await getGarments(selCat);
      setGarments(data);
    } catch { setGarments([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadGarments(category); }, [category, loadGarments]);

  const handleDeleteGarment = async (id: string) => {
    if (!window.confirm("이 의류를 삭제하시겠습니까? (사이트에서 비노출됩니다)")) return;
    try {
      await deleteGarment(id);
      alert("삭제되었습니다.");
      loadGarments(category);
    } catch { alert("삭제 권한이 없거나 실패했습니다."); }
  };

  const handleModalUpload = async (formData: UploadFormData) => {
    if (!localStorage.getItem("accessToken")) {
      alert("로그인이 필요합니다."); navigate("/login"); return;
    }
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
      alert("등록 성공!");
      setIsUploadModalOpen(false);
    } catch { alert("업로드 실패 (1MB 용량 제한 확인)"); } finally { setUploading(false); }
  };

  return (
      <>
        <HomePage
            banners={BANNER_DATA}
            currentBanner={0} // 배너 타이머 로직 생략(정리)
            onPrevBanner={() => {}}
            onNextBanner={() => {}}
            categories={["all", "top", "bottom", "outer", "dress"]}
            category={category}
            setCategory={setCategory}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            garments={garments.map(toDisplayGarment)}
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