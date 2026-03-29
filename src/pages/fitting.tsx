import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UploadBox from "../components/upload/UploadBox";
import UploadButton from "../components/upload/UploadButton";
// import { uploadUserImage } from "../api/userImageApi"; // 나중에 주석 해제

const Fitting = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const cloth = location.state?.cloth || null;
  const garmentId = location.state?.garmentId || null;

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleNext = async () => {
    if (!file || !cloth) return alert("이미지를 업로드해주세요.");

    setIsUploading(true);

    // --- [임시 UI 테스트용: 백엔드 없이 다음 페이지 이동] ---
    setTimeout(() => {
      navigate("/result", {
        state: { 
          cloth, 
          garmentId, 
          userImageId: "mock_id_123", // 가짜 ID
          preview: URL.createObjectURL(file) // 업로드한 이미지 주소 전달
        },
      });
      setIsUploading(false);
    }, 1500);
    // --- [임시 로직 끝] ---

    /* 🔥 실제 백엔드 연결 시 위 setTimeout을 지우고 아래 주석을 푸세요
    try {
      const res = await uploadUserImage(file);
      navigate("/result", {
        state: { 
          cloth, 
          garmentId, 
          userImage: res.file_url, 
          userImageId: res.user_image_id,
          preview: URL.createObjectURL(file) 
        },
      });
    } catch (err) {
      alert("업로드 실패");
    } finally {
      setIsUploading(false);
    }
    */
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="w-full border-b border-gray-200 bg-white py-8 mb-10 text-center">
        <h1 className="text-3xl font-bold">가상 피팅</h1>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 px-6">
        <div>
          <p className="text-sm font-bold mb-4">모델 이미지 (나의 사진)</p>
          <div className="h-[500px] bg-white rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
            {file ? <img src={URL.createObjectURL(file)} className="h-full w-full object-contain p-4" /> : <UploadBox />}
          </div>
          <div className="mt-8">
            {file ? (
              <button onClick={() => setFile(null)} className="w-full py-4 bg-gray-200 rounded-xl font-bold">다시 선택</button>
            ) : (
              <UploadButton onChange={setFile} />
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold mb-4">선택한 의류</p>
          <div className="h-[500px] bg-white rounded-3xl border border-gray-100 overflow-hidden flex items-center justify-center p-6">
            <img src={cloth} className="max-w-full max-h-full object-contain" alt="Selected" />
          </div>
          <div className="mt-8">
            <button onClick={() => navigate("/")} className="w-full py-4 bg-black text-white rounded-xl font-bold">다른 의류 선택</button>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-16">
        <button 
          onClick={handleNext} 
          disabled={!file || isUploading}
          className={`px-24 py-5 rounded-2xl text-xl font-black shadow-xl ${!file || isUploading ? "bg-gray-300" : "bg-black text-white"}`}
        >
          {isUploading ? "업로드 중..." : "가상 피팅 시작"}
        </button>
      </div>
    </div>
  );
};

export default Fitting;

// import { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import UploadBox from "../components/upload/UploadBox";
// import UploadButton from "../components/upload/UploadButton";
// import { uploadUserImage } from "../api/userImageApi";

// const Fitting = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // ClothingList에서 보낸 데이터 수신
//   const cloth = location.state?.cloth || null;
//   const garmentId = location.state?.garmentId || null;

//   const [file, setFile] = useState<File | null>(null);
//   const [isUploading, setIsUploading] = useState(false);

//   const handleRetry = () => setFile(null);

//   const handleNext = async () => {
//     if (!file || !cloth || !garmentId) return alert("이미지 또는 의류 정보가 부족합니다.");
    
//     setIsUploading(true);
//     try {
//       const res = await uploadUserImage(file);
//       // ResultPage로 이동하며 필요한 모든 ID와 프리뷰 전달
//       navigate("/result", {
//         state: { 
//           garmentId: garmentId, 
//           userImageId: res.user_image_id,
//           preview: URL.createObjectURL(file) // Before 이미지를 위해 로컬 주소 전달
//         },
//       });
//     } catch (err) {
//       alert("업로드 실패");
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 pb-20 font-sans">
//       <div className="w-full border-b border-gray-200 bg-white py-8 mb-10">
//         <h1 className="text-3xl font-bold text-center">가상 피팅</h1>
//       </div>

//       <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 px-6">
//         {/* 왼쪽: 모델 이미지 업로드 */}
//         <div className="flex flex-col">
//           <p className="text-sm font-bold mb-4 text-gray-700">모델 이미지</p>
//           <div className="h-[500px] bg-white rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
//             {file ? (
//               <img src={URL.createObjectURL(file)} className="w-full h-full object-contain p-4" alt="User" />
//             ) : (
//               <UploadBox />
//             )}
//           </div>
//           <div className="mt-8">
//             {file ? (
//               <button onClick={handleRetry} className="w-full py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300">
//                 다른 사진 선택하기 (재시도)
//               </button>
//             ) : (
//               <UploadButton onChange={setFile} />
//             )}
//           </div>
//         </div>

//         {/* 오른쪽: 선택한 의류 이미지 */}
//         <div className="flex flex-col">
//           <p className="text-sm font-bold mb-4 text-gray-700">선택한 의류</p>
//           <div className="h-[500px] bg-white rounded-3xl border border-gray-100 overflow-hidden flex items-center justify-center p-6">
//             {cloth ? (
//               <img src={cloth} className="max-w-full max-h-full object-contain" alt="Selected Garment" />
//             ) : (
//               <p className="text-gray-400">선택된 의류가 없습니다.</p>
//             )}
//           </div>
//           <div className="mt-8">
//             <button onClick={() => navigate("/")} className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800">
//               다른 의류 선택하기
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* 하단 시작 버튼 */}
//       <div className="flex justify-center mt-16">
//         <button 
//           onClick={handleNext} 
//           disabled={!file || isUploading}
//           className={`px-24 py-5 rounded-2xl text-xl font-black shadow-xl transition-all ${
//             !file || isUploading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-black text-white hover:scale-105"
//           }`}
//         >
//           {isUploading ? "AI 분석 중..." : "가상 피팅 시작"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Fitting;