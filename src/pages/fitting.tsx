import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UploadBox from "../components/upload/UploadBox";

const Fitting = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const cloth = location.state?.cloth;
  const [image, setImage] = useState<string | null>(null);

  const handleImageChange = (file: File) => {
    const url = URL.createObjectURL(file);
    setImage(url);
  };

  const handleNext = () => {
    if (!image) return;

    // 👉 결과 페이지로 이동
    navigate("/result", {
      state: {
        cloth,
        userImage: image,
      },
    });
  };

  if (!cloth) return <div>잘못된 접근입니다.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      <h1 className="text-2xl font-bold text-center mb-8">
        가상 피팅
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* 좌측 */}
        <div className="bg-white p-6 rounded-2xl shadow flex flex-col gap-4">
          <h2 className="font-semibold text-lg">모델 이미지 업로드</h2>

          <UploadBox onChange={handleImageChange} />
        </div>

        {/* 우측 */}
        <div className="bg-white p-6 rounded-2xl shadow flex flex-col gap-4">
          <h2 className="font-semibold text-lg">선택한 의류</h2>

          <img
            src={cloth}
            className="w-full h-80 object-cover rounded-xl"
          />
        </div>

      </div>

      {/* 중앙 버튼 */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleNext}
          disabled={!image}
          className={`px-10 py-3 rounded-xl text-white font-semibold
          ${image ? "bg-black hover:bg-gray-800" : "bg-gray-300"}
          `}
        >
          가상 피팅 시작
        </button>
      </div>

    </div>
  );
};

export default Fitting;