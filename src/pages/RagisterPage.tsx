import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";

type ErrorWithMessage = {
  message?: string;
  data?: {
    message?: string;
  };
};

const isErrorWithMessage = (error: unknown): error is ErrorWithMessage => {
  return typeof error === "object" && error !== null;
};

const getErrorMessage = (error: unknown): string => {
  if (isErrorWithMessage(error)) {
    if (typeof error.data?.message === "string" && error.data.message.trim() !== "") {
      return error.data.message;
    }

    if (typeof error.message === "string" && error.message.trim() !== "") {
      return error.message;
    }
  }

  return "서버 통신 중 오류가 발생했습니다.";
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nickname: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
      key: "email" | "password" | "nickname",
      value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password.trim().length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    try {
      setSubmitting(true);

      const data = await registerUser({
        email: formData.email.trim(),
        password: formData.password,
        nickname: formData.nickname.trim(),
      });

      if (data.user?.id) {
        alert(data.message || "회원가입이 완료되었습니다! 로그인해주세요.");
        navigate("/login");
        return;
      }

      alert(data.message || "회원가입 실패");
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="min-h-screen bg-[#F5F5F3] flex items-center justify-center px-10">
        <div className="max-w-md w-full bg-white p-12 shadow-sm">
          <h2 className="text-3xl font-[1000] tracking-tighter text-[#111111] mb-8 text-center">
            회원가입
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                별명
              </label>
              <input
                  type="text"
                  required
                  value={formData.nickname}
                  className="w-full border-b-2 border-gray-100 py-3 focus:border-[#111111] outline-none text-sm"
                  onChange={(e) => handleChange("nickname", e.target.value)}
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Email
              </label>
              <input
                  type="email"
                  required
                  value={formData.email}
                  className="w-full border-b-2 border-gray-100 py-3 focus:border-[#111111] outline-none text-sm"
                  onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Password
              </label>
              <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="8자 이상 입력"
                  value={formData.password}
                  className="w-full border-b-2 border-gray-100 py-3 focus:border-[#111111] outline-none text-sm"
                  onChange={(e) => handleChange("password", e.target.value)}
              />
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#111111] text-white py-5 font-black text-xs tracking-[0.2em] hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {submitting ? "가입 중..." : "가입하기"}
            </button>
          </form>
        </div>
      </div>
  );
};

export default RegisterPage;