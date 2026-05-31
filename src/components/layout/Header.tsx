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

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!sessionStorage.getItem("accessToken"));
  const [userInfo, setUserInfo] = useState<HeaderUserInfo | null>(() => {
    const token = sessionStorage.getItem("accessToken");
    return token ? parseJwtUser(token) : null;
  });

  useEffect(() => {
    const syncAuthState = async () => {
      await Promise.resolve();

      const token = sessionStorage.getItem("accessToken");
      const savedUser = sessionStorage.getItem("user");

      if (token) {
        const parsedInfo = parseJwtUser(token);
        if (parsedInfo) {
          setIsLoggedIn(true);
          setUserInfo(parsedInfo);
          return;
        }
      }

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

  // 💡 [추가된 로직]: 권한(Role)을 확인하여 관리자 여부 판단
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

            {/* 💡 [수정된 부분]: 관리자면 "관리자", 일반 유저면 "닉네임님" 출력 */}
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