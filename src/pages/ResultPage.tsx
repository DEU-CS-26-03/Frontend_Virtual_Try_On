import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Star, Download, RotateCcw, ThumbsUp, ThumbsDown, ShoppingBag } from "lucide-react";

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { preview } = location.state || {};

  const [result, setResult] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    // 3초 후 결과 이미지 등장 시뮬레이션
    const timer = setTimeout(() => {
      setResult("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=768&h=1024&auto=format&fit=crop");
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // 다운로드 로직
  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result;
    link.download = "fitting_result.jpg";
    link.click();
  };

  // 별점 클릭 시 추천 영역 활성화
  const handleRating = (index: number) => {
    setRating(index);
    setShowRecommendations(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-900">
      {/* 상단 액션 바 */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-2xl font-extrabold tracking-tight">피팅 결과</h1>
        <button 
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all"
        >
          <RotateCcw size={16} className="group-hover:rotate-[-45deg] transition-transform" /> 
          새로 시작하기
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 mb-16">
        {/* Before 카드 */}
        <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col">
          <span className="text-[10px] font-black tracking-[0.2em] text-gray-300 uppercase mb-4 text-center">Reference Image</span>
          <div className="flex-1 min-h-[500px] bg-gray-50 rounded-[1.8rem] overflow-hidden">
            {preview ? (
              <img src={preview} className="w-full h-full object-contain" alt="Before" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 italic">이미지 없음</div>
            )}
          </div>
        </div>

        {/* After 카드 */}
        <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col relative">
          <span className="text-[10px] font-black tracking-[0.2em] text-blue-400 uppercase mb-4 text-center">AI Generation</span>
          <div className="flex-1 min-h-[500px] bg-gray-50 rounded-[1.8rem] overflow-hidden relative">
            {result ? (
              <>
                <img src={result} className="w-full h-full object-contain animate-fadeIn" alt="After" />
                <button 
                  onClick={handleDownload}
                  className="absolute bottom-6 right-6 p-4 bg-black text-white rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all"
                >
                  <Download size={22} />
                </button>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                <p className="text-sm font-bold text-gray-400 animate-pulse">이미지를 생성하고 있습니다...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 별점 평가 & 추천 컨테이너 */}
      {result && (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
          {/* 만족도 조사 섹션 */}
          <div className="bg-white py-12 px-6 rounded-[2.5rem] shadow-sm border border-gray-100 text-center animate-slideUp">
            <h2 className="text-xl font-bold mb-6">스타일링이 마음에 드시나요?</h2>
            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3, 4, 5].map((idx) => (
                <button key={idx} onClick={() => handleRating(idx)}>
                  <Star 
                    size={40} 
                    className={`transition-all ${idx <= rating ? "fill-yellow-400 text-yellow-400 scale-110" : "text-gray-100 hover:text-gray-200"}`} 
                  />
                </button>
              ))}
            </div>
            <div className="flex justify-center gap-3">
              <button className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg">
                <ThumbsUp size={18} /> 추천해요
              </button>
              <button className="flex items-center gap-2 px-8 py-3 bg-white border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                <ThumbsDown size={18} /> 아쉬워요
              </button>
            </div>
          </div>

          {/* 상품 추천 섹션 (별점 클릭 시 등장) */}
          {showRecommendations && (
            <div className="animate-fadeIn space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ShoppingBag size={20} /></div>
                <h3 className="text-xl font-extrabold text-gray-800">이런 스타일은 어떠세요?</h3>
              </div>
              
              {/* 실제 데이터가 들어올 자리 (나중에 API 연동) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="aspect-[3/4] bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col animate-pulse">
                    <div className="flex-1 bg-gray-100" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 w-2/3 bg-gray-200 rounded" />
                      <div className="h-3 w-1/2 bg-gray-100 rounded" />
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

export default Result;


// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// // import { createTryonJob, getTryonJobStatus } from "../api/tryonApi"; // 실제 연결 시 주석 해제
// // import { getResultById } from "../api/resultsApi"; // 실제 연결 시 주석 해제

// const Result = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // Fitting 페이지에서 보낸 데이터 수신
//   const { garmentId, userImageId, preview } = location.state || {};
//   const [result, setResult] = useState<string | null>(null);

//   useEffect(() => {
//     // if (!garmentId || !userImageId) return; // 실제 연결 시 주석 해제

//     // --- [임시 UI 테스트용 로직 시작] ---
//     console.log("UI 테스트 모드: 3초 후 결과 이미지를 표시합니다.");
//     const timer = setTimeout(() => {
//       // 실제 백엔드가 없으므로, 테스트용 샘플 이미지 주소를 넣습니다.
//       // 나중에는 `setResult(실제_API_결과_URL)`로 변경하면 됩니다.
//       setResult("https://via.placeholder.com/768x1024/000000/FFFFFF?text=Fitting+Result"); 
//     }, 3000);

//     return () => clearTimeout(timer);
//     // --- [임시 UI 테스트용 로직 끝] ---

//     /* // 🔥 실제 백엔드 연결 시 아래 로직의 주석을 푸세요.
//     let interval: ReturnType<typeof setInterval>;

//     const start = async () => {
//       try {
//         const job = await createTryonJob(userImageId, garmentId);
        
//         interval = setInterval(async () => {
//           const status = await getTryonJobStatus(job.tryon_id);

//           if (status.status === "completed") {
//             clearInterval(interval);
//             const resultData = await getResultById(status.result_id);
//             setResult(`http://localhost:8000${resultData.result_url}`);
//           }
//         }, 2000);
//       } catch (err) {
//         console.error(err);
//         alert("피팅 처리 중 오류가 발생했습니다.");
//       }
//     };

//     start();
//     return () => clearInterval(interval);
//     */
//   }, [garmentId, userImageId]);

//   return (
//     <div className="min-h-screen bg-gray-50 p-10 font-sans">
//       <h1 className="text-3xl font-bold text-center mb-12 text-gray-900">피팅 완료</h1>

//       <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
//         {/* Before 영역: 내가 업로드한 사진 */}
//         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
//           <p className="mb-4 font-bold text-gray-400 uppercase text-xs tracking-widest text-center">Before (My Photo)</p>
//           <div className="h-[500px] flex items-center justify-center bg-gray-50 rounded-2xl overflow-hidden">
//             {preview ? (
//               <img src={preview} className="w-full h-full object-contain" alt="Before" />
//             ) : (
//               <p className="text-gray-400">업로드된 사진이 없습니다.</p>
//             )}
//           </div>
//         </div>

//         {/* After 영역: AI 결과물 */}
//         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
//           <p className="mb-4 font-bold text-gray-400 uppercase text-xs tracking-widest text-center">After (AI Fitting)</p>
//           {result ? (
//             <div className="h-[500px] flex items-center justify-center bg-gray-50 rounded-2xl overflow-hidden animate-fadeIn">
//               <img src={result} className="w-full h-full object-contain" alt="After" />
//             </div>
//           ) : (
//             <div className="h-[500px] flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
//               <p className="text-gray-500 font-medium">AI가 옷을 입혀드리고 있어요...</p>
//               <p className="text-gray-400 text-sm mt-2">(약 3초 소요 예정)</p>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="flex justify-center mt-12 gap-4">
//         <button 
//           onClick={() => navigate("/")} 
//           className="px-10 py-4 bg-black text-white rounded-xl font-bold shadow-lg hover:scale-105 active:scale-95 transition"
//         >
//           다른 옷 입어보기
//         </button>
//         {result && (
//            <button className="px-10 py-4 bg-white text-black border border-gray-200 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition">
//              이미지 저장하기
//            </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Result;