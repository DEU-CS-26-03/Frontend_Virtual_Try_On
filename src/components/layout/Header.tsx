import { useNavigate } from "react-router-dom";
import { User, Globe, Menu, LogOut } from "lucide-react";

type HeaderUserInfo = {
  id?: number;
  email?: string;
  nickname?: string;
  role?: string;
};

const parseJwtUser = (token: string): HeaderUserInfo | null => {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) {
      return null;
    }

    const normalizedPayload = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(atob(normalizedPayload)) as Record<string, unknown>;

    return {
      id:
          typeof decodedPayload.userId === "number"
              ? decodedPayload.userId
              : typeof decodedPayload.id === "number"
                  ? decodedPayload.id
                  : undefined,
      email:
          typeof decodedPayload.email === "string"
              ? decodedPayload.email
              : undefined,
      nickname:
          typeof decodedPayload.nickname === "string"
              ? decodedPayload.nickname
              : typeof decodedPayload.name === "string"
                  ? decodedPayload.name
                  : undefined,
      role:
          typeof decodedPayload.role === "string"
              ? decodedPayload.role
              : undefined,
    };
  } catch {
    return null;
  }
};

const Header = () => {
  const navigate = useNavigate();

  const token = (() => {
    try {
      return sessionStorage.getItem("accessToken");
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
    if (!window.confirm("로그아웃 하시겠습니까?")) {
      return;
    }

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
            {isLoggedIn && userInfo?.nickname && (
                <span className="text-[10px] font-bold text-[#111111] bg-white px-3 py-1 rounded-full border border-gray-200">
              {userInfo.nickname}님
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