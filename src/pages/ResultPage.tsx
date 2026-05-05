import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Star, Download, RotateCcw, Camera } from "lucide-react";
import Header from "../components/layout/Header";
import { getTryonStatus, type TryonStatus } from "../api/tryonApi";

type ResultPageState = {
  tryonId?: string;
  userPreview?: string | null;
  uploadedUserImageUrl?: string | null; // ★ 추가됨: FittingPage에서 넘어온 진짜 서버 URL
};

const ResultPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // ★ 수정됨: uploadedUserImageUrl 받아오기
  const { tryonId, userPreview, uploadedUserImageUrl } = (state || {}) as ResultPageState;

  const [resultImage, setResultImage] = useState<string | null>(null);

  // ★ 추가됨: 새로고침 시에도 유지될 수 있도록, 폴링으로 받아온 진짜 원본 사진 URL을 저장할 상태
  const [finalUserImage, setFinalUserImage] = useState<string | null>(
      uploadedUserImageUrl || userPreview || null
  );

  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState("준비 중...");
  const [rating, setRating] = useState(0);
  const [showRec, setShowRec] = useState(false);
  const pollTimerRef = useRef<number | undefined>(undefined);

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `fitting_result_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusLabel = (status: TryonStatus, progress: number) => {
    if (status === "queued") return `대기열 등록 완료... (${progress}%)`;
    if (status === "processing") return `스타일 합성 중... (${progress}%)`;
    if (status === "completed") return "합성이 완료되었습니다.";
    return "합성에 실패했습니다.";
  };

  // 서버의 로컬 경로(/data/uploads/...)를 퍼블릭 URL로 변환해주는 헬퍼 함수
  const getPublicUrl = (path: string | undefined | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path; // 이미 완벽한 URL이면 그대로 사용

    // 예: /data/uploads/person_xxx.jpg -> https://apivirtualtryon.p-e.kr/uploads/user-images/person_xxx.jpg
    const fileName = path.split("/").pop();
    return `https://apivirtualtryon.p-e.kr/uploads/user-images/${fileName}`;
  };

  useEffect(() => {
    let active = true;

    const clearPolling = () => {
      if (pollTimerRef.current !== undefined) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = undefined;
      }
    };

    const runFittingWorkflow = async () => {
      if (!tryonId) {
        alert("잘못된 접근이거나 피팅 작업이 만료되었습니다.");
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        setStatusText("작업 진행 상태를 확인합니다...");

        pollTimerRef.current = window.setInterval(async () => {
          try {
            // ★ 수정됨: 폴링으로 가져오는 데이터에 원본 이미지 경로(userImageId)도 포함되어 있음
            const polled = await getTryonStatus(tryonId);
            if (!active) return;

            setStatusText(getStatusLabel(polled.status, polled.progress));

            // ★ 핵심: 서버가 알려주는 진짜 원본 사진 경로가 있다면 그걸로 업데이트 (새로고침 엑박 방지)
            if (polled.userImageId) {
              const publicUserUrl = getPublicUrl(polled.userImageId);
              if (publicUserUrl) setFinalUserImage(publicUserUrl);
            }

            if (polled.status === "completed") {
              setResultImage(polled.resultImageUrl || null);
              setLoading(false);
              clearPolling();
            } else if (polled.status === "failed") {
              setStatusText(polled.error?.message || "합성 실패. 다시 시도해 주세요.");
              setLoading(false);
              clearPolling();
            }
          } catch (pollError) {
            console.error("polling error:", pollError);
            if (!active) return;
            setStatusText("상태 조회 중 오류가 발생했습니다.");
            setLoading(false);
            clearPolling();
          }
        }, 3000);
      } catch (err) {
        console.error("runFittingWorkflow error:", err);
        setStatusText("오류가 발생했습니다.");
        setLoading(false);
      }
    };

    runFittingWorkflow();

    return () => {
      active = false;
      clearPolling();
    };
  }, [tryonId, navigate]);

  return (
      <div className="min-h-screen bg-[#F5F5F3] pb-32 font-sans text-[#111111]">
        <Header />

        <div className="max-w-[1600px] mx-auto px-10 pt-16 pb-12 flex justify-between items-end">
          <h1 className="text-6xl font-[1000] tracking-tighter leading-none uppercase">
            피팅
            <br />
            <span className="text-gray-300 italic font-light">결과</span>
          </h1>

          <div className="flex gap-4">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-8 py-3 bg-white border border-gray-200 rounded-full text-xs font-black tracking-widest hover:bg-black hover:text-white transition-all"
            >
              <Camera size={16} /> 사진 교체
            </button>

            <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-8 py-3 bg-[#111111] text-white rounded-full text-xs font-black tracking-widest hover:bg-gray-800 transition-all"
            >
              <RotateCcw size={16} /> 처음으로
            </button>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto grid md:grid-cols-2 gap-12 px-10 mb-24">
          <div className="space-y-5 text-center md:text-left">
          <span className="text-[11px] font-[1000] tracking-[0.3em] text-gray-300 uppercase px-2">
            Original
          </span>
            <div className="relative aspect-[3/4] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
              {/* ★ 수정됨: previewImage 대신, 서버에서 받아온 완벽한 finalUserImage를 띄움 */}
              {finalUserImage ? (
                  <img
                      src={finalUserImage}
                      className="w-full h-full object-cover"
                      alt="Before"
                  />
              ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">
                    사용자 이미지가 없습니다
                  </div>
              )}
              <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-md text-white px-5 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                Before
              </div>
            </div>
          </div>

          <div className="space-y-5 text-center md:text-left">
          <span className="text-[11px] font-[1000] tracking-[0.3em] text-[#2563EB] uppercase px-2">
            After Style
          </span>
            <div className="relative aspect-[3/4] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-2xl flex items-center justify-center">
              {loading ? (
                  <div className="text-center space-y-6">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 border-[3px] border-gray-100 rounded-full"></div>
                      <div className="absolute inset-0 border-[3px] border-t-[#2563EB] rounded-full animate-spin"></div>
                    </div>
                    <p className="text-xs font-black text-gray-400 tracking-widest uppercase animate-pulse">
                      {statusText}
                    </p>
                  </div>
              ) : (
                  <>
                    <img
                        src={resultImage || finalUserImage || ""}
                        className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-1000"
                        alt="Result"
                    />
                    <div className="absolute top-6 left-6 bg-[#2563EB] text-white px-5 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-lg uppercase">
                      Generated
                    </div>
                    {resultImage && (
                        <button
                            onClick={handleDownload}
                            className="absolute bottom-8 right-8 p-6 bg-[#111111] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
                        >
                          <Download size={24} />
                        </button>
                    )}
                  </>
              )}
            </div>
          </div>
        </div>

        {!loading && (
            <div className="max-w-5xl mx-auto px-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <div className="bg-[#111111] py-20 px-10 rounded-[4rem] shadow-2xl text-center text-white relative overflow-hidden">
            <span className="text-[11px] font-[1000] tracking-[0.5em] text-[#2563EB] uppercase mb-6 block">
              Feedback
            </span>
                <h2 className="text-4xl font-[1000] mb-12 tracking-tighter uppercase font-sans">
                  결과가 마음에 드시나요?
                </h2>

                <div className="flex justify-center gap-6 mb-16">
                  {[1, 2, 3, 4, 5].map((idx) => (
                      <button
                          key={idx}
                          onClick={() => {
                            setRating(idx);
                            setShowRec(true);
                          }}
                          className="transition-transform hover:scale-125"
                      >
                        <Star
                            size={52}
                            className={`transition-all duration-300 ${
                                idx <= rating ? "fill-[#2563EB] text-[#2563EB]" : "text-gray-800"
                            }`}
                            strokeWidth={idx <= rating ? 0 : 1.5}
                        />
                      </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <button className="px-16 py-6 bg-[#2563EB] rounded-2xl font-black text-[12px] tracking-widest hover:bg-blue-700 transition-all uppercase">
                    완전 만족해요!
                  </button>
                  <button
                      onClick={() => navigate("/")}
                      className="px-16 py-6 border border-gray-800 text-gray-500 rounded-2xl font-black text-[12px] tracking-widest hover:border-white hover:text-white transition-all uppercase"
                  >
                    조금 아쉬워요
                  </button>
                </div>
              </div>

              {showRec && (
                  <div className="mt-32 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-1000 text-center">
                    <div className="flex flex-col items-center gap-4 mb-20">
                      <div className="w-12 h-[2px] bg-[#2563EB]"></div>
                      <h3 className="text-4xl font-[1000] tracking-tighter uppercase font-sans">
                        당신을 위한 추천 아이템
                      </h3>
                      <p className="text-gray-400 font-bold text-[10px] tracking-widest uppercase mt-2">
                        Recommended for you
                      </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
                      {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="group cursor-pointer text-left">
                            <div className="aspect-[3/4] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:-translate-y-3">
                              <img
                                  src={`https://picsum.photos/seed/shop${i + 30}/500/660`}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                  alt="Rec"
                              />
                            </div>
                            <div className="mt-6 px-2">
                              <p className="text-[10px] font-black text-[#2563EB] uppercase tracking-[0.2em] mb-1 font-sans">
                                Trend Now
                              </p>
                              <h4 className="font-bold text-lg text-[#111111] font-sans">
                                추천 아이템 스타일 {i}
                              </h4>
                              <p className="text-gray-400 text-sm font-bold mt-1">₩ 49,000</p>
                            </div>
                          </div>
                      ))}
                    </div>
                  </div>
              )}
            </div>
        )}
      </div>
  );
};

export default ResultPage;