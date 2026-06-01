import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, ImagePlus, RefreshCw, Shirt, Zap } from "lucide-react";
import { createTryonJob, type ClothCategory } from "../api/tryonApi";
import Header from "../components/layout/Header";
import UploadBox from "../components/upload/UploadBox";

const Fitting = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { cloth, category } = location.state || {};

  const getMappedCategory = (cat: string): ClothCategory => {
    const lowerCat = String(cat || "").toLowerCase();
    if (lowerCat.includes("dress") || lowerCat.includes("onepiece") || lowerCat.includes("원피스")) return "overall";
    if (lowerCat.includes("pants") || lowerCat.includes("skirt") || lowerCat.includes("lower") || lowerCat.includes("하의")) return "lower";
    return "upper";
  };

  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ClothCategory>(getMappedCategory(category));

  // 💡 [추가]: UploadModal의 모범 자산을 본받아 드래그 상태 관리 스위치 추가
  const [isDragging, setIsDragging] = useState(false);

  const userPreviewUrl = useMemo(() => {
    return file ? URL.createObjectURL(file) : null;
  }, [file]);

  // 💡 [철벽 방어]: 탐색기에서 파일을 끌어다 놓을 때 브라우저가 멋대로 새 탭을 여는 기본 이벤트를 전역에서 원천 차단합니다.
  useEffect(() => {
    const handleGlobalPrevent = (e: globalThis.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener("dragenter", handleGlobalPrevent, false);
    window.addEventListener("dragover", handleGlobalPrevent, false);
    window.addEventListener("drop", handleGlobalPrevent, false);

    return () => {
      window.removeEventListener("dragenter", handleGlobalPrevent, false);
      window.removeEventListener("dragover", handleGlobalPrevent, false);
      window.removeEventListener("drop", handleGlobalPrevent, false);
    };
  }, []);

  useEffect(() => {
    return () => { if (userPreviewUrl) URL.revokeObjectURL(userPreviewUrl); };
  }, [userPreviewUrl]);

  // 💡 [추가]: 컴포넌트 레벨의 드래그 앤 드롭 핸들러 함수 명시적 정의 (any 없음)
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!droppedFile.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleNext = async () => {
    if (!file || !cloth) {
      alert("사진과 의상을 모두 준비해주세요.");
      return;
    }
    try {
      setIsLoading(true);
      const backendBaseUrl = "https://apivirtualtryon.p-e.kr";
      const targetClothUrl = cloth.startsWith("http") ? cloth : backendBaseUrl + cloth;
      const response = await fetch(targetClothUrl);
      const blob = await response.blob();
      const clothFile = new File([blob], "cloth.jpg", { type: "image/jpeg" });

      const job = await createTryonJob({
        personImage: file,
        clothImage: clothFile,
        clothType: selectedCategory,
      });

      navigate("/result", {
        state: { tryonId: job.tryonId, userPreview: userPreviewUrl, clothType: selectedCategory, clothPreview: cloth }
      });
    } catch (error) {
      console.error("서버 통신 오류:", error);
      alert("서버 통신에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-[#F5F5F3] pb-24 font-sans text-[#111111]">
        <Header />

        <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-12 flex flex-col items-center relative">
          <button onClick={() => navigate("/")} className="absolute left-6 top-16 group p-4 bg-white rounded-full border border-gray-200 hover:bg-[#111111] transition-all shadow-sm hidden md:block">
            <ChevronLeft size={24} className="group-hover:text-white" />
          </button>

          <h1 className="text-4xl font-[1000] tracking-tighter mb-2 uppercase italic">Virtual Fitting</h1>
          <p className="text-gray-400 font-bold text-xs tracking-widest mb-12">CHOOSE CATEGORY & UPLOAD YOUR PHOTO</p>

          {/* 1. 카테고리 선택 */}
          <div className="flex justify-center gap-4 mb-10 w-full max-w-[600px]">
            {["upper", "lower", "overall"].map((cat) => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat as ClothCategory)}
                    className={`flex-1 py-4 rounded-2xl text-[11px] font-black tracking-widest transition-all ${
                        selectedCategory === cat
                            ? "bg-[#2563EB] text-white shadow-xl scale-105"
                            : "bg-white border border-gray-200 text-gray-400 hover:bg-gray-100"
                    }`}
                >
                  {cat.toUpperCase()}
                </button>
            ))}
          </div>

          {/* 2. 메인 컨텐츠 영역 */}
          <div className="grid md:grid-cols-2 gap-8 w-full">

            {/* Step 01: 내 모델 사진 (드래그 앤 드롭 이식 완료) */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end px-2">
                <span className="text-[10px] font-black text-[#2563EB] tracking-widest uppercase flex items-center gap-1">
                  <Shirt size={12} /> Step 01
                </span>
                <h2 className="text-lg font-black italic">MY MODEL</h2>
              </div>

              <div
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative aspect-[3/4] bg-white rounded-[2.5rem] border shadow-sm overflow-hidden group transition-all duration-300
                    ${isDragging ? "border-[#2563EB] bg-blue-50/30 border-dashed scale-[1.01]" : "border-gray-200"}
                  `}
              >
                {userPreviewUrl ? (
                    // 💡 pointer-events-none 적용으로 내부 이미지 컨텐츠가 드래그 인식을 뺏는 버그 차단
                    <div className="w-full h-full pointer-events-none relative">
                      <img src={userPreviewUrl} className="w-full h-full object-cover" alt="Model" />

                      {cloth && (
                          <div className={`absolute right-4 ${selectedCategory === 'upper' ? 'top-4' : 'bottom-4'} 
                            w-32 h-44 bg-white/90 backdrop-blur-md rounded-3xl border border-white shadow-2xl 
                            flex items-center justify-center p-3 animate-in fade-in slide-in-from-right-5 duration-500`}
                          >
                            <div className="relative w-full h-full flex flex-col">
                              <p className="text-[8px] font-black text-[#2563EB] mb-2 text-center flex items-center justify-center gap-1">
                                <Zap size={8} fill="currentColor"/> PREVIEW
                              </p>
                              <div className="flex-grow flex items-center justify-center relative overflow-hidden rounded-xl bg-gray-50/50">
                                <img
                                    src={cloth}
                                    className={`w-[70%] h-auto object-contain drop-shadow-lg transition-transform duration-700
                                      ${selectedCategory === 'upper' ? 'translate-y-[-10%]' : ''}
                                      ${selectedCategory === 'lower' ? 'translate-y-[10%]' : ''}
                                    `}
                                    alt="Cloth Popup"
                                />
                              </div>
                            </div>
                          </div>
                      )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center pointer-events-none">
                      <UploadBox />
                      <p className="text-[10px] font-bold text-gray-400 mt-2">이곳에 사진을 드래그해서 놓을 수도 있습니다</p>
                    </div>
                )}
              </div>
            </div>

            {/* Step 02: 선택한 의상 */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end px-2">
                <span className="text-[10px] font-black text-gray-300 tracking-widest uppercase">Step 02</span>
                <h2 className="text-lg font-black italic">SELECTED ITEM</h2>
              </div>
              <div className="aspect-[3/4] bg-white rounded-[2.5rem] border border-gray-200 shadow-sm flex items-center justify-center p-12">
                <img src={cloth} className="max-w-full max-h-full object-contain drop-shadow-2xl" alt="Selected" />
              </div>
            </div>
          </div>

          {/* 3. 하단 보조 버튼 */}
          <div className="grid grid-cols-2 gap-8 w-full mt-8">
            <label className="flex items-center justify-center gap-3 py-5 bg-white border-2 border-dashed border-gray-200 rounded-3xl font-black text-[11px] tracking-widest text-gray-500 hover:border-[#111111] hover:text-[#111111] cursor-pointer transition-all shadow-sm">
              <ImagePlus size={18} />
              {file ? "사진 교체하기" : "내 사진 선택하기"}
              <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
            </label>

            <button
                onClick={() => navigate("/")}
                className="flex items-center justify-center gap-3 py-5 bg-white border-2 border-gray-200 rounded-3xl font-black text-[11px] tracking-widest text-gray-500 hover:border-[#111111] hover:text-[#111111] transition-all shadow-sm"
            >
              <RefreshCw size={18} />
              다른 옷 골라보기
            </button>
          </div>

          {/* 4. 메인 피팅 시작 버튼 */}
          <button
              onClick={handleNext}
              disabled={!file || isLoading}
              className={`w-full max-w-[500px] mt-16 py-7 rounded-[2rem] text-lg font-[1000] tracking-[0.2em] transition-all duration-500 shadow-2xl flex justify-center items-center gap-4 ${
                  !file || isLoading
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#111111] text-white hover:bg-black hover:scale-[1.03] active:scale-95"
              }`}
          >
            {isLoading ? <Loader2 className="animate-spin" size={24} /> : "START VIRTUAL TRY-ON"}
          </button>
        </div>
      </div>
  );
};

export default Fitting;