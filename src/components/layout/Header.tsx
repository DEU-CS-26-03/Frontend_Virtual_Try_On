import { useEffect, useState } from "react"; // [추가] useEffect, useState
import { useNavigate } from "react-router-dom";
import { User, Globe, Menu, LogOut } from "lucide-react";
import { getMyInfo } from "../../api/auth";

// [추가] 유저 정보 타입 정의
interface UserInfo {
  name: string;
  email: string;
}

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const isLoggedIn = !!token;

  // [추가] 유저 정보를 담을 상태
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // [추가] 컴포넌트 마운트 시 유저 정보 가져오기
  useEffect(() => {
    if (isLoggedIn) {
      getMyInfo()
        .then((data:any) => {
          // 성공 시 유저 정보 저장
          setUserInfo(data);
        })
        .catch((error: any) => {
          console.error("인증 실패:", error);

          if (error.status === 401) {
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");
            localStorage.removeItem("accessToken");
            window.location.href = "/login";
          }
        });
    }
  }, [isLoggedIn]); // 로그인 상태가 변할 때마다 실행

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
      setUserInfo(null); // 상태 초기화
      window.location.href = "/";
    }
  };

  return (
    <header className="w-full bg-[#F5F5F3] sticky top-0 z-[100] border-b border-gray-100">
      <div className="max-w-[1600px] mx-auto px-10 h-24 flex items-center justify-between">
        
        {/* 로고 영역 */}
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

        {/* 메뉴 영역 */}
        <nav className="hidden md:flex items-center gap-14">
          {["SHOP", "VIRTUAL FITTING", "COLLECTION", "MY HISTORY"].map((menu) => (
            <button 
              key={menu} 
              onClick={(e) => {
                e.preventDefault();
                if (menu === "VIRTUAL FITTING") navigate("/fitting");
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

        {/* 아이콘 및 유저 영역 */}
        <div className="flex items-center gap-7 text-[#111111]">
          {/* [추가] 로그인했을 때 유저 이름 표시 */}
          {isLoggedIn && userInfo && (
            <span className="text-[10px] font-bold text-[#111111] bg-white px-3 py-1 rounded-full border border-gray-200">
              {userInfo.name}님
            </span>
          )}

          <button className="hover:scale-110 transition-transform">
            <Globe size={22} strokeWidth={2} />
          </button>
          
          <button 
            onClick={handleUserClick}
            className="group flex items-center gap-2 hover:text-[#2563EB] transition-colors"
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