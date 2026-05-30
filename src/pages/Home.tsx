import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadGarmentDirect } from "../api/uploadApi";
import { getGarments, deleteGarment, type GarmentItem } from "../api/garmentApi";
import HomePage, { type HomeBanner, type HomeCategory, type HomeDisplayGarment } from "./HomePage";
import UploadModal, { type UploadFormData } from "../components/upload/UploadModal";
import CautionModal from "../components/upload/CautionModal";
import { getFavorites, addFavorite, deleteFavorite } from "../api/favoriteApi";

// Home.tsx 내부의 유저 타입 선언
interface LocalUser {
  id?: number;
  username?: string;
  email?: string;
  nickname?: string;
  role?: string;
  user?: {
    role?: string;
  };
}

const BANNER_DATA: HomeBanner[] = [
  {
    id: 1,
    tag: "SMART FITTING ROOM",
    title: "클릭 한 번으로 완성되는\n나만의 가상 드레스룸",
    sub: "원하는 옷을 고르고 즉시 피팅 결과를 실시간 피드에서 확인하세요.",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop"
  },
  {
    id: 2,
    tag: "AI VIRTUAL TRY-ON",
    title: "상상하던 스타일,\n실시간 AI 가상 피팅으로 확인하세요",
    sub: "모델에게 옷을 입히듯 내 스타일을 즉시 가상 공간에서 확인하세요.",
    beforeImg: "/before.png",
    garmentImg: "/jacket.png",
    resultImg: "/after.png"
  },
  {
    id: 3,
    tag: "STYLING GENERATOR",
    title: "새로운 패션 트렌드를\n정교한 생성형 AI로 매칭",
    sub: "다양한 옷과 체형 데이터베이스를 기반으로 최상의 아웃핏을 도출합니다.",
    beforeImg: "/woman.png",
    garmentImg: "/pink_Tshirt.png",
    resultImg: "/woman_after.PNG"
  }
];

