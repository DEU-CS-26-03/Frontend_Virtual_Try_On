import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UploadBox from "../components/upload/UploadBox";
import { uploadUserImage } from "../api/userImageApi";

const Fitting = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const cloth = location.state?.cloth;
  const [file, setFile] = useState<File | null>(null);

  const handleNext = async () => {
    if (!file) return alert("이미지를 업로드해주세요.");

    try {
      const res = await uploadUserImage(file);

      navigate("/result", {
        state: {
          cloth,
          userImage: res.file_url,
        },
      });
    } catch (err) {
      console.error(err);
      alert("업로드 실패");
    }
  };

  if (!cloth) return <div>잘못된 접근입니다.</div>;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* 🔥 상단 구분 영역 */}
      <div className="w-full border-b border-gray-200 bg-white py-8 mb-10">
        <h1 className="text-3xl font-semibold text-center">
          가상 피팅
        </h1>
        <p className="text-gray-400 text-sm text-center mt-2">
          모델 이미지를 업로드하고 결과를 확인하세요
        </p>
      </div>

      {/* 🔥 메인 */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 px-6">

        {/* 업로드 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col h-[500px]">
          <p className="text-sm font-medium mb-4">모델 이미지</p>

          <div className="flex-1 flex items-center justify-center border border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50">
            {!file ? (
              <UploadBox onChange={setFile} />
            ) : (
              <img
                src={URL.createObjectURL(file)}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* 의류 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col h-[500px]">
          <p className="text-sm font-medium mb-4">선택한 의류</p>

          <div className="flex-1 rounded-xl overflow-hidden bg-gray-50">
            <img
              src={cloth}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      </div>

      {/* 버튼 */}
      <div className="flex justify-center mt-12">
        <button onClick={handleNext} className="px-12 py-4 rounded-xl bg-black text-white">
          가상 피팅 시작
        </button>
      </div>

    </div>
  );
};

export default Fitting;