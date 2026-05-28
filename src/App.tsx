import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RagisterPage";
import Fitting from "./pages/fitting";
import ResultPage from "./pages/ResultPage";
import HistoryPage from "./pages/HistoryPage";

// 💡 1. 공통으로 띄울 Footer 컴포넌트 임포트 (경로는 프로젝트 환경에 맞게 확인해주세요)
import Footer from "./components/layout/Footer";

function App() {
    return (
        <BrowserRouter>
            {/* 💡 2. 화면 전체를 감싸는 컨테이너에 최소 높이(min-h-screen)와 flex-col 세팅 */}
            <div className="flex flex-col min-h-screen bg-gray-50">

                {/* 💡 3. 실제 페이지 내용이 들어가는 곳.
                 flex-grow를 주면 콘텐츠가 짧아도 남은 화면 공간을 꽉 채워주어
                 푸터가 항상 맨 아래로 밀려나게 됩니다. */}
                <main className="flex-grow flex flex-col">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/fitting" element={<Fitting />} />
                        <Route path="/result" element={<ResultPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>

                {/* 💡 4. 모든 페이지 하단에 공통으로 나타날 푸터 배치 */}
                <Footer />

            </div>
        </BrowserRouter>
    );
}

export default App;