import React, { useState, useEffect } from "react";
import axios from "axios";
import AppointmentButton from "./AppointmentButton.jsx";

const API_URL = import.meta.env.VITE_API_URL;
import SupervisorInfo from "./SupervisorInfo.jsx";
const MyHospitalPage = () => {
    const [activeTab, setActiveTab] = useState("patients");
    const [hospitalData, setHospitalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const hospitalId = localStorage.getItem("hospital"); // Получаем hospitalId из localStorage

    useEffect(() => {
        const fetchHospitalData = async () => {
            try {
                const response = await axios.get(`${API_URL}/general/hospital/${hospitalId}`, { withCredentials: true });
                setHospitalData(response.data);
            } catch (error) {
                console.error("Ошибка загрузки данных больницы:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHospitalData();
    }, [hospitalId]);

    if (loading) {
        return <div className="text-center p-6">Загрузка...</div>;
    }

    if (!hospitalData) {
        return <div className="text-center p-6 text-red-500">Ошибка загрузки больницы</div>;
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">{hospitalData.name}</h1>
            <SupervisorInfo/>
            {/* Навигация по вкладкам */}
            <div className="flex space-x-4 border-b pb-2 mb-4">
                {[
                    { name: "Пациенты", key: "patients" },
                    { name: "Врачи", key: "doctors" },
                    { name: "Посещения", key: "appointments" },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        className={`px-4 py-2 rounded-t-lg ${activeTab === tab.key ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500"}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* Контент в зависимости от активной вкладки */}
            {activeTab === "patients" && <PatientsTable patients={hospitalData.patients} />}
            {activeTab === "doctors" && <DoctorsTable doctors={hospitalData.doctors} />}
            {activeTab === "appointments" && <AppointmentsTable hospitalId={hospitalId} />}
        </div>
    );
};

// ✅ Таблица пациентов с поиском и кнопкой "Записать к врачу"
const PatientsTable = ({ patients }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredPatients, setFilteredPatients] = useState(patients);

    useEffect(() => {
        setFilteredPatients(
            patients.filter((p) =>
                p.fname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.phone && p.phone.includes(searchQuery)) ||
                (p.iin && p.iin.includes(searchQuery))
            )
        );
    }, [searchQuery, patients]);

    // const handleAppointment = async (userId) => {
    //     try {
    //         await axios.post(
    //             `${API_URL}/admin/addAppointment`,
    //             { userId },
    //             { withCredentials: true }
    //         );
    //         alert("Пациент успешно записан к врачу!");
    //     } catch (error) {
    //         console.error("Ошибка при записи на приём:", error);
    //         alert("Ошибка при записи на приём.");
    //     }
    // };

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-xl font-semibold mb-2">Пациенты ({filteredPatients.length})</h2>

            {/* 🔍 Поле поиска */}
            <input
                type="text"
                placeholder="Поиск пациентов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border p-2 w-full mb-4 rounded"
            />

            <table className="w-full border-collapse">
                <thead>
                <tr className="bg-gray-200">
                    <th className="p-2 text-left">Имя</th>
                    <th className="p-2 text-left">Телефон</th>
                    <th className="p-2 text-left">ИИН</th>
                    <th className="p-2 text-left">Действия</th>
                </tr>
                </thead>
                <tbody>
                {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                        <tr key={patient._id} className="border-t">
                            <td className="p-2">{patient.fname}</td>
                            <td className="p-2">{patient.phone || "Не указан"}</td>
                            <td className="p-2">{patient.iin || "Не указан"}</td>
                            <td className="p-2">
                                <AppointmentButton userId={patient._id} />
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4" className="p-2 text-center text-gray-500">Нет данных</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

// ✅ Таблица врачей с поиском
const DoctorsTable = ({ doctors }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredDoctors, setFilteredDoctors] = useState(doctors);

    useEffect(() => {
        setFilteredDoctors(
            doctors.filter((d) =>
                d.fname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (d.phone && d.phone.includes(searchQuery)) ||
                (d.speciality && d.speciality.toLowerCase().includes(searchQuery.toLowerCase()))
            )
        );
    }, [searchQuery, doctors]);

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-xl font-semibold mb-2">Врачи ({filteredDoctors.length})</h2>

            {/* 🔍 Поле поиска */}
            <input
                type="text"
                placeholder="Поиск врачей..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border p-2 w-full mb-4 rounded"
            />

            <table className="w-full border-collapse">
                <thead>
                <tr className="bg-gray-200">
                    <th className="p-2 text-left">Имя</th>
                    <th className="p-2 text-left">Телефон</th>
                    <th className="p-2 text-left">Специальность</th>
                </tr>
                </thead>
                <tbody>
                {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor) => (
                        <tr key={doctor._id} className="border-t">
                            <td className="p-2">{doctor.fname}</td>
                            <td className="p-2">{doctor.phone || "Не указан"}</td>
                            <td className="p-2">{doctor.speciality}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="3" className="p-2 text-center text-gray-500">Нет данных</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

const AppointmentsTable = ({ hospitalId }) => {
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_URL}/appointments/hospital/${hospitalId}`, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }});
                setAppointments(response.data);
            } catch (error) {
                console.error("Ошибка загрузки посещений:", error);
            }
        };

        fetchAppointments();
    }, [hospitalId]);

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-xl font-semibold mb-2">Посещения ({appointments.length})</h2>
            <table className="w-full border-collapse">
                <thead>
                <tr className="bg-gray-200">
                    <th className="p-2 text-left">Пациент</th>
                    <th className="p-2 text-left">Врач</th>
                    <th className="p-2 text-left">Дата</th>
                </tr>
                </thead>
                <tbody>
                {appointments.length > 0 ? (
                    appointments.map((appointment) => (
                        <tr key={appointment._id} className="border-t">
                            <td className="p-2">{appointment.user?.fname || "Неизвестно"}</td>
                            <td className="p-2">{appointment.doctor?.fname || "Неизвестно"}</td>
                            <td className="p-2">{appointment.dateTime}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="3" className="p-2 text-center text-gray-500">Нет данных</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default MyHospitalPage;