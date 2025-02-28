import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DoctorDashboard from "./pages/DoctorDashboard";
import ChiefDoctorDashboard from "./pages/ChiefDoctorDashboard";
import SupervisorLogin from "./pages/SupervisorLogin";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import DoctorLogin from "./pages/DoctorLogin";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SupervisorLogin />} />
        <Route path="/login" element={<DoctorLogin />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/chief-doctor" element={<ChiefDoctorDashboard />} />
        <Route path="/supervisor" element={<SupervisorDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
