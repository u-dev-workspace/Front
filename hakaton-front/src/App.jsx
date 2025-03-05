import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SupervisorLogin from "../pages/SupervisorLogin.jsx";
import SupervisorDashboard from "../pages/SupervisorDashboard.jsx";
import DoctorLogin from "../pages/DoctorLogin.jsx";
import DoctorDashboard from "../pages/DoctorDashboard.jsx";
import ChiefDoctorDashboard from "../pages/ChiefDoctorDashboard.jsx";

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
