import React, { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { X, Upload, ImagePlus } from "lucide-react";
import type { HomeCategory } from "../../pages/HomePage";

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

  // 💡 [추가]: 드래그 중인지 상태를 추적하는 State
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    garmentId: "",
    name: "",
    brandName: "",
    category: "top" as HomeCategory,
    price: "",
  });

  if (!isOpen) return null;

  // 💡 [추가]: 중복 코드를 줄이기 위해 파일을 처리하는 공통 함수 생성
  const processFile = (file: File) => {
    // 이미지 파일인지 검증
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // 1. 클릭해서 파일을 골랐을 때
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // 💡 [추가] 2. 파일을 드롭존 위로 드래그하고 있을 때
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // 브라우저가 파일을 열어버리는 기본 동작 방지
    setIsDragging(true);
  };

  // 💡 [추가] 3. 파일이 드롭존을 벗어났을 때
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // 💡 [추가] 4. 파일을 톡! 떨어뜨렸을 때 (Drop)
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false); // 드래그 상태 해제

    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      alert("PC에서 옷 이미지 파일을 선택해주세요.");
      return;
    }

    onUpload({
      ...formData,
      file: selectedFile,
      fileUrl: "",
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
              {/* 왼쪽 입력 폼들 */}
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
                <div className="flex flex-wrap gap-4">
                  {["top", "bottom", "outer", "dress"].map((t) => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="category"
                            checked={formData.category === t}
                            onChange={() => setFormData({ ...formData, category: t as HomeCategory })}
                            className="w-4 h-4 accent-[#2563EB]"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {t === "top" ? "상의" : t === "bottom" ? "하의" : t === "outer" ? "아우터" : "원피스"}
                        </span>
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

            {/* 💡 [수정]: 드래그 앤 드롭이 적용된 이미지 업로드 영역 */}
            <div className="w-[350px] flex flex-col">
              <label className="text-xs font-bold text-gray-400 mb-2 block">로컬 이미지 파일 선택 (필수)</label>
              <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  // isDragging 상태일 때 테두리 색상 파란색, 배경색 살짝 푸른빛으로 변경
                  className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all overflow-hidden relative min-h-[250px]
                    ${isDragging ? "border-[#2563EB] bg-blue-50 scale-[1.02]" : "border-gray-200 hover:bg-gray-50"}
                  `}
              >
                {imagePreview ? (
                    <>
                      <img src={imagePreview} className="w-full h-full object-cover" alt="미리보기" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-full">클릭해서 변경</span>
                      </div>
                    </>
                ) : (
                    <>
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-300 ${isDragging ? "bg-[#2563EB] text-white shadow-lg" : "bg-gray-100 text-gray-400"}`}>
                        {isDragging ? <ImagePlus size={28} /> : <Upload size={28} />}
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-bold ${isDragging ? "text-[#2563EB]" : "text-gray-600"}`}>
                          {isDragging ? "여기에 파일을 놓으세요!" : "클릭 또는 파일 드래그"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG 최대 20MB</p>
                      </div>
                    </>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          <div className="p-6 border-t border-gray-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2.5 rounded-lg font-bold text-sm text-gray-400 hover:bg-gray-100 transition-colors">
              취소
            </button>
            <button
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-lg font-bold text-sm bg-[#2563EB] text-white hover:bg-blue-700 shadow-md transition-colors"
            >
              등록하기
            </button>
          </div>
        </div>
      </div>
  );
};

export default UploadModal;