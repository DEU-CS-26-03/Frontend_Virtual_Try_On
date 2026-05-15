import React, { useState, useRef, type ChangeEvent, useEffect } from "react";
import { X, Upload } from "lucide-react";
import type { HomeCategory } from "../../pages/HomePage";

// ★ any 에러 방지: 폼 데이터의 명확한 타입 정의
export interface UploadFormData {
  file: File | null;
  garmentId: string;
  name: string;
  brandName: string;
  category: HomeCategory;
  price: string;
  fileUrl: string;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: UploadFormData) => void;
}

const UploadModal = ({ isOpen, onClose, onUpload }: UploadModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    garmentId: "",
    name: "",
    brandName: "",
    category: "top" as HomeCategory,
    price: "",
    fileUrl: "",
  });

  // ★ URL 입력 칸에 값이 바뀔 때 미리보기 화면도 즉시 동기화하는 효과
  useEffect(() => {
    if (formData.fileUrl && !selectedFile) {
      setImagePreview(formData.fileUrl);
    }
  }, [formData.fileUrl, selectedFile]);

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData((prev) => ({ ...prev, fileUrl: `/files/garments/${file.name}` }));

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ★ URL 입력란의 값이 바뀔 때 실행될 핸들러
  const handleUrlChange = (value: string) => {
    setSelectedFile(null); // URL을 직접 입력하면 기존에 등록했던 파일 참조는 해제
    if (fileInputRef.current) fileInputRef.current.value = ""; // 파일 input 초기화
    
    setFormData((prev) => ({ ...prev, fileUrl: value }));
    setImagePreview(value || null);
  };

  const handleSubmit = () => {
    if (!selectedFile && !formData.fileUrl.trim()) {
      alert("이미지 파일을 업로드하거나 이미지 URL을 입력해주세요.");
      return;
    }

    // 부모 컴포넌트로 데이터 전체 전달
    onUpload({
      ...formData,
      file: selectedFile,
    });
  };

  return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-[900px] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100">
            <h2 className="text-xl font-black text-[#111111]">새 옷 등록</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-row p-8 gap-10">
            <div className="flex-1 space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">옷 이름</label>
                <input
                    type="text"
                    placeholder="예: 화이트 반팔 티셔츠"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">브랜드 이름</label>
                <input
                    type="text"
                    placeholder="예: 나이키"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">타입 (카테고리)</label>
                <div className="flex gap-4">
                  {["top", "bottom"].map((t) => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="category"
                            checked={formData.category === t}
                            onChange={() => setFormData({ ...formData, category: t as HomeCategory })}
                            className="w-4 h-4 accent-[#2563EB]"
                        />
                        <span className="text-sm font-medium text-gray-700">{t === "top" ? "상의" : "하의"}</span>
                      </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">가격</label>
                <div className="relative">
                  <input
                      type="text"
                      placeholder="30000"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">원</span>
                </div>
              </div>
            </div>

            <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">이미지 웹 URL (선택)</label>
                <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                    value={formData.fileUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                />
              </div>

            <div className="w-[350px] flex flex-col">
              <label className="text-xs font-bold text-gray-400 mb-2 block">이미지</label>
              <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 transition-all overflow-hidden relative min-h-[250px]"
              >
                {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      className="w-full h-full object-cover" 
                      alt="미리보기" 
                      onError={(e) => {
                        // 잘못된 URL 입력 시 엑박 방지 처리
                        (e.target as HTMLImageElement).src = "";
                        alert("유효하지 않은 이미지 URL이거나 가져올 수 없는 이미지 경로입니다.");
                        setImagePreview(null);
                      }}
                    />
                ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <Upload size={20} />
                      </div>
                      <p className="text-xs font-bold text-gray-400">클릭하여 이미지 업로드</p>
                    </>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          <div className="p-6 border-t border-gray-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2.5 rounded-lg font-bold text-sm text-gray-400 hover:bg-gray-100">
              취소
            </button>
            <button
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-lg font-bold text-sm bg-[#2563EB] text-white hover:bg-blue-700 shadow-md"
            >
              등록하기
            </button>
          </div>
        </div>
      </div>
  );
};

export default UploadModal;