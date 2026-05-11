import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, ImagePlus, RefreshCw, Shirt, HelpCircle } from "lucide-react";
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
      <div className="min-h-screen bg-[#F5F5F3] pb-24 font-sans text-[#111111]">
        <Header />

        {/* 상단 타이틀 영역 */}
        <div className="max-w-[1400px] mx-auto px-10 pt-16 pb-12 flex items-center relative">
          <button onClick={() => navigate("/")} className="group p-4 bg-white rounded-full border border-gray-200 hover:bg-[#111111] transition-all shadow-sm mr-6">
            <ChevronLeft size={24} className="group-hover:text-white" />
          </button>
          <div>
            <h1 className="text-5xl font-[1000] tracking-tighter leading-none mb-2">가상 피팅룸</h1>
            <p className="text-gray-400 font-bold tracking-wide text-xs px-1">내 사진을 업로드하고 의상이 입혀질 부위를 선택하세요.</p>
          </div>
        </div>

        {/* 2-Column 메인 레이아웃 */}
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12 px-10">

          {/* 왼쪽: 사용자 모델 사진 & 오버레이 미리보기 */}
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-end mb-5 px-2">
            <span className="text-[11px] font-[1000] tracking-[0.3em] text-[#2563EB] uppercase flex items-center gap-2">
              <Shirt size={14}/> Step 01
            </span>
              <h2 className="text-xl font-black">내 모델 사진</h2>
            </div>

            <div className="flex-grow aspect-[3/4] bg-white rounded-3xl border border-gray-200 flex flex-col justify-between shadow-sm overflow-hidden relative group">
              {!userPreviewUrl ? (
                  // 사진이 없을 때: 업로드 유도 박스
                  <div className="flex items-center justify-center h-full w-full opacity-70 group-hover:opacity-100 transition-opacity p-8">
                    <UploadBox />
                  </div>
              ) : (
                  // 사진이 있을 때: 내 사진 + 스마트 오버레이
                  <div className="relative w-full h-full">
                    <img src={userPreviewUrl} className="w-full h-full object-cover" alt="User Model" />

                    {/* ★ 핵심 개선: 옷 크기 축소 및 부위별 위치 조정 로직 */}
                    {cloth && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-black/10 backdrop-blur-[2px] transition-all duration-700">
                          <img
                              src={cloth}
                              className={`absolute left-1/2 -translate-x-1/2 object-contain drop-shadow-2xl animate-in fade-in zoom-in duration-700
                        ${selectedCategory === 'upper' ? 'top-[10%] w-[60%] h-[50%]' : ''}
                        ${selectedCategory === 'lower' ? 'bottom-[5%] w-[65%] h-[55%]' : ''}
                        ${selectedCategory === 'overall' ? 'top-1/2 -translate-y-1/2 w-[80%] h-[80%]' : ''}
                      `}
                              alt="Cloth Overlay Preview"
                          />
                          {/* 오버레이 상태 표시 뱃지 */}
                          <div className="absolute top-6 right-6 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[9px] font-black text-[#2563EB] shadow-sm uppercase tracking-widest">
                            {selectedCategory} preview
                          </div>
                        </div>
                    )}
                  </div>
              )}
            </div>

            {/* 사진 업로드/변경 버튼 (좌측 박스 하단) */}
            <div className="mt-5 h-[60px]">
              <label className="w-full h-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 rounded-2xl font-black text-[12px] tracking-widest text-gray-500 hover:border-[#2563EB] hover:text-[#2563EB] cursor-pointer transition-all shadow-sm">
                <ImagePlus size={18} />
                {file ? "모델 사진 교체하기" : "모델 사진 업로드"}
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
          </div>

          {/* 오른쪽: 선택한 의상 & 카테고리 선택 */}
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-end mb-5 px-2">
              <span className="text-[11px] font-[1000] tracking-[0.3em] text-gray-400 uppercase">Step 02</span>
              <h2 className="text-xl font-black">선택한 의상 정보</h2>
            </div>

            <div className="flex-grow aspect-[3/4] bg-white rounded-3xl border border-gray-200 flex flex-col shadow-sm relative overflow-hidden">
              {/* 상단: 카테고리 선택 탭 */}
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <HelpCircle size={14} className="text-gray-400" />
                  <p className="text-[11px] font-bold text-gray-500 tracking-wide">의상이 입혀질 부위를 정확히 지정해주세요.</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "upper", label: "상의 (Top)" },
                    { id: "lower", label: "하의 (Bottom)" },
                    { id: "overall", label: "전신 (Dress)" }
                  ].map((cat) => (
                      <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id as ClothCategory)}
                          className={`py-3 rounded-xl text-[11px] font-black tracking-widest transition-all ${
                              selectedCategory === cat.id
                                  ? "bg-[#2563EB] text-white shadow-md ring-2 ring-[#2563EB]/20"
                                  : "bg-white border border-gray-200 text-gray-400 hover:bg-gray-100"
                          }`}
                      >
                        {cat.label}
                      </button>
                  ))}
                </div>
              </div>

              {/* 하단: 옷 이미지 */}
              <div className="flex-grow flex items-center justify-center p-12 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-50 to-white">
                <img src={cloth} className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500" alt="Selected Cloth" />
              </div>
            </div>

            {/* 다른 옷 고르기 버튼 (우측 박스 하단) */}
            <div className="mt-5 h-[60px]">
              <button onClick={() => navigate("/")} className="w-full h-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 rounded-2xl font-black text-[12px] tracking-widest text-gray-500 hover:border-[#111111] hover:text-[#111111] transition-all shadow-sm">
                <RefreshCw size={18} />
                다른 의상 고르기
              </button>
            </div>
          </div>

        </div>

        {/* 4. 가상 피팅 실행 버튼 (최하단 중앙 집중) */}
        <div className="max-w-[800px] mx-auto mt-20 px-10">
          <button
              onClick={handleNext}
              disabled={!file || isLoading}
              className={`w-full py-6 rounded-2xl text-[16px] font-[1000] tracking-widest transition-all duration-500 shadow-xl flex justify-center items-center gap-3 ${
                  !file || isLoading
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#111111] text-white hover:bg-black hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
              }`}
          >
            {isLoading ? <><Loader2 className="animate-spin" size={24} /> AI 합성 엔진 가동 중...</> : "선택한 부위로 가상 피팅 시작하기"}
          </button>
        </div>

      </div>
  );
};

export default Fitting;