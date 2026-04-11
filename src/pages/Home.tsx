import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";

const MOCK_DATA = [
  { garment_id: 1, name: "프리미엄 GTR 그래픽 티셔츠", category: "상의", file_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600", price: "₩35,000" },
  { garment_id: 2, name: "스트릿 데님 자켓", category: "아우터", file_url: "https://images.unsplash.com/photo-1576872381149-78ef78736748?auto=format&fit=crop&q=80&w=600", price: "₩89,000" },
  { garment_id: 3, name: "카고 오버 팬츠", category: "하의", file_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=600", price: "₩54,000" },
  { garment_id: 4, name: "미니멀리스트 윈드브레이커", category: "아우터", file_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600", price: "₩120,000" },
];

const Home = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("전체");
  const [clothingData, setClothingData] = useState<any[]>(MOCK_DATA);

  // 카테고리 한글 매핑용 객체 (데이터 필터링 시 사용)
  const categoryMap: { [key: string]: string } = {
    "전체": "all",
    "상의": "top",
    "하의": "bottom",
    "아우터": "outer"
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] font-sans text-[#111111]">
      <Header />
      
      {/* 히어로 섹션 */}
      <div className="max-w-[1600px] mx-auto px-10 pt-20 pb-16">
        <h1 className="text-7xl font-[1000] tracking-[-0.05em] leading-[0.9]">
          당신에게 <br /> 
          <span className="text-gray-300 italic font-light">어울리는 의상을 찾아보세요!!!!!!!!!</span>
        </h1>
        <p className="mt-8 text-lg font-medium text-gray-500 max-w-md leading-relaxed">
          AI 기술을 활용한 새로운 차원의 쇼핑 경험을 만나보세요. 
          원하는 옷을 고르고 즉시 가상으로 시착할 수 있습니다.
        </p>
      </div>

      <div className="max-w-[1600px] mx-auto px-10">
        
        {/* 카테고리 탭: 한글로 변경 */}
        <div className="flex gap-10 mb-16 border-b border-gray-200 py-4">
          {["전체", "상의", "하의", "아우터"].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-sm font-black tracking-tight transition-all relative ${
                category === c ? "text-[#111111]" : "text-gray-300"
              }`}
            >
              {c}
              {category === c && (
                <div className="absolute -bottom-4 left-0 w-full h-[3px] bg-[#111111]" />
              )}
            </button>
          ))}
        </div>

        {/* 의류 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-16 pb-32">
          {clothingData
            .filter(item => category === "전체" || item.category === category)
            .map((item) => (
            <div
              key={item.garment_id}
              className="group cursor-pointer"
              onClick={() => navigate("/fitting", { 
                state: { cloth: item.file_url, garmentId: item.garment_id } 
              })}
            >
              {/* 이미지 영역 */}
              <div className="relative aspect-[3/4] overflow-hidden bg-white rounded-sm">
                <img 
                  src={item.file_url} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  alt={item.name} 
                />
                
                {/* 버튼 디자인: 한국어 "가상 시착하기" */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all flex items-end p-6">
                  <button className="w-full bg-[#2563EB] text-white py-4 font-black text-xs tracking-widest hover:bg-black transition-colors shadow-xl">
                    가상 시착하기
                  </button>
                </div>
              </div>
              
              {/* 정보 영역 */}
              <div className="mt-6 flex justify-between items-end">
                <div className="flex-1">
                  <p className="text-[10px] font-black text-[#2563EB] uppercase mb-1 tracking-wider">{item.category}</p>
                  <h3 className="font-bold text-lg leading-tight truncate pr-4">{item.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black">{item.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;