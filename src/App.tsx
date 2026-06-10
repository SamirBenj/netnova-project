import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/SideBar";
import SlackSimulation from "./pages/SlackSimulation";
import PentestAD from "./pages/PentestAD";
import Rapport from "./pages/Rapport";

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[#fbfbfe] text-[#150303]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/slack" />} />
            <Route path="/slack" element={<SlackSimulation />} />
            <Route path="/pentest" element={<PentestAD />} />
            <Route path="/rapport" element={<Rapport />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;