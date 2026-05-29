import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { getFavorites, deleteFavorite, type FavoriteItem } from "../api/favoriteApi";

export const FavoritePage = () => {
    const [items, setItems] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        getFavorites()
            .then((data) => {
                if (isMounted) {
                    setItems(data);
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error("관심상품 로드 실패:", err);
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const handleDelete = async (e: React.MouseEvent, item: FavoriteItem) => {
        e.stopPropagation(); // 카드 클릭(시착 이동) 이벤트 방지
        if (!window.confirm("이 관심상품을 삭제하시겠습니까?")) return;

        try {
            await deleteFavorite(item.garmentId);
            setItems((prev) => prev.filter((i) => i.id !== item.id));
        } catch (err) {
            console.error("삭제 에러:", err);
            alert("삭제에 실패했습니다.");
        }
    };

    const handleFittingClick = (item: FavoriteItem) => {
        navigate("/fitting", {
            state: {
                cloth: item.garmentImageUrl,
                garmentId: item.garmentId,
            },
        });
    };

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h3 className="text-2xl font-[1000] tracking-tighter text-[#111111]">MY FAVORITES</h3>
                <p className="text-gray-400 text-sm mt-1 font-medium">
                    내가 찜한 가상 피팅 의류 목록입니다.
                </p>
            </div>

            {loading ? (
                <div className="py-20 text-center font-bold text-gray-400 animate-pulse">
                    관심상품을 불러오는 중입니다...
                </div>
            ) : items.length === 0 ? (
                <div className="py-32 text-center bg-white border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-4">
                    <p className="text-gray-400 font-bold text-sm">등록된 관심상품이 없습니다.</p>
                    <button
                        onClick={() => navigate("/")}
                        className="px-6 py-2 bg-[#111111] text-white rounded-full text-xs font-black tracking-widest hover:bg-[#2563EB] transition-colors"
                    >
                        옷 구경하러 가기
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleFittingClick(item)}
                            className="group cursor-pointer flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
                        >
                            <div className="relative aspect-[3/4] overflow-hidden bg-[#F9F9F9]">
                                {/* 💡 호버 시 나타나는 오버레이 (Try On 버튼) */}
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
                                    onClick={(e) => handleDelete(e, item)}
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