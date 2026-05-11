import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Zap, ChevronLeft, Loader2, Info } from "lucide-react";
import { createTryonJob, type ClothCategory } from "../api/tryonApi"; // ★ ClothCategory 타입 임포트 필요
import UploadBox from "../components/upload/UploadBox";
import UploadButton from "../components/upload/UploadButton";
import Header from "../components/layout/Header";

const Fitting = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ★ 추가됨: 홈 화면에서 옷 정보와 함께 카테고리 정보도 받아옵니다.
  const { cloth, category } = location.state || {};

  // ★ 추가됨: 영문/한글 카테고리명을 AI가 이해하는 3가지 모드로 자동 변환하는 헬퍼 함수
  const getMappedCategory = (cat: string): ClothCategory => {
    const lowerCat = String(cat || "").toLowerCase();
    if (lowerCat.includes("dress") || lowerCat.includes("onepiece") || lowerCat.includes("원피스") || lowerCat.includes("전신")) return "overall";
    if (lowerCat.includes("pants") || lowerCat.includes("skirt") || lowerCat.includes("lower") || lowerCat.includes("bottom") || lowerCat.includes("바지") || lowerCat.includes("치마") || lowerCat.includes("하의")) return "lower";
    return "upper"; // 기본값
  };

  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // ★ 추가됨: 사용자가 선택한 피팅 모드 상태 (초기값은 자동 판별값 적용)
  const [selectedCategory, setSelectedCategory] = useState<ClothCategory>(getMappedCategory(category));

  const userPreviewUrl = useMemo(() => {
    return file ? URL.createObjectURL(file) : null;
  }, [file]);

  useEffect(() => {
    return () => { if (userPreviewUrl) URL.revokeObjectURL(userPreviewUrl); };
  }, [userPreviewUrl]);

  const handleNext = async () => {
    if (!file || !cloth) {
      alert("내 사진과 의상을 모두 준비해주세요.");
      return;
    }

    try {
      setIsLoading(true);

      // Vercel 환경에서 상대경로로 된 이미지를 백엔드에서 정확히 다운로드
      const backendBaseUrl = "https://apivirtualtryon.p-e.kr";
      const targetClothUrl = cloth.startsWith("http") ? cloth : backendBaseUrl + cloth;

      const response = await fetch(targetClothUrl);
      if (!response.ok) {
        throw new Error("옷 이미지를 다운로드할 수 없습니다.");
      }

      const blob = await response.blob();
      const clothFile = new File([blob], "cloth.jpg", { type: blob.type || "image/jpeg" });

      const job = await createTryonJob({
        personImage: file,
        clothImage: clothFile,
        clothType: selectedCategory, // ★ 수정됨: 고정된 "upper" 대신 사용자가 선택한 값 전송
      });

      console.log("서버로부터 받은 Job 데이터:", job);

      // 안전장치
      if (!job || !job.tryonId || job.tryonId === "undefined" || job.tryonId === "") {
        alert("요청은 성공했으나, 백엔드 응답 데이터가 비어있습니다.\n(TryonResponse.java 파일에 @Getter 어노테이션이 있는지 꼭 확인하세요!)");
        setIsLoading(false);
        return;
      }

      // ★ 수정됨: 결과 페이지에서 부위별 맞춤 문구를 띄울 수 있도록 clothType도 함께 넘김
      navigate("/result", {
        state: { tryonId: job.tryonId, userPreview: userPreviewUrl, clothType: selectedCategory }
      });

    } catch (error) {
      console.error("피팅 작업 생성 실패:", error);
      alert("가상 피팅 요청에 실패했습니다. 프론트엔드 F12 콘솔 로그를 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-[#F5F5F3] pb-32 font-sans text-[#111111]">
        <Header />

        {/* ★ 추가됨: AI 실시간 미리보기 (Ghost Overlay 방식) */}
        {userPreviewUrl && cloth && (
            <div className="fixed top-28 right-12 z-50 w-56 hidden xl:block animate-in fade-in slide-in-from-right-10 duration-700">
              <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[2rem] shadow-2xl border border-white">
                <p className="text-[10px] font-black tracking-[0.2em] text-[#2563EB] uppercase mb-4 text-center flex items-center justify-center gap-1">
                  <Zap size={12} fill="currentColor" /> Style Simulation
                </p>
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
                  {/* 배경: 내 사진 (흐릿하게) */}
                  <img src={userPreviewUrl} className="w-full h-full object-cover opacity-50" alt="User" />

                  {/* 오버레이: 옷 이미지 (선택한 모드에 따라 위/아래 위치 자동 조정) */}
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <img
                        src={cloth}
                        className={`w-full h-auto object-contain drop-shadow-2xl animate-pulse transition-all duration-700
                            ${selectedCategory === 'upper' ? 'translate-y-[-20%] scale-110' : ''}
                            ${selectedCategory === 'lower' ? 'translate-y-[20%] scale-110' : ''}
                            ${selectedCategory === 'overall' ? 'scale-100' : ''}
                        `}
                        alt="Cloth Overlay"
                    />
                  </div>
                </div>
                <p className="text-[9px] text-gray-400 mt-3 text-center font-bold uppercase">
                  {selectedCategory} Mode Applied
                </p>
              </div>
            </div>
        )}

        <div className="max-w-[1600px] mx-auto px-10 pt-16 pb-12 flex items-center gap-6">
          <button onClick={() => navigate("/")} className="group p-4 bg-white rounded-full border border-gray-200 hover:bg-[#111111] transition-all">
            <ChevronLeft size={24} className="group-hover:text-white" />
          </button>
          <div>
            <h1 className="text-5xl font-[1000] tracking-tighter leading-none">피팅 단계</h1>
            <p className="text-gray-400 font-bold mt-2 tracking-wide text-xs px-1">준비된 사진으로 스타일을 매칭합니다</p>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto grid md:grid-cols-2 gap-12 px-10 mt-4">
          <div className="flex flex-col">
            <div className="flex justify-between items-end mb-6 px-2">
              <span className="text-[11px] font-[1000] tracking-[0.3em] text-[#2563EB] uppercase">Step 01</span>
              <h2 className="text-xl font-black">내 사진 업로드</h2>
            </div>
            <div className="h-[600px] bg-white rounded-3xl border border-gray-100 flex items-center justify-center shadow-sm overflow-hidden relative group">
              {userPreviewUrl ? (
                  <img src={userPreviewUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Preview" />
              ) : (
                  <UploadBox />
              )}
            </div>
            <div className="mt-8">
              <UploadButton onChange={setFile} />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between items-end mb-6 px-2">
              <span className="text-[11px] font-[1000] tracking-[0.3em] text-gray-300 uppercase">Step 02</span>
              <h2 className="text-xl font-black">선택한 아이템</h2>
            </div>
            {/* 의상 이미지 박스 높이 조정 */}
            <div className="h-[460px] bg-white rounded-3xl border border-gray-100 flex items-center justify-center p-12 shadow-sm relative">
              <img src={cloth} className="max-w-full max-h-full object-contain drop-shadow-sm" alt="Selected" />
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#F5F5F3] rounded-2xl border border-gray-200 flex items-center gap-3">
                <Info size={16} className="text-gray-400" />
                <p className="text-[10px] text-gray-500 font-bold leading-tight">
                  아래 버튼을 눌러 옷이 입혀질 부위를 직접 선택하세요.
                </p>
              </div>
            </div>

            {/* ★ 추가됨: 피팅 부위 선택 버튼 UI */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { id: "upper", label: "상의 (Top)" },
                { id: "lower", label: "하의 (Pants/Skirt)" }, // 바지/치마 명시
                { id: "overall", label: "전신 (Dress)" }
              ].map((cat) => (
                  <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as ClothCategory)}
                      className={`py-4 rounded-xl text-xs font-black tracking-widest transition-all shadow-sm ${
                          selectedCategory === cat.id
                              ? "bg-[#2563EB] text-white ring-4 ring-[#2563EB]/20 scale-105"
                              : "bg-white border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                      }`}
                  >
                    {cat.label}
                  </button>
              ))}
            </div>

            <div className="mt-6">
              <button onClick={() => navigate("/")} className="w-full py-4 bg-transparent border-2 border-[#111111] rounded-2xl font-black text-xs tracking-widest hover:bg-[#111111] hover:text-white transition-all">
                다른 옷 골라보기
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-20">
          <button
              onClick={handleNext}
              disabled={!file || isLoading}
              className={`px-32 py-7 rounded-full text-xl font-[1000] tracking-widest transition-all duration-500 shadow-2xl flex items-center gap-3 ${
                  !file || isLoading ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#2563EB] text-white hover:scale-105 active:scale-95"
              }`}
          >
            {isLoading ? <><Loader2 className="animate-spin" size={24} /> 작업 생성 중...</> : "가상 피팅 시작하기"}
          </button>
        </div>
      </div>
  );
};

export default Fitting;