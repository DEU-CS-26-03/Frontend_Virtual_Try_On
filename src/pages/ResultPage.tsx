import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Download, RotateCcw, Camera, CheckCircle2, Plus, ZoomIn, X } from "lucide-react";
import Header from "../components/layout/Header";
import { getTryonStatus } from "../api/tryonApi";
import type { ClothCategory, TryonStatus } from "../api/tryonApi";
import { apiRequest, API_ROUTES } from "../api/client";
import ResultBox from "../components/result/ResultBox";
import Rating from "../components/result/Rating";
import { getGarments, type GarmentItem } from "../api/garmentApi";

type ResultPageState = {
  tryonId?: string;
  resultId?: string;
  userPreview?: string | null;
  uploadedUserImageUrl?: string | null;
  clothPreview?: string | null;
  clothType?: ClothCategory;
  garmentCategory?: string;
  historyResultUrl?: string;
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

const normalizeFileUrl = (url?: string | null): string => {
  if (!url) return "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=500&q=80";
  if (url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) return url;
  if (url.startsWith("http://217.142.255.158")) {
    return url.replace("http://217.142.255.158", "https://apivirtualtryon.p-e.kr");
  }
  const backendBase = "https://apivirtualtryon.p-e.kr";
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${backendBase}${cleanUrl}`;
};

const convertBlobToBase64 = (blobUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = blobUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 400;
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
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => { resolve(blobUrl); };
  });
};

const getCategoryDisplayName = (cat: string): string => {
  const lower = cat.toLowerCase();
  if (lower === "top" || lower === "upper") return "상의 (TOP)";
  if (lower === "bottom" || lower === "lower") return "하의 (BOTTOM)";
  if (lower === "dress" || lower === "overall") return "원피스 (DRESS)";
  if (lower === "outer") return "아우터 (OUTER)";
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

  const { tryonId, resultId, userPreview, uploadedUserImageUrl, clothPreview, clothType, garmentCategory, historyResultUrl } = (state || {}) as ResultPageState;

  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(historyResultUrl || null);
  const [loading, setLoading] = useState<boolean>(!historyResultUrl);
  const [statusText, setStatusText] = useState(historyResultUrl ? "스타일 변신 완료!" : "AI 엔진 연결 중...");

  const [rating, setRating] = useState(0);
  const [showRec, setShowRec] = useState(false);
  const [backendResultId, setBackendResultId] = useState<string | null>(resultId || null);
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
    if (historyResultUrl) {
      return;
    }

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

            try {
              const storageKey = getHistoryStorageKey();
              const existingRaw = localStorage.getItem(storageKey);
              const existingHistory: LocalHistoryItem[] = existingRaw ? JSON.parse(existingRaw) : [];

              if (!existingHistory.find(item => item.id === targetResultId)) {
                let permanentModelImage = finalUserImage || "";
                if (permanentModelImage.startsWith("blob:")) {
                  permanentModelImage = await convertBlobToBase64(permanentModelImage);
                }

                existingHistory.unshift({
                  id: targetResultId,
                  originalImageUrl: permanentModelImage,
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
  }, [tryonId, navigate, clothType, finalUserImage, garmentCategory, clothPreview, historyResultUrl]);

  const handleRatingSubmit = async (selectedRating: number) => {
    setRating(selectedRating);
    setShowRec(true);
    setIsRecLoading(true);

    const finalResultId = backendResultId || resultId || (tryonId ? `res_${tryonId.replace("tryon_", "").substring(0, 8)}` : "");

    if (!finalResultId) {
      console.warn("결과 ID(resultId)를 식별할 수 없어 별점을 저장할 수 없습니다.");
      setRecommendedItems([]);
      setIsRecLoading(false);
      return;
    }

    try {
      await apiRequest(`${API_ROUTES.RESULTS}/${finalResultId}/feedback`, {
        method: "POST",
        body: JSON.stringify({ rating: selectedRating, comment: "좋아요!" }),
        withAuth: true
      });
      console.log("별점 DB 저장 완료!");

      let targetCategory = String(garmentCategory || clothType || "top").toLowerCase();
      if (targetCategory === "upper") targetCategory = "top";
      if (targetCategory === "lower") targetCategory = "bottom";
      if (targetCategory === "overall") targetCategory = "dress";
      setCurrentCategoryLabel(getCategoryDisplayName(targetCategory));

      const dbItems = await getGarments(targetCategory);
      const filtered = dbItems
          .filter((item: GarmentItem) => item.id !== tryonId)
          .slice(0, 4)
          .map((item) => ({
            id: item.id,
            brandName: item.brandName || "BRAND",
            category: item.category,
            name: item.name || "추천 의상",
            fileUrl: item.fileUrl,
          }));

      setRecommendedItems(filtered);

    } catch (error) {
      console.error("별점 저장 실패 또는 추천 상품 로드 에러:", error);
      setRecommendedItems([]);
    } finally {
      setIsRecLoading(false);
    }
  }; // 💡 문법 에러 원인 1: 누락되었던 닫는 괄호 복구 완료!

  const handleRecommendClick = (item: RecommendItem) => {
    alert(`${item.brandName}의 [${item.name}] 상품으로 이동합니다!`);
  };

  return (
      <div className="min-h-screen bg-[#F5F5F3] pb-32 font-sans text-[#111111]">
        {/* ✨ 확대 클릭 시 화면 전체를 덮는 라이트박스 모달 스크린 */}
        {zoomedImage && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md" onClick={() => setZoomedImage(null)}>
              <button className="absolute top-8 right-8 text-white hover:scale-110 transition-transform"><X size={40} /></button>
              <img src={zoomedImage} className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl animate-in zoom-in duration-300" alt="Zoomed" />
            </div>
        )}

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
          <div className="flex flex-col gap-6 w-full lg:w-[320px] shrink-0">
            {/* MODEL 이미지 카드 */}
            <div className="relative aspect-[4/5] bg-white rounded-[2rem] overflow-hidden shadow-md border border-gray-100 group">
              {finalUserImage ? (
                  <img src={finalUserImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Model" />
              ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
              )}
              <div className="absolute bottom-5 left-5 bg-[#111111]/90 backdrop-blur-sm text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-md z-10">
                MODEL
              </div>
            </div>

            {/* ITEM 이미지 카드 */}
            <div className="relative aspect-[4/5] bg-white rounded-[2rem] overflow-hidden shadow-md border border-gray-100 p-2 group">
              <img src={normalizeFileUrl(clothPreview)} className="w-full h-full object-contain rounded-xl transition-transform duration-700 group-hover:scale-105" alt="Item" />
              <div className="absolute bottom-5 left-5 bg-[#111111]/90 backdrop-blur-sm text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-md">
                ITEM
              </div>
            </div>
          </div>

          <div className="hidden lg:flex shrink-0">
            <Plus size={40} className="text-gray-300" strokeWidth={1.5} />
          </div>

          {/* 3. 우측 결과 전용 스크린 출력 */}
          <div className="w-full lg:w-[500px] shrink-0 relative">
            {/* ✨ 결과 이미지 확대 전용 돋보기 버튼 정밀 배치 */}
            {!loading && resultImage && (
                <button
                    onClick={() => setZoomedImage(resultImage)}
                    className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-sm text-gray-800 rounded-full hover:bg-[#111111] hover:text-white transition-all shadow-md z-10"
                >
                  <ZoomIn size={18} />
                </button>
            )}
            <ResultBox
                imageUrl={resultImage}
                loading={loading}
                statusText={statusText}
                onDownload={handleDownload}
            />
          </div>
        </div>

        {/* 하단 피드백 영역 */}
        {!loading && resultImage && (
            <div className="max-w-[1400px] mx-auto px-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <div className="bg-[#111111] p-16 md:p-20 rounded-[3rem] relative overflow-hidden shadow-2xl">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-[1000] mb-8 tracking-tighter uppercase text-white">결과가 마음에 드시나요?</h2>
                  <Rating rating={rating} onRate={handleRatingSubmit} />
                </div>

                {showRec && (
                    <div className="border-t border-gray-800 pt-16 animate-in slide-in-from-bottom-8 duration-700">
                      <div className="flex justify-between items-end mb-8">
                        <div>
                          <p className="text-[#34D399] font-black uppercase tracking-widest text-xs mb-2">
                            Recommendation Showcase / {currentCategoryLabel}
                          </p>
                          <h3 className="text-2xl font-black text-white">이런 스타일은 어떠신가요?</h3>
                        </div>
                      </div>

                      {recommendedItems.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                            {recommendedItems.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleRecommendClick(item)}
                                    className="group bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-[#34D399] transition-all cursor-pointer flex flex-col"
                                >
                                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-white flex items-center justify-center p-4 relative mb-4">
                                    <img src={normalizeFileUrl(item.fileUrl)} className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105" alt={item.name} />
                                  </div>
                                  <div className="mt-auto text-left">
                                    <p className="text-[10px] font-black text-[#34D399] tracking-widest uppercase">{item.brandName}</p>
                                    <h4 className="text-sm font-bold text-white mt-1 truncate">{item.name}</h4>
                                  </div>
                                </div>
                            ))}
                          </div>
                      ) : (
                          <div className="text-center py-10 text-gray-400 font-bold">추천 의류 데이터가 존재하지 않습니다.</div>
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