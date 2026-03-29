// src/components/upload/UploadButton.tsx

interface Props {
  onChange: (file: File) => void;
}

const UploadButton = ({ onChange }: Props) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  return (
    /* block 또는 flex를 추가하여 w-full이 제대로 작동하게 합니다. */
    <label className="block w-full bg-black text-white py-5 rounded-xl text-center cursor-pointer font-bold hover:bg-gray-800 transition-colors shadow-lg active:scale-95">
      사진 선택하기
      <input type="file" className="hidden" onChange={handleFileChange} />
    </label>
  );
};

export default UploadButton;