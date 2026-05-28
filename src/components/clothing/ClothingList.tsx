import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// 💡 [추가]: 우리가 만들어둔 실제 API 호출 함수 임포트 (경로는 프로젝트에 맞게 수정)
import { getGarments, type GarmentItem } from "../../api/garmentApi";

interface ClothingItem {
  garment_id: string;
  file_url: string;
  category: string;
}

const categories = ["all", "top", "bottom", "outer"];

const ClothingList = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [category, setCategory] = useState("all");
  const [clothingData, setClothingData] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
  useEffect(() => {
    const fetchClothes = async () => {
      try {
        setIsLoading(true);
        const realData = await getGarments();

        // 💡 [해결 2 - 핵심] 여기서 파라미터 item에 'GarmentItem'을 딱 붙여줍니다!
        // 이렇게 하면 1. any 에러 해결 2. never used 에러 해결이 동시에 됩니다.
        const formattedData = realData.map((item: GarmentItem) => {
          let displayCategory = "outer";
          if (item.category === "upper" || item.category === "top") displayCategory = "top";
          if (item.category === "lower" || item.category === "bottom") displayCategory = "bottom";

          return {
            garment_id: item.id,
            file_url: item.fileUrl,
            category: displayCategory,
          };
        });

        setClothingData(formattedData);
      } catch (err) {
        console.error("실제 의류 목록 로드 실패! (더미 데이터로 대체합니다)", err);
        // [캡스톤 방어 코드] 서버 연결 실패 시에도 데모가 가능하도록 더미 렌더링
        setClothingData([
          { garment_id: "gar_001", file_url: "https://picsum.photos/seed/c1/400/500", category: "top" },
          { garment_id: "gar_002", file_url: "https://picsum.photos/seed/c2/400/500", category: "top" },
          { garment_id: "gar_003", file_url: "https://picsum.photos/seed/c3/400/500", category: "bottom" },
          { garment_id: "gar_004", file_url: "https://picsum.photos/seed/c4/400/500", category: "outer" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClothes();
  }, []);

  const filtered = category === "all"
      ? clothingData
      : clothingData.filter((item: ClothingItem) => item.category === category);

  const handleSelect = (item: ClothingItem) => {
    setSelected(item.garment_id);
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

        {isLoading ? (
            <div className="text-center py-20 text-gray-400 font-bold animate-pulse">
              의류 데이터를 불러오는 중입니다...
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              {filtered.map((item: ClothingItem) => (
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
        )}
      </div>
  );
};

export default ClothingList;