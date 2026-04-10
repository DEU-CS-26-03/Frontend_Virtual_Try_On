import { useNavigate } from "react-router-dom";
import { User, ShoppingBag, Menu } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* 로고 영역 */}
        <div 
          onClick={() => navigate("/")} 
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white rounded-full animate-pulse" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-gray-900">
            FIT.AI
          </span>
        </div>

        {/* 메뉴 영역 (데스크탑) */}
        <nav className="hidden md:flex items-center gap-10">
          {["SHOP", "VIRTUAL FITTING", "COLLECTION", "MY"].map((menu) => (
            <a 
              key={menu} 
              href="#" 
              className="text-xs font-black tracking-widest text-gray-400 hover:text-black transition-colors"
            >
              {menu}
            </a>
          ))}
        </nav>

        {/* 아이콘 영역 */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-50 rounded-full transition-all">
            <ShoppingBag size={20} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => navigate("/history")} // 히스토리 페이지가 있다면 연결
            className="p-2 hover:bg-gray-50 rounded-full transition-all"
          >
            <User size={20} strokeWidth={2.5} />
          </button>
          <button className="md:hidden p-2">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;