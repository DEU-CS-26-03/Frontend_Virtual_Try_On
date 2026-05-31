import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Menu, LogOut } from "lucide-react";

type HeaderUserInfo = {
  id?: number | string;
  email?: string;
  nickname?: string;
  role?: string;
};

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
  [key: string]: unknown;
}

const parseJwtUser = (token: string): HeaderUserInfo | null => {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;

    const normalizedPayload = payloadPart.replace(/-/g, "+").replace(/_/g, "/");

    const decodedPayload = JSON.parse(
        decodeURIComponent(
            atob(normalizedPayload)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        )
    ) as JwtPayload;

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
  const location = useLocation();

  // [핵심 해결 1]: 중첩된 user 객체까지 완벽하게 파싱하는 헬퍼 함수 추가
  const getRealUserFromStorage = (): HeaderUserInfo | null => {
    const savedUserStr = sessionStorage.getItem("user");
    if (!savedUserStr) return null;
    try {
      const parsed = JSON.parse(savedUserStr);
      if (parsed.user && parsed.user.nickname) {
        return parsed.user;
      }
      return parsed as HeaderUserInfo;
    } catch {
      return null;
    }
  };

  // [핵심 해결 2]: 1순위로 세션 스토리지의 진짜 닉네임을, 2순위로 토큰을 찾습니다.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!sessionStorage.getItem("accessToken"));
  const [userInfo, setUserInfo] = useState<HeaderUserInfo | null>(() => {
    const realUser = getRealUserFromStorage();
    if (realUser?.nickname) return realUser; // 진짜 닉네임이 있으면 무조건 우선 사용!

    const token = sessionStorage.getItem("accessToken");
    return token ? parseJwtUser(token) : null;
  });

  useEffect(() => {
    const syncAuthState = async () => {
      await Promise.resolve();

      const token = sessionStorage.getItem("accessToken");
      const realUser = getRealUserFromStorage(); // 진짜 유저 정보 가져오기

      // 1순위: 진짜 닉네임이 담긴 세션 스토리지가 있다면 이것을 최우선으로 사용
      if (token && realUser?.nickname) {
        setIsLoggedIn(true);
        setUserInfo(realUser);
        return;
      }

      // 2순위: 세션 스토리지가 날아갔다면 토큰이라도 뜯어서 복구
      if (token) {
        const parsedInfo = parseJwtUser(token);
        if (parsedInfo) {
          setIsLoggedIn(true);
          setUserInfo(parsedInfo);
          return;
        }
      }

      setIsLoggedIn(false);
      setUserInfo(null);
    };

    void syncAuthState();
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
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const isAdmin = userInfo?.role?.toUpperCase().includes("ADMIN");

  return (
      <header className="w-full bg-[#F5F5F3] sticky top-0 z-[100] shadow-md border-b border-gray-200 transition-all">
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

            {isLoggedIn && (
                <span className={`text-sm font-bold bg-white px-4 py-1.5 rounded-full border shadow-sm ${isAdmin ? 'text-[#2563EB] border-blue-200' : 'text-[#111111] border-gray-200'}`}>
                  {isAdmin ? "관리자" : `${userInfo?.nickname || "사용자"}님`}
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