import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { getGarments } from "../api/clothingApi"; // 실제 연동 시 주석 해제

const Home = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const [clothingData, setClothingData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      /* ---------------------------------------------------------
         실제 백엔드 연동 로직 (주석 처리)
      try {
        const data = await getGarments({ category });
        setClothingData(data);
      } catch (err) { console.error(err); }
      --------------------------------------------------------- */

      // ✅ UI 테스트용 시뮬레이션 데이터
      const mockData = [
        { garment_id: "gar_01", file_url: "https://picsum.photos/seed/1/400/550", category: "top" },
        { garment_id: "gar_02", file_url: "https://picsum.photos/seed/2/400/550", category: "top" },
        { garment_id: "gar_03", file_url: "https://picsum.photos/seed/3/400/550", category: "bottom" },
        { garment_id: "gar_04", file_url: "https://picsum.photos/seed/4/400/550", category: "outer" },
      ];
      
      const filtered = category === "all" ? mockData : mockData.filter(d => d.category === category);
      setClothingData(filtered);
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
                category === c ? "bg-black text-white scale-105 shadow-lg" : "bg-white text-gray-400 border hover:bg-gray-50"
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
              className="relative rounded-[2rem] overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-500"
            >
              <img src={item.file_url} className="w-full h-[450px] object-cover group-hover:scale-110 transition-transform duration-700" alt="cloth" />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <div className="bg-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl">피팅하기</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;