import { useNavigate } from "react-router-dom";
import { User, Globe, Menu } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();

  return (
    // 배경색을 페이지와 동일하게 설정 (bg-[#F5F5F3])
    <header className="w-full bg-[#F5F5F3] sticky top-0 z-[100]">
      <div className="max-w-[1600px] mx-auto px-10 h-24 flex items-center justify-between">
        
        {/* 로고: 블랙 포인트 */}
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

        {/* 메뉴: 가독성 높은 차콜 그레이 */}
        <nav className="hidden md:flex items-center gap-14">
          {["SHOP", "VIRTUAL FITTING", "COLLECTION", "MY"].map((menu) => (
            <a 
              key={menu} 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if(menu === "VIRTUAL FITTING") navigate("/fitting");
              }}
              className="text-[12px] font-black tracking-[0.2em] text-gray-400 hover:text-[#111111] transition-colors"
            >
              {menu}
            </a>
          ))}
        </nav>

        {/* 아이콘 */}
        <div className="flex items-center gap-7 text-[#111111]">
          <button className="hover:scale-110 transition-transform">
            <Globe size={22} strokeWidth={2} />
          </button>
          <button 
            onClick={() => navigate("/history")}
            className="hover:scale-110 transition-transform"
          >
            <User size={24} strokeWidth={2} />
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