import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Star, Download, RotateCcw, Camera, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import Header from "../components/layout/Header";
import { getTryonStatus } from "../api/tryonApi";
import type { ClothCategory, TryonStatus } from "../api/tryonApi";

type ResultPageState = {
  tryonId?: string;
  userPreview?: string | null;
  uploadedUserImageUrl?: string | null;
  clothType?: ClothCategory;
  garmentCategory?: string;
};

interface RecommendItem {
  id: string;
  brandName: string;
  category: string;
  name: string;
  fileUrl: string;
}

interface LocalHistoryItem {
  id: string;
  originalImageUrl: string;
  resultImageUrl: string;
  category: string;
  createdAt: string;
}

const normalizeFileUrl = (url?: string | null): string => {
  if (!url) return "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=500&q=80";
  if (url.startsWith("https://") || url.startsWith("data:")) return url;
  if (url.startsWith("http://217.142.255.158")) {
    return url.replace("http://217.142.255.158", "https://apivirtualtryon.p-e.kr");
  }
  const backendBase = "https://apivirtualtryon.p-e.kr";
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${backendBase}${cleanUrl}`;
};

const getCategoryDisplayName = (cat: string): string => {
  const lower = cat.toLowerCase();
  if (lower === "top" || lower === "upper") return "상의 (TOP)";
  if (lower === "bottom" || lower === "lower") return "하의 (BOTTOM)";
  if (lower === "dress" || lower === "overall") return "원피스 (DRESS)";
  return "추천 의류";
};

// 💡 헬퍼 함수들을 컴포넌트 밖이나 최상단에 빼두어 TS2304 에러를 방지합니다.
const getValidToken = (): string => {
  const userRaw = sessionStorage.getItem("user");
  const accessTokenRaw = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
  const tokenRaw = sessionStorage.getItem("token") || localStorage.getItem("token");

  if (accessTokenRaw) return accessTokenRaw;
  if (tokenRaw) return tokenRaw;
  if (userRaw) {
    try {
      const parsed = JSON.parse(userRaw);
      return (parsed.accessToken || parsed.token || "") as string;
    } catch { return ""; }
  }
  return "";
};

const getHistoryStorageKey = (): string => {
  const userRaw = sessionStorage.getItem("user");
  if (userRaw) {
    try {
      const parsed = JSON.parse(userRaw);
      const identifier = parsed.id || parsed.userId || parsed.email || "guest";
      return `fittingHistory_${identifier}`;
    } catch {
      return "fittingHistory_guest";
    }
  }
  return "fittingHistory_guest";
};

const ResultPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { tryonId, userPreview, uploadedUserImageUrl, clothType, garmentCategory } = (state || {}) as ResultPageState;

  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState("AI 엔진 연결 중...");
  const [rating, setRating] = useState(0);
  const [showRec, setShowRec] = useState(false);

  const [backendResultId, setBackendResultId] = useState<string | null>(null);
  const [recommendedItems, setRecommendedItems] = useState<RecommendItem[]>([]);
  const [isRecLoading, setIsRecLoading] = useState(false);
  const [currentCategoryLabel, setCurrentCategoryLabel] = useState("");

  const pollTimerRef = useRef<number | undefined>(undefined);

  const rawUserImage = userPreview || uploadedUserImageUrl || null;
  const finalUserImage = rawUserImage && rawUserImage.trim() !== "" ? rawUserImage : null;

  const getStatusLabel = (status: TryonStatus, type?: ClothCategory): string => {
    if (status === "queued") return "서버 대기열에서 차례를 기다리고 있습니다...";
    if (status === "processing") {
      if (type === "lower") return "AI가 하체 라인에 맞춰 Bottom(하의)을 정밀 합성 중입니다...";
      if (type === "overall") return "AI가 전신 체형을 분석하여 Onepiece(원피스) 핏을 맞추는 중입니다...";
      return "AI가 상체 어깨와 소매 라인을 따라 Top(상의)을 매칭 중입니다...";
    }
    if (status === "completed") return "스타일 변신 완료!";
    if (status === "failed") return "합성에 실패했습니다. 사진 품질을 확인하세요.";
    return "준비 중...";
  };

  const handleDownload = async () => {
    if (!resultImage) return;
    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `style_fitting_${tryonId || "result"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("다운로드 중 오류 발생:", error);
      window.open(resultImage, "_blank");
    }
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

          const currentStatus = polled.status;
          setStatusText(getStatusLabel(currentStatus, clothType));

          if (currentStatus === "completed") {
            const finalImg = polled.resultImageUrl || null;
            const targetResultId = polled.resultId || tryonId || String(Math.random());

            setResultImage(finalImg);
            setBackendResultId(targetResultId);

            // ✨ [유저별 저장소] 생성된 결과를 로컬에 저장
            try {
              const storageKey = getHistoryStorageKey();
              const existingRaw = localStorage.getItem(storageKey);
              const existingHistory: LocalHistoryItem[] = existingRaw ? JSON.parse(existingRaw) : [];

              if (!existingHistory.find(item => item.id === targetResultId)) {
                existingHistory.unshift({
                  id: targetResultId,
                  originalImageUrl: finalUserImage || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=500",
                  resultImageUrl: finalImg || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=500",
                  category: garmentCategory || clothType || "의류",
                  createdAt: new Date().toISOString()
                });
                localStorage.setItem(storageKey, JSON.stringify(existingHistory));
              }
            } catch (error) {
              console.error("로컬 스토리지 저장 실패:", error);
            }

            setLoading(false);
            clearPolling();
          } else if (currentStatus === "failed") {
            setLoading(false);
            clearPolling();
          }
        } catch (err) {
          console.error("🚨 폴링 중 에러 발생:", err);
        }
      }, 3000);
    };

    runPolling();
    return () => { active = false; clearPolling(); };
  }, [tryonId, navigate, clothType, finalUserImage, garmentCategory]);

  const handleRatingSubmit = (selectedRating: number) => {
    setRating(selectedRating);
    setShowRec(true);

    let targetCategory = garmentCategory || clothType || "top";
    if (targetCategory === "upper") targetCategory = "top";
    if (targetCategory === "lower") targetCategory = "bottom";
    if (targetCategory === "overall") targetCategory = "dress";
    setCurrentCategoryLabel(getCategoryDisplayName(targetCategory));

    setRecommendedItems([]);
  };

  const handleRecommendClick = (item: RecommendItem) => {
    alert(`${item.brandName}의 [${item.name}] 상품으로 이동합니다!`);
  };

  return (
      <div className="min-h-screen bg-[#F5F5F3] pb-32 font-sans text-[#111111]">
        <Header />
        <div className="max-w-[1600px] mx-auto px-10 pt-16 pb-12 flex justify-between items-end">
          <div>
            <h1 className="text-6xl font-[1000] tracking-tighter uppercase">Fitting Result</h1>
            {!loading && (
                <div className="flex items-center gap-2 mt-4 text-[#2563EB] font-bold tracking-widest uppercase text-sm">
                  <CheckCircle2 size={18} /> {clothType === 'lower' ? 'Bottom' : clothType === 'overall' ? 'Overall' : 'Top'} Fitting Success
                </div>
            )}
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-8 py-4 bg-white border border-gray-200 rounded-2xl text-xs font-black hover:bg-gray-50 transition-all shadow-sm">
              <Camera size={16} /> 사진 교체
            </button>
            <button onClick={() => navigate("/")} className="flex items-center gap-2 px-8 py-4 bg-[#111111] text-white rounded-2xl text-xs font-black hover:bg-gray-800 transition-all shadow-xl">
              <RotateCcw size={16} /> 다른 옷 입어보기
            </button>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto grid md:grid-cols-2 gap-12 px-10 mb-24">
          <div className="space-y-5">
            <span className="text-[11px] font-[1000] text-gray-300 uppercase px-2 tracking-[0.2em]">Original Identity</span>
            <div className="relative aspect-[3/4] bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm">
              {finalUserImage && <img src={finalUserImage} className="w-full h-full object-cover" alt="Before" />}
              <div className="absolute top-6 left-6 bg-black/80 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase">Source</div>
            </div>
          </div>

          <div className="space-y-5">
            <span className="text-[11px] font-[1000] text-[#2563EB] uppercase px-2 tracking-[0.2em]">AI Generated Style</span>
            <div className ="relative aspect-[3/4] bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl flex items-center justify-center">
              {loading ? (
                  <div className="text-center space-y-4 px-8">
                    <Loader2 className="w-12 h-12 animate-spin text-[#2563EB] mx-auto" />
                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase text-gray-800 tracking-widest animate-pulse leading-relaxed">{statusText}</p>
                      <p className="text-[10px] text-gray-400 font-bold tracking-tight">AI 추론 엔진 가동 중 (평균 30초 소요)</p>
                    </div>
                    {statusText.includes("실패") && <AlertCircle className="text-red-500 mx-auto" size={32} />}
                  </div>
              ) : (
                  <>
                    <img src={resultImage || undefined} className="w-full h-full object-contain bg-white animate-in fade-in duration-1000" alt="Result" />
                    <div className="absolute top-6 left-6 bg-[#2563EB] text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase shadow-lg">Generated</div>
                    <button onClick={handleDownload} className="absolute bottom-8 right-8 p-6 bg-[#111111] text-white rounded-full hover:scale-110 transition-all shadow-2xl group">
                      <Download size={24} className="group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </>
              )}
            </div>
          </div>
        </div>

        {!loading && resultImage && (
            <div className="max-w-[1600px] mx-auto px-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <div className="bg-[#111111] p-16 md:p-20 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-[1000] mb-8 tracking-tighter uppercase">결과가 마음에 드시나요?</h2>
                  <div className="flex justify-center gap-4 md:gap-6">
                    {[1, 2, 3, 4, 5].map((idx) => (
                        <button key={idx} onClick={() => handleRatingSubmit(idx)} className="hover:scale-125 transition-transform">
                          <Star size={48} className={`transition-all ${idx <= rating ? "fill-[#2563EB] text-[#2563EB]" : "text-gray-700"}`} />
                        </button>
                    ))}
                  </div>
                </div>

                {showRec && (
                    <div className="border-t border-gray-800 pt-16 animate-in slide-in-from-bottom-8 duration-700">
                      <div className="flex justify-between items-end mb-8">
                        <div>
                          <p className="text-[#2563EB] font-black uppercase tracking-widest text-xs mb-2">
                            Backend Recommendation Showcase / {currentCategoryLabel}
                          </p>
                          <h3 className="text-2xl font-black flex items-center gap-2 flex-wrap">
                            <span className="bg-[#2563EB] text-white text-xs px-3 py-1.5 rounded-lg uppercase font-black">
                              {currentCategoryLabel}
                            </span>
                            {rating >= 4
                                ? "고객님의 취향에 맞춘 유사한(SIMILAR) 추천 스타일입니다."
                                : rating <= 2
                                    ? "색다른 매력을 선사할 대비되는(CONTRAST) 추천 스타일입니다."
                                    : "다채로운 매력을 담은 혼합형(MIXED) 추천 스타일입니다."}
                          </h3>
                        </div>
                        <button className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                          더보기 <ArrowRight size={14} />
                        </button>
                      </div>

                      {isRecLoading ? (
                          <div className="flex justify-center items-center py-20">
                            <Loader2 className="animate-spin text-[#2563EB]" size={40} />
                          </div>
                      ) : recommendedItems.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {recommendedItems.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleRecommendClick(item)}
                                    className="bg-white/5 rounded-2xl overflow-hidden cursor-pointer hover:bg-white/10 transition-colors border border-white/10 group"
                                >
                                  <div className="aspect-[4/5] bg-gray-800 relative overflow-hidden">
                                    <img src={item.fileUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                  </div>
                                  <div className="p-5">
                                    <p className="text-[10px] font-black tracking-widest text-[#2563EB] mb-1 uppercase">
                                      {item.category.toUpperCase()} / {item.brandName}
                                    </p>
                                    <p className="text-sm font-bold truncate">{item.name}</p>
                                  </div>
                                </div>
                            ))}
                          </div>
                      ) : (
                          <div className="text-center py-10 text-gray-500 font-bold">
                            추천 의류 데이터가 존재하지 않습니다.
                          </div>
                      )}
                    </div>
                )}
              </div>
            </div>
        )}
      </div>
  );
};

export default ResultPage;