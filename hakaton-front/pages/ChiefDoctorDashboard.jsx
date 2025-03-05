import React, { useState, useEffect } from "react";

const ChiefDoctorDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    // Загружаем данные о врачах и пациентах с API
    fetch("/api/doctors")
      .then((res) => res.json())
      .then((data) => setDoctors(data));
    
    fetch("/api/patients")
      .then((res) => res.json())
      .then((data) => setPatients(data));
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Панель главного врача</h1>
      
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Список врачей</h2>
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">Имя</th>
              <th className="p-2 text-left">Статус</th>
              <th className="p-2 text-left">ИИН</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id} className="border-t">
                <td className="p-2">{doctor.name}</td>
                <td className="p-2">{doctor.status}</td>
                <td className="p-2">{doctor.iin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">Список пациентов</h2>
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">Имя</th>
              <th className="p-2 text-left">Статус</th>
              <th className="p-2 text-left">ИИН</th>
              <th className="p-2 text-left">Лечащий врач</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} className="border-t">
                <td className="p-2">{patient.name}</td>
                <td className="p-2">{patient.status}</td>
                <td className="p-2">{patient.iin}</td>
                <td className="p-2">{patient.doctorName || "Не назначен"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChiefDoctorDashboard;
