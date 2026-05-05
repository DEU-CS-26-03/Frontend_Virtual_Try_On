import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Zap, ChevronLeft, Loader2 } from "lucide-react";
import { createTryonJob } from "../api/tryonApi";
import UploadBox from "../components/upload/UploadBox";
import UploadButton from "../components/upload/UploadButton";
import Header from "../components/layout/Header";

const Fitting = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ★ 수정됨: 사용하지 않는 garmentId 제거
  const { cloth } = location.state || {};
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

      const response = await fetch(cloth);
      const blob = await response.blob();
      const clothFile = new File([blob], "cloth.jpg", { type: blob.type || "image/jpeg" });

      const job = await createTryonJob({
        personImage: file,
        clothImage: clothFile,
        clothType: "upper",
      });

      navigate("/result", {
        state: { tryonId: job.tryonId, userPreview: userPreviewUrl } // ★ 수정됨: 안 쓰는 clothUrl 넘김 제거
      });

    } catch (error) {
      console.error("피팅 작업 생성 실패:", error);
      alert("가상 피팅 요청에 실패했습니다. 서버 연결을 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-[#F5F5F3] pb-32 font-sans text-[#111111]">
        <Header />

        {/* AI 미리보기 플로팅 카드 */}
        {userPreviewUrl && cloth && (
            <div className="fixed top-28 right-12 z-50 w-56 hidden xl:block animate-in fade-in slide-in-from-right-10 duration-700">
              <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[2rem] shadow-2xl border border-white">
                <p className="text-[10px] font-black tracking-[0.2em] text-[#2563EB] uppercase mb-4 text-center flex items-center justify-center gap-1">
                  <Zap size={12} fill="currentColor" /> AI 실시간 미리보기
                </p>
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
                  <img src={userPreviewUrl} className="w-full h-full object-cover opacity-40" alt="User" />
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <img src={cloth} className="w-full h-auto object-contain drop-shadow-2xl animate-pulse" alt="Cloth" />
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* 헤더 타이틀 */}
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
          {/* 1단계. 사진 업로드 */}
          <div className="flex flex-col">
            <div className="flex justify-between items-end mb-6 px-2">
              <span className="text-[11px] font-[1000] tracking-[0.3em] text-gray-300 uppercase">Step 01</span>
              <h2 className="text-xl font-black">내 사진 업로드</h2>
            </div>
            <div className="h-[600px] bg-white rounded-3xl border border-gray-100 flex items-center justify-center shadow-sm overflow-hidden relative">
              {userPreviewUrl ? (
                  <img src={userPreviewUrl} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                  <UploadBox />
              )}
            </div>
            <div className="mt-8">
              <UploadButton onChange={setFile} />
            </div>
          </div>

          {/* 2단계. 선택한 아이템 */}
          <div className="flex flex-col">
            <div className="flex justify-between items-end mb-6 px-2">
              <span className="text-[11px] font-[1000] tracking-[0.3em] text-gray-300 uppercase">Step 02</span>
              <h2 className="text-xl font-black">선택한 아이템</h2>
            </div>
            <div className="h-[600px] bg-white rounded-3xl border border-gray-100 flex items-center justify-center p-16 shadow-sm">
              <img src={cloth} className="max-w-full max-h-full object-contain drop-shadow-sm" alt="Selected" />
            </div>
            <div className="mt-8">
              <button onClick={() => navigate("/")} className="w-full py-5 bg-transparent border-2 border-[#111111] rounded-2xl font-black text-xs tracking-widest hover:bg-[#111111] hover:text-white transition-all">
                다른 옷 골라보기
              </button>
            </div>
          </div>
        </div>

        {/* 실행 버튼 (★ 중복 버튼 제거하고 스피너 달린 버튼만 남김) */}
        <div className="flex justify-center mt-24">
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