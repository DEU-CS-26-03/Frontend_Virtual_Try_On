import { useLocation, useNavigate } from "react-router-dom";
import Rating from "../components/fitting/Rating";

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { cloth, userImage } = location.state || {};

  if (!cloth || !userImage) {
    return <div>잘못된 접근입니다.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      <h1 className="text-2xl font-bold text-center mb-8">
        피팅 결과
      </h1>

      <div className="flex flex-col items-center gap-6">

        {/* 결과 이미지 (임시) */}
        <img
          src={userImage}
          className="w-80 h-96 object-cover rounded-2xl shadow"
        />

        {/* 별점 */}
        <div className="text-center">
          <p className="mb-2 font-medium">결과 평가</p>
          <Rating />
        </div>

        {/* 뒤로가기 */}
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-6 py-2 bg-black text-white rounded-lg"
        >
          처음으로
        </button>

      </div>

    </div>
  );
};

export default Result;