import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { ChevronLeft, ChevronRight, Upload } from "lucide-react";

const BANNER_DATA = [
  { 
    id: 1, 
    title: "상상하던 스타일, 실시간 AI 가상 피팅으로 확인하세요", 
    sub: "모델에게 옷을 입히듯, 당신의 사진 위에 새로운 스타일을 즉시 얹어보세요.", 
    img: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1600",
    tag: "AI VIRTUAL TRY-ON" 
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState("전체");
  const [currentBanner, setCurrentBanner] = useState(0);

  // 배너 자동 전환
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNER_DATA.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // 로컬 파일 업로드 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localImageUrl = URL.createObjectURL(file);
      const newGarment = {
        garment_id: Date.now(),
        name: "사용자 업로드 의상",
        category: "CUSTOM",
        file_url: localImageUrl,
        price: "N/A"
      };
      handleFittingClick(newGarment);
    }
  };

  // 피팅 페이지 이동
  const handleFittingClick = (item: any) => {
    const token = localStorage.getItem('accessToken');
    navigate("/fitting", { 
      state: { 
        cloth: item.file_url, 
        garmentId: item.garment_id,
        name: item.name,
        price: item.price,
        isGuest: !token 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] font-sans text-[#111111]">
      <Header />
      
      {/* 히어로 슬라이더 */}
      <div className="relative w-full h-[700px] overflow-hidden bg-black">
        {BANNER_DATA.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentBanner ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
            <img src={banner.img} className="w-full h-full object-cover opacity-80" alt="Banner" />
            
            <div className="absolute bottom-24 left-20 z-20 max-w-4xl text-white">
              <div className="inline-block px-4 py-1.5 bg-[#2563EB] text-[10px] font-black tracking-[0.2em] mb-6 rounded-full">
                {banner.tag}
              </div>
              <h1 className="text-6xl font-[1000] tracking-tighter leading-[1.15] mb-8 break-keep">
                {banner.title}
              </h1>
              <p className="text-xl font-medium opacity-70 max-w-2xl mb-10">{banner.sub}</p>
              <button 
                onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                className="group flex items-center gap-4 bg-white text-black px-8 py-4 rounded-full font-black text-sm tracking-widest hover:bg-[#2563EB] hover:text-white transition-all shadow-2xl"
              >
                지금 시작하기
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}

        {/* 슬라이더 컨트롤 */}
        <div className="absolute bottom-24 right-20 flex items-center gap-6 z-30">
          <div className="flex items-baseline gap-1 text-white">
            <span className="text-3xl font-[1000]">{currentBanner + 1}</span>
            <span className="text-lg font-bold opacity-30">/ {BANNER_DATA.length}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentBanner((prev) => (prev - 1 + BANNER_DATA.length) % BANNER_DATA.length)} className="p-4 rounded-full border border-white/20 text-white hover:bg-white/10 backdrop-blur-md transition-all"><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentBanner((prev) => (prev + 1) % BANNER_DATA.length)} className="p-4 rounded-full border border-white/20 text-white hover:bg-white/10 backdrop-blur-md transition-all"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-10 mt-20">
        {/* 카테고리 & 업로드 버튼 영역 */}
        <div className="flex justify-between items-center mb-16 border-b border-gray-200 py-4">
          <div className="flex gap-10">
            {["전체", "상의", "하의", "아우터"].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`text-sm font-black tracking-tight transition-all relative ${category === c ? "text-[#111111]" : "text-gray-300"}`}
              >
                {c}
                {category === c && <div className="absolute -bottom-4 left-0 w-full h-[3px] bg-[#111111]" />}
              </button>
            ))}
          </div>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-[#111111] text-white px-6 py-3 rounded-full font-black text-[11px] tracking-widest hover:bg-[#2563EB] transition-all shadow-lg"
          >
            <Upload size={16} /> 로컬 의상 업로드
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        </div>

        {/* 의류 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12 pb-32">
          {/* 상품 리스트 */}
          {MOCK_DATA
            .filter(item => category === "전체" || item.category === category)
            .map((item) => (
            <div 
              key={item.garment_id} 
              className="group cursor-pointer flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500"
              onClick={() => handleFittingClick(item)}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-[#F9F9F9]">
                <img src={item.file_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.name} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300 w-full">
                    <button className="w-full bg-white text-black py-4 rounded-full font-black text-xs tracking-[0.2em] hover:bg-[#2563EB] hover:text-white transition-colors">
                      TRY ON NOW
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-8 flex flex-col justify-between flex-grow">
                <div>
                  <p className="text-[10px] font-black text-[#2563EB] tracking-widest uppercase mb-2">{item.category}</p>
                  <h3 className="font-bold text-lg text-[#111111] leading-tight line-clamp-1 group-hover:text-[#2563EB] transition-colors">
                    {item.name}
                  </h3>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-400">PRICE</span>
                  <span className="text-xl font-[1000] text-[#111111]">{item.price}</span>
                </div>
              </div>
            </div>
          ))}
          
          {/* 로컬 추가 전용 카드 */}
            <div 
            onClick={() => fileInputRef.current?.click()}
            className="group cursor-pointer flex flex-col bg-white border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden hover:border-[#2563EB] transition-all duration-300"
          >
            <div className="aspect-[3/4] bg-gray-50 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-[#2563EB] group-hover:text-white transition-all mb-4">
                <Upload size={28} strokeWidth={1.5} />
              </div>
              <p className="text-sm font-bold text-gray-400 group-hover:text-[#2563EB]">파일 선택하기</p>
            </div>
            <div className="p-8 bg-white/50 text-center">
              <h3 className="font-bold text-gray-400">내 옷으로 시착하기</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;