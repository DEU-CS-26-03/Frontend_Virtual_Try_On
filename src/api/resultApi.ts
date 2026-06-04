// (기존 import 유지)
import { apiRequest } from "./client";

export const submitFeedback = async (resultId: string, feedbackData: { rating: number; comment: string }) => {
    return apiRequest(`/api/v1/results/${resultId}/feedback`, {
        method: "POST",
        body: JSON.stringify(feedbackData),
        withAuth: true, // ★ 핵심: 401 에러 해결을 위해 인증 토큰 동봉
    });
};