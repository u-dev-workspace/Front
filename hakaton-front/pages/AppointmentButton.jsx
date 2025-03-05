import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.REACT_APP_API_URL;

const AppointmentModal = ({ isOpen, onClose, userId }) => {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [appointmentDate, setAppointmentDate] = useState("");

    useEffect(() => {
        if (isOpen) {
            setDoctors([]); // Очищаем врачей при открытии
            setSearchQuery("");
            setSelectedDoctor(null);
            setAppointmentDate("");
        }
    }, [isOpen]);

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query.trim()) return setDoctors([]);

        try {
            const response = await axios.get(`${API_URL}/search/doctors/${query}`, { withCredentials: true });
            setDoctors(response.data.doctors || []);
        } catch (error) {
            console.error("Ошибка поиска врачей:", error);
            setDoctors([]);
        }
    };

    const handleAppointment = async () => {
        if (!selectedDoctor || !appointmentDate) {
            alert("Выберите врача и дату!");
            return;
        }

        try {
            await axios.post(
                `${API_URL}/admin/addAppointment`,
                { doctorId: selectedDoctor._id, userId, dateTime: appointmentDate },
                { withCredentials: true }
            );

            alert("Пациент успешно записан к врачу!");
            onClose();
        } catch (error) {
            alert("Ошибка при записи на приём.");
            console.error(error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
                <h2 className="text-xl font-semibold mb-4">Запись к врачу</h2>

                {/* Поисковый инпут */}
                <input
                    type="text"
                    placeholder="Введите имя врача..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="border p-2 w-full mb-2 rounded"
                />

                {/* Список врачей с автозаполнением */}
                {doctors.length > 0 && (
                    <ul className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto rounded shadow-md z-10">
                        {doctors.map((doctor) => (
                            <li
                                key={doctor._id}
                                className="p-2 cursor-pointer hover:bg-gray-200"
                                onClick={() => {
                                    setSelectedDoctor(doctor);
                                    setSearchQuery(doctor.fname + " - " + doctor.speciality);
                                    setDoctors([]); // Скрываем список после выбора
                                }}
                            >
                                {doctor.fname} - {doctor.speciality}
                            </li>
                        ))}
                    </ul>
                )}

                {/* Выбранный врач */}
                {selectedDoctor && (
                    <div className="mb-2 p-2 bg-gray-100 rounded">
                        <p className="font-semibold">{selectedDoctor.fname}</p>
                        <p className="text-sm text-gray-600">{selectedDoctor.speciality}</p>
                    </div>
                )}

                {/* Выбор даты */}
                <input
                    type="datetime-local"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="border p-2 w-full mb-2 rounded"
                />

                <div className="flex justify-end">
                    <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={handleAppointment}>
                        Записать
                    </button>
                    <button className="px-4 py-2 bg-gray-500 text-white rounded ml-2" onClick={onClose}>
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
};

const AppointmentButton = ({ userId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                className="px-2 py-1 bg-green-500 text-white rounded"
                onClick={() => setIsModalOpen(true)}
            >
                Записать к врачу
            </button>

            <AppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} userId={userId} />
        </>
    );
};

export default AppointmentButton;
