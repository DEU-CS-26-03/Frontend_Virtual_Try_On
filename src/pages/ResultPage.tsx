import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Star, Download, RotateCcw, Camera, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Header from "../components/layout/Header";
import { getTryonStatus } from "../api/tryonApi";
import type { ClothCategory } from "../api/tryonApi";

type ResultPageState = {
  tryonId?: string;
  userPreview?: string | null;
  uploadedUserImageUrl?: string | null;
  clothType?: ClothCategory;
};

const ResultPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { tryonId, userPreview, uploadedUserImageUrl, clothType } = (state || {}) as ResultPageState;

  const [resultImage, setResultImage] = useState<string | null>(null);
  const [finalUserImage, setFinalUserImage] = useState<string | null>(uploadedUserImageUrl || userPreview || null);
  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState("AI 엔진 연결 중...");
  const [rating, setRating] = useState(0);
  const [showRec, setShowRec] = useState(false);
  const pollTimerRef = useRef<number | undefined>(undefined);

  // ★ 에러 해결: 부위별 상태 문구를 생성하는 핵심 함수
  const getStatusLabel = (status: string, type?: ClothCategory): string => {
    const s = status.toLowerCase();
    if (s === "queued") return "대기열에서 순서를 기다리는 중입니다...";

    if (s === "processing") {
      // 사용자가 선택한 카테고리에 따른 맞춤형 멘트
      switch (type) {
        case "lower": return "AI가 하체 체형을 분석하여 하의를 합성 중입니다...";
        case "overall": return "AI가 전신 실루엣에 맞춰 원피스를 정밀 피팅 중입니다...";
        default: return "AI가 어깨 라인과 소매를 따라 상의를 매칭 중입니다...";
      }
    }

    if (s === "completed") return "가상 피팅이 완료되었습니다!";
    return "합성에 실패했습니다. 사진을 다시 확인해주세요.";
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `style_fitting_${tryonId}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPublicUrl = (path: string | undefined | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const fileName = path.split("/").pop();
    return `https://apivirtualtryon.p-e.kr/api/v1/display?filename=${fileName}`;
  };

  useEffect(() => {
    let active = true;
    const clearPolling = () => {
      if (pollTimerRef.current !== undefined) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = undefined;
      }
    };

    const runPolling = async () => {
      if (!tryonId) {
        alert("작업 ID가 없습니다.");
        navigate("/");
        return;
      }

      pollTimerRef.current = window.setInterval(async () => {
        try {
          const polled = await getTryonStatus(tryonId);
          if (!active) return;

          // ★ 핵심 수정: getStatusLabel을 사용하여 상태 메시지 업데이트
          const currentLabel = getStatusLabel(polled.status, clothType);
          setStatusText(currentLabel);

          if (polled.userImageId) {
            const url = getPublicUrl(polled.userImageId);
            if (url) setFinalUserImage(url);
          }

          if (polled.status.toLowerCase() === "completed") {
            setResultImage(polled.resultImageUrl || null);
            setLoading(false);
            clearPolling();
          } else if (polled.status.toLowerCase() === "failed") {
            setLoading(false);
            clearPolling();
          }
        } catch (err) { console.error(err); }
      }, 3000);
    };

    runPolling();
    return () => { active = false; clearPolling(); };
  }, [tryonId, navigate, clothType]);

  return (
      <div className="min-h-screen bg-[#F5F5F3] pb-32 font-sans text-[#111111]">
        <Header />
        <div className="max-w-[1600px] mx-auto px-10 pt-16 pb-12 flex justify-between items-end">
          <div>
            <h1 className="text-6xl font-[1000] tracking-tighter uppercase">Fitting Result</h1>
            {!loading && (
                <div className="flex items-center gap-2 mt-4 text-[#2563EB] font-bold">
                  <CheckCircle2 size={18} /> 합성 완료: {clothType === 'lower' ? 'Bottom' : clothType === 'overall' ? 'Overall' : 'Top'} 적용됨
                </div>
            )}
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-8 py-3 bg-white border rounded-full text-xs font-black hover:bg-black hover:text-white transition-all">
              <Camera size={16} /> 사진 교체
            </button>
            <button onClick={() => navigate("/")} className="flex items-center gap-2 px-8 py-3 bg-[#111111] text-white rounded-full text-xs font-black hover:bg-gray-800 transition-all">
              <RotateCcw size={16} /> 처음으로
            </button>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto grid md:grid-cols-2 gap-12 px-10 mb-24">
          <div className="space-y-5">
            <span className="text-[11px] font-[1000] text-gray-300 uppercase px-2">Original Identity</span>
            <div className="relative aspect-[3/4] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
              {finalUserImage && <img src={finalUserImage} className="w-full h-full object-cover" alt="Before" />}
              <div className="absolute top-6 left-6 bg-black/80 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase">Source</div>
            </div>
          </div>

          <div className="space-y-5">
            <span className="text-[11px] font-[1000] text-[#2563EB] uppercase px-2">AI Generated Style</span>
            <div className="relative aspect-[3/4] bg-white rounded-3xl overflow-hidden border shadow-2xl flex items-center justify-center">
              {loading ? (
                  <div className="text-center space-y-4 px-8">
                    <Loader2 className="w-12 h-12 animate-spin text-[#2563EB] mx-auto" />
                    <div className="space-y-2">
                      {/* 폴링 중 업데이트되는 statusText를 직접 표시 */}
                      <p className="text-xs font-black uppercase text-gray-800 tracking-widest animate-pulse leading-relaxed">
                        {statusText}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold tracking-tight">AI 추론 엔진 가동 중 (평균 30초 소요)</p>
                    </div>
                    {statusText.includes("실패") && <AlertCircle className="text-red-500 mx-auto" size={32} />}
                  </div>
              ) : (
                  <>
                    <img src={resultImage || ""} className="w-full h-full object-cover animate-in fade-in duration-1000" alt="Result" />
                    <div className="absolute top-6 left-6 bg-[#2563EB] text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase shadow-lg">Success</div>
                    <button onClick={handleDownload} className="absolute bottom-8 right-8 p-6 bg-[#111111] text-white rounded-full hover:scale-110 transition-all shadow-2xl">
                      <Download size={24} />
                    </button>
                  </>
              )}
            </div>
          </div>
        </div>

        {!loading && resultImage && (
            <div className="max-w-5xl mx-auto px-10 text-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <div className="bg-[#111111] py-20 rounded-[4rem] text-white relative overflow-hidden shadow-2xl">
                <h2 className="text-4xl font-[1000] mb-12 tracking-tighter uppercase">결과가 마음에 드시나요?</h2>
                <div className="flex justify-center gap-6 mb-16">
                  {[1, 2, 3, 4, 5].map((idx) => (
                      <button key={idx} onClick={() => { setRating(idx); setShowRec(true); }} className="hover:scale-125 transition-transform">
                        <Star size={52} className={`transition-all ${idx <= rating ? "fill-[#2563EB] text-[#2563EB]" : "text-gray-800"}`} />
                      </button>
                  ))}
                </div>
                {showRec && (
                    <div className="space-y-4 animate-bounce">
                      <p className="text-[#2563EB] font-black uppercase tracking-widest text-sm">Thank you for your feedback!</p>
                      <p className="text-gray-400 text-xs">피드백을 바탕으로 AI 모델이 더욱 정교해집니다.</p>
                    </div>
                )}
              </div>
            </div>
        )}
      </div>
  );
};

export default ResultPage;