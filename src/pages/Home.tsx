import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getGarments } from "../api/clothingApi";

const Home = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const [clothingData, setClothingData] = useState<any[]>([]);

  useEffect(() => {
    // ✅ async를 useEffect 콜백에 직접 쓰지 않고 내부 함수로 선언
    const loadData = async () => {
      try {
        const data = await getGarments({ category });
        setClothingData(data);
      } catch (err) {
        console.error("데이터 로드 실패, 테스트 데이터를 표시합니다.");
        setClothingData([
          { garment_id: "gar_01", file_url: "https://picsum.photos/seed/1/400/500", category: "top" },
          { garment_id: "gar_02", file_url: "https://picsum.photos/seed/2/400/500", category: "bottom" },
        ]);
      }
    };
    loadData();
  }, [category]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="w-full border-b bg-white py-12 mb-10 text-center shadow-sm">
        <h1 className="text-4xl font-extrabold text-gray-900">패션 피팅</h1>
        <p className="text-gray-500 mt-3 font-medium text-lg">원하는 스타일을 선택하고 가상으로 입어보세요.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-center gap-3 mb-10">
          {["all", "top", "bottom", "outer"].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-8 py-3 rounded-full text-sm font-black transition-all ${
                category === c ? "bg-black text-white scale-105" : "bg-white text-gray-400 border hover:bg-gray-50"
              }`}
            >
              {c.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 bg-white rounded-3xl p-8 border shadow-sm">
          {clothingData.map((item) => (
            <div
              key={item.garment_id}
              onClick={() => navigate("/fitting", { state: { cloth: item.file_url, garmentId: item.garment_id } })}
              className="relative rounded-[2.5rem] overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-500"
            >
              <img src={item.file_url} className="w-full h-[450px] object-cover group-hover:scale-110 transition-transform duration-700" alt="cloth" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <div className="bg-white px-6 py-3 rounded-2xl font-bold shadow-xl">선택하기</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;