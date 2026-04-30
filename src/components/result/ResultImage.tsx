// src/components/result/ResultImage.tsx
interface Props {
    imageUrl: string | null;
    loading: boolean;
    statusText?: string;
}

const ResultImage = ({ imageUrl, loading, statusText }: Props) => {
    if (loading) {
        return (
            <div className="h-[420px] bg-gray-50 rounded-2xl flex flex-col items-center justify-center">
                <div className="w-14 h-14 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4" />
                <p className="text-sm font-bold text-gray-400">{statusText || "처리 중..."}</p>
            </div>
        );
    }

    return (
        <div className="h-[420px] bg-gray-50 rounded-2xl overflow-hidden">
            {imageUrl ? (
                <img src={imageUrl} alt="result" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">
                    결과 이미지 없음
                </div>
            )}
        </div>
    );
};

export default ResultImage;