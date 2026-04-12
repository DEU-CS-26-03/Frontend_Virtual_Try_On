import { useNavigate } from "react-router-dom";
import { User, Globe, Menu } from "lucide-react";

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

  return (
    <header className="w-full bg-[#F5F5F3] sticky top-0 z-[100]">
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
            가상 피팅(try-on)
          </span>
        </div>

        {/* 메뉴 영역 */}
        <nav className="hidden md:flex items-center gap-14">
          {["SHOP", "VIRTUAL FITTING", "COLLECTION", "MY"].map((menu) => (
            <button // a 태그 대신 button으로 변경하여 제어권 확보
              key={menu} 
              onClick={(e) => {
                e.preventDefault();
                if (menu === "VIRTUAL FITTING") navigate("/fitting");
                // 3. 상단 메뉴의 'MY'를 눌렀을 때도 로그인 체크를 수행합니다.
                if (menu === "MY") handleUserClick();
              }}
              className="text-[12px] font-black tracking-[0.2em] text-gray-400 hover:text-[#111111] transition-colors"
            >
              {menu}
            </button>
          ))}
        </nav>

        {/* 아이콘 영역 */}
        <div className="flex items-center gap-7 text-[#111111]">
          <button className="hover:scale-110 transition-transform">
            <Globe size={22} strokeWidth={2} />
          </button>
          
          {/* 4. 사람 아이콘 클릭 시 handleUserClick 실행 */}
          <button 
            onClick={handleUserClick}
            className="hover:scale-110 transition-transform flex flex-col items-center"
          >
            <User size={24} strokeWidth={2} />
            {/* 시각적으로 로그인 유도 텍스트가 필요하다면 아래처럼 추가 가능 (선택사항) */}
            {!isLoggedIn && <span className="text-[8px] font-bold mt-1">LOGIN</span>}
          </button>

          <button className="md:hidden">
            <Menu size={22} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;