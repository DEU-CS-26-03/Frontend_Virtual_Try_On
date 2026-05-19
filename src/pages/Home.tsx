// src/pages/Home.tsx

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadGarmentDirect } from "../api/uploadApi";
import { getGarments, deleteGarment, type GarmentItem } from "../api/garmentApi";
import HomePage, { type HomeBanner, type HomeCategory, type HomeDisplayGarment } from "./HomePage";
import UploadModal, { type UploadFormData } from "../components/upload/UploadModal";

const BANNER_DATA: HomeBanner[] = [
  { 
    id: 1, 
    tag: "SMART FITTING ROOM", 
    title: "클릭 한 번으로 완성되는\n나만의 가상 드레스룸", 
    sub: "원하는 옷을 고르고 즉시 피팅 결과를 실시간 피드에서 확인하세요.", 
    // 💡 이전에 맞춰드렸던 세련된 고화질 드레스룸/쇼룸 이미지 URL로 교체합니다.
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop" 
  },
  { 
    id: 2, 
    tag: "AI VIRTUAL TRY-ON",
    title: "상상하던 스타일,\n실시간 AI 가상 피팅으로 확인하세요", 
    sub: "모델에게 옷을 입히듯 내 스타일을 즉시 가상 공간에서 확인하세요.", 
    beforeImg: "/before.PNG",   
    garmentImg: "/jacket.PNG",  
    resultImg: "/after.PNG"     
  },
  { 
    id: 3, 
    tag: "STYLING GENERATOR",
    title: "새로운 패션 트렌드를\n정교한 생성형 AI로 매칭", 
    sub: "다양한 옷과 체형 데이터베이스를 기반으로 최상의 아웃핏을 도출합니다.", 
    beforeImg: "/before.PNG",   
    garmentImg: "/jacket.PNG",  
    resultImg: "/after.PNG"     
  }
];


const CATEGORY_API_MAP: Record<HomeCategory, "upper" | "lower" | "overall"> = {
  all: "upper", top: "upper", bottom: "lower", outer: "upper", dress: "overall"
};

// ★ URL 변환 함수를 컴포넌트 밖으로 빼서 정리
const normalizeFileUrl = (url?: string | null): string => {
  if (!url) return "";

  // 1. 이미 완전한 외부 URL(https)이거나 미리보기(data:)인 경우 그대로 반환
  if (url.startsWith("https://") || url.startsWith("data:")) return url;

  // 2. 구형 IP 주소로 저장된 경우 현재 API 주소로 교체
  if (url.startsWith("http://217.142.255.158")) {
    return url.replace("http://217.142.255.158", "https://apivirtualtryon.p-e.kr");
  }

  // 3. /files/ 로 시작하는 상대 경로인 경우 백엔드 주소를 앞에 강제로 붙임
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

  useEffect(() => {
    // localStorage에서 유저 정보가 담긴 스트링을 가져옵니다.
    const savedUser = localStorage.getItem("user"); 
  
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        console.log("현재 로그인한 유저 정보:", user);
      
        // 백엔드 타입에 명시된 role 값을 대소문자 모두 체크
        setIsAdmin(user.role === "admin" || user.role === "ADMIN");
      } catch (error) {
        console.error("유저 정보 파싱 실패:", error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
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
        fileUrl: formData.fileUrl, // ★ 입력받은 이미지 주소를 API로 전달
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
              fileUrl: normalizeFileUrl(g.fileUrl), // ★ 여기서 함수를 사용합니다!
              price: g.price?.toLocaleString() || "0"
            }))}
            loading={loading}
            uploading={uploading}
            handleFittingClick={(item: HomeDisplayGarment) => navigate("/fitting", { state: { cloth: item.fileUrl, garmentId: item.garmentId } })}
            isAdmin={isAdmin}
            onDelete={handleDeleteGarment}
        />
        <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={handleModalUpload} />
      </>
  );
};

export default Home;