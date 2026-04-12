import React, { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import { getMyInfo } from "../api/auth";

const HistoryPage = () => {
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getMyInfo().then(data => setUser(data));
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F3]">
      <Header />
      <div className="max-w-[1600px] mx-auto px-10 py-20">
        <div className="mb-20">
          <p className="text-[10px] font-black text-blue-600 tracking-[0.3em] mb-4">MY PROFILE</p>
          <h2 className="text-6xl font-[1000] tracking-tighter">
            HELLO, <span className="text-gray-300 italic">{user?.nickname || "USER"}</span>
          </h2>
          <p className="mt-4 text-gray-500 font-medium">{user?.email}</p>
        </div>

        <div>
          <h3 className="text-xl font-black mb-10 border-b border-gray-200 pb-4">VIRTUAL FITTING HISTORY</h3>
          
          {history.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-sm">
              <p className="text-gray-400 font-bold">아직 시착 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-10">
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;