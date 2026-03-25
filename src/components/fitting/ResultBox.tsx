import ResultImage from "./ResultImage";
import SaveButton from "./SaveButton";

const ResultBox = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow flex flex-col">
      <h2 className="text-lg font-semibold mb-4">피팅 결과</h2>

      <ResultImage />
      <SaveButton />
    </div>
  );
};

export default ResultBox;