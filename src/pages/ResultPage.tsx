import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Star, Download, RotateCcw, Camera, CheckCircle2, AlertCircle, Loader2, ArrowRight, Plus } from "lucide-react";
import Header from "../components/layout/Header";
import { getTryonStatus } from "../api/tryonApi";
import type { ClothCategory, TryonStatus } from "../api/tryonApi";

type ResultPageState = {
  tryonId?: string;
  userPreview?: string | null;
  uploadedUserImageUrl?: string | null;
  clothPreview?: string | null; // ✨ Fitting.tsx에서 넘어온 옷 사진
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
  clothImageUrl: string;
  resultImageUrl: string;
  category: string;
  createdAt: string;
}

// 💡 옷 이미지를 안전하게 불러오는 헬퍼 함수
const normalizeFileUrl = (url?: string | null): string => {
  // url이 없으면 기본 이미지(갈색 자켓) 반환
  if (!url) return "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=500&q=80";
  if (url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) return url;
  if (url.startsWith("http://217.142.255.158")) {
    return url.replace("http://217.142.255.158", "https://apivirtualtryon.p-e.kr");
  }
  const backendBase = "https://apivirtualtryon.p-e.kr";
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${backendBase}${cleanUrl}`;
};

// 💡 blob 주소를 받아와 로컬 스토리지용 초경량 JPEG 문자열로 변환하는 함수
const convertBlobToBase64 = (blobUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = blobUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 400; // 히스토리용 해상도 최적화 (용량 다이어트)
      let width = img.width;
      let height = img.height;

      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);

      // 용량을 30~50KB 수준으로 압축하여 반환
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => {
      resolve(blobUrl); // 실패 시 기존 주소 반환
    };
  });
};

const getCategoryDisplayName = (cat: string): string => {
  const lower = cat.toLowerCase();
  if (lower === "top" || lower === "upper") return "상의 (TOP)";
  if (lower === "bottom" || lower === "lower") return "하의 (BOTTOM)";
  if (lower === "dress" || lower === "overall") return "원피스 (DRESS)";
  return "추천 의류";
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

  // ✨ state에서 clothPreview 추출
  const { tryonId, userPreview, uploadedUserImageUrl, clothPreview, clothType, garmentCategory } = (state || {}) as ResultPageState;

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

            // ✨ [수정] 로컬 스토리지 저장 전에 blob 주소를 영구 텍스트 주소로 변환합니다.
            try {
              const storageKey = getHistoryStorageKey();
              const existingRaw = localStorage.getItem(storageKey);
              const existingHistory: LocalHistoryItem[] = existingRaw ? JSON.parse(existingRaw) : [];

              if (!existingHistory.find(item => item.id === targetResultId)) {

                // 💡 살아있는 blob 주소를 영구 저장용 Base64 문자열로 굽기
                let permanentModelImage = finalUserImage || "";
                if (permanentModelImage.startsWith("blob:")) {
                  permanentModelImage = await convertBlobToBase64(permanentModelImage);
                }

                existingHistory.unshift({
                  id: targetResultId,
                  originalImageUrl: permanentModelImage, // ✨ 영구 주소 저장!
                  clothImageUrl: clothPreview ? normalizeFileUrl(clothPreview) : "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=500",
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
  }, [tryonId, navigate, clothType, finalUserImage, garmentCategory, clothPreview]);

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
      // ✨ [수정됨] 배경을 원래의 밝은 톤(#F5F5F3)으로 복구했습니다.
      <div className="min-h-screen bg-[#F5F5F3] pb-32 font-sans text-[#111111]">
        <Header />

        <div className="max-w-[1400px] mx-auto px-10 pt-16 pb-12 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-[1000] tracking-tighter uppercase text-[#111111]">Fitting Result</h1>
            {!loading && (
                <div className="flex items-center gap-2 mt-4 text-[#34D399] font-bold tracking-widest uppercase text-sm">
                  <CheckCircle2 size={18} /> {clothType === 'lower' ? 'Bottom' : clothType === 'overall' ? 'Overall' : 'Top'} Fitting Success
                </div>
            )}
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-6 py-3 bg-white text-[#111111] border border-gray-200 rounded-xl text-xs font-black hover:bg-gray-50 transition-all shadow-sm">
              <Camera size={16} /> 다시 찍기
            </button>
            <button onClick={() => navigate("/")} className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white rounded-xl text-xs font-black hover:bg-gray-800 transition-all shadow-md">
              <RotateCcw size={16} /> 다른 옷 입어보기
            </button>
          </div>
        </div>

        {/* 3단 비교 레이아웃 */}
        <div className="max-w-[1300px] mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 px-10 mb-24">

          {/* 1. 좌측: 입력 데이터 */}
          <div className="flex flex-col gap-6 w-full lg:w-[320px] shrink-0">
            {/* MODEL 이미지 카드 */}
            <div className="relative aspect-[4/5] bg-white rounded-[2rem] overflow-hidden shadow-md border border-gray-100 group">
              {finalUserImage ? (
                  <img src={finalUserImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Model" />
              ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
              )}
              <div className="absolute bottom-5 left-5 bg-[#111111]/90 backdrop-blur-sm text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-md">
                MODEL
              </div>
            </div>

            {/* ITEM 이미지 카드 */}
            <div className="relative aspect-[4/5] bg-white rounded-[2rem] overflow-hidden shadow-md border border-gray-100 p-2 group">
              {/* 💡 여기에 normalizeFileUrl이 적용되어 진짜 옷 이미지를 렌더링합니다 */}
              <img src={normalizeFileUrl(clothPreview)} className="w-full h-full object-contain rounded-xl transition-transform duration-700 group-hover:scale-105" alt="Item" />
              <div className="absolute bottom-5 left-5 bg-[#111111]/90 backdrop-blur-sm text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-md">
                ITEM
              </div>
            </div>
          </div>

          {/* 2. 중앙: 플러스 아이콘 */}
          <div className="hidden lg:flex shrink-0">
            <Plus size={40} className="text-gray-300" strokeWidth={1.5} />
          </div>

          {/* 3. 우측: 결과 출력 */}
          <div className="w-full lg:w-[500px] shrink-0">
            <div className="relative aspect-[3/4] bg-white rounded-[2.5rem] overflow-hidden shadow-xl border-[3px] border-[#34D399] flex items-center justify-center">
              {loading ? (
                  <div className="text-center space-y-4 px-8">
                    <Loader2 className="w-12 h-12 animate-spin text-[#34D399] mx-auto" />
                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase text-gray-800 tracking-widest animate-pulse leading-relaxed">{statusText}</p>
                      <p className="text-[10px] text-gray-400 font-bold tracking-tight">AI 추론 엔진 가동 중 (평균 30초 소요)</p>
                    </div>
                  </div>
              ) : (
                  <>
                    <img src={resultImage || undefined} className="w-full h-full object-contain bg-white animate-in fade-in duration-1000" alt="Result" />

                    <div className="absolute bottom-8 left-8 bg-[#34D399] text-black px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                      TRY-ON RESULT
                    </div>

                    <button onClick={handleDownload} className="absolute bottom-8 right-8 p-4 bg-[#111111]/90 backdrop-blur-sm text-white rounded-full hover:scale-110 transition-all shadow-xl group">
                      <Download size={20} className="group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </>
              )}
            </div>
          </div>
        </div>

        {/* 하단 피드백 영역 (검은색 박스) */}
        {!loading && resultImage && (
            <div className="max-w-[1400px] mx-auto px-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <div className="bg-[#111111] p-16 md:p-20 rounded-[3rem] relative overflow-hidden shadow-2xl">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-[1000] mb-8 tracking-tighter uppercase text-white">결과가 마음에 드시나요?</h2>
                  <div className="flex justify-center gap-4 md:gap-6">
                    {[1, 2, 3, 4, 5].map((idx) => (
                        <button key={idx} onClick={() => handleRatingSubmit(idx)} className="hover:scale-125 transition-transform">
                          <Star size={48} className={`transition-all ${idx <= rating ? "fill-[#34D399] text-[#34D399]" : "text-gray-600"}`} />
                        </button>
                    ))}
                  </div>
                </div>

                {showRec && (
                    <div className="border-t border-gray-800 pt-16 animate-in slide-in-from-bottom-8 duration-700">
                      <div className="flex justify-between items-end mb-8">
                        <div>
                          <p className="text-[#34D399] font-black uppercase tracking-widest text-xs mb-2">
                            Recommendation Showcase / {currentCategoryLabel}
                          </p>
                          <h3 className="text-2xl font-black text-white">
                            이런 스타일은 어떠신가요?
                          </h3>
                        </div>
                      </div>

                      {isRecLoading ? (
                          <div className="flex justify-center items-center py-20">
                            <Loader2 className="animate-spin text-[#34D399]" size={40} />
                          </div>
                      ) : (
                          <div className="text-center py-10 text-gray-400 font-bold">
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