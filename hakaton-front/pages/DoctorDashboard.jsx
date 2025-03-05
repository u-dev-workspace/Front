import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchIIN, setSearchIIN] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
   const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    localStorage.getItem("doctorId");
    axios.post(`${API_URL}/doctor/getUpcomingAppointments`, {
      headers: {
        "Content-Type": "application/json",
        "Cookie": document.cookie, // Передаем куки вручную
      },
      withCredentials: true, // Все равно оставляем, если сервер работает с куками
    })
        .then((res) => setAppointments(res.data))
        .catch((err) => console.error("Ошибка загрузки назначений", err));

    axios.post(`${API_URL}/patients`, { withCredentials: true })
        .then((res) => {
          setPatients(res.data);
          setFilteredPatients(res.data);
        })
        .catch((err) => console.error("Ошибка загрузки пациентов", err));
  }, []);

  const handleSearch = () => {
    const filtered = patients.filter((p) => p.iin.includes(searchIIN));
    setFilteredPatients(filtered);
  };

  const handlePrescription = (patient) => {
    setSelectedPatient(patient);
  };

  const groupedAppointments = appointments.reduce((acc, appointment) => {
    const date = new Date(appointment.dateTime).toDateString();
    console.log(selectedPatient)
    if (!acc[date]) acc[date] = [];
    acc[date].push(appointment);
    return acc;
  }, {});

  return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Панель врача</h1>

        <div className="grid grid-cols-3 gap-4">
          {/* Календарь записей */}
          <div className="col-span-1 bg-white p-4 shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Календарь записей</h2>
            <Calendar onChange={setSelectedDate} value={selectedDate} />
            <div className="mt-4">
              <h3 className="font-semibold">Записи на {selectedDate.toDateString()}:</h3>
              <ul>
                {groupedAppointments[selectedDate.toDateString()]?.map((app) => (
                    <li key={app._id} className="border p-2 rounded mt-2">
                      Пациент: {app.user.fname}, Время: {app.dateTime}
                    </li>
                )) || <p>Нет записей</p>}
              </ul>
            </div>
          </div>

          {/* Все пациенты */}
          <div className="col-span-2 bg-white p-4 shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Все пациенты</h2>
            <div className="flex mb-4">
              <input
                  type="text"
                  placeholder="Введите ИИН для поиска"
                  value={searchIIN}
                  onChange={(e) => setSearchIIN(e.target.value)}
                  className="border p-2 flex-grow mr-2"
              />
              <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSearch}>
                Искать
              </button>
            </div>
            <table className="w-full border-collapse">
              <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">Имя</th>
                <th className="p-2 text-left">ИИН</th>
                <th className="p-2 text-left">Действия</th>
              </tr>
              </thead>
              <tbody>
              {filteredPatients.map((patient) => (
                  <tr key={patient._id} className="border-t">
                    <td className="p-2">{patient.fname}</td>
                    <td className="p-2">{patient.iin}</td>
                    <td className="p-2">
                      <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => handlePrescription(patient)}>
                        Назначить лечение
                      </button>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};

export default DoctorDashboard;
