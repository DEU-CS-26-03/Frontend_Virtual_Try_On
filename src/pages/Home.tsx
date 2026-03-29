import ClothingList from "../components/clothing/ClothingList";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* 🔥 상단 구분 영역 (Fitting 페이지와 통일감 부여) */}
      <div className="w-full border-b border-gray-200 bg-white py-12 mb-10 shadow-sm">
        <h1 className="text-4xl font-extrabold text-center tracking-tight text-gray-900">
          패션 피팅
        </h1>
        <p className="text-gray-500 text-center mt-3 text-lg font-medium">
          사용자의 체형과 스타일을 분석해 패션 아이템을 실시간으로 착용해보는 경험을 제공합니다.
        </p>
      </div>

      {/* 🔥 메인 콘텐츠 영역 (여백 확보) */}
      <div className="max-w-7xl mx-auto px-6">
        
        {/* '비슷한 옷들을 찾아봤어요' 같은 서브 타이틀이 필요하다면 추가 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 border-l-4 border-black pl-4">
            피팅 가능한 의류 리스트
          </h2>
        </div>

        {/* 의류 리스트 컴포넌트 */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <ClothingList />
        </div>

      </div>

      {/* 하단 푸터 느낌의 여백 */}
      <div className="mt-20 text-center text-gray-400 text-sm">
        © 2026 capstone 001 너임마청년.
      </div>
    </div>
  );
};

export default Home;