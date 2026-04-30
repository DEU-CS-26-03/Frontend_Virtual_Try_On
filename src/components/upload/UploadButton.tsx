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
      <label className="block w-full bg-black text-white py-5 rounded-xl text-center cursor-pointer font-bold hover:bg-gray-800 transition-colors shadow-lg active:scale-95">
        사진 선택하기
        <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
        />
      </label>
  );
};

export default UploadButton;