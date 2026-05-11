// src/pages/FittingPage.tsx
import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, Info } from "lucide-react";
import { createTryonJob, type ClothCategory } from "../api/tryonApi"; // ClothCategory 타입 추가됨
import UploadBox from "../components/upload/UploadBox";
import UploadButton from "../components/upload/UploadButton";
import Header from "../components/layout/Header";

const FittingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // 홈에서 넘어온 데이터들
    const { cloth, category } = location.state || {};
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const userPreviewUrl = useMemo(() => {
        return file ? URL.createObjectURL(file) : null;
    }, [file]);

    useEffect(() => {
        return () => { if (userPreviewUrl) URL.revokeObjectURL(userPreviewUrl); };
    }, [userPreviewUrl]);

    // ★ 추가된 로직: 카테고리 자동 판별 (데이터가 없을 경우 대비)
    const getMappedCategory = (cat: string): ClothCategory => {
        const lowerCat = String(cat || "").toLowerCase();
        if (lowerCat.includes("dress") || lowerCat.includes("onepiece")) return "overall";
        if (lowerCat.includes("pants") || lowerCat.includes("skirt") || lowerCat.includes("lower")) return "lower";
        return "upper"; // 기본값 상의
    };

    const handleNext = async () => {
        if (!file || !cloth) {
            alert("내 사진과 의상을 모두 준비해주세요.");
            return;
        }

        try {
            setIsLoading(true);

            // 1. 의류 이미지 다운로드 (백엔드가 File을 원하므로 URL을 파일로 변환)
            const backendBaseUrl = "https://apivirtualtryon.p-e.kr"; // 캡스톤 서버 주소
            const targetClothUrl = cloth.startsWith("http") ? cloth : backendBaseUrl + cloth;

            const response = await fetch(targetClothUrl);
            if (!response.ok) throw new Error("옷 이미지를 불러올 수 없습니다.");

            const blob = await response.blob();
            const clothFile = new File([blob], "cloth.jpg", { type: "image/jpeg" });

            // 2. 카테고리 결정
            const clothType = getMappedCategory(category);

            // 3. 피팅 작업 요청
            const job = await createTryonJob({
                personImage: file,
                clothImage: clothFile,
                clothType: clothType, // "upper" | "lower" | "overall"
            });

            // 로그인 안 했을 때만 세션에 tryonId 저장
            if (!sessionStorage.getItem("accessToken")) {
                const guestIds = JSON.parse(sessionStorage.getItem("guestTryonIds") || "[]");
                sessionStorage.setItem("guestTryonIds", JSON.stringify([...guestIds, job.tryonId]));
            }

            if (!job || !job.tryonId) {
                throw new Error("Job ID가 생성되지 않았습니다.");
            }

            // 4. 결과 페이지로 이동 (폴링은 결과 페이지에서 수행)
            navigate("/result", {
                state: {
                    tryonId: job.tryonId,
                    userPreview: userPreviewUrl,
                    clothType: clothType
                }
            });

        } catch (error) {
            console.error("피팅 요청 실패:", error);
            alert("가상 피팅 서버와 통신에 실패했습니다. (서버 사양/네트워크 확인 필요)");
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
                            {/* 배경: 내 사진 (흐릿하게) */}
                            <img src={userPreviewUrl} className="w-full h-full object-cover opacity-50" alt="User" />

                            {/* 오버레이: 선택한 옷 (부위에 따라 위치 자동 보정) */}
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                <img
                                    src={cloth}
                                    className={`w-full h-auto object-contain drop-shadow-2xl animate-pulse transition-all duration-700
                            ${getMappedCategory(category) === 'upper' ? 'translate-y-[-20%] scale-110' : ''}
                            ${getMappedCategory(category) === 'lower' ? 'translate-y-[20%] scale-110' : ''}
                            ${getMappedCategory(category) === 'overall' ? 'scale-100' : ''}
                        `}
                                    alt="Cloth Overlay"
                                />
                            </div>
                        </div>
                        <p className="text-[9px] text-gray-400 mt-3 text-center font-bold uppercase">
                            {getMappedCategory(category)} Mode Applied
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
                {/* Step 1: User Photo */}
                <div className="flex flex-col">
                    <div className="flex justify-between items-end mb-6 px-2">
                        <span className="text-[11px] font-[1000] tracking-[0.3em] text-[#2563EB] uppercase">Step 01</span>
                        <h2 className="text-xl font-black">내 정면 사진</h2>
                    </div>
                    <div className="h-[600px] bg-white rounded-3xl border border-gray-100 flex items-center justify-center shadow-sm overflow-hidden relative group">
                        {userPreviewUrl ? (
                            <img src={userPreviewUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Preview" />
                        ) : (
                            <UploadBox />
                        )}
                    </div>
                    <div className="mt-8">
                        <UploadButton onChange={setFile} />
                    </div>
                </div>

                {/* Step 2: Selected Item */}
                <div className="flex flex-col">
                    <div className="flex justify-between items-end mb-6 px-2">
                        <span className="text-[11px] font-[1000] tracking-[0.3em] text-gray-300 uppercase">Step 02</span>
                        <h2 className="text-xl font-black">선택한 의상</h2>
                    </div>
                    <div className="h-[600px] bg-white rounded-3xl border border-gray-100 flex items-center justify-center p-16 shadow-sm relative">
                        <img src={cloth} className="max-w-full max-h-full object-contain drop-shadow-2xl" alt="Selected" />
                        <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#F5F5F3] rounded-2xl border border-gray-200 flex items-center gap-3">
                            <Info size={16} className="text-gray-400" />
                            <p className="text-[10px] text-gray-500 font-bold leading-tight">AI가 의상의 형태를 분석하여<br/>{getMappedCategory(category)} 모드로 처리합니다.</p>
                        </div>
                    </div>
                    <div className="mt-8">
                        <button onClick={() => navigate("/")} className="w-full py-5 bg-transparent border-2 border-[#111111] rounded-2xl font-black text-xs tracking-widest hover:bg-[#111111] hover:text-white transition-all">
                            다른 아이템 선택하기
                        </button>
                    </div>
                </div>
            </div>

            {/* 실행 버튼 */}
            <div className="flex justify-center mt-24">
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