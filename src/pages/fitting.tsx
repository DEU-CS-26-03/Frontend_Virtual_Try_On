import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Zap, ChevronLeft } from "lucide-react";
import UploadBox from "../components/upload/UploadBox";
import UploadButton from "../components/upload/UploadButton";

const Fitting = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cloth, garmentId } = location.state || {};

  const [file, setFile] = useState<File | null>(null);

  const userPreviewUrl = useMemo(() => {
    return file ? URL.createObjectURL(file) : null;
  }, [file]);

  useEffect(() => {
    return () => {
      if (userPreviewUrl) URL.revokeObjectURL(userPreviewUrl);
    };
  }, [userPreviewUrl]);

  const handleNext = () => {
    if (!file || !garmentId) {
      alert("먼저 사진을 업로드해 주세요.");
      return;
    }

    // [중요] 실제 업로드 로직은 ResultPage에서 수행하므로
    // 원본 File 객체와 메타데이터를 state에 담아 넘깁니다.
    navigate("/result", { 
      state: { 
        userFile: file,       // 원본 파일 객체
        garmentId: garmentId, 
        clothUrl: cloth,      // 옷 이미지 URL (미리보기용)
        userPreview: userPreviewUrl 
      } 
    });
  };

  return (
    <div className="relative min-h-screen bg-gray-50 pb-20 font-sans">
      {/* AI Preview 플로팅 창 */}
      {userPreviewUrl && cloth && (
        <div className="fixed top-24 right-10 z-50 w-52 hidden lg:block animate-in fade-in slide-in-from-right-10 duration-500">
          <div className="bg-white/70 backdrop-blur-2xl p-4 rounded-[2.5rem] shadow-2xl border border-white/50 ring-1 ring-black/5">
            <p className="text-[10px] font-black tracking-widest text-blue-600 uppercase mb-3 text-center flex items-center justify-center gap-1">
              <Zap size={12} fill="currentColor" className="animate-pulse" /> AI Preview
            </p>
            <div className="relative aspect-[3/4] rounded-[1.8rem] overflow-hidden bg-gray-200 shadow-inner">
              <img src={userPreviewUrl} className="w-full h-full object-cover opacity-50" alt="User" />
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <img src={cloth} className="w-full h-auto object-contain drop-shadow-2xl animate-pulse" alt="Cloth" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full border-b bg-white py-8 mb-10 shadow-sm flex items-center px-10">
        <button onClick={() => navigate("/")} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-3xl font-extrabold text-gray-900 tracking-tight text-center mr-8">가상 피팅 단계</h1>
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 px-6">
        <div className="flex flex-col">
          <p className="text-sm font-black mb-4 text-gray-400 uppercase tracking-widest text-center">Step 1. Your Photo</p>
          <div className="h-[550px] bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 flex items-center justify-center shadow-sm overflow-hidden relative group hover:border-black/20 transition-all">
            {userPreviewUrl ? (
              <img src={userPreviewUrl} className="w-full h-full object-cover p-2" alt="Preview" />
            ) : (
              <UploadBox />
            )}
          </div>
          <div className="mt-8">
            <UploadButton onChange={setFile} />
          </div>
        </div>

        <div className="flex flex-col">
          <p className="text-sm font-black mb-4 text-gray-400 uppercase tracking-widest text-center">Step 2. Selected Item</p>
          <div className="h-[550px] bg-white rounded-[2.5rem] border border-gray-100 flex items-center justify-center p-10 shadow-sm">
            <img src={cloth} className="max-w-full max-h-full object-contain drop-shadow-md" alt="Selected" />
          </div>
          <div className="mt-8">
            <button onClick={() => navigate("/")} className="w-full py-5 bg-white border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all">
              다른 옷 골라보기
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-20">
        <button 
          onClick={handleNext} 
          disabled={!file}
          className={`px-32 py-6 rounded-[2rem] text-2xl font-black shadow-2xl transition-all duration-300 ${
            !file ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-black text-white hover:scale-105 active:scale-95"
          }`}
        >
          가상 피팅 시작
        </button>
      </div>
    </div>
  );
};

export default Fitting;