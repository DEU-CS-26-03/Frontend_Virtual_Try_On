import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Star, Download, RotateCcw, ShoppingBag, Camera, ThumbsUp, ThumbsDown } from "lucide-react";
// UI 확인 위해 주석처리
// import { createTryOn, getTryOnStatus } from "../api/tryonApi"; 

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { garmentId, cloth, preview, userImageId } = location.state || {};
  
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState("AI 피팅 요청 중...");
  const [rating, setRating] = useState(0);
  const [showRec, setShowRec] = useState(false);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!preview) {
      navigate("/");
      return;
    }

    // 나중에 연동 시 startFittingProcess()로 변경
    const simulateUI = () => {
      setLoading(true);
      setStatusText("이미지를 분석하고 있습니다...");

      // 1.5초 후 상태 메시지 변경 테스트
      setTimeout(() => setStatusText("AI가 옷을 입히는 중입니다... (85%)"), 1500);

      // 3초 후 결과 화면 출력 테스트
      pollTimer.current = setTimeout(() => {
        // 테스트용 랜덤 이미지
        setResultImage("https://picsum.photos/seed/fitting_res/800/1200"); 
        setLoading(false);
      }, 3000);
    };

    simulateUI();

    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [preview, navigate]);

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `fitting_result.jpg`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      {/* 헤더 */}
      <div className="w-full border-b border-gray-200 bg-white py-6 mb-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <h1 className="text-3xl font-black tracking-tight italic">가상 피팅 결과</h1>
          <div className="flex gap-3">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all">
              <Camera size={18} /> 사진 교체
            </button>
            <button onClick={() => navigate("/")} className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-sm font-bold shadow-lg hover:bg-gray-800 transition-all">
              <RotateCcw size={18} /> 처음으로
            </button>
          </div>
        </div>
      </div>

      {/* 메인 이미지 영역 */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 px-6 mb-16">
        {/* 원본 (Before) */}
        <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-gray-100">
          <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3 text-center">원본</p>
          <div className="relative w-full h-[650px] bg-gray-100 rounded-[1.8rem] overflow-hidden">
            <img src={preview} className="w-full h-full object-cover" alt="Before" />
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-4 py-1 rounded-full text-xs font-bold">BEFORE</div>
          </div>
        </div>

        {/* 결과 (After) */}
        <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-gray-100 relative">
          <p className="text-[10px] font-black tracking-widest text-blue-500 uppercase mb-3 text-center">가상 피팅 결과</p>
          <div className="relative w-full h-[650px] bg-gray-100 rounded-[1.8rem] overflow-hidden flex items-center justify-center">
            {loading ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin mx-auto" />
                <p className="text-sm font-bold text-gray-400">{statusText}</p>
              </div>
            ) : (
              <>
                <img src={resultImage!} className="w-full h-full object-cover animate-fadeIn" alt="After" />
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">AFTER</div>
                <button onClick={handleDownload} className="absolute bottom-6 right-6 p-5 bg-black text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                  <Download size={22} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 하단 만족도 영역 (loading이 끝나면 등장) */}
      {!loading && (
        <div className="max-w-4xl mx-auto px-6 animate-slideUp">
          <div className="bg-white py-12 px-8 rounded-[3rem] shadow-2xl border border-gray-100 text-center">
            <h2 className="text-2xl font-black mb-8">스타일링이 마음에 드시나요?</h2>
            <div className="flex justify-center gap-4 mb-10">
              {[1, 2, 3, 4, 5].map((idx) => (
                <button key={idx} onClick={() => { setRating(idx); setShowRec(true); }}>
                  <Star size={48} className={`transition-all duration-300 ${idx <= rating ? "fill-yellow-400 text-yellow-400 scale-110" : "text-gray-100 hover:text-gray-300"}`} />
                </button>
              ))}
            </div>
            <div className="flex justify-center gap-4">
              <button className="flex items-center gap-2 px-14 py-5 bg-black text-white rounded-2xl font-bold shadow-xl hover:scale-105 transition-all"><ThumbsUp size={20} /> 만족해요!</button>
              <button onClick={() => navigate("/")} className="flex items-center gap-2 px-14 py-5 bg-white border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all"><ThumbsDown size={20} /> 아쉬워요..</button>
            </div>
          </div>

          {/* 추천 아이템 섹션 */}
          {showRec && (
            <div className="mt-20 pb-10 animate-fadeIn">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><ShoppingBag size={24} /></div>
                <h3 className="text-2xl font-black tracking-tight">이런 옷은 어떠세요?</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden group cursor-pointer">
                    <img src={`https://picsum.photos/seed/rec${i}/300/400`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
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