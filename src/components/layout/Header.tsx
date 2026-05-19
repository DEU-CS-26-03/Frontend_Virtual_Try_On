import { useNavigate } from "react-router-dom";
import { User, Globe, Menu, LogOut } from "lucide-react";

type HeaderUserInfo = {
  id?: number | string;
  email?: string;
  nickname?: string;
  role?: string;
};

// 백엔드 Spring JWT 구조에 맞춰 유연하게 파싱하도록 개선된 함수
const parseJwtUser = (token: string): HeaderUserInfo | null => {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;

    const normalizedPayload = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    // decodeURIComponent와 escape를 조합하여 한글 닉네임 깨짐 및 base64 디코딩 에러 방지
    const decodedPayload = JSON.parse(
      decodeURIComponent(
        atob(normalizedPayload)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
    ) as Record<string, any>;

    console.log("Header JWT Payload 확인:", decodedPayload); // 디버깅용 로그

    return {
      // Spring Security 표준인 sub(username) 또는 id, userId 대응
      id: decodedPayload.userId || decodedPayload.id || decodedPayload.sub,
      email: decodedPayload.email || decodedPayload.username,
      // 백엔드 세팅에 따라 다를 수 있는 닉네임/이름 필드 전부 대응
      nickname: decodedPayload.nickname || decodedPayload.name || decodedPayload.username || "사용자",
      role: decodedPayload.role || decodedPayload.roles,
    };
  } catch (error) {
    console.error("JWT 파싱 실패 에러:", error);
    return null;
  }
};

const Header = () => {
  const navigate = useNavigate();

  const token = (() => {
    try {
      // 💡 오직 세션 스토리지방만 확인해서 개인정보 보안 유지
      return sessionStorage.getItem("token") || sessionStorage.getItem("accessToken");
    } catch {
      return null;
    }
  })();

  const isLoggedIn = !!token;
  const userInfo = token ? parseJwtUser(token) : null;

  const handleUserClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    navigate("/history");
  };

  const handleLogout = () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;
    // 로그아웃 시 세션 깔끔하게 청소
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("accessToken");
    navigate("/");
    window.location.reload();
  };

  return (
      <header className="w-full bg-[#F5F5F3] sticky top-0 z-[100] border-b border-gray-100">
        <div className="max-w-[1600px] mx-auto px-10 h-24 flex items-center justify-between">
          <div
              onClick={() => navigate("/")}
              className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 border-[3px] border-[#111111] rounded-full flex items-center justify-center transition-all group-hover:bg-[#111111]">
              <div className="w-4 h-4 bg-[#111111] rounded-full group-hover:bg-white" />
            </div>
            <span className="text-2xl font-[1000] tracking-tighter text-[#111111]">
            VIRTUAL TRY-ON
          </span>
          </div>

          <div className="flex items-center gap-7 text-[#111111]">
            
            {/* 💡 수정됨: userInfo 전체가 아니라 nickname만 없더라도 isLoggedIn 상태면 기본 표출되도록 방어 */}
            {isLoggedIn && (
                <span className="text-[10px] font-bold text-[#111111] bg-white px-3 py-1 rounded-full border border-gray-200">
              {userInfo?.nickname || "정상 로그인됨"}님
            </span>
            )}

            <button
                onClick={handleUserClick}
                className="group flex items-center gap-2 hover:text-[#2563EB] transition-colors"
                type="button"
            >
              <User size={24} strokeWidth={2} />
              <span className="text-[11px] font-black tracking-widest hidden lg:block">
              {isLoggedIn ? "MY PAGE" : "LOGIN"}
            </span>
            </button>

            {isLoggedIn && (
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="로그아웃"
                    type="button"
                >
                  <LogOut size={20} strokeWidth={2.5} />
                  <span className="text-[11px] font-black tracking-widest hidden lg:block">
                LOGOUT
              </span>
                </button>
            )}

            <button className="md:hidden" type="button">
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>
  );
};

export default Header;