import Header from "../components/layout/Header";
import FavoriteButton from "../components/favorite/FavoriteButton";
import { ChevronLeft, ChevronRight, Upload, Trash2 } from "lucide-react"; // 중복 import 합침

export interface HomeBanner {
    id: number;
    title: string;
    sub: string;
    tag: string;
    beforeImg?: string;  // 왼쪽 상단 (모델 사진)
    garmentImg?: string; // left 하단 (의상 사진)
    resultImg?: string;  // 오른쪽 전체 (피팅 결과)
    img?: string;
}

export interface HomeDisplayGarment {
    garmentId: string;
    name: string;
    category: string;
    fileUrl: string;
    price: string;
    isFavorite: boolean; // 추가
}

export type HomeCategory = "all" | "top" | "bottom" | "outer" | "dress";

interface HomePageProps {
    banners: HomeBanner[];
    currentBanner: number;
    onPrevBanner: () => void;
    onNextBanner: () => void;
    categories: readonly HomeCategory[];
    category: HomeCategory;
    setCategory: (category: HomeCategory) => void;
    onOpenUploadModal: () => void; // ★ fileInputRef 대신 함수를 받음
    garments: HomeDisplayGarment[];
    onToggleFavorite: (garmentId: string) => void; // 💡 인터페이스 추가
    loading: boolean;
    uploading: boolean;
    handleFittingClick: (item: HomeDisplayGarment) => void;
    isAdmin: boolean;
    onDelete: (id: string) => void;
}

const CATEGORY_LABEL_MAP: Record<HomeCategory, string> = {
    all: "전체",
    top: "상의",
    bottom: "바지",
    outer: "아우터",
    dress: "원피스/스커트",
};

const FALLBACK_IMAGE =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
    <rect width="100%" height="100%" fill="#F3F4F6"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
      fill="#9CA3AF" font-size="28" font-family="Arial, sans-serif">
      NO IMAGE
    </text>
  </svg>
