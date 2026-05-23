// src/components/upload/cautionModal.tsx
import { Sun, Camera, User, Shirt } from "lucide-react";

interface CautionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CautionModal = ({ isOpen, onClose, onConfirm }: CautionModalProps) => {
  if (!isOpen) return null;

  const notices = [
    {
      icon: <Sun className="text-blue-500" size={20} />,
      title: "밝은 조명",
      desc: "자연광이 있는 밝은 장소에서 촬영해주세요.",
    },
    {
      icon: <Camera className="text-blue-500" size={20} />,
      title: "전신 촬영",
      desc: "머리부터 발끝까지 전신이 나오도록 촬영해주세요.",
    },
    {
      icon: <User className="text-blue-500" size={20} />,
      title: "정면 자세",
      desc: "카메라를 정면으로 바라보고 편안한 자세를 취해주세요.",
    },
    {
      icon: <Shirt className="text-blue-500" size={20} />,
      title: "몸에 맞는 옷",
      desc: "몸의 라인이 드러나는 옷을 착용해주세요.",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* 스크롤 가능한 본문 영역 */}
        <div className="p-8 md:p-10 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full border-2 border-blue-600 flex items-center justify-center text-blue-600 font-bold text-sm">
              !
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">피팅 전 주의사항</h2>
          </div>
          
          <p className="text-gray-500 text-sm font-medium">
            정확한 가상 피팅을 위해 아래 사항을 확인해주세요.
          </p>

          {/* 리스트 카드 카드 */}
          <div className="space-y-4">
            {notices.map((notice, idx) => (
              <div key={idx} className="flex items-center gap-5 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  {notice.icon}
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-800 text-base">{notice.title}</h4>
                  <p className="text-gray-400 text-xs font-semibold mt-1">{notice.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 하단 경고 배너 */}
          <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-xs font-semibold leading-relaxed">
            <span className="text-orange-600 font-black">참고:</span>{' '}
            <span className="text-gray-600">주의사항을 지키지 않을 경우 피팅 결과가 부정확할 수 있습니다.</span>
          </div>
        </div>

        {/* 푸터 버튼 영역 */}
        <div className="px-8 pb-8 pt-2 bg-white flex justify-end items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-gray-200 text-gray-500 font-bold text-sm rounded-xl hover:bg-gray-50 active:scale-95 transition-all w-24"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-600/10 w-24"
          >
            확인
          </button>
        </div>

      </div>
    </div>
  );
};

export default CautionModal;