import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UploadBox from "../components/upload/UploadBox";
import UploadButton from "../components/upload/UploadButton";
// import { uploadUserImage } from "../api/userImageApi"; // 실제 연동 시 주석 해제

const Fitting = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ClothingList에서 전달받은 데이터 (없을 경우 null 처리)
  const cloth = location.state?.cloth || null;
  const garmentId = location.state?.garmentId || null;

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  /**
   * [가상 피팅 시작 버튼 클릭 시 핸들러]
   * 현재는 UI 테스트를 위해 setTimeout을 사용하지만, 
   * 주석 처리된 영역이 실제 백엔드 연동 표준 규격입니다.
   */
  const handleNext = async () => {
    if (!file || !cloth || !garmentId) {
      return alert("이미지 또는 의류 정보가 부족합니다.");
    }

    setIsUploading(true);

    try {
      // [UI 확인용]
      console.log("UI 테스트 모드: 1.5초 후 결과 페이지로 이동합니다.");
      
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      navigate("/result", {
        state: { 
          cloth,              // 선택한 옷 이미지
          garmentId,          // 선택한 옷 ID
          userImageId: "mock_id_123", // 가짜 이미지 ID 실제 연동시 삭제 예정
          preview: URL.createObjectURL(file) // 'Before' 화면용 로컬 프리뷰
        },
      });
      // ---------------------------------------------------------

      /* [실제 API 연동 코드] - 나중에 위 시뮬레이션 모드를 지우고 사용
      
      // 서버에 사용자 이미지 업로드 (이미지 파일 전송)
      const res = await uploadUserImage(file); 
      
      // 업로드 성공 후 받은 실제 ID값들을 가지고 결과 페이지로 이동
      navigate("/result", {
        state: { 
          cloth,                    // 선택한 옷 URL
          garmentId,                // 옷 ID
          userImageId: res.user_image_id, // 서버에서 생성된 유저 이미지 고유 ID
          preview: URL.createObjectURL(file) // 로컬 프리뷰 (서버 부하 방지용)
        },
      });
      */

    } catch (err) {
      console.error("작업 중 오류 발생:", err);
      alert("처리에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetry = () => setFile(null);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* 상단 바: 디자인 통일 */}
      <div className="w-full border-b border-gray-200 bg-white py-8 mb-10 shadow-sm">
        <h1 className="text-3xl font-extrabold text-center tracking-tight text-gray-900">가상 피팅</h1>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 px-6">
        {/* 왼쪽: 사용자 이미지 업로드 섹션 */}
        <div className="flex flex-col">
          <p className="text-sm font-black mb-4 text-gray-400 uppercase tracking-widest">Step 1. Your Photo</p>
          <div className="h-[550px] bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center shadow-sm relative group">
            {file ? (
              <img src={URL.createObjectURL(file)} className="w-full h-full object-contain p-6 animate-fadeIn" alt="User" />
            ) : (
              <UploadBox />
            )}
          </div>
          <div className="mt-8">
            {file ? (
              <button 
                onClick={handleRetry} 
                className="w-full py-4.5 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm active:scale-95"
              >
                다른 사진으로 변경하기
              </button>
            ) : (
              <UploadButton onChange={setFile} />
            )}
          </div>
        </div>

        {/* 오른쪽: 선택한 의류 확인 섹션 */}
        <div className="flex flex-col">
          <p className="text-sm font-black mb-4 text-gray-400 uppercase tracking-widest">Step 2. Selected Item</p>
          <div className="h-[550px] bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden flex items-center justify-center p-10 shadow-sm">
            {cloth ? (
              <img src={cloth} className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-500" alt="Selected Garment" />
            ) : (
              <p className="text-gray-300 italic">의류가 선택되지 않았습니다.</p>
            )}
          </div>
          <div className="mt-8">
            <button 
              onClick={() => navigate("/")} 
              className="w-full py-4.5 bg-white border border-gray-200 text-gray-900 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm active:scale-95"
            >
              다른 옷 골라보기
            </button>
          </div>
        </div>
      </div>

      {/* 가상 피팅 시작 버튼 */}
      <div className="flex justify-center mt-20">
        <button 
          onClick={handleNext} 
          disabled={!file || isUploading}
          className={`px-32 py-6 rounded-[2rem] text-2xl font-black shadow-2xl transition-all duration-300 ${
            !file || isUploading 
              ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
              : "bg-black text-white hover:scale-105 active:scale-95 hover:shadow-black/20"
          }`}
        >
          {isUploading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              분석 중...
            </div>
          ) : "가상 피팅 시작"}
        </button>
      </div>
    </div>
  );
};

export default Fitting;