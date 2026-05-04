import { useEffect, useMemo, useState } from "react";
import Header from "../components/layout/Header";
import { deleteTryon, getTryonList, type TryonJob } from "../api/tryonApi";

type MyInfo = {
  id: number;
  email: string;
  nickname: string;
  role: string;
};

const statusStyleMap: Record<string, string> = {
  queued: "bg-gray-100 text-gray-500",
  processing: "bg-blue-50 text-blue-600",
  completed: "bg-green-50 text-green-600",
  failed: "bg-red-50 text-red-500",
};

const statusLabelMap: Record<string, string> = {
  queued: "대기중",
  processing: "처리중",
  completed: "완료",
  failed: "실패",
};

const parseJwt = (token: string): MyInfo | null => {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) {
      return null;
    }

    const normalizedPayload = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(atob(normalizedPayload)) as Record<string, unknown>;

    return {
      id:
          typeof decodedPayload.userId === "number"
              ? decodedPayload.userId
              : typeof decodedPayload.sub === "number"
                  ? decodedPayload.sub
                  : 0,
      email:
          typeof decodedPayload.email === "string"
              ? decodedPayload.email
              : "",
      nickname:
          typeof decodedPayload.nickname === "string"
              ? decodedPayload.nickname
              : typeof decodedPayload.name === "string"
                  ? decodedPayload.name
                  : "USER",
      role:
          typeof decodedPayload.role === "string"
              ? decodedPayload.role
              : "USER",
    };
  } catch {
    return null;
  }
};

const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
};

const HistoryPage = () => {
  const user = useMemo(() => {
    const token = getAccessToken();
    return token ? parseJwt(token) : null;
  }, []);

  const [history, setHistory] = useState<TryonJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      try {
        const tryons = await getTryonList();

        if (!cancelled) {
          setHistory(tryons);
        }
      } catch (error: unknown) {
        console.error("history load error:", error);

        if (!cancelled) {
          alert("히스토리를 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (tryonId: string) => {
    if (!window.confirm("이 피팅 내역을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteTryon(tryonId);
      setHistory((prev) => prev.filter((item) => item.tryonId !== tryonId));
    } catch (error: unknown) {
      console.error("delete error:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  return (
      <div className="min-h-screen bg-[#F5F5F3]">
        <Header />

        <div className="max-w-[1600px] mx-auto px-10 py-20">
          <div className="mb-20">
            <p className="text-[10px] font-black text-blue-600 tracking-[0.3em] mb-4">
              내 프로필
            </p>
            <h2 className="text-6xl font-[1000] tracking-tighter">
              안녕하세요.{" "}
              <span className="text-gray-300 italic">
              {user?.nickname || "USER"}
            </span>
            </h2>
            <p className="mt-4 text-gray-500 font-medium">{user?.email || ""}</p>
          </div>

          <h3 className="text-xl font-black mb-10 border-b border-gray-200 pb-4">
            피팅 히스토리
          </h3>

          {loading ? (
              <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-sm">
                <p className="text-gray-400 font-bold">피팅 내역을 불러오는 중입니다.</p>
              </div>
          ) : history.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-sm">
                <p className="text-gray-400 font-bold">아직 피팅 내역이 없습니다.</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
                {history.map((item) => (
                    <div
                        key={item.tryonId}
                        className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm"
                    >
                      <div className="aspect-[3/4] bg-gray-100">
                        {item.resultImageUrl ? (
                            <img
                                src={item.resultImageUrl}
                                alt="tryon result"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">
                              결과 이미지 없음
                            </div>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                    <span
                        className={`px-3 py-1 rounded-full text-[11px] font-black uppercase ${
                            statusStyleMap[item.status] || "bg-gray-100 text-gray-500"
                        }`}
                    >
                      {statusLabelMap[item.status] || item.status}
                    </span>
                          <span className="text-xs text-gray-400 font-bold">
                      {item.progress}%
                    </span>
                        </div>

                        <p className="text-sm font-bold text-[#111111] break-all mb-2">
                          TRYON ID: {item.tryonId}
                        </p>

                        <p className="text-xs text-gray-400 mb-1">
                          GARMENT: {item.garmentId || "-"}
                        </p>

                        <p className="text-xs text-gray-400 mb-6">
                          {item.createdAt
                              ? new Date(item.createdAt).toLocaleString()
                              : "생성일 없음"}
                        </p>

                        <div className="flex gap-3">
                          <button
                              onClick={() => {
                                if (item.resultImageUrl) {
                                  window.open(
                                      item.resultImageUrl,
                                      "_blank",
                                      "noopener,noreferrer"
                                  );
                                }
                              }}
                              disabled={!item.resultImageUrl}
                              className={`flex-1 py-3 rounded-2xl text-xs font-black tracking-widest transition-all ${
                                  item.resultImageUrl
                                      ? "bg-[#111111] text-white hover:bg-[#2563EB]"
                                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
                              }`}
                          >
                            보기
                          </button>

                          <button
                              onClick={() => handleDelete(item.tryonId)}
                              className="flex-1 py-3 rounded-2xl text-xs font-black tracking-widest border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-all"
                          >
                            삭제
                          </button>
                        </div>

                        {item.error?.message && (
                            <p className="mt-4 text-xs text-red-400 font-medium break-words">
                              {item.error.message}
                            </p>
                        )}
                      </div>
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );
};

export default HistoryPage;