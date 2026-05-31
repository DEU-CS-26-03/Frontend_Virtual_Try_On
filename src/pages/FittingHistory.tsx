import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Trash2, ExternalLink, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";

interface FittingHistoryItem {
    id: string;
    originalImageUrl: string;
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
    } catch (error) {
        console.error("날짜 파싱 중 오류 발생:", error);
        return "날짜 정보 없음";
    }
};

export const FittingHistory = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState<FittingHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 💡 여기에 똑같이 추가하세요!
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

    const fetchHistory = async () => {
        setLoading(true);
        setErrorMsg(null);

        try {
            // ✨ 내 고유 Key로 저장된 데이터만 쏙 빼옵니다.
            const storageKey = getHistoryStorageKey();
            const localDataRaw = localStorage.getItem(storageKey);
            const localData: FittingHistoryItem[] = localDataRaw ? JSON.parse(localDataRaw) : [];

            if (localData.length === 0) {
                console.warn("로컬 스토리지에 저장된 내역이 없습니다.");
                setHistory([]);
            } else {
                setHistory(localData.map((item: FittingHistoryItem) => ({
                    id: item.id,
                    originalImageUrl: item.originalImageUrl,
                    resultImageUrl: item.resultImageUrl,
                    category: item.category,
                    createdAt: formatDate(item.createdAt)
                })));
            }
        } catch (error) {
            console.error("히스토리 로드 에러:", error);
            setErrorMsg("로컬 데이터를 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleDelete = async (resultId: string) => {
        if (!confirm("이 피팅 기록을 정말 삭제하시겠습니까?")) return;

        try {
            // 💡 내 고유 Key를 이용해 내 데이터베이스에서만 삭제
            const storageKey = getHistoryStorageKey();
            const existingRaw = localStorage.getItem(storageKey);
            const existingHistory: FittingHistoryItem[] = existingRaw ? JSON.parse(existingRaw) : [];
            const updatedHistory = existingHistory.filter((item) => item.id !== resultId);

            localStorage.setItem(storageKey, JSON.stringify(updatedHistory));

            setHistory(prev => prev.filter(item => item.id !== resultId));
            alert("결과가 브라우저에서 성공적으로 삭제되었습니다.");

        } catch (error) {
            console.error("삭제 중 에러:", error);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    const validateImgSrc = (url: string): string => {
        if (!url || url.trim() === "") {
            return "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=500";
        }
        if (url.startsWith("http") || url.startsWith("data:")) return url;

        const cleanUrl = url.startsWith("/") ? url : `/${url}`;
        return `https://apivirtualtryon.p-e.kr${cleanUrl}`;
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="text-gray-400 font-bold">로컬 저장소에서 데이터를 불러오는 중...</p>
        </div>
    );

    if (errorMsg) return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <h4 className="text-lg font-black text-gray-800 mb-2">데이터 로드 실패</h4>
            <p className="text-gray-500 text-sm max-w-md mb-6">{errorMsg}</p>
            <button onClick={fetchHistory} className="px-5 py-2.5 bg-[#111111] text-white text-xs font-bold rounded-xl hover:bg-gray-800">
                다시 시도
            </button>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-3">
                <Clock className="text-blue-600" size={24} />
                <h3 className="text-2xl font-[1000] uppercase tracking-tighter">Fitting History</h3>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2.5 py-1 rounded-md">
                    {history.length} ITEMS
                </span>
            </div>

            {history.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {history.map((item) => (
                        <div key={item.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500">
                            <div className="flex aspect-[4/3] bg-gray-50 relative overflow-hidden">
                                <div className="w-1/2 relative group-hover:scale-102 transition-transform duration-500">
                                    <img src={validateImgSrc(item.originalImageUrl)} className="w-full h-full object-cover" alt="Source" />
                                    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-[8px] text-white px-2.5 py-1 rounded-full font-black">THUMBNAIL</div>
                                </div>
                                <div className="w-1/2 relative border-l-2 border-white group-hover:scale-102 transition-transform duration-500">
                                    <img src={validateImgSrc(item.resultImageUrl)} className="w-full h-full object-cover" alt="Result" />
                                    <div className="absolute top-4 left-4 bg-blue-600/80 backdrop-blur-md text-[8px] text-white px-2.5 py-1 rounded-full font-black shadow-lg">FITTED</div>
                                </div>
                            </div>

                            <div className="p-6 flex justify-between items-center bg-white">
                                <div>
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{item.category}</span>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">{item.createdAt}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/result`, { state: { tryonId: item.id } })}
                                        className="p-3 bg-gray-50 text-gray-500 rounded-xl hover:bg-black hover:text-white transition-all"
                                    >
                                        <ExternalLink size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
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