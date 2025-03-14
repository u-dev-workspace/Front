import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import moment from "moment";
import RecipeModalButton from "./RecipeModalButton.jsx";
import {useNavigate} from "react-router-dom";
import statImg from "./analytics.png"
const API_URL = import.meta.env.VITE_API_URL;

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [doctorData, setDoctorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");

        const [appointmentsRes, patientsRes, doctorDataRes] = await Promise.all([
          axios.get(`${API_URL}/doctor/getUpcomingAppointments`, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/doctor/getPatientsByDoctor`, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/doctor/getDoctorData`, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setAppointments(appointmentsRes.data.appointments || []);
        setPatients(patientsRes.data || []);
        setFilteredPatients(patientsRes.data || []);
        setDoctorData(doctorDataRes.data || null);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const groupedAppointments = useMemo(() => {
    return appointments.reduce((acc, appointment) => {
      if (!appointment.dateTimeISO) {
        console.warn("⚠ Отсутствует `dateTimeISO` у записи:", appointment);
        return acc;
      }

      let date = moment(appointment.dateTimeISO);
      if (!date.isValid()) {
        console.error("❌ Ошибка: `dateTimeISO` невалиден!", appointment.dateTimeISO);
        return acc;
      }

      const dateString = date.format("YYYY-MM-DD");
      if (!acc[dateString]) acc[dateString] = [];
      acc[dateString].push(appointment);
      return acc;
    }, {});
  }, [appointments]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredPatients(
        patients.filter(
            (p) =>
                p.fname?.toLowerCase().includes(term) ||
                p.lname?.toLowerCase().includes(term) ||
                p.mname?.toLowerCase().includes(term) ||
                p.iin?.includes(term) ||
                p.phone?.includes(term)
        )
    );
  };

  const getPatientFullName = (patient) => {
    return `${patient.fname || ""} ${patient.lname || ""} ${patient.mname || ""}`.trim() || "Неизвестный пациент";
  };

  return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Панель врача</h1>
        
        {/* Информационная плашка о докторе */}
        <div className="bg-white p-4 shadow-md rounded-lg mb-4 w-[50%]">
          {isLoading ? (
            <div>
              <p>Загрузка...</p>
              <p className="text-gray-500">Больница не найдена</p>
            </div>
          ) : (
            <div>
              <div className="font-medium">{doctorData?.name || "Имя не указано"}</div>
              <div className="text-gray-500">{doctorData?.speciality || "Специальность не указана"}</div>
              <div className="text-gray-500 mt-1">
                {doctorData?.hospitals && doctorData.hospitals.length > 0 
                  ? doctorData.hospitals[0].name 
                  : "Больница не найдена"}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* 🔹 Календарь записей */}
          <div className="col-span-1 bg-white p-4 shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Календарь записей</h2>
            <Calendar
                onChange={(date) => setSelectedDate(moment(date).format("YYYY-MM-DD"))}
                value={selectedDate}
            />
            <div className="mt-4">
              <h3 className="font-semibold">Записи на {moment(selectedDate).format("DD MMMM YYYY")}:</h3>
              <ul>
                {groupedAppointments[selectedDate]?.length > 0 ? (
                    groupedAppointments[selectedDate].map((app) => (
                        <li key={app._id} className="border p-2 rounded mt-2">
                          <p><strong>Пациент:</strong> {app.user?.fname || "Неизвестно"}</p>
                          <p><strong>Время:</strong> {moment(app.dateTimeISO).format("HH:mm")}</p>
                        </li>
                    ))
                ) : (
                    <p>Нет записей</p>
                )}
              </ul>
            </div>
          </div>

          {/* 🔹 Все пациенты */}
          <div className="col-span-2 bg-white p-4 shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Все пациенты</h2>
            <input
                type="text"
                placeholder="Поиск по имени, ИИН, телефону..."
                value={searchTerm}
                onChange={handleSearch}
                className="border p-2 w-full mb-4 rounded"
            />
            <table className="w-full border-collapse">
              <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">Имя</th>
                <th className="p-2 text-left">ИИН</th>
                <th className="p-2 text-left">Контакты</th>
                <th className="p-2 text-left">Действия</th>
              </tr>
              </thead>
              <tbody>
              {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                      <tr key={patient._id} className="border-t">
                        <td className="p-2">{getPatientFullName(patient)}</td>
                        <td className="p-2">{patient.iin}</td>
                        <td className="p-2">
                          {patient.phone && <div>{patient.phone}</div>}
                        </td>
                        <td className="p-2">
                          <RecipeModalButton userId={patient._id}/>
                        </td>
                        <td className="p-2">
                          <button className="w-[40px] h-[40px]" onClick={() => navigate(`/user/${patient._id}/statistics`)} >
                            <img src={statImg} alt=""/>
                          </button>
                        </td>

                      </tr>
                  ))
              ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-500">
                      Пациенты не найдены
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};

export default DoctorDashboard;
