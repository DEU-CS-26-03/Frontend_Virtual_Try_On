import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Star, Download, RotateCcw, ShoppingBag, Camera, ThumbsUp, ThumbsDown } from "lucide-react";
import { createTryOnJob, uploadToStorage, startInference, getJobStatus } from "../api/tryonApi";

const ResultPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // Fitting 페이지에서 전달받은 데이터
  const { userFile, garmentId, userPreview } = state || {};

  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState("준비 중...");
  const [rating, setRating] = useState(0);
  const [showRec, setShowRec] = useState(false);

  // 브라우저 환경의 타이머를 저장하기 위해 number 타입을 사용합니다.
  const pollTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const runFittingWorkflow = async () => {
      // 0. 방어 코드: 데이터가 없는 경우 메인으로 튕겨냄
      if (!userFile || !garmentId) {
        alert("잘못된 접근이거나 데이터가 유실되었습니다.");
        navigate("/");
        return;
      }

      try {
        // 1. Spring API: Job 생성 및 Presigned URL 수령
        setStatusText("업로드 세션을 생성하는 중...");
        const { jobId, uploadUrls } = await createTryOnJob();

        // 2. Storage 직접 업로드: Spring 대역폭을 쓰지 않고 직접 전송
        setStatusText("이미지를 안전하게 업로드하고 있습니다...");
        await uploadToStorage(uploadUrls.person, userFile);

        // 3. Spring API: 업로드 완료 알림 및 Python 추론 시작 요청
        setStatusText("AI 모델이 스타일 분석을 시작했습니다...");
        await startInference(jobId);

        // 4. Polling 시작: 3초마다 상태 조회
        pollTimerRef.current = window.setInterval(async () => {
          try {
            const res = await getJobStatus(jobId);
            
            if (res.status === "DONE") {
              // 성공: 결과 이미지 URL 설정 및 로딩 종료
              setResultImage(res.resultUrl);
              setLoading(false);
              if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
            } else if (res.status === "FAILED") {
              // 실패: 에러 메시지 출력
              setStatusText("합성 과정에서 오류가 발생했습니다. 다시 시도해 주세요.");
              setLoading(false);
              if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
            } else {
              // 진행 중 (UPLOADING, PROCESSING 등)
              setStatusText(`작업 진행 중... (${res.status})`);
            }
          } catch (pollError) {
            console.error("Polling fetch error:", pollError);
            // 개별 요청 실패 시 타이머를 멈추지 않고 다음 턴을 기다립니다.
          }
        }, 3000);

      } catch (err: any) {
        console.error("Workflow Error:", err);
        setStatusText(`오류 발생: ${err.message || "알 수 없는 에러"}`);
        setLoading(false);
      }
    };

    runFittingWorkflow();

    // 컴포넌트 언마운트 시 타이머 제거 (메모리 누수 및 에러 방지)
    return () => {
      if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
    };
  }, [userFile, garmentId, navigate]);

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `fitting_result_${Date.now()}.jpg`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      {/* 상단 네비게이션 */}
      <div className="w-full border-b border-gray-200 bg-white py-6 mb-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <h1 className="text-3xl font-black tracking-tight italic uppercase">Fitting Result</h1>
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

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 px-6 mb-16">
        {/* BEFORE 섹션 */}
        <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-gray-100">
          <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3 text-center">Your Original Photo</p>
          <div className="relative w-full h-[650px] bg-gray-100 rounded-[1.8rem] overflow-hidden">
            <img src={userPreview} className="w-full h-full object-cover" alt="Before" />
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-4 py-1 rounded-full text-xs font-bold uppercase">Before</div>
          </div>
        </div>

        {/* AFTER 섹션 */}
        <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-gray-100 relative">
          <p className="text-[10px] font-black tracking-widest text-blue-500 uppercase mb-3 text-center">AI Fitting Result</p>
          <div className="relative w-full h-[650px] bg-gray-100 rounded-[1.8rem] overflow-hidden flex items-center justify-center">
            {loading ? (
              <div className="text-center space-y-6">
                <div className="relative w-16 h-16 mx-auto">
                   <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-t-black rounded-full animate-spin"></div>
                </div>
                <p className="text-sm font-bold text-gray-500 animate-pulse tracking-tight">{statusText}</p>
              </div>
            ) : (
              <>
                <img src={resultImage!} className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-700" alt="Result" />
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg uppercase tracking-wider">After</div>
                <button onClick={handleDownload} className="absolute bottom-6 right-6 p-5 bg-black text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                  <Download size={22} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 피드백 및 추천 */}
      {!loading && resultImage && (
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white py-12 px-8 rounded-[3rem] shadow-2xl border border-gray-100 text-center">
            <h2 className="text-2xl font-black mb-8">결과가 마음에 드시나요?</h2>
            <div className="flex justify-center gap-4 mb-10">
              {[1, 2, 3, 4, 5].map((idx) => (
                <button key={idx} onClick={() => { setRating(idx); setShowRec(true); }}>
                  <Star size={48} className={`transition-all duration-300 ${idx <= rating ? "fill-yellow-400 text-yellow-400 scale-110" : "text-gray-100 hover:text-gray-300"}`} />
                </button>
              ))}
            </div>
            <div className="flex justify-center gap-4">
              <button className="flex items-center gap-2 px-14 py-5 bg-black text-white rounded-2xl font-bold shadow-xl hover:scale-105 transition-all"><ThumbsUp size={20} /> 만족해요</button>
              <button onClick={() => navigate("/")} className="flex items-center gap-2 px-14 py-5 bg-white border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all"><ThumbsDown size={20} /> 아쉬워요</button>
            </div>
          </div>

          {showRec && (
            <div className="mt-20 pb-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="flex items-center gap-3 mb-8 justify-center">
                <ShoppingBag className="text-blue-500" />
                <h3 className="text-2xl font-black">이런 아이템은 어떠세요?</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
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