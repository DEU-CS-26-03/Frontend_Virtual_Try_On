import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Fitting from "./pages/fitting";
import Result from "./pages/ResultPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fitting" element={<Fitting />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;