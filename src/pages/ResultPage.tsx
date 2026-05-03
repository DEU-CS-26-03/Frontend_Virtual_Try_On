// src/pages/ResultPage.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Star, Download, RotateCcw, Camera } from "lucide-react";
import Header from "../components/layout/Header";
import { useTryonPipeline } from "../hooks/useTryonPipeline";

const ResultPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { userFile, garmentId, externalItemKey, userPreview } = state || {};

  // Polling 및 상태 관리 전담
  const { run, status, resultImageUrl, errorMessage } = useTryonPipeline();
  
  const [rating, setRating] = useState(0);
  const [showRec, setShowRec] = useState(false);

  // 초기 진입 시 워크플로우 실행
  useEffect(() => {
    if (!userFile || (!garmentId && !externalItemKey)) {
      navigate("/");
      return;
    }
    
    run(userFile, garmentId || externalItemKey);
  }, [userFile, garmentId, externalItemKey, navigate, run]);

  const handleDownload = () => {
    if (!resultImageUrl) return;
    const link = document.createElement("a");
    link.href = resultImageUrl;
    link.download = `fitting_result_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] pb-32 font-sans text-[#111111]">
      <Header />

      <div className="max-w-[1600px] mx-auto px-10 pt-16 pb-12 flex justify-between items-end">
        <h1 className="text-6xl font-[1000] tracking-tighter leading-none uppercase">
          피팅
          <br />
          <span className="text-gray-300 italic font-light">결과</span>
        </h1>

        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-8 py-3 bg-white border border-gray-200 rounded-full text-xs font-black tracking-widest hover:bg-black hover:text-white transition-all"
          >
            <Camera size={16} /> 사진 교체
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-8 py-3 bg-[#111111] text-white rounded-full text-xs font-black tracking-widest hover:bg-gray-800 transition-all"
          >
            <RotateCcw size={16} /> 처음으로
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto grid md:grid-cols-2 gap-12 px-10 mb-24">
        <div className="space-y-5 text-center md:text-left">
          <span className="text-[11px] font-[1000] tracking-[0.3em] text-gray-300 uppercase px-2">
            Original
          </span>
          <div className="relative aspect-[3/4] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            <img src={userPreview} className="w-full h-full object-cover" alt="Before" />
            <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-md text-white px-5 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
              Before
            </div>
          </div>
        </div>

        <div className="space-y-5 text-center md:text-left">
          <span className="text-[11px] font-[1000] tracking-[0.3em] text-[#2563EB] uppercase px-2">
            After Style
          </span>
          <div className="relative aspect-[3/4] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-2xl flex items-center justify-center">
            
            {(status === "submitting" || status === "polling") ? (
              <div className="text-center space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 border-[3px] border-gray-100 rounded-full"></div>
                  <div className="absolute inset-0 border-[3px] border-t-[#2563EB] rounded-full animate-spin"></div>
                </div>
                <p className="text-xs font-black text-gray-400 tracking-widest uppercase animate-pulse">
                  {status === "submitting" ? "요청 전송 중..." : "AI 스타일 합성 중..."}
                </p>
              </div>
            ) : status === "error" ? (
              //FAILED 상태 처리
              <div className="text-center p-8 space-y-4">
                <div className="text-4xl text-red-500 mb-2">⚠️</div>
                <p className="text-sm font-black text-gray-800 tracking-tight">합성에 실패했습니다.</p>
                <p className="text-xs text-red-500 font-medium">{errorMessage || "알 수 없는 오류 발생"}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-gray-100 rounded-full text-[10px] font-bold">다시 시도</button>
              </div>
            ) : (
              // COMPLETED 상태 시 결과 이미지 표시
              <>
                <img
                  src={resultImageUrl || userPreview}
                  className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-1000"
                  alt="Result"
                />
                <div className="absolute top-6 left-6 bg-[#2563EB] text-white px-5 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-lg uppercase">
                  Generated
                </div>
                {resultImageUrl && (
                  <button
                    onClick={handleDownload}
                    className="absolute bottom-8 right-8 p-6 bg-[#111111] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
                  >
                    <Download size={24} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {status === "done" && (
        <div className="max-w-5xl mx-auto px-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="bg-[#111111] py-20 px-10 rounded-[4rem] shadow-2xl text-center text-white relative overflow-hidden">
            <span className="text-[11px] font-[1000] tracking-[0.5em] text-[#2563EB] uppercase mb-6 block">Feedback</span>
            <h2 className="text-4xl font-[1000] mb-12 tracking-tighter uppercase font-sans">결과가 마음에 드시나요?</h2>

            <div className="flex justify-center gap-6 mb-16">
              {[1, 2, 3, 4, 5].map((idx) => (
                <button
                  key={idx}
                  onClick={() => { setRating(idx); setShowRec(true); }}
                  className="transition-transform hover:scale-125"
                >
                  <Star
                    size={52}
                    className={`transition-all duration-300 ${idx <= rating ? "fill-[#2563EB] text-[#2563EB]" : "text-gray-800"}`}
                    strokeWidth={idx <= rating ? 0 : 1.5}
                  />
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <button className="px-16 py-6 bg-[#2563EB] rounded-2xl font-black text-[12px] tracking-widest hover:bg-blue-700 transition-all uppercase">완전 만족해요!</button>
              <button onClick={() => navigate("/")} className="px-16 py-6 border border-gray-800 text-gray-500 rounded-2xl font-black text-[12px] tracking-widest hover:border-white hover:text-white transition-all uppercase">조금 아쉬워요</button>
            </div>
          </div>

          {showRec && (
            <div className="mt-32 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-1000 text-center">
              <div className="flex flex-col items-center gap-4 mb-20">
                <div className="w-12 h-[2px] bg-[#2563EB]"></div>
                <h3 className="text-4xl font-[1000] tracking-tighter uppercase font-sans">당신을 위한 추천 아이템</h3>
                <p className="text-gray-400 font-bold text-[10px] tracking-widest uppercase mt-2">Recommended for you</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="group cursor-pointer text-left">
                    <div className="aspect-[3/4] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:-translate-y-3">
                      <img src={`https://picsum.photos/seed/shop${i + 30}/500/660`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Rec" />
                    </div>
                    <div className="mt-6 px-2">
                      <p className="text-[10px] font-black text-[#2563EB] uppercase tracking-[0.2em] mb-1 font-sans">Trend Now</p>
                      <h4 className="font-bold text-lg text-[#111111] font-sans">추천 아이템 스타일 {i}</h4>
                      <p className="text-gray-400 text-sm font-bold mt-1">₩ 49,000</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultPage;