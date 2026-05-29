import { useEffect, useState } from "react";
import { getFavorites, deleteFavorite, type FavoriteItem } from "../api/favoriteApi";

export const FavoritePage = () => {
    const [items, setItems] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

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

    const handleDelete = async (item: FavoriteItem) => {
        if (!window.confirm("이 관심상품을 삭제하시겠습니까?")) return;

        try {
            await deleteFavorite(item.garmentId);
            setItems((prev) => prev.filter((i) => i.id !== item.id));
        } catch (err) {
            console.error("삭제 에러:", err);
            alert("삭제에 실패했습니다.");
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-black mb-6">내 관심상품</h3>

            {loading ? (
                <div className="py-10 text-center text-gray-400 font-medium text-sm">
                    관심상품을 불러오는 중입니다...
                </div>
            ) : items.length === 0 ? (
                <div className="py-20 text-center bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-gray-400 font-medium text-sm">등록된 관심상품이 없습니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="border border-gray-100 p-4 rounded-2xl flex flex-col items-center hover:shadow-md transition-shadow bg-white"
                        >
                            <div className="w-full aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-3">
                                {item.garmentImageUrl ? (
                                    <img
                                        src={item.garmentImageUrl}
                                        alt={item.garmentCategory ?? "상품 이미지"}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => handleDelete(item)}
                                className="w-full py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-colors"
                            >
                                삭제하기
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};