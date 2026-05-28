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

  // 💡 [해결 2]: 초기 상태값을 함수형으로 지정하여, 화면이 처음 켜질 때부터 올바른 값을 가지게 합니다.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!sessionStorage.getItem("accessToken"));
  const [userInfo, setUserInfo] = useState<HeaderUserInfo | null>(() => {
    const token = sessionStorage.getItem("accessToken");
    return token ? parseJwtUser(token) : null;
  });

  useEffect(() => {
    // 💡 [해결 1 & 2]: 비동기(async) 함수로 감싸서 동기적 setState 경고(cascading renders)를 완벽히 우회합니다.
    const syncAuthState = async () => {
      await Promise.resolve(); // 마이크로태스크 큐로 넘겨서 React가 렌더링을 끝낼 시간을 벌어줍니다.

      const token = sessionStorage.getItem("accessToken");
      const savedUser = sessionStorage.getItem("user");

      if (token) {
        // 💡 [미사용 에러 해결!]: 만들어둔 parseJwtUser 함수를 여기서 드디어 사용합니다.
        const parsedInfo = parseJwtUser(token);
        if (parsedInfo) {
          setIsLoggedIn(true);
          setUserInfo(parsedInfo);
          return;
        }
      }

      // 토큰 파싱에 실패했을 때만 기존의 savedUser 문자열을 꺼내 쓰는 폴백(Fallback) 로직
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