import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UploadBox from "../components/upload/UploadBox";
import UploadButton from "../components/upload/UploadButton";
// import { uploadUserImage } from "../api/userImageApi"; // 실제 연동 시 주석 해제

const Fitting = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cloth, garmentId } = location.state || {};

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleNext = async () => {
    if (!file || !garmentId) return alert("옷을 먼저 선택하거나 사진을 업로드해주세요.");
    
    setIsUploading(true);

    /* ---------------------------------------------------------
      실제 백엔드 연동 로직
    try {
      const res = await uploadUserImage(file);
      navigate("/result", { state: { userImageId: res.image_id, preview: URL.createObjectURL(file), cloth, garmentId } });
    } catch (err) { alert("업로드 실패"); }
    --------------------------------------------------------- */

    // UI 테스트용: 1초 대기 후 결과 페이지로 강제 이동
    setTimeout(() => {
      setIsUploading(false);
      navigate("/result", { 
        state: { 
          userImageId: "mock_user_123", // 가짜 ID
          preview: URL.createObjectURL(file), // 내가 올린 사진
          cloth, // 선택한 옷 이미지
          garmentId 
        } 
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="w-full border-b bg-white py-8 mb-10 shadow-sm text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">가상 피팅 단계</h1>
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 px-6">
        <div className="flex flex-col">
          <p className="text-sm font-black mb-4 text-gray-400 uppercase tracking-widest text-center">Step 1. Your Photo</p>
          <div className="h-[550px] bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 flex items-center justify-center shadow-sm overflow-hidden relative">
            {file ? (
              <img src={URL.createObjectURL(file)} className="w-full h-full object-contain p-6" alt="Preview" />
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
            {cloth ? (
              <img src={cloth} className="max-w-full max-h-full object-contain" alt="Selected" />
            ) : (
              <p className="text-gray-300 italic">선택된 옷이 없습니다.</p>
            )}
          </div>
          <div className="mt-8">
            <button onClick={() => navigate("/")} className="w-full py-5 bg-white border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm">
              다른 옷 골라보기
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-20">
        <button 
          onClick={handleNext} 
          disabled={!file || isUploading}
          className={`px-32 py-6 rounded-[2rem] text-2xl font-black shadow-2xl transition-all duration-300 ${
            !file || isUploading ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-black text-white hover:scale-105 active:scale-95"
          }`}
        >
          {isUploading ? "처리 중..." : "가상 피팅 시작"}
        </button>
      </div>
    </div>
  );
};

export default Fitting;