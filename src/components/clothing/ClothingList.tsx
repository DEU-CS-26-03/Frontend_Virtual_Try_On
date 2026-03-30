import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { fetchClothingList } from "../api/clothingApi"; // 🔥 실제 연동 시 주석 해제

const categories = ["all", "top", "bottom", "outer"];

const ClothingList = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [category, setCategory] = useState("all");
  const [clothingData, setClothingData] = useState<any[]>([]);

  useEffect(() => {
    const getClothes = async () => {
      /* 구현시 적용할 코드(수정)
      try {
        const data = await fetchClothingList();
        setClothingData(data);
      } catch (err) { console.error("목록 로드 실패"); }
      */

      // 결과 UI 확인을 위한 코드 실제 구현시 변경
      setClothingData([
        { garment_id: "gar_001", file_url: "https://picsum.photos/seed/c1/400/500", category: "top" },
        { garment_id: "gar_002", file_url: "https://picsum.photos/seed/c2/400/500", category: "top" },
        { garment_id: "gar_003", file_url: "https://picsum.photos/seed/c3/400/500", category: "bottom" },
        { garment_id: "gar_004", file_url: "https://picsum.photos/seed/c4/400/500", category: "outer" },
      ]);
    };
    getClothes();
  }, []);

  const filtered = category === "all" ? clothingData : clothingData.filter(item => item.category === category);

  const handleSelect = (item: any) => {
    setSelected(item.garment_id);
    // 선택 효과를 위해 약간의 딜레이 후 이동
    setTimeout(() => {
      navigate("/fitting", {
        state: { 
          cloth: item.file_url, 
          garmentId: item.garment_id 
        }
      });
    }, 300);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* 카테고리 탭 */}
      <div className="flex justify-center gap-3 mb-16">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-8 py-3 rounded-full text-sm font-black transition-all ${
              category === c ? "bg-black text-white shadow-xl scale-105" : "bg-white text-gray-400 border border-gray-100 hover:bg-gray-50"
            }`}
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 리스트 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
        {filtered.map((item) => (
          <div
            key={item.garment_id}
            onClick={() => handleSelect(item)}
            className={`relative rounded-[2.5rem] overflow-hidden cursor-pointer group transition-all duration-500 ${
              selected === item.garment_id ? "ring-4 ring-black scale-105 shadow-2xl" : "hover:shadow-lg"
            }`}
          >
            <img src={item.file_url} className="w-full h-[450px] object-cover group-hover:scale-110 transition-transform duration-700" alt="cloth" />
            <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity ${selected === item.garment_id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
              <div className="bg-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl">선택됨</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClothingList;