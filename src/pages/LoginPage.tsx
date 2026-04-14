import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // 테스트 계정 체크
    if (email === "capstone@gmail.com" && password === "1234") {
      localStorage.setItem("accessToken", "capstone-test-token");
      alert("로그인 성공!");
      window.location.href = "/"; 
      return;
    }

    // 서버가 켜져 있을 때만 작동
    try {
      const data = await loginUser({ email, password }); 

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        alert("로그인 성공!");
        window.location.href = "/"; 
      }
    } catch (error) {
    alert("아이디 또는 비밀번호가 틀렸습니다. (테스트 계정을 이용해 보세요)");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex items-center justify-center px-10">
      <div className="max-w-md w-full bg-white p-12 shadow-sm rounded-sm">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-[1000] tracking-tighter text-[#111111]">LOGIN</h2>
          <p className="text-gray-400 text-sm mt-2 font-medium">서비스 이용을 위해 로그인해주세요.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b-2 border-gray-100 py-3 focus:border-[#111111] outline-none transition-colors text-sm"
              placeholder="example@email.com"
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b-2 border-gray-100 py-3 focus:border-[#111111] outline-none transition-colors text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#111111] text-white py-5 font-black text-xs tracking-[0.2em] hover:bg-[#2563EB] transition-colors mt-8"
          >
            로그인
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate("/")}
            className="text-gray-400 text-xs font-bold hover:text-[#111111] transition-colors"
          >
            메인 페이지로 돌아가기
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">
            계정이 없으신가요?{" "}
            <span onClick={() => navigate("/register")} 
            className="text-[#111111] font-bold cursor-pointer underline underline-offset-4">
            회원가입하기</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;