
import SupervisorLogin from "../pages/SupervisorLogin.jsx";
import SupervisorDashboard from "../pages/SupervisorDashboard.jsx";
import DoctorLogin from "../pages/DoctorLogin.jsx";
import DoctorDashboard from "../pages/DoctorDashboard.jsx";
import ChiefDoctorDashboard from "../pages/ChiefDoctorDashboard.jsx";
import MyHospitalPage from "../pages/MyHospitalPage.jsx";
import UserStatistics from "../pages/UserStatistics.jsx";
import './App.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
function App() {
    return (
        <Router>
            <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
                <Route path="/" element={<SupervisorLogin />} />
                <Route path="/login" element={<DoctorLogin />} />
                <Route path="/doctor" element={<DoctorDashboard />} />
                <Route path="/chief-doctor" element={<ChiefDoctorDashboard />} />
                <Route path="/supervisor" element={<SupervisorDashboard />} />
                <Route path="/supervisor/hospital" element={<MyHospitalPage />} />
                <Route path="/doctor/statistics" element={<MyHospitalPage />} />
                <Route path="/user/:userId/statistics" element={<UserStatistics />} />
            </Routes>
        </Router>
    );
}


export default App;
