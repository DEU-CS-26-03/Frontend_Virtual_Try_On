import { Download } from "lucide-react";
import ResultImage from "./ResultImage";

interface Props {
    imageUrl: string | null;
    loading: boolean;
    statusText?: string;
    onDownload: () => void; // 다운로드 기능 전달용
}

const ResultBox = ({ imageUrl, loading, statusText, onDownload }: Props) => {
    return (
        <div className="relative aspect-[3/4] bg-white rounded-[2.5rem] overflow-hidden shadow-xl border-[3px] border-[#34D399] flex items-center justify-center">

            <ResultImage imageUrl={imageUrl} loading={loading} statusText={statusText} />

            {!loading && imageUrl && (
                <button onClick={onDownload} className="absolute bottom-8 right-8 p-4 bg-[#111111]/90 backdrop-blur-sm text-white rounded-full hover:scale-110 transition-all shadow-xl group z-10">
                    <Download size={20} className="group-hover:-translate-y-1 transition-transform" />
                </button>
            )}
        </div>
    );
};

export default ResultBox;