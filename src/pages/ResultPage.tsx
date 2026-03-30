import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Download, RotateCcw, Camera } from "lucide-react";
import { createTryOn, getTryOnStatus } from "../api/tryonApi";
import { getResultById } from "../api/systemApi";

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { garmentId, cloth, preview, userImageId } = location.state || {};
  
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState("AI 피팅 요청 중...");
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
  if (!userImageId || !garmentId) return;

  // ✅ 1. 내부 비동기 함수 정의
  const startFitting = async () => {
    try {
      setLoading(true);
      const task = await createTryOn(userImageId, garmentId);
      
      // ✅ 2. 상태 체크 함수 호출
      const checkLoop = async (id: string) => {
        try {
          const data = await getTryOnStatus(id);
          if (data.status === "completed") {
            const final = await getResultById(data.result_id);
            setResultImage(final.result_url);
            setLoading(false);
          } else if (data.status === "failed") {
            setLoading(false);
          } else {
            // 폴링: 타이머 설정
            pollTimer.current = setTimeout(() => checkLoop(id), 2500);
          }
        } catch (e) {
          setLoading(false);
        }
      };

      checkLoop(task.tryon_id);
    } catch (err) {
      setLoading(false);
    }
  };

  startFitting(); // 정의한 비동기 로직 실행

  return () => {
    if (pollTimer.current) clearTimeout(pollTimer.current);
  };
}, [userImageId, garmentId]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="w-full border-b bg-white py-6 mb-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <h1 className="text-3xl font-black">피팅 결과</h1>
          <div className="flex gap-3">
            <button onClick={() => navigate("/fitting", { state: { cloth, garmentId } })} className="flex items-center gap-2 px-6 py-3 bg-white border rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all">
              <Camera size={18} /> 사진 교체
            </button>
            <button onClick={() => navigate("/")} className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-sm font-bold shadow-lg hover:bg-gray-800 transition-all">
              <RotateCcw size={18} /> 처음으로
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 px-6">
        {/* Before */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border text-center">
          <p className="text-[10px] font-black tracking-widest text-gray-300 uppercase mb-4">Reference Photo</p>
          <div className="min-h-[550px] bg-gray-50 rounded-[1.8rem] overflow-hidden">
            <img src={preview} className="w-full h-full object-contain" alt="Original" />
          </div>
        </div>

        {/* AI Result */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border text-center relative">
          <p className="text-[10px] font-black tracking-widest text-blue-500 uppercase mb-4">AI Result</p>
          <div className="min-h-[550px] bg-gray-50 rounded-[1.8rem] overflow-hidden flex flex-col items-center justify-center">
            {loading ? (
              <div className="space-y-4">
                <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin mx-auto" />
                <p className="text-sm font-bold text-gray-400">{statusText}</p>
              </div>
            ) : (
              <>
                <img src={resultImage!} className="w-full h-full object-contain animate-fadeIn" alt="Result" />
                <button 
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = resultImage!;
                    link.download = "tryon_result.jpg";
                    link.click();
                  }}
                  className="absolute bottom-6 right-6 p-5 bg-black text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                >
                  <Download size={22} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;