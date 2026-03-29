// src/components/upload/UploadBox.tsx
const UploadBox = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/50">
      <div className="text-6xl text-gray-200 mb-4">📸</div>
      <h2 className="text-xl font-bold text-gray-800 tracking-tight">이미지 업로드</h2>
      <p className="text-sm text-gray-400 mt-2 uppercase tracking-widest font-medium">
        업로드 영역
      </p>
    </div>
  );
};

export default UploadBox;