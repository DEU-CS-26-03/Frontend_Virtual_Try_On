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
    <label className="mt-4 w-full bg-black text-white py-2 rounded-lg text-center cursor-pointer">
      업로드
      <input type="file" className="hidden" onChange={handleFileChange} />
    </label>
  );
};

export default UploadButton;