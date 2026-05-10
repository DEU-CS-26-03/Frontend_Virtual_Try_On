import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Star, Download, RotateCcw, Camera, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Header from "../components/layout/Header";
import { getTryonStatus } from "../api/tryonApi";
import type { TryonStatus, ClothCategory } from "../api/tryonApi";

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

  // 30~45번째 줄: ESLint 미사용 변수 에러 해결 (rating, showRec 상태 정의)
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [finalUserImage, setFinalUserImage] = useState<string | null>(uploadedUserImageUrl || userPreview || null);
  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState("AI 엔진 연결 중...");
  const [rating, setRating] = useState(0);
  const [showRec, setShowRec] = useState(false);
  const pollTimerRef = useRef<number | undefined>(undefined);

  const getCategoryLabel = (type?: string) => {
    if (type === "lower") return "하의(Lower) 모드";
    if (type === "overall") return "원피스(Overall) 모드";
    return "상의(Upper) 모드";
  };

  // 55~65번째 줄: handleDownload 함수를 버튼에 연결하여 에러 해결
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

          // TryonStatus 타입 사용 로직
          const currentStatus: TryonStatus = polled.status;

          if (currentStatus === "queued") setStatusText("대기열 확인 중...");
          if (currentStatus === "processing") setStatusText(`AI가 ${getCategoryLabel(clothType)}로 합성 중...`);

          if (polled.userImageId) {
            const url = getPublicUrl(polled.userImageId);
            if (url) setFinalUserImage(url);
          }

          if (currentStatus === "completed") {
            setResultImage(polled.resultImageUrl || null);
            setLoading(false);
            clearPolling();
          } else if (currentStatus === "failed") {
            setStatusText("합성에 실패했습니다. 사진 품질을 확인하세요.");
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
                  <CheckCircle2 size={18} /> 합성 완료: {getCategoryLabel(clothType)}
                </div>
            )}
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-8 py-3 bg-white border rounded-full text-xs font-black">
              <Camera size={16} /> 다시 하기
            </button>
            <button onClick={() => navigate("/")} className="flex items-center gap-2 px-8 py-3 bg-[#111111] text-white rounded-full text-xs font-black">
              <RotateCcw size={16} /> 처음으로
            </button>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto grid md:grid-cols-2 gap-12 px-10 mb-24">
          <div className="space-y-5">
            <span className="text-[11px] font-[1000] text-gray-300 uppercase px-2">Original Identity</span>
            <div className="relative aspect-[3/4] bg-white rounded-3xl overflow-hidden border">
              {finalUserImage && <img src={finalUserImage} className="w-full h-full object-cover" alt="Before" />}
              <div className="absolute top-6 left-6 bg-black/80 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase">Source</div>
            </div>
          </div>

          <div className="space-y-5">
            <span className="text-[11px] font-[1000] text-[#2563EB] uppercase px-2">AI Generated Style</span>
            <div className="relative aspect-[3/4] bg-white rounded-3xl overflow-hidden border shadow-2xl flex items-center justify-center">
              {loading ? (
                  <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-[#2563EB] mx-auto" />
                    <p className="text-xs font-black uppercase animate-pulse">{statusText}</p>
                    {/* ★ 에러 해결: 실패 시 AlertCircle 보여주기 */}
                    {statusText.includes("실패") && <AlertCircle className="text-red-500 mx-auto" size={32} />}
                  </div>
              ) : (
                  <>
                    <img src={resultImage || ""} className="w-full h-full object-cover animate-in fade-in duration-1000" alt="Result" />
                    <div className="absolute top-6 left-6 bg-[#2563EB] text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase">Generated</div>
                    {/* ★ 에러 해결: handleDownload 함수 연결 */}
                    <button onClick={handleDownload} className="absolute bottom-8 right-8 p-6 bg-[#111111] text-white rounded-full hover:scale-110 transition-all">
                      <Download size={24} />
                    </button>
                  </>
              )}
            </div>
          </div>
        </div>

        {/* ★ 에러 해결: Star, rating, setRating, showRec 사용 섹션 */}
        {!loading && resultImage && (
            <div className="max-w-5xl mx-auto px-10 text-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <div className="bg-[#111111] py-20 rounded-[4rem] text-white relative overflow-hidden">
                <h2 className="text-4xl font-[1000] mb-12">결과가 마음에 드시나요?</h2>
                <div className="flex justify-center gap-6 mb-16">
                  {[1, 2, 3, 4, 5].map((idx) => (
                      <button key={idx} onClick={() => { setRating(idx); setShowRec(true); }} className="hover:scale-125 transition-transform">
                        <Star size={52} className={idx <= rating ? "fill-[#2563EB] text-[#2563EB]" : "text-gray-800"} />
                      </button>
                  ))}
                </div>
                {showRec && <p className="text-[#2563EB] font-black animate-bounce">감사합니다! 아래에 추천 스타일을 준비했습니다.</p>}
              </div>
            </div>
        )}
      </div>
  );
};

export default ResultPage;