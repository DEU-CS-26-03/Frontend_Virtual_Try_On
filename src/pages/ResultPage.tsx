import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Star, Download, RotateCcw, Camera, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import Header from "../components/layout/Header";
import { getTryonStatus } from "../api/tryonApi";
import type { TryonStatus, ClothCategory } from "../api/tryonApi";

type ResultPageState = {
  tryonId?: string;
  userPreview?: string | null;
  uploadedUserImageUrl?: string | null;
  clothType?: ClothCategory;
};

// ★ 캡스톤 시연용 더미 데이터 (나중에 Spring API로 교체 가능)
const mockSimilarItems = [
  { id: 1, brand: "MINIMALIST", name: "베이직 라운드 니트", img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&q=80" },
  { id: 2, brand: "URBAN STUDIO", name: "소프트 코튼 티셔츠", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&q=80" },
  { id: 3, brand: "ESSENTIAL", name: "스탠다드 핏 셔츠", img: "https://images.unsplash.com/photo-1596755094514-f87e32f85e23?w=300&q=80" },
  { id: 4, brand: "MINIMALIST", name: "오버핏 하프넥 셔츠", img: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=300&q=80" },
];

const mockDifferentItems = [
  { id: 5, brand: "STREET VIBE", name: "와이드 데님 팬츠", img: "https://images.unsplash.com/photo-1542272604-780c9685b5bf?w=300&q=80" },
  { id: 6, brand: "NEW ERA", name: "그래픽 오버핏 반팔", img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=300&q=80" },
  { id: 7, brand: "CHIC CASUAL", name: "플리츠 롱 스커트", img: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=300&q=80" },
  { id: 8, brand: "MODERN", name: "크롭 레더 자켓", img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&q=80" },
];

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

  const getStatusLabel = (status: string, type?: ClothCategory): string => {
    const s = status.toLowerCase();
    if (s === "queued") return "서버 대기열에서 차례를 기다리고 있습니다...";
    if (s === "processing") {
      if (type === "lower") return "AI가 하체 라인에 맞춰 Bottom(하의)을 정밀 합성 중입니다...";
      if (type === "overall") return "AI가 전신 체형을 분석하여 Onepiece(원피스) 핏을 맞추는 중입니다...";
      return "AI가 상체 어깨와 소매 라인을 따라 Top(상의)을 매칭 중입니다...";
    }
    if (s === "completed") return "스타일 변신 완료!";
    if (s === "failed") return "합성에 실패했습니다. 사진 품질을 확인하세요.";
    return "준비 중...";
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

          setStatusText(getStatusLabel(polled.status, clothType));

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

  // ★ 추천 상품 클릭 핸들러 (홈이나 디테일 페이지로 이동)
  const handleRecommendClick = (item: any) => {
    // 실제 서비스에서는 해당 상품 ID를 가지고 피팅 페이지로 다시 이동
    alert(`${item.brand}의 [${item.name}] 상품으로 이동합니다!`);
  };

  return (
      <div className="min-h-screen bg-[#F5F5F3] pb-32 font-sans text-[#111111]">
        <Header />

        {/* 상단 결과 타이틀 */}
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

        {/* 전후 비교 이미지 섹션 */}
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
            <div className="relative aspect-[3/4] bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl flex items-center justify-center">
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
                    <img src={resultImage || ""} className="w-full h-full object-cover animate-in fade-in duration-1000" alt="Result" />
                    <div className="absolute top-6 left-6 bg-[#2563EB] text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase shadow-lg">Generated</div>
                    <button onClick={handleDownload} className="absolute bottom-8 right-8 p-6 bg-[#111111] text-white rounded-full hover:scale-110 transition-all shadow-2xl group">
                      <Download size={24} className="group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </>
              )}
            </div>
          </div>
        </div>

        {/* 별점 평가 및 맞춤 추천 섹션 */}
        {!loading && resultImage && (
            <div className="max-w-[1600px] mx-auto px-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <div className="bg-[#111111] p-16 md:p-20 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">

                {/* 별점 입력 영역 */}
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-[1000] mb-8 tracking-tighter uppercase">결과가 마음에 드시나요?</h2>
                  <div className="flex justify-center gap-4 md:gap-6">
                    {[1, 2, 3, 4, 5].map((idx) => (
                        <button key={idx} onClick={() => { setRating(idx); setShowRec(true); }} className="hover:scale-125 transition-transform">
                          <Star size={48} className={`transition-all ${idx <= rating ? "fill-[#2563EB] text-[#2563EB]" : "text-gray-700"}`} />
                        </button>
                    ))}
                  </div>
                </div>

                {/* ★ 동적 추천 렌더링 영역 */}
                {showRec && (
                    <div className="border-t border-gray-800 pt-16 animate-in slide-in-from-bottom-8 duration-700">
                      <div className="flex justify-between items-end mb-8">
                        <div>
                          <p className="text-[#2563EB] font-black uppercase tracking-widest text-xs mb-2">Personalized Pick</p>
                          <h3 className="text-2xl font-black">
                            {rating >= 3
                                ? "마음에 드셨군요! 이런 비슷한 스타일은 어떠세요?"
                                : "아쉬우셨군요. 새로운 스타일로 기분 전환을 제안해요!"}
                          </h3>
                        </div>
                        <button className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                          더보기 <ArrowRight size={14} />
                        </button>
                      </div>

                      {/* 추천 아이템 그리드 */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {(rating >= 3 ? mockSimilarItems : mockDifferentItems).map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleRecommendClick(item)}
                                className="bg-white/5 rounded-2xl overflow-hidden cursor-pointer hover:bg-white/10 transition-colors border border-white/10 group"
                            >
                              <div className="aspect-[4/5] bg-gray-800 relative overflow-hidden">
                                <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                              </div>
                              <div className="p-5">
                                <p className="text-[10px] font-black tracking-widest text-gray-400 mb-1">{item.brand}</p>
                                <p className="text-sm font-bold truncate">{item.name}</p>
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>
                )}

              </div>
            </div>
        )}
      </div>
  );
};

export default ResultPage;