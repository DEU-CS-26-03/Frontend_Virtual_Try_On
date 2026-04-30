// src/hooks/useTryonPipeline.ts
import { useState, useRef, useCallback } from "react";
import { createTryon, getTryon, type TryonJob, TryonStatus } from "../api/tryonApi";

interface PipelineState {
    status: "idle" | "submitting" | "polling" | "done" | "error";
    job: TryonJob | null;
    errorMessage: string | null;
}

const POLL_INTERVAL_MS = 3000;   // 3초마다 폴링
const MAX_POLL_COUNT   = 100;    // 최대 5분 (300s)

export function useTryonPipeline() {
    const [state, setState] = useState<PipelineState>({
        status: "idle",
        job: null,
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

            // 타임아웃 처리
            if (pollCount.current > MAX_POLL_COUNT) {
                setState(s => ({ ...s, status: "error", errorMessage: "추론 시간 초과 (5분)" }));
                stopPolling();
                return;
            }

            try {
                const job = await getTryon(tryonId);
                setState(s => ({ ...s, job }));

                if (job.status === "completed") {
                    setState(s => ({ ...s, status: "done" }));
                    stopPolling();
                } else if (job.status === "failed") {
                    setState(s => ({
                        ...s,
                        status: "error",
                        errorMessage: job.error?.message ?? "추론 실패",
                    }));
                    stopPolling();
                } else {
                    // queued / processing — 계속 폴링
                    poll(tryonId);
                }
            } catch (e) {
                setState(s => ({ ...s, status: "error", errorMessage: String(e) }));
                stopPolling();
            }
        }, POLL_INTERVAL_MS);
    }, [stopPolling]);

    const run = useCallback(
        async (userImageId: string, garmentId: string) => {
            stopPolling();
            pollCount.current = 0;
            setState({ status: "submitting", job: null, errorMessage: null });

            try {
                const job = await createTryon({ userImageId, garmentId });
                setState({ status: "polling", job, errorMessage: null });
                poll(job.tryonId);
            } catch (e) {
                setState({
                    status: "error",
                    job: null,
                    errorMessage: String(e),
                });
            }
        },
        [poll, stopPolling]
    );

    const reset = useCallback(() => {
        stopPolling();
        setState({ status: "idle", job: null, errorMessage: null });
    }, [stopPolling]);

    return { ...state, run, reset };
}