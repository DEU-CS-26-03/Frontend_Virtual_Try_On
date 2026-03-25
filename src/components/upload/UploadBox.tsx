import ImagePreview from "./ImagePreview";
import UploadButton from "./UploadButton";

interface Props {
  onChange: (file: File) => void;
}

const UploadBox = ({onChange}:Props) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">이미지 업로드</h2>

      <div className="flex-1 flex flex-col">
        <ImagePreview />
      </div>

      <UploadButton onChange={onChange}/>
    </div>
  );
};

export default UploadBox;