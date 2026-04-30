// src/pages/FittingPage.tsx
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import UploadButton from "../components/upload/UploadButton";

const FittingPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const cloth = state?.cloth as string | undefined;
    const garmentId = state?.garmentId as string | undefined;
    const externalItemKey = state?.externalItemKey as string | undefined;

    const [userFile, setUserFile] = useState<File | null>(null);

    const userPreview = useMemo(() => {
        if (!userFile) return null;
        return URL.createObjectURL(userFile);
    }, [userFile]);

    const handleNext = () => {
        if (!cloth) {
            alert("선택된 의상이 없습니다. 홈에서 다시 선택해주세요.");
            navigate("/");
            return;
        }

        if (!userFile) {
            alert("사용자 사진을 업로드해주세요.");
            return;
        }

        navigate("/result", {
            state: {
                cloth,
                garmentId,
                externalItemKey,
                userFile,
                userPreview,
            },
        });
    };

    return (
        <div className="min-h-screen bg-[#F5F5F3]">
            <Header />

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-10">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#111111]">
                        Fitting 준비
                    </h1>
                    <p className="mt-3 text-gray-500 font-medium">
                        의상과 사용자 사진을 확인한 뒤 가상 피팅을 시작하세요.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                        <p className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-4">
                            선택 의상
                        </p>

                        <div className="rounded-3xl overflow-hidden bg-gray-50">
                            {cloth ? (
                                <img
                                    src={cloth}
                                    alt="selected garment"
                                    className="w-full h-[520px] object-cover"
                                />
                            ) : (
                                <div className="h-[520px] flex items-center justify-center text-gray-300 font-bold">
                                    선택된 의상이 없습니다
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col">
                        <p className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-4">
                            사용자 사진
                        </p>

                        <div className="flex-1 rounded-3xl overflow-hidden bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center">
                            {userPreview ? (
                                <img
                                    src={userPreview}
                                    alt="user preview"
                                    className="w-full h-[520px] object-cover"
                                />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <p className="font-bold">사용자 사진을 업로드해주세요.</p>
                                    <p className="text-sm mt-2">정면 사진 권장</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <UploadButton onChange={setUserFile} />
                        </div>

                        <button
                            onClick={handleNext}
                            className="mt-4 w-full bg-[#111111] text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-colors"
                        >
                            피팅 시작하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FittingPage;