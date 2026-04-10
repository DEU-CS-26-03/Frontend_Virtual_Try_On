import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getGarments } from "../api/clothingApi";
import Header from "../components/layout/Header";

const Home = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const [clothingData, setClothingData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 실제 API 호출 (내부적으로 더미 반환 중)
        const data = await getGarments({ category });
        setClothingData(data);
      } catch (err) {
        console.error("데이터 로드 실패:", err);
      }
    };
    loadData();
  }, [category]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Header />
      
      <div className="w-full border-b bg-white py-12 mb-10 text-center shadow-sm">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tighter">VIRTUAL FITTING</h1>
        <p className="text-gray-500 mt-3 font-medium text-lg">원하는 스타일을 선택하고 가상으로 입어보세요.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* 카테고리 탭 */}
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

        {/* 의류 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 bg-white rounded-3xl p-8 border shadow-sm">
          {clothingData.map((item) => (
            <div
              key={item.garment_id}
              onClick={() => navigate("/fitting", { 
                state: { cloth: item.file_url, garmentId: item.garment_id } 
              })}
              className="relative rounded-[2rem] overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-500 border border-gray-50"
            >
              <div className="relative h-[450px] overflow-hidden">
                <img 
                  src={item.file_url} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  alt={item.name} 
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                  <div className="bg-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl">피팅하기</div>
                </div>
              </div>
              
              {/* 상품 정보 표시 추가 */}
              <div className="p-5">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{item.category}</p>
                <h3 className="font-bold text-gray-800 truncate">{item.name || "멋진 아이템"}</h3>
                <p className="text-gray-900 font-black mt-1">{item.price || "₩0"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;