import React, { useEffect, useState } from "react";
import { apiRequest, API_ROUTES, API_BASE_URL, ApiError } from "../api/client";
import type { UserInfo } from "./HistoryPage";

interface FixUserProps {
    user: UserInfo | null;
}

// 💡 1. 에러 메세지를 안전하게 추출하기 위한 타입 가드 (RegisterPage 패턴 적용)
type ErrorWithMessage = {
    message?: string;
    data?: {
        message?: string;
    };
};

const isErrorWithMessage = (error: unknown): error is ErrorWithMessage => {
    return typeof error === "object" && error !== null;
};

const getErrorMessage = (error: unknown): string => {
    if (error instanceof ApiError) {
        return error.message;
    }
    if (isErrorWithMessage(error)) {
        if (typeof error.data?.message === "string" && error.data.message.trim() !== "") {
            return error.data.message;
        }
        if (typeof error.message === "string" && error.message.trim() !== "") {
            return error.message;
        }
    }
    return "서버 통신 중 오류가 발생했습니다.";
};

// 💡 2. 세션 스토리지를 안전하게 파싱하기 위한 타입 가드
function isRecord(val: unknown): val is Record<string, unknown> {
    return typeof val === "object" && val !== null;
}

export const FixUser = ({ user }: FixUserProps) => {
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [submittingInfo, setSubmittingInfo] = useState(false);
    const [submittingPassword, setSubmittingPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setNickname(user.nickname);
            setEmail(user.email);
        }
    }, [user]);

    // 💡 기본 정보 변경 핸들러
    const handleSaveUserInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submittingInfo) return;
        if (nickname.trim() === "" || email.trim() === "") {
            alert("닉네임과 이메일을 모두 입력해주세요.");
            return;
        }

        try {
            setSubmittingInfo(true);
            // 변경 필요
            await apiRequest(API_ROUTES.AUTH_ME, {
                method: "PATCH",
                withAuth: true,
                body: JSON.stringify({
                    nickname: nickname.trim(),
                    email: email.trim(),
                }),
            });

            alert("기본 정보가 성공적으로 변경되었습니다.");

            // 세션 스토리지 안전 업데이트
            const saved = sessionStorage.getItem("user");
            if (saved) {
                try {
                    const parsed: unknown = JSON.parse(saved);
                    if (isRecord(parsed)) {
                        if ("user" in parsed && isRecord(parsed.user)) {
                            // 중첩 구조 { user: { ... } }
                            const updatedNestedUser = { ...parsed.user, nickname, email };
                            sessionStorage.setItem("user", JSON.stringify({ ...parsed, user: updatedNestedUser }));
                        } else {
                            // 직접 저장된 { nickname, email, ... } 구조
                            const updatedUser = { ...parsed, nickname, email };
                            sessionStorage.setItem("user", JSON.stringify(updatedUser));
                        }
                        window.location.reload();
                    }
                } catch {
                    console.warn("세션 스토리지 업데이트 실패");
                }
            }
        } catch (error: unknown) {
            alert(getErrorMessage(error));
        } finally {
            setSubmittingInfo(false);
        }
    };

    // 💡 비밀번호 변경 핸들러
    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submittingPassword) return;
        if (currentPassword.trim() === "" || newPassword.trim() === "") {
            alert("비밀번호를 모두 입력해주세요.");
            return;
        }
        if (newPassword.trim().length < 8) {
            alert("새 비밀번호는 8자 이상이어야 합니다.");
            return;
        }

        try {
            setSubmittingPassword(true);

            // spring에 맞게 변경 필요
            await apiRequest(`${API_BASE_URL}/auth/password`, {
                method: "PATCH",
                withAuth: true,
                body: JSON.stringify({
                    currentPassword: currentPassword, // ★ oldPassword -> currentPassword 로 변경
                    newPassword: newPassword,
                }),
            });

            alert("비밀번호가 성공적으로 변경되었습니다.");
            setCurrentPassword("");
            setNewPassword("");
        } catch (error: unknown) {
            const errMsg = getErrorMessage(error);
            if (errMsg.includes("인증") || errMsg.includes("Unauthorized")) {
                alert("기존 비밀번호가 일치하지 않거나 로그인이 만료되었습니다.");
            } else {
                alert(errMsg);
            }
        } finally {
            setSubmittingPassword(false);
        }
    };

    return (
        <div className="max-w-xl space-y-12">

            {/* --- 기본 정보 변경 섹션 --- */}
            <section>
                <div className="mb-6">
                    <h3 className="text-2xl font-[1000] tracking-tighter text-[#111111]">개인정보 수정</h3>
                    <p className="text-gray-400 text-sm mt-1 font-medium">
                        닉네임과 이메일 주소를 변경할 수 있습니다.
                    </p>
                </div>

                <form onSubmit={handleSaveUserInfo} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                            별명
                        </label>
                        <input
                            type="text"
                            value={nickname}
                            required
                            disabled={submittingInfo}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full border-b-2 border-gray-100 py-3 focus:border-[#111111] outline-none transition-colors text-sm bg-transparent"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            required
                            disabled={submittingInfo}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border-b-2 border-gray-100 py-3 focus:border-[#111111] outline-none transition-colors text-sm bg-transparent"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submittingInfo}
                        className="w-full bg-[#111111] text-white py-4 font-black text-xs tracking-[0.2em] hover:bg-blue-600 transition-colors disabled:opacity-60 mt-4"
                    >
                        {submittingInfo ? "저장 중..." : "기본 정보 저장"}
                    </button>
                </form>
            </section>

            <hr className="border-gray-100" />

            {/* --- 비밀번호 변경 섹션 --- */}
            <section>
                <div className="mb-6">
                    <h3 className="text-2xl font-[1000] tracking-tighter text-[#111111]">PASSWORD</h3>
                    <p className="text-gray-400 text-sm mt-1 font-medium">
                        계정 보호를 위해 비밀번호를 주기적으로 변경해주세요.
                    </p>
                </div>

                <form onSubmit={handleSavePassword} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                            기존 패스워드
                        </label>
                        <input
                            type="password"
                            value={currentPassword}
                            required
                            disabled={submittingPassword}
                            placeholder="••••••••"
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full border-b-2 border-gray-100 py-3 focus:border-[#111111] outline-none transition-colors text-sm bg-transparent"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                            새로운 패스워드
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            required
                            minLength={8}
                            disabled={submittingPassword}
                            placeholder="8자 이상 입력"
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full border-b-2 border-gray-100 py-3 focus:border-[#111111] outline-none transition-colors text-sm bg-transparent"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submittingPassword}
                        className="w-full bg-[#111111] text-white py-4 font-black text-xs tracking-[0.2em] hover:bg-blue-600 transition-colors disabled:opacity-60 mt-4"
                    >
                        {submittingPassword ? "변경 중..." : "비밀번호 변경"}
                    </button>
                </form>
            </section>

        </div>
    );
};