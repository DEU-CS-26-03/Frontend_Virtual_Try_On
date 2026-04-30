// src/components/result/SaveButton.tsx
interface Props {
    imageUrl: string | null;
}

const SaveButton = ({ imageUrl }: Props) => {
    const handleDownload = () => {
        if (!imageUrl) return;

        const a = document.createElement("a");
        a.href = imageUrl;
        a.download = `tryon_result_${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <button
            onClick={handleDownload}
            disabled={!imageUrl}
            className="mt-4 bg-black text-white py-3 rounded-lg font-bold disabled:bg-gray-300"
        >
            저장하기
        </button>
    );
};

export default SaveButton;