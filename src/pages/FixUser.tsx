import { useState } from "react";
import { apiRequest, API_BASE_URL } from "../api/client";
import type { UserInfo } from "./HistoryPage"; // 타입 공유

interface FixUserProps {
    user: UserInfo | null;
}

export const FixUser = ({ user }: FixUserProps) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const handleSave = async () => {
        if (currentPassword.trim() === "" || newPassword.trim() === "") {
            alert("비밀번호를 모두 입력해주세요.");
            return;
        }

        try {
            await apiRequest(`${API_BASE_URL}/auth/password`, {
                method: "PATCH",
                withAuth: true,
                body: JSON.stringify({
                    oldPassword: currentPassword, // 백엔드 DTO에 맞춘 키값
                    newPassword: newPassword,
                }),
            });
            alert("비밀번호가 성공적으로 변경되었습니다.");
            setCurrentPassword("");
            setNewPassword("");
        } catch (e) {
            console.error(e);
            alert("변경 실패: 현재 비밀번호가 틀렸거나 서버 오류가 발생했습니다.");
        }
    };

    return (
        <div className="max-w-xl space-y-6">
            <h3 className="text-2xl font-black">개인정보 수정</h3>
            <p className="text-sm text-gray-500 border-b pb-4">
                {user?.nickname ?? "고객"}님의 비밀번호를 변경할 수 있습니다.
            </p>

            <div className="space-y-4">
                <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase mb-1 block">현재 비밀번호</label>
                    <input
                        type="password"
                        value={currentPassword}
                        placeholder="현재 사용 중인 비밀번호 입력"
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full p-4 border rounded-2xl text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase mb-1 block">새 비밀번호</label>
                    <input
                        type="password"
                        value={newPassword}
                        placeholder="새로운 비밀번호 입력"
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-4 border rounded-2xl text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            <button
                onClick={handleSave}
                className="w-full py-4 bg-[#111111] text-white rounded-2xl font-black text-sm hover:bg-blue-600 transition-colors mt-6"
            >
                비밀번호 변경 저장
            </button>
        </div>
    );
};