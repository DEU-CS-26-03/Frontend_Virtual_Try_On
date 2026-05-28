import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadGarmentDirect } from "../api/uploadApi";
import { getGarments, deleteGarment, type GarmentItem } from "../api/garmentApi";
import HomePage, { type HomeBanner, type HomeCategory, type HomeDisplayGarment } from "./HomePage";
import UploadModal, { type UploadFormData } from "../components/upload/UploadModal";
import CautionModal from "../components/upload/CautionModal";

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

const CATEGORY_API_MAP: Record<HomeCategory, "upper" | "lower" | "overall"> = {
  all: "upper", top: "upper", bottom: "lower", outer: "upper", dress: "overall"
};

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

  // 💡 [추가] 배너의 현재 인덱스를 관리하는 State
  const [currentBanner, setCurrentBanner] = useState(0);

  // 💡 [추가] 이전 배너로 이동하는 함수 (첫 페이지에서 누르면 마지막 페이지로)
  const handlePrevBanner = () => {
    setCurrentBanner((prev) => (prev === 0 ? BANNER_DATA.length - 1 : prev - 1));
  };

  // 💡 [추가] 다음 배너로 이동하는 함수 (마지막 페이지에서 누르면 첫 페이지로)
  const handleNextBanner = useCallback(() => {
    setCurrentBanner((prev) => (prev === BANNER_DATA.length - 1 ? 0 : prev + 1));
  }, []); // 빈 배열을 넣어 함수가 처음 한 번만 생성되도록 고정

  // 💡 [추가] 5초마다 배너를 자동으로 넘겨주는 효과
  useEffect(() => {
    // 5000ms(5초)마다 handleNextBanner 실행
    const timer = setInterval(() => {
      handleNextBanner();
    }, 5000);

    // 🔥 중요: 사용자가 버튼을 클릭해 배너가 바뀌거나 화면을 나갈 때 타이머 리셋
    return () => clearInterval(timer);
  }, [handleNextBanner, currentBanner]); // 💡 currentBanner를 넣어 클릭 즉시 5초가 초기화되도록 세팅

  useEffect(() => {
    const savedUser = sessionStorage.getItem("user"); 
  
    // 1. 데이터가 아예 안 들어왔는지 브라우저 콘솔(F12)에서 확인
    console.log("현재 sessionStorage 'user' 데이터:", savedUser);

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser) as LocalUser;
      
        // 2. 가끔 객체 안에 user가 또 들어있는 경우가 있어 방어 코드 작성
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

  useEffect(() => { void loadGarments(category); }, [category, loadGarments]);

  const handleDeleteGarment = async (id: string) => {
    if (!window.confirm("정말 이 의류를 삭제하시겠습니까?")) return;
    try {
      await deleteGarment(id);
      alert("삭제되었습니다.");
      loadGarments(category); // 삭제 후 새로고침
    } catch { alert("삭제 권한이 없거나 서버 오류입니다."); }
  };

  const handleModalUpload = async (formData: UploadFormData) => {
    try {
      setUploading(true);
      await uploadGarmentDirect({
        file: formData.file,
        category: CATEGORY_API_MAP[formData.category],
        name: formData.name,
        brandName: formData.brandName,
        price: formData.price,
        fileUrl: formData.fileUrl,
      });
      loadGarments(category);
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error("업로드 실패:", error);
      alert("업로드 실패");
    } finally {
      setUploading(false);
    }
  };

  // 💡 옷 클릭 시 실행되어 모달을 띄워주는 함수
  const handleFittingClickOpenNotice = (item: HomeDisplayGarment) => {
    setSelectedGarment(item);
    setIsNoticeOpen(true);
  };

  // 💡 모달에서 최종 [확인] 클릭 시 실행될 함수
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
            currentBanner={currentBanner} // 💡 고정값 0 대신 State 전달
            onPrevBanner={handlePrevBanner} // 💡 빈 함수 대신 구현된 함수 전달
            onNextBanner={handleNextBanner} // 💡 빈 함수 대신 구현된 함수 전달
            categories={["all", "top", "bottom", "outer", "dress"]}
            category={category}
            setCategory={setCategory}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            garments={garments.map(g => ({
              garmentId: g.id,
              name: g.name || "이름 없음",
              category: g.category,
              fileUrl: normalizeFileUrl(g.fileUrl),
              price: g.price?.toLocaleString() || "0"
            }))}
            loading={loading}
            uploading={uploading}
            // ★ 중요: 바로 페이지 이동이 아니라 모달을 여는 함수를 바인딩합니다.
            handleFittingClick={handleFittingClickOpenNotice}
            isAdmin={isAdmin}
            onDelete={handleDeleteGarment}
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