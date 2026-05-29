// src/components/favorite/FavoriteButton.tsx
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { addFavorite, deleteFavorite, getFavorites } from "../../api/favoriteApi";

interface Props {
    garmentId: string;
    isFavorite: boolean;   // 부모가 넘겨주는 하트 상태 (boolean)
    onToggle: () => void;  // 부모가 넘겨주는 토글 함수 (리턴값이 없는 함수)
}

const FavoriteButton = ({ garmentId, isFavorite, onToggle }: Props) => {
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;

        const token = localStorage.getItem("accessToken");
        if (!token) {
            setLiked(false);
            return;
        }

        const loadFavorites = async () => {
            try {
                const favorites = await getFavorites();
                if (!mounted) return;
                setLiked(favorites.some((item) => String(item.garmentId) === String(garmentId)));
            } catch (error) {
                console.error("favorites load error:", error);
            }
        };

        void loadFavorites();

        return () => {
            mounted = false;
        };
    }, [garmentId]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();

        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("로그인 후 이용 가능합니다.");
            return;
        }

        try {
            setLoading(true);

            if (liked) {
                await deleteFavorite(garmentId);
                setLiked(false);
            } else {
                await addFavorite(garmentId);
                setLiked(true);
            }
        } catch (error) {
            const status =
                typeof error === "object" && error && "status" in error
                    ? Number((error as { status?: number }).status)
                    : undefined;

            if (status === 401) {
                alert("로그인 후 이용 가능합니다.");
                return;
            }

            console.error("favorite toggle error:", error);
            alert("즐겨찾기 처리에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault(); // 링크나 부모 카드 클릭 이벤트 방지
                onToggle();        // 부모(Home.tsx)의 토글 함수 실행
            }}
            disabled={loading}
            className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow hover:scale-105 transition"
            title={liked ? "즐겨찾기 해제" : "즐겨찾기 추가"}
        >
            <Heart size={20} className={liked ? "fill-red-500 text-red-500" : "text-gray-500"} />
        </button>
    );
};

export default FavoriteButton;