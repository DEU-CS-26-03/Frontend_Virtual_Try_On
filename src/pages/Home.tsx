import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { ChevronLeft, ChevronRight } from "lucide-react"; // 아이콘 추가

const BANNER_DATA = [
  { 
    id: 1, 
    title: "상상하던 스타일, 실시간 AI 가상 피팅으로 확인하세요", 
    sub: "모델에게 옷을 입히듯, 당신의 사진 위에 새로운 스타일을 즉시 얹어보세요.", 
    img: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1600",
    tag: "AI VIRTUAL TRY-ON" // 강조용 태그 추가
  },
  { 
    id: 2, 
    title: "클릭 한 번으로 완성되는 나만의 가상 드레스룸", 
    sub: "복잡한 시착 과정 없이 원하는 옷을 고르고 즉시 피팅 결과를 확인하세요.", 
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600",
    tag: "SMART FITTING"
  },
];

const MOCK_DATA = [
  { garment_id: 1, name: "프리미엄 GTR 그래픽 티셔츠", category: "상의", file_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600", price: "₩35,000" },
  { garment_id: 2, name: "스트릿 데님 자켓", category: "아우터", file_url: "https://images.unsplash.com/photo-1576872381149-78ef78736748?auto=format&fit=crop&q=80&w=600", price: "₩89,000" },
  { garment_id: 3, name: "카고 오버 팬츠", category: "하의", file_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=600", price: "₩54,000" },
  { garment_id: 4, name: "미니멀리스트 윈드브레이커", category: "아우터", file_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600", price: "₩120,000" },
];

const Home = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("전체");
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNER_DATA.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleFittingClick = (item: any) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      if (window.confirm("로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?")) {
        navigate('/login');
      }
      return;
    }
    navigate("/fitting", { state: { cloth: item.file_url, garmentId: item.garment_id } });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] font-sans text-[#111111]">
      <Header />
      
      {/* 슬라이더 히어로 섹션 */}
      <div className="relative w-full h-[700px] overflow-hidden bg-black">
        {BANNER_DATA.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentBanner ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* 가독성을 위한 진한 하단 그라데이션 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
            
            <img src={banner.img} className="w-full h-full object-cover opacity-80" alt="Banner" />
            
            <div className="absolute bottom-24 left-20 z-20 max-w-4xl text-white text-left">
              {/* 핵심 기능 강조 태그 */}
              <div className="inline-block px-4 py-1.5 bg-[#2563EB] text-[10px] font-black tracking-[0.2em] mb-6 rounded-full">
                {banner.tag}
              </div>
              
              <h1 className="text-6xl font-[1000] tracking-tighter leading-[1.15] mb-8 break-keep">
                {banner.title}
              </h1>
              
              <p className="text-xl font-medium opacity-70 max-w-2xl mb-10">
                {banner.sub}
              </p>

              {/* [추가] 지금 시착하기 버튼 (스크롤 유도) */}
              <button 
                onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                className="group flex items-center gap-4 bg-white text-black px-8 py-4 rounded-full font-black text-sm tracking-widest hover:bg-[#2563EB] hover:text-white transition-all shadow-2xl"
              >
                지금 시착 시작하기
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}

        {/* 컨트롤 버튼 및 페이지네이션 */}
        <div className="absolute bottom-24 right-20 flex items-center gap-6 z-30">
          <div className="flex items-baseline gap-1 text-white">
            <span className="text-3xl font-[1000]">{currentBanner + 1}</span>
            <span className="text-lg font-bold opacity-30">/ {BANNER_DATA.length}</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentBanner((prev) => (prev - 1 + BANNER_DATA.length) % BANNER_DATA.length)}
              className="p-4 rounded-full border border-white/20 text-white hover:bg-white/10 backdrop-blur-md transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setCurrentBanner((prev) => (prev + 1) % BANNER_DATA.length)}
              className="p-4 rounded-full border border-white/20 text-white hover:bg-white/10 backdrop-blur-md transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-10 mt-20">
        {/* 카테고리 탭 영역 (기존과 동일) */}
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
              {category === c && <div className="absolute -bottom-4 left-0 w-full h-[3px] bg-[#111111]" />}
            </button>
          ))}
        </div>

        {/* 의류 그리드 (기존과 동일) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-16 pb-32">
          {MOCK_DATA
            .filter(item => category === "전체" || item.category === category)
            .map((item) => (
            <div key={item.garment_id} className="group cursor-pointer" onClick={() => handleFittingClick(item)}>
              <div className="relative aspect-[3/4] overflow-hidden bg-white rounded-sm">
                <img src={item.file_url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={item.name} />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all flex items-end p-6">
                  <button className="w-full bg-[#2563EB] text-white py-4 font-black text-xs tracking-widest hover:bg-black transition-colors shadow-xl">
                    가상 시착하기
                  </button>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-end">
                <div className="flex-1">
                  <p className="text-[10px] font-black text-[#2563EB] uppercase mb-1">{item.category}</p>
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