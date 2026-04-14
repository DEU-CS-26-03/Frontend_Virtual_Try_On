import { useNavigate } from "react-router-dom";
import { User, Globe, Menu, LogOut } from "lucide-react"; // LogOut 아이콘 추가

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("accessToken");

  const handleUserClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      navigate("/history");
    }
  };
  
  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("accessToken");
      window.location.href = "/"; // 상태 초기화를 위해 새로고침하며 메인으로
    }
  };

  return (
    <header className="w-full bg-[#F5F5F3] sticky top-0 z-[100] border-b border-gray-100">
      <div className="max-w-[1600px] mx-auto px-10 h-24 flex items-center justify-between">
        
        {/* 로고 */}
        <div 
          onClick={() => navigate("/")} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 border-[3px] border-[#111111] rounded-full flex items-center justify-center transition-all group-hover:bg-[#111111]">
            <div className="w-4 h-4 bg-[#111111] rounded-full group-hover:bg-white" />
          </div>
          <span className="text-2xl font-[1000] tracking-tighter text-[#111111]">
            가상 피팅(Try-on)
          </span>
        </div>

        {/* 메뉴 영역 */}
        <nav className="hidden md:flex items-center gap-14">
          {["SHOP", "VIRTUAL FITTING", "COLLECTION", "MY HISTORY"].map((menu) => (
            <button 
              key={menu} 
              onClick={(e) => {
                e.preventDefault();
                if (menu === "VIRTUAL FITTING") navigate("/fitting");
                // MY 대신 MY HISTORY로 이름을 바꾸고 로그인 체크 적용
                if (menu === "MY HISTORY") handleUserClick();
              }}
              className={`text-[12px] font-black tracking-[0.2em] transition-colors ${
                menu === "MY HISTORY" && isLoggedIn ? "text-[#2563EB]" : "text-gray-400 hover:text-[#111111]"
              }`}
            >
              {menu}
            </button>
          ))}
        </nav>

        {/* 아이콘 및 로그인/로그아웃 영역 */}
        <div className="flex items-center gap-7 text-[#111111]">
          {/* 지구본 아이콘 (언어설정 등) */}
          <button className="hover:scale-110 transition-transform">
            <Globe size={22} strokeWidth={2} />
          </button>
          
          {/* 유저 아이콘 (클릭 시 로그인 또는 히스토리 이동) */}
          <button 
            onClick={handleUserClick}
            className="group flex items-center gap-2 hover:text-[#2563EB] transition-colors"
          >
            <User size={24} strokeWidth={2} />
            <span className="text-[11px] font-black tracking-widest hidden lg:block">
              {isLoggedIn ? "MY PAGE" : "LOGIN"}
            </span>
          </button>

          {/* [추가] 로그인 상태일 때만 로그아웃 버튼 표시 */}
          {isLoggedIn && (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
              title="로그아웃"
            >
              <LogOut size={20} strokeWidth={2.5} />
              <span className="text-[11px] font-black tracking-widest hidden lg:block">LOGOUT</span>
            </button>
          )}

          <button className="md:hidden">
            <Menu size={22} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;