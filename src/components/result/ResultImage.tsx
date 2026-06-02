import { Loader2 } from "lucide-react";

interface Props {
    imageUrl: string | null;
    loading: boolean;
    statusText?: string;
}

const ResultImage = ({ imageUrl, loading, statusText }: Props) => {
    if (loading) {
        return (
            <div className="text-center space-y-4 px-8 flex flex-col items-center justify-center h-full">
                <Loader2 className="w-12 h-12 animate-spin text-[#34D399] mx-auto" />
                <div className="space-y-2">
                    <p className="text-xs font-black uppercase text-gray-800 tracking-widest animate-pulse leading-relaxed">{statusText}</p>
                    <p className="text-[10px] text-gray-400 font-bold tracking-tight">AI 추론 엔진 가동 중 (평균 30초 소요)</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <img src={imageUrl || undefined} className="w-full h-full object-contain bg-white animate-in fade-in duration-1000" alt="Result" />
            <div className="absolute bottom-8 left-8 bg-[#34D399] text-black px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                TRY-ON RESULT
            </div>
        </>
    );
};

export default ResultImage;