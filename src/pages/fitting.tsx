import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UploadBox from "../components/upload/UploadBox";
import UploadButton from "../components/upload/UploadButton";
import { uploadUserImage } from "../api/userImageApi";

const Fitting = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cloth, garmentId } = location.state || {};

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleNext = async () => {
    if (!file || !garmentId) return alert("정보가 부족합니다.");
    setIsUploading(true);
    try {
      const res = await uploadUserImage(file);
      navigate("/result", {
        state: { 
          userImageId: res.image_id, 
          preview: URL.createObjectURL(file),
          cloth,
          garmentId 
        },
      });
    } catch (err) {
      alert("업로드 실패. 서버 상태를 확인해주세요.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="w-full border-b bg-white py-8 mb-10 shadow-sm text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">가상 피팅</h1>
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 px-6">
        {/* Step 1: User Photo */}
        <div className="flex flex-col">
          <p className="text-sm font-black mb-4 text-gray-400 uppercase tracking-widest text-center">Step 1. Your Photo</p>
          <div className="h-[550px] bg-white rounded-[2.5rem] border-2 border-dashed flex items-center justify-center shadow-sm overflow-hidden">
            {file ? <img src={URL.createObjectURL(file)} className="w-full h-full object-contain p-4" /> : <UploadBox />}
          </div>
          <div className="mt-8">
            <UploadButton onChange={setFile} />
          </div>
        </div>

        {/* Step 2: Selected Cloth */}
        <div className="flex flex-col">
          <p className="text-sm font-black mb-4 text-gray-400 uppercase tracking-widest text-center">Step 2. Selected Item</p>
          <div className="h-[550px] bg-white rounded-[2.5rem] border flex items-center justify-center p-10 shadow-sm">
            <img src={cloth} className="max-w-full max-h-full object-contain" alt="Selected" />
          </div>
          <div className="mt-8">
            <button onClick={() => navigate("/")} className="w-full py-5 bg-white border rounded-2xl font-bold hover:bg-gray-50 transition-all">다른 옷 골라보기</button>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-20">
        <button 
          onClick={handleNext} 
          disabled={!file || isUploading}
          className={`px-32 py-6 rounded-[2rem] text-2xl font-black shadow-2xl transition-all ${!file || isUploading ? "bg-gray-200 text-gray-400" : "bg-black text-white hover:scale-105"}`}
        >
          {isUploading ? "분석 중..." : "가상 피팅 시작"}
        </button>
      </div>
    </div>
  );
};

export default Fitting;