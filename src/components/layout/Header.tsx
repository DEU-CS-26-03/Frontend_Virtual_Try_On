import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Menu, LogOut } from "lucide-react";

type HeaderUserInfo = {
  id?: number | string;
  email?: string;
  nickname?: string;
  role?: string;
};

// 💡 [추가된 부분]: any 대신 사용할 정확한 JWT 페이로드 타입 정의
interface JwtPayload {
  id?: string | number;
  userId?: string | number;
  sub?: string;
  email?: string;
  username?: string;
  nickname?: string;
  name?: string;
  role?: string;
  roles?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown; // 명시된 속성 외에 백엔드에서 추가로 보내는 데이터 허용 (any 방어)
}

// 💡 [수정된 부분]: parseJwtUser 함수 내부 로직 업데이트
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
    ) as JwtPayload;

    console.log("Header JWT Payload 확인:", decodedPayload); // 디버깅용 로그

    return {
      id: decodedPayload.userId || decodedPayload.id || decodedPayload.sub,
      email: decodedPayload.email || decodedPayload.username,
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
  const location = useLocation(); // 💡 페이지 이동 감지를 위해 추가

// 🛠️ 로그인 상태와 유저 정보를 담을 React 상태(State) 선언
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<HeaderUserInfo | null>(null);

// 🔄 페이지 라우팅 경로가 변동될 때마다 세션 스토리지를 감지하여 UI 동기화
  useEffect(() => {
    // 🔐 [보안 통합]: 오직 sessionStorage만 감시하도록 단일화
    const token = sessionStorage.getItem("accessToken");
    const savedUser = sessionStorage.getItem("user");

    if (token && savedUser) {
      setIsLoggedIn(true);
      try {
        setUserInfo(JSON.parse(savedUser) as HeaderUserInfo);
      } catch (error) {
        console.error("헤더 유저 정보 파싱 에러:", error);
        setUserInfo(null);
      }
    } else {
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  }, [location.pathname]);

  const handleUserClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    navigate("/history");
  };

  const handleLogout = () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;
  // 🔐 세션 스토리지 완전 보이드(Void) 처리
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
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