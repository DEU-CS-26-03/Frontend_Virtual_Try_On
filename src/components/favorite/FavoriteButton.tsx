// src/components/favorite/FavoriteButton.tsx
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { addFavorite, deleteFavorite, getFavorites } from "../../api/favoriteApi";

interface Props {
    garmentId: string;
}

const FavoriteButton = ({ garmentId }: Props) => {
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;

        const loadFavorites = async () => {
            try {
                const favorites = await getFavorites();
                if (!mounted) return;
                setLiked(favorites.some((item) => String(item.garmentId) === String(garmentId)));
            } catch (error) {
                console.error("favorites load error:", error);
            }
        };

        loadFavorites();

        return () => {
            mounted = false;
        };
    }, [garmentId]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();

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
            console.error("favorite toggle error:", error);
            alert("즐겨찾기 처리에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow hover:scale-105 transition"
            title={liked ? "즐겨찾기 해제" : "즐겨찾기 추가"}
        >
            <Heart
                size={20}
                className={liked ? "fill-red-500 text-red-500" : "text-gray-500"}
            />
        </button>
    );
};

export default FavoriteButton;