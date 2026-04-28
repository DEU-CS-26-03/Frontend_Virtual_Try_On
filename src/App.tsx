import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RagisterPage";
import Fitting from "./pages/fitting";
import ResultPage from "./pages/ResultPage";
import HistoryPage from "./pages/HistoryPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/fitting" element={<Fitting />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/History" element={<HistoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;