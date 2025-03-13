import React, { useState, useEffect } from "react";
import axios from "axios";
import {toast} from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const AssignToHospitalButton = ({ userId, userType }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [hospitals, setHospitals] = useState([]);
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (searchQuery.trim()) {
            fetchHospitals();
        }
    }, [searchQuery]);

    const fetchHospitals = async () => {
        try {
            const response = await axios.get(`${API_URL}/search/hospitals/${encodeURIComponent(searchQuery)}`, { withCredentials: true });
            setHospitals(response.data.hospitals || []);
        } catch (error) {
            console.error("Ошибка при загрузке больниц:", error);

            setHospitals([]);
        }
    };

    const handleAssign = async () => {
        if (!selectedHospital) return;

        setLoading(true);
        setError(null);

        const endpoint = userType === "doctor" ? "/admin/addDoctorToHospital" : "/admin/addUserToHospital";

        try {
            const token = localStorage.getItem("token");
            await axios.post(`${API_URL}${endpoint}`, { userId, hospitalId: selectedHospital }, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${token}`
                }});
            toast.success("Пациент добавлен", { position: "top-right", autoClose: 3000 });
            setIsOpen(false);
        } catch (error) {
            console.error("Ошибка при привязке:", error);
            toast.error("Ошибка при привязке пользователя", { position: "top-right", autoClose: 3000 });
            setError("Не удалось привязать к больнице.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setIsOpen(true)}>
                Привязать к больнице
            </button>
            {isOpen && (
                <div className="fixed inset-0 bg-[#0000009c] flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-bold mb-4">Выберите больницу</h2>
                        <input
                            type="text"
                            placeholder="Поиск больницы..."
                            className="border p-2 w-full mb-2 rounded"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <ul className="max-h-40 overflow-y-auto border rounded p-2">
                            {hospitals.length > 0 ? (
                                hospitals.map((hospital) => (
                                    <li
                                        key={hospital._id}
                                        className={`p-2 cursor-pointer ${selectedHospital === hospital._id ? "bg-blue-100" : ""}`}
                                        onClick={() => setSelectedHospital(hospital._id)}
                                    >
                                        {hospital.name} - {hospital.address}
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-500">Нет результатов</li>
                            )}
                        </ul>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        <div className="flex justify-end mt-4">
                            <button className="px-4 py-2 bg-gray-500 text-white rounded mr-2" onClick={() => setIsOpen(false)}>Отмена</button>
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                                onClick={handleAssign}
                                disabled={loading}
                            >
                                {loading ? "Привязываем..." : "Привязать"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AssignToHospitalButton;
