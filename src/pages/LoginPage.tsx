import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ROUTES, apiRequest, ApiError } from "../api/client";

// 🗑️ 맨 위에 있던 interface LoginResponse 부분은 삭제했습니다. (아래 함수 안에 이미 선언되어 있습니다)

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);

      type LoginRequest = {
        email: string;
        password: string;
      };

      // 여기서 타입을 선언해서 쓰고 있으므로 위쪽의 인터페이스는 필요 없습니다.
      type LoginResponse = {
        accessToken?: string;
        refreshToken?: string;
        token?: string;
        user?: {
          id?: string;
          email?: string;
          name?: string;
          role?: string;
        };
        message?: string;
      };

      const payload: LoginRequest = { email, password };

      const data = await apiRequest<LoginResponse>(API_ROUTES.AUTH_LOGIN, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const token = data.accessToken || data.token;

      if (!token) {
        throw new ApiError(data.message || "토큰이 응답에 없습니다.", 401, data);
      }
      sessionStorage.setItem("accessToken", token);

      if (data.user) {
        sessionStorage.setItem("user", JSON.stringify(data.user));
      } else {
        console.warn("주의: 백엔드 응답에 user 객체가 존재하지 않습니다.");
      }
      alert("로그인 성공!");
      window.location.href = "/";
    } catch (error) {
      console.error("Login Error:", error);

      if (error instanceof ApiError) {
        alert(error.message || "로그인에 실패했습니다.");
      } else {
        alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="min-h-screen bg-[#F5F5F3] flex items-center justify-center px-10">
        <div className="max-w-md w-full bg-white p-12 shadow-sm rounded-sm">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-[1000] tracking-tighter text-[#111111]">LOGIN</h2>
            <p className="text-gray-400 text-sm mt-2 font-medium">
              서비스 이용을 위해 로그인해주세요.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                  htmlFor="email"
                  className="text-[10px] font-black text-gray-400 uppercase tracking-widest"
              >
                Email
              </label>
              <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-b-2 border-gray-100 py-3 focus:border-[#111111] outline-none transition-colors text-sm"
                  placeholder="example@email.com"
                  required
                  disabled={submitting}
              />
            </div>

            <div>
              <label
                  htmlFor="password"
                  className="text-[10px] font-black text-gray-400 uppercase tracking-widest"
              >
                Password
              </label>
              <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-b-2 border-gray-100 py-3 focus:border-[#111111] outline-none transition-colors text-sm"
                  placeholder="••••••••"
                  required
                  disabled={submitting}
              />
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#111111] text-white py-5 font-black text-xs tracking-[0.2em] hover:bg-[#2563EB] transition-colors mt-8 disabled:opacity-60"
            >
              {submitting ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
                type="button"
                onClick={() => navigate("/")}
                className="text-gray-400 text-xs font-bold hover:text-[#111111] transition-colors"
                disabled={submitting}
            >
              메인 페이지로 돌아가기
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-xs">
              계정이 없으신가요?{" "}
              <button
                  type="button"
                  onClick={() => !submitting && navigate("/register")}
                  className="text-[#111111] font-bold cursor-pointer underline underline-offset-4"
                  disabled={submitting}
              >
                회원가입하기
              </button>
            </p>
          </div>
        </div>
      </div>
  );
};

export default LoginPage;