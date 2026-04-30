// src/components/result/ResultBox.tsx
import ResultImage from "./ResultImage";
import SaveButton from "./SaveButton";

interface Props {
    imageUrl: string | null;
    loading: boolean;
    statusText?: string;
}

const ResultBox = ({ imageUrl, loading, statusText }: Props) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow flex flex-col">
            <h2 className="text-lg font-semibold mb-4">피팅 결과</h2>
            <ResultImage imageUrl={imageUrl} loading={loading} statusText={statusText} />
            <SaveButton imageUrl={imageUrl} />
        </div>
    );
};

export default ResultBox;