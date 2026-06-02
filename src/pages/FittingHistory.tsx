import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Trash2, ExternalLink, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";
// 미사용이었던 apiRequest, API_ROUTES import 제거 완료
import { getTryonList, deleteTryon, type TryonJob } from "../api/tryonApi";

// 1. 프론트엔드 화면 렌더링용 타입 명시 (any 완전 배제)
interface FittingHistoryItem {
    id: string; // result_id
    tryonId: string; // tryon_id
    originalImageUrl: string;
    clothImageUrl: string;
    resultImageUrl: string;
    category: string;
    createdAt: string;
}

// 미사용이었던 BackendResultResponse 인터페이스 제거 완료

// 3. 로컬 스토리지 저장 데이터 규격 명시
interface LocalHistoryItem {
    id: string;
    originalImageUrl: string;
    clothImageUrl: string;
    resultImageUrl: string;
    category: string;
    createdAt: string;
}

const formatDate = (dateStr?: string): string => {
    if (!dateStr) return "날짜 정보 없음";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}.${month}.${day}`;
    } catch {
        return "날짜 정보 없음";
    }
};

const getHistoryStorageKey = (): string => {
    const userRaw = sessionStorage.getItem("user");
    if (userRaw) {
        try {
            const parsed = JSON.parse(userRaw);
            const identifier = parsed.id || parsed.userId || parsed.email || "guest";
            return `fittingHistory_${identifier}`;
        } catch {
            return "fittingHistory_guest";
        }
    }
    return "fittingHistory_guest";
};

export const FittingHistory = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState<FittingHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // useCallback 없이 일반 함수로 선언해도 무방하지만, linting rule에 맞춰 사용할 수도 있습니다.
    // 여기서는 기존 로직의 흐름을 유지하며 불필요한 의존성 없이 정의합니다.
    const fetchHistory = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const allJobs = await getTryonList();

            const storageKey = getHistoryStorageKey();
            const localRaw = localStorage.getItem(storageKey);
            const localHistory: LocalHistoryItem[] = localRaw ? JSON.parse(localRaw) : [];

            const completedJobs = allJobs.filter((job: TryonJob) => job.status === "completed");

            const myFilteredJobs = completedJobs.filter((job: TryonJob) => {
                return localHistory.some((local) => local.resultImageUrl === job.resultImageUrl);
            });

            const mappedHistory: FittingHistoryItem[] = myFilteredJobs.map((job: TryonJob) => {
                const tId = job.tryonId;
                const rId = job.resultId || tId;

                const localMatch = localHistory.find((local) => local.resultImageUrl === job.resultImageUrl);

                return {
                    id: rId,
                    tryonId: tId,
                    originalImageUrl: localMatch?.originalImageUrl || job.userImageId || "",
                    clothImageUrl: localMatch?.clothImageUrl || job.garmentId || "",
                    resultImageUrl: job.resultImageUrl || localMatch?.resultImageUrl || "",
                    category: localMatch?.category || "VIRTUAL FIT",
                    createdAt: formatDate(job.createdAt)
                };
            });

            const uniqueHistory = Array.from(
                new Map(mappedHistory.map(item => [item.tryonId, item])).values()
            );

            setHistory(uniqueHistory);

        } catch (error: unknown) {
            console.error("히스토리 로드 에러:", error);
            setErrorMsg("가상 피팅 내역을 동기화하는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Promise 반환 함수를 useEffect 내부에서 안전하게 실행 (void 연산자 사용)
        void fetchHistory();
    }, []);

    const handleDelete = async (tryonId: string, resultId: string) => {
        if (!window.confirm("이 피팅 기록을 정말 삭제하시겠습니까?")) return;

        try {
            await deleteTryon(tryonId);

            setHistory(prev => prev.filter(item => item.tryonId !== tryonId));

            const storageKey = getHistoryStorageKey();
            const localRaw = localStorage.getItem(storageKey);
            if (localRaw) {
                const localHistory: LocalHistoryItem[] = JSON.parse(localRaw);
                const updated = localHistory.filter((item) => item.id !== resultId && !tryonId.startsWith(item.id.replace("res_", "")));
                localStorage.setItem(storageKey, JSON.stringify(updated));
            }

        } catch (error) {
            console.error("삭제 중 에러:", error);
            alert("삭제 처리 중 문제가 발생했습니다.");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="animate-spin text-[#34D399]" size={48} />
            <p className="text-gray-400 font-bold">내 가상 피팅 내역을 정밀 동기화하는 중...</p>
        </div>
    );

    if (errorMsg) return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <h4 className="text-lg font-black text-gray-800 mb-2">데이터 로드 실패</h4>
            <p className="text-gray-500 text-sm max-w-md mb-6">{errorMsg}</p>
            <button onClick={() => { void fetchHistory(); }} className="px-5 py-2.5 bg-[#111111] text-white text-xs font-bold rounded-xl hover:bg-gray-800">
                다시 시도
            </button>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 text-[#111111]">
            <div className="flex items-center gap-3">
                <Clock className="text-[#34D399]" size={24} />
                <h3 className="text-2xl font-[1000] uppercase tracking-tighter">Fitting History</h3>
                <span className="bg-[#34D399]/20 text-[#111111] text-[10px] font-black px-2.5 py-1 rounded-md">
                    {history.length} ITEMS
                </span>
            </div>

            {history.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* 💡 미사용 변수 'index' 제거 완료 ( (_, item) -> (item) ) */}
                    {history.map((item) => (
                        <div
                            key={item.tryonId}
                            className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500"
                        >
                            <div className="flex flex-col sm:flex-row items-center justify-between p-6 gap-6 bg-gray-50/50 border-b border-gray-100">
                                <div className="flex flex-col gap-3 w-full sm:w-[140px] shrink-0">
                                    {/* MODEL 이미지 카드 */}
                                    <div className="relative aspect-[4/5] bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                        <img
                                            src={item.originalImageUrl || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=500"}
                                            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=500"; }}
                                            className="w-full h-full object-cover"
                                            alt="Model"
                                        />
                                        <div className="absolute bottom-2 left-2 bg-black/70 text-[8px] text-white px-2 py-0.5 rounded-md font-black uppercase">MODEL</div>
                                    </div>

                                    {/* ITEM 이미지 카드 */}
                                    <div className="relative aspect-[4/5] bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 p-1">
                                        <img
                                            src={item.clothImageUrl || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=500"}
                                            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=500"; }}
                                            className="w-full h-full object-contain"
                                            alt="Item"
                                        />
                                        <div className="absolute bottom-2 left-2 bg-black/70 text-[8px] text-white px-2 py-0.5 rounded-md font-black uppercase">ITEM</div>
                                    </div>
                                </div>

                                <div className="text-gray-300 font-light text-2xl select-none hidden sm:block">+</div>

                                {/* RESULT 이미지 카드 */}
                                <div className="w-full sm:flex-1 max-w-[260px]">
                                    <div className="relative aspect-[3/4] bg-white rounded-[1.8rem] overflow-hidden shadow-md border-2 border-[#34D399]">
                                        <img
                                            src={item.resultImageUrl || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=500"}
                                            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=500"; }}
                                            className="w-full h-full object-contain bg-white"
                                            alt="Result"
                                        />
                                        <div className="absolute bottom-3 left-3 bg-[#34D399] text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">
                                            TRY-ON RESULT
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 flex justify-between items-center bg-white">
                                <div>
                                    <span className="text-[10px] font-black text-[#34D399] uppercase tracking-[0.2em]">{item.category}</span>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">{item.createdAt}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/result`, {
                                            state: {
                                                tryonId: item.tryonId,
                                                resultId: item.id,
                                                clothPreview: item.clothImageUrl,
                                                userPreview: item.originalImageUrl,
                                                historyResultUrl: item.resultImageUrl,
                                                category: item.category
                                            }
                                        })}
                                        className="p-3 bg-gray-50 text-gray-500 rounded-xl hover:bg-black hover:text-white transition-all"
                                    >
                                        <ExternalLink size={18} />
                                    </button>
                                    <button
                                        onClick={() => void handleDelete(item.tryonId, item.id)}
                                        className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                    <ImageIcon className="mx-auto text-gray-200 mb-4" size={64} />
                    <p className="text-gray-400 font-bold">아직 생성된 피팅 내역이 없습니다.</p>
                </div>
            )}
        </div>
    );
};