`);

const HomePage = ({
                      banners,
                      currentBanner,
                      onPrevBanner,
                      onNextBanner,
                      categories,
                      category,
                      setCategory,
                      onOpenUploadModal,
                      garments,
                      onToggleFavorite, // 💡여기에 누락되었던 파라미터를 꼭 추가해 주세요!
                      loading,
                      uploading,
                      handleFittingClick,
                      isAdmin,
                      onDelete,
                  }: HomePageProps) => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── 🔓 헤더 영역 복구 (로고 및 로그인/로그아웃 섹션) ── */}
            <Header />

            {/* ── 꽉 차는 마스터 슬라이더 섹션 ── */}
            <div className="relative w-full h-[550px] bg-[#0d1117] overflow-hidden shadow-2xl">
                {banners.map((banner, index) => {
                    const isActive = index === currentBanner;
                    
                    return (
                        <div
                            key={banner.id}
                            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                                isActive 
                                    ? "opacity-100 z-10 pointer-events-auto block" 
                                    : "opacity-0 z-0 pointer-events-none invisible"
                            }`}
                        >
                            {banner.id === 1 ? (
                                /* 💡 1페이지: 고화질 매장 전경이 화면에 꽉 차는 풀스크린 레이아웃 */
                                <div className="relative w-full h-full">
                                    <img
                                        src={banner.img || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop"}
                                        alt={banner.title}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
                                    
                                    <div className="max-w-[1600px] mx-auto w-full h-full flex items-center px-10 md:px-16 relative z-20">
                                        <div className="w-full lg:w-[50%] space-y-6">
                                            <span className="inline-block bg-teal-400 text-black px-4 py-1.5 text-xs font-black rounded-full tracking-widest uppercase shadow-md">
                                                {banner.tag}
                                            </span>
                                            <h1 className="text-3xl md:text-[46px] font-[1000] leading-[1.3] tracking-tight text-white whitespace-pre-line drop-shadow-xl">
                                                {banner.title}
                                            </h1>
                                            <p className="text-gray-200 text-sm md:text-base leading-relaxed max-w-md font-medium drop-shadow">
                                                {banner.sub}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* 💡 2, 3페이지: 가상 피팅 전용 좌우 레이아웃 (3분할 구조 포함) */
                                <div className="max-w-[1600px] mx-auto w-full h-full flex flex-col lg:flex-row items-center justify-between px-10 md:px-16 py-6 text-white gap-12 relative z-20">
                                    <div className="w-full lg:w-[42%] space-y-6">
                                        <span className="inline-block bg-teal-400/10 text-teal-400 border border-teal-400/20 px-4 py-1.5 text-xs font-black rounded-full tracking-widest uppercase">
                                            {banner.tag}
                                        </span>
                                        <h1 className="text-3xl md:text-[44px] font-[1000] leading-[1.3] tracking-tight text-white whitespace-pre-line drop-shadow-lg">
                                            {banner.title}
                                        </h1>
                                        <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-md font-medium">
                                            {banner.sub}
                                        </p>
                                    </div>

                                    <div className="w-full lg:w-[53%] h-[420px] flex justify-end items-center">
                                        <div className="flex items-center gap-6 w-full max-w-[720px] h-full justify-end">
                                            <div className="flex flex-col gap-4 w-[190px] h-full justify-center">
                                                <div className="h-[190px] bg-gray-800 rounded-2xl overflow-hidden border border-white/10 relative shadow-xl">
                                                    <img src={banner.beforeImg} alt="Model" className="w-full h-full object-cover object-top" />
                                                    <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] text-gray-300 rounded-lg font-bold">MODEL</span>
                                                </div>
                                                <div className="h-[190px] bg-white rounded-2xl overflow-hidden border border-white/10 relative shadow-xl flex items-center justify-center p-4">
                                                    <img src={banner.garmentImg} alt="Garment" className="max-w-full max-h-full object-contain" />
                                                    <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] text-black rounded-lg font-bold">ITEM</span>
                                                </div>
                                            </div>
                                            
                                            <div className="text-3xl font-light text-gray-600 px-1">+</div>

                                            <div className="w-[280px] h-[400px] bg-gray-800 rounded-3xl overflow-hidden border-2 border-teal-400 relative shadow-2xl shadow-teal-500/20">
                                                <img src={banner.resultImg} alt="Result" className="w-full h-full object-cover object-top" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                                <span className="absolute bottom-4 left-4 bg-teal-400 text-black px-3 py-1.5 text-xs font-black rounded-xl shadow-lg">
                                                    TRY-ON RESULT
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* 🧭 슬라이더 클릭 컨트롤러 (z-index 격상으로 무조건 뚫고 클릭되게 세팅) */}
                <div className="absolute bottom-10 right-16 flex items-center gap-6 z-[60] bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 pointer-events-auto">
                    <div className="flex items-baseline gap-1 text-white select-none">
                        <span className="text-2xl font-black text-teal-400">{currentBanner + 1}</span>
                        <span className="text-sm font-bold opacity-40">/ {banners.length}</span>
                    </div>
                    <div className="w-[1px] h-4 bg-white/20" />
                    <div className="flex gap-3">
                        <button 
                            type="button"
                            onClick={(e) => { 
                                e.preventDefault(); 
                                e.stopPropagation(); 
                                onPrevBanner(); 
                            }} 
                            className="p-2.5 rounded-full border border-white/20 text-white hover:bg-teal-400 hover:text-black hover:border-teal-400 transition-all active:scale-95 cursor-pointer relative z-[70]"
                        >
                            <ChevronLeft size={18} strokeWidth={2.5} />
                        </button>
                        <button 
                            type="button"
                            onClick={(e) => { 
                                e.preventDefault(); 
                                e.stopPropagation(); 
                                onNextBanner(); 
                            }} 
                            className="p-2.5 rounded-full border border-white/20 text-white hover:bg-teal-400 hover:text-black hover:border-teal-400 transition-all active:scale-95 cursor-pointer relative z-[70]"
                        >
                            <ChevronRight size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── 하단 상품 목록 영역 ── */}
            <div className="max-w-[1600px] mx-auto px-10 mt-20">
                <div className="flex justify-between items-center mb-16 border-b border-gray-200 py-4">
                    <div className="flex gap-10">
                        {categories.map((c) => (
                            <button
                                key={c}
                                onClick={() => setCategory(c)}
                                className={`text-sm font-black tracking-tight transition-all relative ${
                                    category === c ? "text-[#111111]" : "text-gray-300 hover:text-gray-500"
                                }`}
                            >
                                {CATEGORY_LABEL_MAP[c]}
                                {category === c && <div className="absolute -bottom-4 left-0 w-full h-[3px] bg-[#111111]" />}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={onOpenUploadModal}
                        disabled={uploading}
                        className="flex items-center gap-2 bg-[#111111] text-white px-6 py-3 rounded-full font-black text-[11px] tracking-widest hover:bg-[#2563EB] transition-all shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <Upload size={16} />
                        {uploading ? "업로드 중..." : "새 옷 등록하기"}
                    </button>
                </div>

                {loading ? (
                    <div className="pb-32 text-center py-20 font-bold text-gray-400 animate-pulse">의류 목록을 불러오는 중입니다.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12 pb-32">
                        {garments.map((item) => (
                            <div
                                key={item.garmentId}
                                className="group cursor-pointer flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500"
                                onClick={() => handleFittingClick(item)}
                            >
                                <div className="relative aspect-[3/4] overflow-hidden bg-[#F9F9F9]">
                                    <div
                                        className="absolute top-4 right-4 z-20"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <FavoriteButton
                                            garmentId={item.garmentId}
                                            isFavorite={item.isFavorite}
                                            onToggle={() => onToggleFavorite(item.garmentId)}
                                        />
                                    </div>
                                    <img
                                        src={item.fileUrl || FALLBACK_IMAGE}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        alt={item.name}
                                        onError={(e) => {
                                            e.currentTarget.src = FALLBACK_IMAGE;
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 z-10">
                                        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300 w-full">
                                            <button className="w-full bg-white text-black py-4 rounded-full font-black text-xs tracking-[0.2em] hover:bg-[#2563EB] hover:text-white transition-colors">
                                                TRY ON NOW
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col justify-between flex-grow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-[#2563EB] tracking-widest uppercase mb-2">
                                                {item.category}
                                            </p>

                                            {/* ★ 수정된 영역: 이름과 삭제 버튼을 가로로 배치 */}
                                            <div className="flex justify-between items-start gap-3 w-full">
                                                <h3 className="font-bold text-lg text-[#111111] leading-tight line-clamp-2 group-hover:text-[#2563EB] transition-colors flex-1">
                                                    {item.name}
                                                </h3>
                                                {/* ★ 관리자일 때만 휴지통 버튼 렌더링 */}
                                                {isAdmin && (
                                                    <button 
                                                        type="button" 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation(); 
                                                            onDelete(item.garmentId);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all relative z-[30] cursor-pointer"
                                                        title="의류 삭제"
                                                    >
                                                        <Trash2 size={18} strokeWidth={2.5} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                                        <span className="text-xs font-medium text-gray-400">PRICE</span>
                                        <span className="text-xl font-[1000] text-[#111111]">{item.price}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {garments.length === 0 && (
                            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 min-h-[220px] rounded-2xl border-2 border-dashed border-gray-200 bg-white flex items-center justify-center text-gray-400 font-bold">
                                등록된 의류가 없습니다.
                            </div>
                        )}

                        <div
                            onClick={onOpenUploadModal} // ★ 모달 띄우기 함수 연결
                            className="group cursor-pointer flex flex-col bg-white border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden hover:border-[#2563EB] transition-all duration-300"
                        >
                            <div className="aspect-[3/4] bg-gray-50 flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-[#2563EB] group-hover:text-white transition-all mb-4">
                                    <Upload size={28} strokeWidth={1.5} />
                                </div>
                                <p className="text-sm font-bold text-gray-400 group-hover:text-[#2563EB]">직접 등록하기</p>
                            </div>
                            <div className="p-8 bg-white/50 text-center">
                                <h3 className="font-bold text-gray-400">내 옷으로 시착하기</h3>
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </div>
    );
};

export default HomePage;