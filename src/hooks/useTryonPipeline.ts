// src/hooks/useTryonPipeline.ts
import { useState, useRef, useCallback, useEffect } from "react";
import { createTryon, getTryon, type TryonJob, type ClothCategory } from "../api/tryonApi";
import { showTryonCompleteNotification } from "../components/utils/notification";

interface PipelineState {
    status: "idle" | "submitting" | "polling" | "done" | "error";
    job: TryonJob | null;
    resultImageUrl: string | null | undefined;
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
    // 컴포넌트 마운트 상태 추적 (안전장치)
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (pollTimer.current) clearTimeout(pollTimer.current);
        };
    }, []);

    // 해결 포인트 1: 일반 함수로 선언하여 호이스팅 문제 및 참조 순서 에러 방지
    const stopPolling = () => {
        if (pollTimer.current) {
            clearTimeout(pollTimer.current);
            pollTimer.current = null;
        }
    };

    // 해결 포인트 2: 일반 함수로 선언 (useCallback 의존성 제거)
    const poll = (tryonId: string) => {
        pollTimer.current = setTimeout(async () => {
            if (!isMounted.current) return;
            pollCount.current += 1;

            if (pollCount.current > MAX_POLL_COUNT) {
                setState(s => ({ ...s, status: "error", errorMessage: "추론 시간 초과 (5분)" }));
                stopPolling();
                return;
            }

            try {
                const job = await getTryon(tryonId);
                if (!isMounted.current) return;

                const currentStatus = String(job.status).toUpperCase();

                if (currentStatus === "COMPLETED") {
                    showTryonCompleteNotification();
                    setState(s => ({
                        ...s,
                        status: "done",
                        job: job,
                        resultImageUrl: job.resultImageUrl
                    }));
                    stopPolling();
                } else if (currentStatus === "FAILED") {
                    setState(s => ({
                        ...s,
                        status: "error",
                        job: job,
                        errorMessage: job.error?.message ?? "AI 추론 서버(Ngrok)와 연결이 끊어졌거나 처리 중 오류가 발생했습니다.",
                    }));
                    stopPolling();
                } else {
                    setState(s => ({ ...s, job }));
                    // 상태가 QUEUED/PROCESSING 이면 다시 자신을 호출
                    poll(tryonId);
                }
            } catch {
                if (!isMounted.current) return;
                setState(s => ({ ...s, status: "error", errorMessage: "서버 응답 지연 (Polling 에러 발생)" }));
                stopPolling();
            }
        }, POLL_INTERVAL_MS);
    };

    const run = useCallback(
        async (personImage: File, clothImage: File, clothType: ClothCategory = "upper") => {
            stopPolling();
            pollCount.current = 0;
            setState({ status: "submitting", job: null, resultImageUrl: null, errorMessage: null });

            try {
                const job = await createTryon({ personImage, clothImage, clothType });
                if (!isMounted.current) return;

                setState({ status: "polling", job, resultImageUrl: null, errorMessage: null });
                poll(job.tryonId);
            } catch (error) {
                if (!isMounted.current) return;
                setState({
                    status: "error",
                    job: null,
                    resultImageUrl: null,
                    errorMessage: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
                });
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [] // 해결 포인트 3: 일반 함수를 호출하므로 deps를 비워 무한 루프나 참조 에러 방지
    );

    const reset = useCallback(() => {
        stopPolling();
        setState({ status: "idle", job: null, resultImageUrl: null, errorMessage: null });
    }, []);

    return { ...state, run, reset };
}