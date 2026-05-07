// src/hooks/useTryonPipeline.ts
import { useState, useRef, useCallback } from "react";
import { createTryon, getTryon, type TryonJob } from "../api/tryonApi";

interface PipelineState {
    status: "idle" | "submitting" | "polling" | "done" | "error";
    job: TryonJob | null;
    resultImageUrl: string | null | undefined; // undefined 허용하도록 수정
    errorMessage: string | null;
}

const POLL_INTERVAL_MS = 3000;   // 3초마다 폴링
const MAX_POLL_COUNT   = 100;    // 최대 5분 (300s)

export function useTryonPipeline() {
    const [state, setState] = useState<PipelineState>({
        status: "idle",
        job: null,
        resultImageUrl: null,
        errorMessage: null,
    });
    const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pollCount = useRef(0);

    const stopPolling = useCallback(() => {
        if (pollTimer.current) {
            clearTimeout(pollTimer.current);
            pollTimer.current = null;
        }
    }, []);

    const poll = useCallback((tryonId: string) => {
        pollTimer.current = setTimeout(async () => {
            pollCount.current += 1;

            if (pollCount.current > MAX_POLL_COUNT) {
                setState(s => ({ ...s, status: "error", errorMessage: "추론 시간 초과 (5분)" }));
                stopPolling();
                return;
            }

            try {
                const job = await getTryon(tryonId);
                
                // 에러 메시지에서 지적한 대로 타입을 안전하게 처리
                const currentStatus = String(job.status).toUpperCase();

                if (currentStatus === "COMPLETED") {
                    setState(s => ({ 
                        ...s, 
                        status: "done", 
                        job: job, // job 업데이트 추가
                        resultImageUrl: job.resultImageUrl // string | undefined를 허용함
                    }));
                    stopPolling();
                } else if (currentStatus === "FAILED") {
                    setState(s => ({
                        ...s,
                        status: "error",
                        job: job,
                        errorMessage: job.error?.message ?? "추론 실패",
                    }));
                    stopPolling();
                } else {
                    setState(s => ({ ...s, job }));
                    poll(tryonId);
                }
            } catch (e) {
                setState(s => ({ ...s, status: "error", errorMessage: String(e) }));
                stopPolling();
            }
        }, POLL_INTERVAL_MS);
    }, [stopPolling]);

    const run = useCallback(
        // 파라미터를 실제 File 객체로 변경
        async (personImage: File, clothImage: File, clothType: string = "upper") => {
            stopPolling();
            pollCount.current = 0;
            setState({ status: "submitting", job: null, resultImageUrl: null, errorMessage: null });

            try {
<<<<<<< HEAD
                // 객체 프로퍼티 매칭 에러 해결
                const job = await createTryon({
                    personImage,
                    clothImage,
                    clothType
                });

                setState({ status: "polling", job, errorMessage: null });
=======
                const job = await createTryon({ userImageId, garmentId });
                setState({ status: "polling", job, resultImageUrl: null, errorMessage: null });
>>>>>>> e7d9413e5e0c530f1926536a173a9fb1406713e6
                poll(job.tryonId);
            } catch (e) {
                setState({
                    status: "error",
                    job: null,
<<<<<<< HEAD
=======
                    resultImageUrl: null,
>>>>>>> e7d9413e5e0c530f1926536a173a9fb1406713e6
                    errorMessage: String(e),
                });
            }
        },
        [poll, stopPolling]
    );

    const reset = useCallback(() => {
        stopPolling();
        setState({ status: "idle", job: null, resultImageUrl: null, errorMessage: null });
    }, [stopPolling]);

    return { ...state, run, reset };
}