import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ROUTES, apiRequest } from "../api/client";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. 테스트 계정 체크 (기존 로직 유지)
    if (email === "capstone@gmail.com" && password === "1234") {
      localStorage.setItem("accessToken", "capstone-test-token");
      alert("테스트 계정으로 로그인되었습니다.");
      navigate("/"); // window.location.href 대신 리액트 방식인 navigate 권장
      return;
    }

    try {
      // 2. auth.ts의 loginUser 대신 apiRequest를 직접 호출
      // API_ROUTES.LOGIN은 client.ts에 정의된 "/api/v1/auth/login" 경로를 사용합니다.
      const data = await apiRequest<any>(API_ROUTES.LOGIN, {
        method: "POST",
        body: JSON.stringify({
          email: email,      // 백엔드 필드명이 username이라면 username으로 수정
          password: password,
        }),
      });

      // 3. 토큰 저장 및 이동
      // 백엔드 응답 필드가 accessToken인지 token인지 확인 후 맞춰주세요.
      const token = data.accessToken || data.token;

      if (token) {
        localStorage.setItem("accessToken", token);
        alert("로그인 성공!");
        navigate("/");
      } else {
        alert(data.message || "로그인 정보가 올바르지 않습니다.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      // 서버 응답이 없거나 401 등 에러가 발생했을 때
      alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인하거나 테스트 계정을 사용해 주세요.");
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