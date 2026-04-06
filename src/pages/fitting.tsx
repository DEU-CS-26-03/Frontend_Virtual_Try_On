import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Zap, ChevronLeft } from "lucide-react"; // AI 느낌을 주는 아이콘 추가
import UploadBox from "../components/upload/UploadBox";
import UploadButton from "../components/upload/UploadButton";
// import { uploadUserImage } from "../api/userImageApi"; // 실제 연동 시 주석 해제

const Fitting = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cloth, garmentId } = location.state || {};

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 메모리 누수 방지를 위해 URL 객체 생성 로직 최적화
  const userPreviewUrl = useMemo(() => {
    return file ? URL.createObjectURL(file) : null;
  }, [file]);

  const handleNext = async () => {
    if (!file || !garmentId) return alert("사진을 먼저 업로드해주세요.");
    
    setIsUploading(true);

    /* ---------------------------------------------------------
       실제 백엔드 연동 로직 (필요시 해제)
    try {
      const res = await uploadUserImage(file);
      navigate("/result", { 
        state: { 
          userImageId: res.image_id, 
          preview: userPreviewUrl, 
          cloth, 
          garmentId 
        } 
      });
    } catch (err) { 
      alert("업로드 실패"); 
      setIsUploading(false);
    }
    --------------------------------------------------------- */

    // UI 테스트용 시뮬레이션
    setTimeout(() => {
      setIsUploading(false);
      navigate("/result", { 
        state: { 
          userImageId: "mock_user_123",
          preview: userPreviewUrl,
          cloth,
          garmentId 
        } 
      });
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-gray-50 pb-20 font-sans">
      
      {/* ✨ [신규] 우측 상단 미니 프리뷰 (사용자 사진 + 옷 조합) */}
      {userPreviewUrl && cloth && (
        <div className="fixed top-24 right-10 z-50 w-52 animate-bounceIn hidden lg:block">
          <div className="bg-white/70 backdrop-blur-2xl p-4 rounded-[2.5rem] shadow-2xl border border-white/50 ring-1 ring-black/5">
            <p className="text-[10px] font-black tracking-widest text-blue-600 uppercase mb-3 text-center flex items-center justify-center gap-1">
              <Zap size={12} fill="currentColor" className="animate-pulse" /> AI Preview
            </p>
            
            <div className="relative aspect-[3/4] rounded-[1.8rem] overflow-hidden bg-gray-200 shadow-inner">
              {/* 배경: 사용자 사진 (반투명 처리) */}
              <img 
                src={userPreviewUrl} 
                className="w-full h-full object-cover opacity-50 grayscale-[30%]" 
                alt="User base" 
              />
              
              {/* 오버레이: 선택한 옷 (중앙에 배치하여 합성 느낌 암시) */}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <img 
                  src={cloth} 
                  className="w-full h-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)] animate-pulse" 
                  alt="Cloth overlay" 
                />
              </div>

              <div className="absolute bottom-0 w-full bg-blue-600/80 backdrop-blur-md py-2 text-[9px] text-center font-bold text-white tracking-tight">
                COMPOSITION ANALYZING...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 상단 헤더 */}
      <div className="w-full border-b bg-white py-8 mb-10 shadow-sm flex items-center px-10">
        <button onClick={() => navigate("/")} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-3xl font-extrabold text-gray-900 tracking-tight text-center mr-8">가상 피팅 단계</h1>
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 px-6">
        {/* Step 1. 사진 업로드 영역 */}
        <div className="flex flex-col">
          <p className="text-sm font-black mb-4 text-gray-400 uppercase tracking-widest text-center">Step 1. Your Photo</p>
          <div className="h-[550px] bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 flex items-center justify-center shadow-sm overflow-hidden relative group transition-all hover:border-black/20">
            {userPreviewUrl ? (
              <img src={userPreviewUrl} className="w-full h-full object-contain p-6 animate-fadeIn" alt="Preview" />
            ) : (
              <UploadBox />
            )}
          </div>
          <div className="mt-8">
            <UploadButton onChange={setFile} />
          </div>
        </div>

        {/* Step 2. 선택된 옷 영역 */}
        <div className="flex flex-col">
          <p className="text-sm font-black mb-4 text-gray-400 uppercase tracking-widest text-center">Step 2. Selected Item</p>
          <div className="h-[550px] bg-white rounded-[2.5rem] border border-gray-100 flex items-center justify-center p-10 shadow-sm">
            {cloth ? (
              <img src={cloth} className="max-w-full max-h-full object-contain drop-shadow-md" alt="Selected" />
            ) : (
              <div className="text-center">
                <p className="text-gray-300 italic mb-4">선택된 옷이 없습니다.</p>
                <button onClick={() => navigate("/")} className="text-blue-600 font-bold underline">옷 고르러 가기</button>
              </div>
            )}
          </div>
          <div className="mt-8">
            <button onClick={() => navigate("/")} className="w-full py-5 bg-white border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
              다른 옷 골라보기
            </button>
          </div>
        </div>
      </div>

      {/* 하단 시작 버튼 */}
      <div className="flex justify-center mt-20">
        <button 
          onClick={handleNext} 
          disabled={!file || isUploading}
          className={`px-32 py-6 rounded-[2rem] text-2xl font-black shadow-2xl transition-all duration-300 ${
            !file || isUploading ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-black text-white hover:scale-105 active:scale-95 hover:shadow-black/20"
          }`}
        >
          {isUploading ? (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-4 border-gray-400 border-t-white rounded-full animate-spin" />
              처리 중...
            </div>
          ) : "가상 피팅 시작"}
        </button>
      </div>
    </div>
  );
};

export default Fitting;