import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nickname: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await registerUser(formData);
      if (data.userId) {
        alert("회원가입이 완료되었습니다! 로그인해주세요.");
        navigate("/login");
      } else {
        alert(data.message || "회원가입 실패");
      }
    } catch (error) {
      alert("서버 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex items-center justify-center px-10">
      <div className="max-w-md w-full bg-white p-12 shadow-sm">
        <h2 className="text-3xl font-[1000] tracking-tighter text-[#111111] mb-8 text-center">회원가입</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 닉네임 입력 */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">별명</label>
            <input
              type="text"
              required
              className="w-full border-b-2 border-gray-100 py-3 focus:border-[#111111] outline-none text-sm"
              onChange={(e) => setFormData({...formData, nickname: e.target.value})}
            />
          </div>
          {/* 이메일 입력 */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</label>
            <input
              type="email"
              required
              className="w-full border-b-2 border-gray-100 py-3 focus:border-[#111111] outline-none text-sm"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          {/* 비밀번호 입력 */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
            <input
              type="password"
              required
              placeholder="8자 이상 입력"
              className="w-full border-b-2 border-gray-100 py-3 focus:border-[#111111] outline-none text-sm"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full bg-[#111111] text-white py-5 font-black text-xs tracking-[0.2em] hover:bg-blue-600 transition-colors">
            가입하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;