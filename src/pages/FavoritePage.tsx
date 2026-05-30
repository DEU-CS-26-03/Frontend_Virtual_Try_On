import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, Heart } from "lucide-react";
import { getFavorites, deleteFavorite, type FavoriteItem } from "../api/favoriteApi";

export const FavoritePage = () => {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    // 1. 관심상품 목록 불러오기
    useEffect(() => {
        let isMounted = true;

        const fetchFavorites = async () => {
            try {
                setLoading(true);
                const data = await getFavorites();
                if (isMounted) {
                    setFavorites(data);
                }
            } catch (err) {
                console.error("관심상품 로드 실패:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchFavorites();

        return () => {
            isMounted = false;
        };
    }, []);

    // 2. 삭제 기능
    const handleDelete = async (e: React.MouseEvent, garmentId: string) => {
        e.stopPropagation();
        if (!window.confirm("이 관심상품을 삭제하시겠습니까?")) return;

        try {
            await deleteFavorite(garmentId);
            // 삭제 성공 시 로컬 상태 업데이트 (api에 맞게 garmentId로 필터링)
            setFavorites((prev) => prev.filter((item) => String(item.garmentId) !== String(garmentId)));
        } catch (err) {
            console.error("삭제 에러:", err);
            alert("삭제 처리에 실패했습니다. 다시 시도해 주세요.");
        }
    };

    // 3. 시착 페이지 이동
    const handleFittingClick = (item: FavoriteItem) => {
        navigate("/fitting", {
            state: {
                cloth: item.garmentImageUrl, // API 인터페이스에 맞춤
                garmentId: item.garmentId,
            },
        });
    };

    return (
        <div className="max-w-[1600px] mx-auto px-10 py-16 min-h-screen bg-gray-50">
            <div className="flex items-center gap-3 mb-12 border-b border-gray-200 pb-6">
                <Heart className="text-red-500 fill-red-500" size={28} />
                <h1 className="text-3xl font-[1000] text-[#111111] tracking-tight">MY FAVORITES</h1>
                <span className="bg-gray-200 text-gray-700 text-sm font-bold px-3 py-1 rounded-full ml-2">
                    {favorites.length}
                </span>
            </div>

            {loading ? (
                <div className="py-20 text-center font-bold text-gray-400 animate-pulse">
                    찜한 상품을 불러오는 중입니다...
                </div>
            ) : favorites.length === 0 ? (
                <div className="min-h-[400px] bg-white border border-gray-100 rounded-3xl flex flex-col items-center justify-center p-8 shadow-sm">
                    <ShoppingBag size={48} className="text-gray-300 mb-4" />
                    <p className="text-gray-500 font-bold text-lg mb-2">아직 위시리스트가 비어 있습니다.</p>
                    <button
                        onClick={() => navigate("/")}
                        className="mt-6 bg-[#111111] text-white px-6 py-3 rounded-full font-black text-xs tracking-widest hover:bg-[#2563EB] transition-colors shadow-md"
                    >
                        쇼핑하러 가기
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {favorites.map((item) => (
                        <div
                            key={item.id || item.garmentId}
                            onClick={() => handleFittingClick(item)}
                            className="group cursor-pointer flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
                        >
                            <div className="relative aspect-[3/4] overflow-hidden bg-[#F9F9F9]">
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 z-10">
                                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300 w-full">
                                        <button className="w-full bg-white text-black py-3 rounded-full font-black text-[10px] tracking-[0.2em] hover:bg-[#2563EB] hover:text-white transition-colors">
                                            TRY ON NOW
                                        </button>
                                    </div>
                                </div>

                                {item.garmentImageUrl ? (
                                    <img
                                        src={item.garmentImageUrl}
                                        alt={item.garmentCategory ?? "상품 이미지"}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-xs text-gray-400 font-bold">
                                        NO IMAGE
                                    </div>
                                )}
                            </div>

                            <div className="p-5 flex justify-between items-center bg-white z-20 relative">
                                <span className="text-[10px] font-black text-[#2563EB] tracking-widest uppercase">
                                    {item.garmentCategory || "ITEM"}
                                </span>
                                <button
                                    onClick={(e) => handleDelete(e, item.garmentId)}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                    title="목록에서 삭제"
                                >
                                    <Trash2 size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};