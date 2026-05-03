// src/pages/HomePage.tsx
import type { ChangeEvent, RefObject } from "react";
import Header from "../components/layout/Header";
import FavoriteButton from "../components/favorite/FavoriteButton";
import { ChevronLeft, ChevronRight, Upload } from "lucide-react";

export interface HomeBanner {
    id: number;
    title: string;
    sub: string;
    img: string;
    tag: string;
}

export interface HomeDisplayGarment {
    garmentId: string;
    name: string;
    category: string;
    fileUrl: string;
    price: string;
}

interface HomePageProps {
    banners: HomeBanner[];
    currentBanner: number;
    onPrevBanner: () => void;
    onNextBanner: () => void;
    categories: string[];
    category: string;
    setCategory: (category: string) => void;
    fileInputRef: RefObject<HTMLInputElement | null>;
    handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
    garments: HomeDisplayGarment[];
    loading: boolean;
    uploading: boolean;
    handleFittingClick: (item: HomeDisplayGarment) => void;
}

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
                      fileInputRef,
                      handleFileChange,
                      garments,
                      loading,
                      uploading,
                      handleFittingClick,
                  }: HomePageProps) => {
    return (
        <div className="min-h-screen bg-[#F5F5F3] font-sans text-[#111111]">
            <Header />

            <div className="relative w-full h-[700px] overflow-hidden bg-black">
                {banners.map((banner, index) => (
                    <div
                        key={banner.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            index === currentBanner ? "opacity-100" : "opacity-0"
                        }`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                        <img
                            src={banner.img}
                            className="w-full h-full object-cover opacity-80"
                            alt={banner.title}
                        />

                        <div className="absolute bottom-24 left-20 z-20 max-w-4xl text-white">
                            <div className="inline-block px-4 py-1.5 bg-[#2563EB] text-[10px] font-black tracking-[0.2em] mb-6 rounded-full">
                                {banner.tag}
                            </div>
                            <h1 className="text-6xl font-[1000] tracking-tighter leading-[1.15] mb-8 break-keep">
                                {banner.title}
                            </h1>
                            <p className="text-xl font-medium opacity-70 max-w-2xl mb-10">
                                {banner.sub}
                            </p>
                            <button
                                onClick={() => window.scrollTo({ top: 800, behavior: "smooth" })}
                                className="group flex items-center gap-4 bg-white text-black px-8 py-4 rounded-full font-black text-sm tracking-widest hover:bg-[#2563EB] hover:text-white transition-all shadow-2xl"
                            >
                                지금 시작하기
                                <ChevronRight
                                    size={18}
                                    className="group-hover:translate-x-1 transition-transform"
                                />
                            </button>
                        </div>
                    </div>
                ))}

                <div className="absolute bottom-24 right-20 flex items-center gap-6 z-30">
                    <div className="flex items-baseline gap-1 text-white">
                        <span className="text-3xl font-[1000]">{currentBanner + 1}</span>
                        <span className="text-lg font-bold opacity-30">/ {banners.length}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onPrevBanner}
                            className="p-4 rounded-full border border-white/20 text-white hover:bg-white/10 backdrop-blur-md transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={onNextBanner}
                            className="p-4 rounded-full border border-white/20 text-white hover:bg-white/10 backdrop-blur-md transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-10 mt-20">
                <div className="flex justify-between items-center mb-16 border-b border-gray-200 py-4">
                    <div className="flex gap-10">
                        {categories.map((c) => (
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

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 bg-[#111111] text-white px-6 py-3 rounded-full font-black text-[11px] tracking-widest hover:bg-[#2563EB] transition-all shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <Upload size={16} />
                        {uploading ? "업로드 중..." : "로컬 의상 업로드"}
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                </div>

                {loading ? (
                    <div className="pb-32">
                        <div className="h-[240px] rounded-2xl border border-gray-100 bg-white flex items-center justify-center text-gray-400 font-bold">
                            의류 목록을 불러오는 중입니다.
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12 pb-32">
                        {garments.map((item) => (
                            <div
                                key={item.garmentId}
                                className="group cursor-pointer flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500"
                                onClick={() => handleFittingClick(item)}
                            >
                                <div className="relative aspect-[3/4] overflow-hidden bg-[#F9F9F9]">
                                    <FavoriteButton garmentId={item.garmentId} />
                                    <img
                                        src={item.fileUrl || FALLBACK_IMAGE}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        alt={item.name}
                                        onError={(e) => {
                                            e.currentTarget.src = FALLBACK_IMAGE;
                                        }}
                                    />
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
                                        <p className="text-[10px] font-black text-[#2563EB] tracking-widest uppercase mb-2">
                                            {item.category}
                                        </p>
                                        <h3 className="font-bold text-lg text-[#111111] leading-tight line-clamp-1 group-hover:text-[#2563EB] transition-colors">
                                            {item.name}
                                        </h3>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                                        <span className="text-xs font-medium text-gray-400">PRICE</span>
                                        <span className="text-xl font-[1000] text-[#111111]">
                      {item.price}
                    </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {garments.length === 0 && (
                            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-3 min-h-[220px] rounded-2xl border-2 border-dashed border-gray-200 bg-white flex items-center justify-center text-gray-400 font-bold">
                                등록된 의류가 없습니다.
                            </div>
                        )}

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="group cursor-pointer flex flex-col bg-white border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden hover:border-[#2563EB] transition-all duration-300"
                        >
                            <div className="aspect-[3/4] bg-gray-50 flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-[#2563EB] group-hover:text-white transition-all mb-4">
                                    <Upload size={28} strokeWidth={1.5} />
                                </div>
                                <p className="text-sm font-bold text-gray-400 group-hover:text-[#2563EB]">
                                    파일 선택하기
                                </p>
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