const normalizeFileUrl = (url?: string | null): string => {
  if (!url) return "";
  if (url.startsWith("https://") || url.startsWith("data:")) return url;
  if (url.startsWith("http://217.142.255.158")) {
    return url.replace("http://217.142.255.158", "https://apivirtualtryon.p-e.kr");
  }
  const backendBase = "https://apivirtualtryon.p-e.kr";
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${backendBase}${cleanUrl}`;
};

const Home = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<HomeCategory>("all");
  const [garments, setGarments] = useState<GarmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [selectedGarment, setSelectedGarment] = useState<HomeDisplayGarment | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 💡 추가: 로그인 상태 관리 State

  // 💡 내가 찜한 상품들의 garmentId 목록을 저장할 State
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // 💡 배너의 현재 인덱스를 관리하는 State
  const [currentBanner, setCurrentBanner] = useState(0);

  const handlePrevBanner = () => {
    setCurrentBanner((prev) => (prev === 0 ? BANNER_DATA.length - 1 : prev - 1));
  };

  // 💡 다음 배너로 이동하는 함수
  const handleNextBanner = useCallback(() => {
    setCurrentBanner((prev) => (prev === BANNER_DATA.length - 1 ? 0 : prev + 1));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNextBanner();
    }, 5000);
    return () => clearInterval(timer);
  }, [handleNextBanner, currentBanner]);

// 💡 [수정됨] 찜 목록 ID 로드 (가드 클로즈 적용: 비로그인 유저 보호)
  const loadFavoriteIds = useCallback(async () => {
    const savedUser = sessionStorage.getItem("user");
    if (!savedUser) {
      setFavoriteIds([]);
      return; // 비로그인이면 API 자체를 호출하지 않음 (409 에러 원천 차단)
    }

    try {
      const favs = await getFavorites();
      setFavoriteIds(favs.map(f => String(f.garmentId)));
    } catch {
      setFavoriteIds([]);
    }
  }, []);

  // 💡 [수정됨] 찜하기 토글 (가드 클로즈 적용)
  const handleToggleFavorite = useCallback(async (garmentId: string) => {
    const savedUser = sessionStorage.getItem("user");
    if (!savedUser) {
      alert("로그인 후 관심상품을 등록할 수 있습니다.");
      navigate("/login");
      return;
    }

    const isFav = favoriteIds.includes(String(garmentId));
    try {
      if (isFav) {
        await deleteFavorite(garmentId);
        setFavoriteIds((prev) => prev.filter((id) => id !== String(garmentId)));
      } else {
        await addFavorite(garmentId);
        setFavoriteIds((prev) => [...prev, String(garmentId)]);
      }
    } catch (error) {
      console.error("찜하기 처리 실패:", error);
      alert("찜하기 처리에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  }, [favoriteIds, navigate]);

  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
    console.log("현재 sessionStorage 'user' 데이터:", savedUser);

    if (savedUser) {
      setIsLoggedIn(true); // 💡 유저 정보가 있으면 로그인 상태를 true로 설정
      try {
        const user = JSON.parse(savedUser) as LocalUser;
        const rawRole = user.role || user.user?.role || "";
        const userRole = String(rawRole).trim().toUpperCase();

        console.log("추출된 유저 권한(Role):", userRole);

        if (userRole === "ADMIN" || userRole === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("유저 정보 파싱 실패:", error);
        setIsAdmin(false);
      }
    } else {
      setIsLoggedIn(false); // 💡 유저 정보가 없으면 false
      setIsAdmin(false);
    }
  }, []);

  const loadGarments = useCallback(async (selCat: HomeCategory) => {
    try {
      setLoading(true);
      const data = await getGarments(selCat);
      setGarments(data);
    } catch { setGarments([]); } finally { setLoading(false); }
  }, []);

  // 💡 카테고리가 바뀌거나 홈에 진입할 때 상품 목록과 찜 리스트를 동시에 리로드하도록 정돈
  useEffect(() => {
    void loadGarments(category);
    void loadFavoriteIds();
  }, [category, loadGarments, loadFavoriteIds]);

  const handleDeleteGarment = async (id: string) => {
    if (!window.confirm("정말 이 의류를 삭제하시겠습니까?")) return;
    try {
      await deleteGarment(id);
      alert("삭제되었습니다.");
      await loadGarments(category);
    } catch { alert("삭제 권한이 없거나 서버 오류입니다."); }
  };

  const handleModalUpload = async (formData: UploadFormData) => {
    try {
      setUploading(true);
      await uploadGarmentDirect({
        file: formData.file,
        category: formData.category,
        name: formData.name,
        brandName: formData.brandName,
        price: formData.price,
        fileUrl: formData.fileUrl,
      });
      await loadGarments(category);
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error("업로드 실패:", error);
      alert("업로드 실패");
    } finally {
      setUploading(false);
    }
  };

  const handleFittingClickOpenNotice = (item: HomeDisplayGarment) => {
    setSelectedGarment(item);
    setIsNoticeOpen(true);
  };

  const handleConfirmFitting = () => {
    if (selectedGarment) {
      navigate("/fitting", {
        state: {
          cloth: selectedGarment.fileUrl,
          garmentId: selectedGarment.garmentId
        }
      });
    }
    setIsNoticeOpen(false);
    setSelectedGarment(null);
  };

  return (
      <>
        <HomePage
            banners={BANNER_DATA}
            currentBanner={currentBanner}
            onPrevBanner={handlePrevBanner}
            onNextBanner={handleNextBanner}
            categories={["all", "top", "bottom", "outer", "dress"]}
            category={category}
            setCategory={setCategory}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            garments={garments.map(g => ({
              garmentId: g.id,
              name: g.name || "이름 없음",
              category: g.category,
              fileUrl: normalizeFileUrl(g.fileUrl),
              price: g.price?.toLocaleString() || "0",
              isFavorite: favoriteIds.includes(String(g.id))
            }))}
            loading={loading}
            uploading={uploading}
            handleFittingClick={handleFittingClickOpenNotice}
            isAdmin={isAdmin}
            onDelete={handleDeleteGarment}
            // 💡 [추가] HomePage가 요구하는 즐겨찾기 토글 함수를 여기에 연결해 줍니다!
            onToggleFavorite={handleToggleFavorite}
            isLoggedIn={isLoggedIn} // 💡 추가: HomePage로 로그인 상태 전달
        />
        <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={handleModalUpload} />
        <CautionModal
            isOpen={isNoticeOpen}
            onClose={() => {
              setIsNoticeOpen(false);
              setSelectedGarment(null);
            }}
            onConfirm={handleConfirmFitting}
        />
      </>
  );
};

export default Home;