import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DoctorDashboard from "./pages/DoctorDashboard";
import ChiefDoctorDashboard from "./pages/ChiefDoctorDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/chief-doctor" element={<ChiefDoctorDashboard />} />
        <Route path="/supervisor" element={<SupervisorDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
