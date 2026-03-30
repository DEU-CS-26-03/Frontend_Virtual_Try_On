import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Star, Download, RotateCcw, ThumbsUp, ThumbsDown, ShoppingBag, Camera } from "lucide-react";

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Fitting 페이지에서 넘겨받은 데이터
  const { garmentId, cloth, preview, userImageId } = location.state || {};
  
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    /**
     * 서버에 저장된 생성 결과를 요청하는 로직
     */
    const fetchAIResult = async () => {
      try {
        setLoading(true);

        /* 
        const response = await fetch(`https://api.your-domain.com/v1/result/${userImageId}`);
        const data = await response.json();
        setResult(`${data.image_url}?t=${new Date().getTime()}`);
        */

        // 결과 UI 확인용 코드, 실제 구현시 수정 
        await new Promise(resolve => setTimeout(resolve, 3000));
        setResult("https://picsum.photos/seed/fitting_done/800/1000");

      } catch (err) {
        console.error("결과 생성 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userImageId) {
      fetchAIResult();
    }
  }, [userImageId]);

  // 이미지 다운로드 함수
  const handleDownload = async () => {
    if (!result) return;
    try {
      const response = await fetch(result);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "my_style_result.jpg";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("다운로드 실패", e);
    }
  };

  // 별점 클릭 시 실행
  const handleRating = (index: number) => {
    setRating(index);
    setShowRecommendations(true);
    
    /* [실제 코드 - 별점 데이터 서버 전송]
    // fetch('/api/rating', { method: 'POST', body: JSON.stringify({ garmentId, rating: index }) });
    */
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      {/* 1. 상단 바 */}
      <div className="w-full border-b border-gray-200 bg-white py-6 mb-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold tracking-tight">피팅 완료</h1>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate("/fitting", { state: { cloth, garmentId } })}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all"
            >
              <Camera size={18} /> 다시 찍기
            </button>
            <button 
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-sm font-bold shadow-lg hover:bg-gray-800 transition-all"
            >
              <RotateCcw size={18} /> 메인 페이지로
            </button>
          </div>
        </div>
      </div>

      {/* 2. 이미지 비교 영역 */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 px-6 mb-16">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col">
          <span className="text-[10px] font-black tracking-widest text-gray-300 uppercase mb-4 text-center">My Photo</span>
          <div className="flex-1 min-h-[500px] bg-gray-50 rounded-[1.8rem] overflow-hidden">
            {preview ? <img src={preview} className="w-full h-full object-contain" alt="Before" /> : <div className="h-full flex items-center justify-center italic text-gray-300">이미지 없음</div>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col relative">
          <span className="text-[10px] font-black tracking-widest text-blue-500 uppercase mb-4 text-center">AI Fitting</span>
          <div className="flex-1 min-h-[500px] bg-gray-50 rounded-[1.8rem] overflow-hidden relative">
            {!loading && result ? (
              <>
                <img src={result} className="w-full h-full object-contain animate-fadeIn" alt="After" />
                <button onClick={handleDownload} className="absolute bottom-6 right-6 p-4.5 bg-black text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                  <Download size={22} />
                </button>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4 bg-gray-50">
                <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
                <p className="text-sm font-bold text-gray-400">스타일링 생성 중...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. 만족도 조사 섹션 (로딩 완료 후에만 표시) */}
      {!loading && result && (
        <div className="max-w-7xl mx-auto px-6 space-y-12 animate-slideUp">
          <div className="bg-white py-12 px-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-center">
            <h2 className="text-2xl font-bold mb-8">결과가 마음에 드시나요?</h2>
            <div className="flex justify-center gap-3 mb-10">
              {[1, 2, 3, 4, 5].map((idx) => (
                <button key={idx} onClick={() => handleRating(idx)}>
                  <Star size={48} className={`transition-all duration-300 ${idx <= rating ? "fill-yellow-400 text-yellow-400 scale-110" : "text-gray-100 hover:text-gray-200"}`} />
                </button>
              ))}
            </div>
            <div className="flex justify-center gap-4">
              <button className="flex items-center gap-2 px-10 py-4 bg-black text-white rounded-2xl font-bold shadow-lg hover:bg-gray-800">
                <ThumbsUp size={19} /> 만족해요!
              </button>
              <button className="flex items-center gap-2 px-10 py-4 bg-white border border-gray-200 rounded-2xl font-bold hover:bg-gray-50">
                <ThumbsDown size={19} /> 조금 아쉬워요
              </button>
            </div>
          </div>

          {/* 4. 추천 아이템 섹션 */}
          {showRecommendations && (
            <div className="animate-fadeIn space-y-8 pb-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><ShoppingBag size={22} /></div>
                <h3 className="text-2xl font-extrabold tracking-tight">회원님을 위한 추천 아이템</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-white rounded-[1.5rem] border border-gray-100 shadow-sm animate-pulse" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Result;