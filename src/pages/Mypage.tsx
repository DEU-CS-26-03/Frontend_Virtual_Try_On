import { useMemo, useState } from "react";
import Header from "../components/layout/Header";
import { FixUser } from "./FixUser";
import { FavoritePage } from "./FavoritePage";
import { FittingHistory } from "./FittingHistory"; // 💡 새로 만든 컴포넌트 임포트

export interface UserInfo {
  id: number;
  email: string;
  nickname: string;
  role: string;
}

// 💡 타입 가드 1: 데이터 자체가 UserInfo 인지 검사 (직접 저장된 경우)
function isUserInfo(data: unknown): data is UserInfo {
  if (typeof data !== "object" || data === null) return false;
  return "email" in data && "nickname" in data;
}

// 💡 타입 가드 2: 데이터 안에 user 속성이 있는지 검사 (중첩 저장된 경우)
function hasUserProperty(data: unknown): data is { user: unknown } {
  if (typeof data !== "object" || data === null) return false;
  return "user" in data;
}

const Mypage = () => {
  const [activeTab, setActiveTab] = useState<"info" | "profile" | "favorite" | "history">("history");

  // 로그인 시 세션스토리지에 저장된 사용자 정보를 안전하게 불러옵니다.
  const user = useMemo((): UserInfo | null => {
    const saved = sessionStorage.getItem("user");
    if (saved === null) return null;

    try {
      const parsed: unknown = JSON.parse(saved);

      // 경우 1: { user: { nickname, email }, accessToken: "..." } 형태
      if (hasUserProperty(parsed) && isUserInfo(parsed.user)) {
        return parsed.user;
      }

      // 경우 2: { nickname, email } 형태 (SessionStorage에 직접 저장된 경우)
      if (isUserInfo(parsed)) {
        return parsed;
      }
    } catch {
      return null;
    }
    return null;
  }, []);

  return (
      <div className="min-h-screen bg-[#F8F9FA] text-[#111111]">
        <Header />
        <div className="max-w-[1400px] mx-auto px-6 py-10 flex flex-col md:flex-row gap-6 items-start">

          {/* 사이드바 영역 */}
          <aside className="w-full md:w-[280px] bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2 shrink-0">
            <button
                onClick={() => setActiveTab("info")}
                className={`w-full text-left px-4 py-3.5 font-bold text-sm rounded-xl transition-colors ${activeTab === "info" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
            >
              👤 내 정보
            </button>
            {/* 💡 피팅 히스토리 버튼 추가 */}
            <button
                onClick={() => setActiveTab("history")}
                className={`w-full text-left px-4 py-3.5 font-bold text-sm rounded-xl transition-colors ${activeTab === "history" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
            >
              👗 피팅 히스토리
            </button>
            <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-4 py-3.5 font-bold text-sm rounded-xl transition-colors ${activeTab === "profile" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
            >
              ⚙️ 개인정보 수정
            </button>
            <button
                onClick={() => setActiveTab("favorite")}
                className={`w-full text-left px-4 py-3.5 font-bold text-sm rounded-xl transition-colors ${activeTab === "favorite" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
            >
              ❤️ 관심상품
            </button>
          </aside>

          {/* 메인 콘텐츠 영역 */}
          <main className="flex-1 w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm min-h-[500px]">
            {activeTab === "info" && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-black">내 기본 정보</h3>
                  <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <p className="flex flex-col space-y-1">
                      <span className="text-xs font-bold text-gray-500">닉네임</span>
                      <span className="text-lg font-semibold">{user?.nickname ?? "알 수 없음"}</span>
                    </p>
                    <p className="flex flex-col space-y-1">
                      <span className="text-xs font-bold text-gray-500">이메일</span>
                      <span className="text-lg font-semibold">{user?.email ?? "알 수 없음"}</span>
                    </p>
                    <p className="flex flex-col space-y-1">
                      <span className="text-xs font-bold text-gray-500">권한</span>
                      <span className="text-lg font-semibold">{user?.role ?? "USER"}</span>
                    </p>
                  </div>
                </div>
            )}

            {/* 💡 피팅 히스토리 탭 콘텐츠 연결 */}
            {activeTab === "history" && <FittingHistory />}
            {activeTab === "profile" && <FixUser user={user} />}
            {activeTab === "favorite" && <FavoritePage />}
          </main>

        </div>
      </div>
  );
};

export default Mypage;