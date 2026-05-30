import React from "react";
import { Heart } from "lucide-react";

interface Props {
    garmentId: string;
    isFavorite: boolean;   // 부모가 내려주는 상태
    onToggle: () => void;  // 부모가 내려주는 함수
}

const FavoriteButton = ({ garmentId, isFavorite, onToggle }: Props) => {

    // 버튼 클릭 시 실행될 함수
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();   // 기본 동작(링크 이동 등) 방지
        e.stopPropagation();  // 부모 요소(상품 카드)로 클릭 이벤트가 전파되어 상세페이지로 넘어가는 현상 방지
        onToggle();           // Home.tsx에서 정의한 토글 로직 실행
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            // HomePage에서 이미 absolute 위치를 잡고 있다면 여기서는 뺄 수 있지만,
            // 기존 디자인 유지를 위해 class는 거의 그대로 두었습니다.
            className="w-11 h-11 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow hover:scale-105 transition"
            title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
        >
            <Heart
                size={20}
                // isFavorite이 true면 빨간색 꽉 찬 하트, false면 회색 빈 하트
                className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}
            />
        </button>
    );
};

export default FavoriteButton;