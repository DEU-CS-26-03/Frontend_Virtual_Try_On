import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, Info } from "lucide-react";
import { createTryonJob, type ClothCategory } from "../api/tryonApi";
import UploadBox from "../components/upload/UploadBox";
import UploadButton from "../components/upload/UploadButton";
import Header from "../components/layout/Header";

const FittingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // 홈에서 넘어온 데이터들
    const { cloth, category } = location.state || {};

    // 카테고리 자동 판별 (기본값 설정용)
    const getMappedCategory = (cat: string): ClothCategory => {
        const lowerCat = String(cat || "").toLowerCase();
        if (lowerCat.includes("dress") || lowerCat.includes("onepiece")) return "overall";
        if (lowerCat.includes("pants") || lowerCat.includes("skirt") || lowerCat.includes("lower")) return "lower";
        return "upper";
    };

    // 상태 관리
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false); // ✨ 드래그 상태 추가
    const [isLoading, setIsLoading] = useState(false);
    // ★ 에러 방지: 렌더링 시점에 자동 판별된 값을 초기값으로 세팅
    const [selectedCategory, setSelectedCategory] = useState<ClothCategory>(getMappedCategory(category));

    const userPreviewUrl = useMemo(() => {
        return file ? URL.createObjectURL(file) : null;
    }, [file]);

    // 💡 1. [추가] 브라우저 전체 영역 방어막
    // 사용자가 엉뚱한 곳에 사진을 떨어뜨려도 새 창이 열리지 않게 막습니다.
    useEffect(() => {
        const preventGlobalDrag = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };
        window.addEventListener("dragover", preventGlobalDrag);
        window.addEventListener("drop", preventGlobalDrag);

        return () => {
            window.removeEventListener("dragover", preventGlobalDrag);
            window.removeEventListener("drop", preventGlobalDrag);
        };
    }, []);

    // 💡 2. [수정] 핸들러 철벽 방어 코드로 강화 (stopPropagation 필수)
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    useEffect(() => {
        return () => { if (userPreviewUrl) URL.revokeObjectURL(userPreviewUrl); };
    }, [userPreviewUrl]);

    // ✨ [추가] 고화질 이미지를 로컬 스토리지용 초경량(수십 KB)으로 압축하는 함수
    const compressImage = (targetFile: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(targetFile);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 500; // 가로 해상도를 500px로 최적화 (비교 화면용으로 충분)
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);

                    // 압축률 0.7의 JPEG 포맷 문자열로 반환 (용량이 50KB 내외로 줄어듦)
                    const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
                    resolve(compressedBase64);
                };
            };
        });
    };

    const handleNext = async () => {
        if (!file || !cloth) {
            alert("사진과 의상을 모두 준비해주세요.");
            return;
        }
        try {
            setIsLoading(true);

            // 1. 의류 이미지 다운로드 및 가공
            const backendBaseUrl = "https://apivirtualtryon.p-e.kr";
            const cleanClothUrl = cloth.startsWith("/") ? cloth : `/${cloth}`; // 무조건 앞에 /를 붙임
            const targetClothUrl = cloth.startsWith("http") ? cloth : `${backendBaseUrl}${cleanClothUrl}`;
            const response = await fetch(targetClothUrl);
            const blob = await response.blob();
            const clothFile = new File([blob], "cloth.jpg", { type: "image/jpeg" });

            // 2. 백엔드 가상 피팅 API 요청 보내기
            const job = await createTryonJob({
                personImage: file,
                clothImage: clothFile,
                clothType: selectedCategory,
            });

            // 3. 비동기 레이스 컨디션 및 로컬 용량 에러를 막기 위해 이미지 압축을 먼저 완료(await) 시킵니다.
            const compressedUserImage = await compressImage(file);

            // 4. 모든 데이터가 완벽히 준비된 후 안전하게 결과 페이지로 이동
            navigate("/result", {
                state: {
                    tryonId: job.tryonId,
                    userPreview: compressedUserImage, // ✨ 용량이 획기적으로 줄어든 영구 저장용 주소
                    clothType: selectedCategory,
                    clothPreview: cloth,
                    garmentCategory: category // ✨ 원본 카테고리(outer 등) 정보를 잊지 않고 넘겨줍니다!
                }
            });

        } catch (error) {
            console.error("서버 통신 오류:", error);
            alert("서버 통신에 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F3] pb-32 font-sans text-[#111111]">
            <Header />

            {/* AI 실시간 미리보기: Ghost Overlay 방식 */}
            {userPreviewUrl && cloth && (
                <div className="fixed top-28 right-12 z-50 w-56 hidden xl:block animate-in fade-in slide-in-from-right-10 duration-700">
                    <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[2rem] shadow-2xl border border-white">
                        <p className="text-[10px] font-black tracking-[0.2em] text-[#2563EB] uppercase mb-4 text-center">
                            Style Simulation
                        </p>
                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
                            {/* 배경: 내 사진 짤리던 오류 수정 */}
                            <img src={userPreviewUrl} className="w-full h-full object-contain opacity-50 bg-gray-50" alt="User" />

                            {/* 오버레이: 선택한 옷 (선택된 카테고리에 따라 위치 이동) */}
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                <img
                                    src={cloth}
                                    className={`w-full h-auto object-contain drop-shadow-2xl animate-pulse transition-all duration-700
                                        ${selectedCategory === 'upper' ? 'translate-y-[-20%] scale-110' : ''}
                                        ${selectedCategory === 'lower' ? 'translate-y-[20%] scale-110' : ''}
                                        ${selectedCategory === 'overall' ? 'scale-100' : ''}
                                    `}
                                    alt="Cloth Overlay"
                                />
                            </div>
                        </div>
                        <p className="text-[9px] text-gray-400 mt-3 text-center font-bold uppercase">
                            {selectedCategory} Mode Applied
                        </p>
                    </div>
                </div>
            )}

            {/* 헤더 섹션 */}
            <div className="max-w-[1600px] mx-auto px-10 pt-16 pb-12 flex items-center gap-6">
                <button onClick={() => navigate("/")} className="group p-4 bg-white rounded-full border border-gray-200 hover:bg-[#111111] transition-all">
                    <ChevronLeft size={24} className="group-hover:text-white" />
                </button>
                <div>
                    <h1 className="text-5xl font-[1000] tracking-tighter leading-none">Style Matching</h1>
                    <p className="text-gray-400 font-bold mt-2 tracking-wide text-xs px-1">AI가 당신의 체형에 맞춰 의상을 피팅합니다</p>
                </div>
            </div>

            {/* 메인 업로드 영역 */}
            <div className="max-w-[1600px] mx-auto grid md:grid-cols-2 gap-12 px-10 mt-4">
                <div className="flex flex-col">
                    <div className="flex justify-between items-end mb-6 px-2">
                        <span className="text-[11px] font-[1000] tracking-[0.3em] text-[#2563EB] uppercase">Step 01</span>
                        <h2 className="text-xl font-black">내 정면 사진</h2>
                    </div>

                    {/* 💡 중복된 껍데기 하나 삭제 후, 드래그 기능이 달린 이 박스 하나만 남깁니다! */}
                    <div
                        onDragEnter={handleDragEnter} // ✨ 잊지 말고 추가
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`min-h-[500px] max-h-[650px] aspect-[3/4] md:aspect-auto w-full bg-[#F9F9F9] rounded-3xl border-2 flex flex-col items-center justify-center shadow-sm overflow-hidden relative group p-4 transition-all duration-300 ${
                            isDragging ? "border-[#2563EB] bg-blue-50/50 border-dashed" : "border-gray-200"
                        }`}
                    >
                        {userPreviewUrl ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <img
                                    src={userPreviewUrl}
                                    className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl transition-transform duration-700 group-hover:scale-102"
                                    alt="Preview"
                                />
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center pointer-events-none">
                                <UploadBox />
                                <p className="mt-4 text-[11px] font-bold text-gray-400">또는 이미지를 이곳으로 드래그 앤 드롭</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8">
                        <UploadButton onChange={setFile} />
                    </div>
                </div>

                {/* Step 2: Selected Item & Mode Selection */}
                <div className="flex flex-col">
                    <div className="flex justify-between items-end mb-6 px-2">
                        <span className="text-[11px] font-[1000] tracking-[0.3em] text-gray-300 uppercase">Step 02</span>
                        <h2 className="text-xl font-black">선택한 의상</h2>
                    </div>

                    {/* 의상 이미지 박스 */}
                    <div className="h-[480px] bg-white rounded-3xl border border-gray-100 flex items-center justify-center p-12 shadow-sm relative">
                        <img src={cloth} className="max-w-full max-h-full object-contain drop-shadow-2xl" alt="Selected" />
                        <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#F5F5F3] rounded-2xl border border-gray-200 flex items-center gap-3">
                            <Info size={16} className="text-gray-400" />
                            <p className="text-[10px] text-gray-500 font-bold leading-tight">
                                아래 버튼을 눌러 옷이 입혀질 부위를 직접 선택하세요.
                            </p>
                        </div>
                    </div>

                    {/* ★ 추가됨: 피팅 부위 선택 버튼 (의상 박스 바로 아래) */}
                    <div className="mt-6 grid grid-cols-3 gap-3">
                        {[
                            { id: "upper", label: "상의 (Top)" },
                            { id: "lower", label: "하의 (Bottom)" },
                            { id: "overall", label: "전신 (Overall)" }
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id as ClothCategory)}
                                className={`py-4 rounded-xl text-xs font-black tracking-widest transition-all shadow-sm ${
                                    selectedCategory === cat.id
                                        ? "bg-[#2563EB] text-white ring-4 ring-[#2563EB]/20 scale-105"
                                        : "bg-white border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-4">
                        <button onClick={() => navigate("/")} className="w-full py-4 bg-transparent text-gray-400 font-bold text-[11px] hover:text-[#111111] transition-all underline underline-offset-4">
                            다른 아이템 선택하기
                        </button>
                    </div>
                </div>
            </div>

            {/* 실행 버튼 */}
            <div className="flex justify-center mt-20">
                <button
                    onClick={handleNext}
                    disabled={!file || isLoading}
                    className={`px-32 py-7 rounded-full text-xl font-[1000] tracking-widest transition-all duration-500 shadow-2xl flex items-center gap-4 ${
                        !file || isLoading ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#2563EB] text-white hover:scale-105 active:scale-95"
                    }`}
                >
                    {isLoading ? <><Loader2 className="animate-spin" size={24} /> AI 추론 엔진 가동 중...</> : "가상 피팅 시작"}
                </button>
            </div>
        </div>
    );
};

export default FittingPage;