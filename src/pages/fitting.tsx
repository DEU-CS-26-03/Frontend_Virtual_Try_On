import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, ImagePlus, RefreshCw } from "lucide-react";
import { createTryonJob, type ClothCategory } from "../api/tryonApi";
import Header from "../components/layout/Header";
import UploadBox from "../components/upload/UploadBox"; // 기존 업로드 박스 유지

const Fitting = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { cloth, category } = location.state || {};

  const getMappedCategory = (cat: string): ClothCategory => {
    const lowerCat = String(cat || "").toLowerCase();
    if (lowerCat.includes("dress") || lowerCat.includes("onepiece") || lowerCat.includes("원피스") || lowerCat.includes("전신")) return "overall";
    if (lowerCat.includes("pants") || lowerCat.includes("skirt") || lowerCat.includes("lower") || lowerCat.includes("bottom") || lowerCat.includes("바지") || lowerCat.includes("치마") || lowerCat.includes("하의")) return "lower";
    return "upper";
  };

  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

      const backendBaseUrl = "https://apivirtualtryon.p-e.kr";
      const targetClothUrl = cloth.startsWith("http") ? cloth : backendBaseUrl + cloth;

      const response = await fetch(targetClothUrl);
      if (!response.ok) throw new Error("옷 이미지를 다운로드할 수 없습니다.");

      const blob = await response.blob();
      const clothFile = new File([blob], "cloth.jpg", { type: blob.type || "image/jpeg" });

      const job = await createTryonJob({
        personImage: file,
        clothImage: clothFile,
        clothType: selectedCategory,
      });

      if (!sessionStorage.getItem("accessToken")) {
        const guestIds = JSON.parse(sessionStorage.getItem("guestTryonIds") || "[]");
        sessionStorage.setItem("guestTryonIds", JSON.stringify([...guestIds, job.tryonId]));
      }

      if (!job || !job.tryonId || job.tryonId === "undefined" || job.tryonId === "") {
        throw new Error("Job ID가 생성되지 않았습니다.");
      }

      navigate("/result", {
        state: { tryonId: job.tryonId, userPreview: userPreviewUrl, clothType: selectedCategory }
      });

    } catch (error) {
      console.error("피팅 요청 실패:", error);
      alert("가상 피팅 서버와 통신에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-[#F5F5F3] pb-20 font-sans text-[#111111]">
        <Header />

        {/* 상단 타이틀 영역 */}
        <div className="max-w-[1000px] mx-auto px-6 pt-12 pb-8 flex flex-col items-center relative">
          <button onClick={() => navigate("/")} className="absolute left-6 top-10 group p-4 bg-white rounded-full border border-gray-200 hover:bg-[#111111] transition-all shadow-sm">
            <ChevronLeft size={24} className="group-hover:text-white" />
          </button>
          <h1 className="text-4xl font-[1000] tracking-tighter mb-2">가상 피팅룸</h1>
          <p className="text-gray-400 font-bold text-sm tracking-wide">의상이 입혀질 부위를 선택하고 내 사진을 업로드하세요</p>
        </div>

        {/* 중앙 정렬된 메인 컨트롤 영역 */}
        <div className="flex flex-col items-center w-full max-w-[500px] mx-auto px-6">

          {/* 1. 카테고리 선택 버튼 (사진 바로 위, 좌우 완벽 대칭) */}
          <div className="w-full grid grid-cols-3 gap-3 mb-6">
            {[
              { id: "upper", label: "상의 (Top)" },
              { id: "lower", label: "하의 (Bottom)" },
              { id: "overall", label: "전신 (Dress)" }
            ].map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as ClothCategory)}
                    className={`py-3.5 rounded-2xl text-[11px] font-black tracking-widest transition-all shadow-sm ${
                        selectedCategory === cat.id
                            ? "bg-[#2563EB] text-white ring-4 ring-[#2563EB]/20 scale-105"
                            : "bg-white border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                >
                  {cat.label}
                </button>
            ))}
          </div>

          {/* 2. 메인 사진 & 오버레이 캔버스 (중앙 집중형) */}
          <div className="w-full aspect-[3/4] bg-white rounded-[2rem] border border-gray-200 flex items-center justify-center shadow-xl overflow-hidden relative group">
            {!userPreviewUrl ? (
                // 사진이 없을 때: 업로드 유도 박스
                <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                  <UploadBox />
                </div>
            ) : (
                // 사진이 있을 때: 내 사진 + 옷 오버레이
                <>
                  <img src={userPreviewUrl} className="w-full h-full object-cover" alt="User" />

                  {/* 오버레이 효과 (크기를 w-[85%]로 키워 옷이 더 크고 선명하게 보이도록 수정) */}
                  {cloth && (
                      <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/10 backdrop-blur-[2px]">
                        <img
                            src={cloth}
                            className={`w-[85%] h-[85%] object-contain drop-shadow-2xl animate-pulse transition-all duration-700
                      ${selectedCategory === 'upper' ? 'translate-y-[-20%] scale-100' : ''}
                      ${selectedCategory === 'lower' ? 'translate-y-[20%] scale-100' : ''}
                      ${selectedCategory === 'overall' ? 'scale-110' : ''}
                    `}
                            alt="Cloth Overlay"
                        />
                      </div>
                  )}
                </>
            )}
          </div>

          {/* 3. 보조 액션 버튼 (같은 x축에 좌우 대칭 배치) */}
          <div className="w-full flex gap-4 mt-6">
            {/* 완벽한 대칭 디자인을 위해 기존 UploadButton 대신 동일한 규격의 label 디자인 적용 */}
            <div className="flex-1">
              <label className="w-full h-full flex items-center justify-center gap-2 py-4 bg-white border-2 border-gray-200 rounded-2xl font-black text-[11px] tracking-widest text-gray-500 hover:border-[#111111] hover:text-[#111111] cursor-pointer transition-all shadow-sm">
                <ImagePlus size={16} />
                사진 선택하기
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
                    }}
                />
              </label>
            </div>

            <div className="flex-1">
              <button onClick={() => navigate("/")} className="w-full h-full flex items-center justify-center gap-2 py-4 bg-white border-2 border-gray-200 rounded-2xl font-black text-[11px] tracking-widest text-gray-500 hover:border-[#111111] hover:text-[#111111] transition-all shadow-sm">
                <RefreshCw size={16} />
                다른 옷 고르기
              </button>
            </div>
          </div>

          {/* 4. 가상 피팅 시작 버튼 */}
          <div className="w-full mt-10">
            <button
                onClick={handleNext}
                disabled={!file || isLoading}
                className={`w-full py-6 rounded-2xl text-[15px] font-[1000] tracking-widest transition-all duration-500 shadow-xl flex justify-center items-center gap-3 ${
                    !file || isLoading
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-[#2563EB] text-white hover:bg-[#1D4ED8] hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
                }`}
            >
              {isLoading ? <><Loader2 className="animate-spin" size={24} /> AI 추론 엔진 가동 중...</> : "가상 피팅 시작하기"}
            </button>
          </div>

        </div>
      </div>
  );
};

export default Fitting;