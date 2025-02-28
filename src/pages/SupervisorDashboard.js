import React, { useState } from "react";

const SupervisorDashboard = () => {
  const [doctors, setDoctors] = useState([
    { id: "67c0b012004ba526fbdec309", name: "Дмитрий Смирнов", speciality: "Терапевт" },
    { id: "67c0b012004ba526fbdec310", name: "Сергей Иванов", speciality: "Кардиолог" },
  ]);

  const [patients, setPatients] = useState([
    { id: 1, name: "Иван Иванов", status: "На лечении", iin: "123456789012" },
    { id: 2, name: "Петр Петров", status: "Новый", iin: "987654321098" },
  ]);

  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");

  const [newDoctor, setNewDoctor] = useState({ fname: "", phone: "", password: "", speciality: "" });
  const [newPatient, setNewPatient] = useState({ fname: "", phone: "", iin: "", password: "0000" });

  const handleAddDoctor = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/register/doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoctor),
      });

      if (!response.ok) throw new Error("Ошибка регистрации");

      const result = await response.json();

      alert("Доктор успешно зарегистрирован!");

      setDoctors([...doctors, { id: result.id, name: newDoctor.fname, speciality: newDoctor.speciality }]);

      setShowAddDoctorModal(false);
      setNewDoctor({ fname: "", phone: "", password: "", speciality: "" });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAddPatient = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/register/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPatient),
      });

      if (!response.ok) throw new Error("Ошибка регистрации");

      const result = await response.json();

      alert("Пациент успешно зарегистрирован!");

      setPatients([...patients, { id: result.id, name: newPatient.fname, status: "Новый", iin: newPatient.iin }]);

      setShowAddPatientModal(false);
      setNewPatient({ fname: "", phone: "", iin: "", password: "0000" });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleOpenAppointmentModal = (patientId) => {
    setSelectedPatient(patientId);
    setShowAppointmentModal(true);
  };

  const handleAddAppointment = async () => {
    if (!selectedDoctor || !appointmentDate) {
      alert("Выберите врача и дату!");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/admin/addAppointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctor,
          userId: selectedPatient,
          dateTime: appointmentDate,
        }),
      });

      if (!response.ok) throw new Error("Ошибка записи");

      alert("Пациент успешно записан к врачу!");
      setShowAppointmentModal(false);
      setSelectedDoctor("");
      setAppointmentDate("");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Панель супервизора</h1>

      <div className="bg-white shadow-md rounded-lg p-4">
        <input
          type="text"
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <button className="px-4 py-2 bg-blue-500 text-white rounded">Искать</button>

        <div className="mt-4">
          <button className="px-4 py-2 bg-green-500 text-white rounded mr-2" onClick={() => setShowAddDoctorModal(true)}>
            Добавить врача
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={() => setShowAddPatientModal(true)}>
            Добавить пациента
          </button>
        </div>
      </div>

      {/* Таблица врачей */}
      <div className="w-[100%] flex flex-row space-x-8">
        <div className="bg-white shadow-md rounded-lg p-4 mt-4 w-[49%]">
            <h2 className="text-xl font-semibold mb-2">Список врачей</h2>
            <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
                <tr className="bg-gray-200">
                <th className="p-2 text-left">Имя</th>
                <th className="p-2 text-left">Специальность</th>
                </tr>
            </thead>
            <tbody>
                {doctors.map((doctor) => (
                <tr key={doctor.id} className="border-t">
                    <td className="p-2">{doctor.name}</td>
                    <td className="p-2">{doctor.speciality}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

      {/* Таблица пациентов */}
        <div className="bg-white shadow-md rounded-lg p-4 mt-4 w-[49%]">
            <h2 className="text-xl font-semibold mb-2">Список пациентов</h2>
            <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
                <tr className="bg-gray-200">
                <th className="p-2 text-left">Имя</th>
                <th className="p-2 text-left">Статус</th>
                <th className="p-2 text-left">Действия</th>
                </tr>
            </thead>
            <tbody>
                {patients.map((patient) => (
                <tr key={patient.id} className="border-t">
                    <td className="p-2">{patient.name}</td>
                    <td className="p-2">{patient.status}</td>
                    <td className="p-2">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => handleOpenAppointmentModal(patient.id)}>
                        Записать к врачу
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

        {showAddDoctorModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-2">Добавить врача</h2>
            <input
                type="text"
                placeholder="Имя"
                value={newDoctor.fname}
                onChange={(e) => setNewDoctor({ ...newDoctor, fname: e.target.value })}
                className="border p-2 w-full mb-2"
            />
            <input
                type="text"
                placeholder="Телефон"
                value={newDoctor.phone}
                onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                className="border p-2 w-full mb-2"
            />
            <input
                type="password"
                placeholder="Пароль"
                value={newDoctor.password}
                onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                className="border p-2 w-full mb-2"
            />
            <input
                type="text"
                placeholder="Специальность"
                value={newDoctor.speciality}
                onChange={(e) => setNewDoctor({ ...newDoctor, speciality: e.target.value })}
                className="border p-2 w-full mb-2"
            />
            <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={handleAddDoctor}>
                Добавить
            </button>
            <button className="px-4 py-2 bg-gray-500 text-white rounded ml-2" onClick={() => setShowAddDoctorModal(false)}>
                Отмена
            </button>
            </div>
        </div>
        )}

        {/* Модальное окно для добавления пациента */}
        {showAddPatientModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-2">Добавить пациента</h2>
            <input
                type="text"
                placeholder="Имя"
                value={newPatient.fname}
                onChange={(e) => setNewPatient({ ...newPatient, fname: e.target.value })}
                className="border p-2 w-full mb-2"
            />
            <input
                type="text"
                placeholder="Телефон"
                value={newPatient.phone}
                onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                className="border p-2 w-full mb-2"
            />
            <input
                type="text"
                placeholder="ИИН"
                value={newPatient.iin}
                onChange={(e) => setNewPatient({ ...newPatient, iin: e.target.value })}
                className="border p-2 w-full mb-2"
            />
            <input
                type="password"
                placeholder="пароль"
                value={newPatient.password}
                onChange={(e) => setNewPatient({ ...newPatient, password: e.target.value })}
                className="border p-2 w-full mb-2"
            />
            <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={handleAddPatient}>
                Добавить
            </button>
            <button className="px-4 py-2 bg-gray-500 text-white rounded ml-2" onClick={() => setShowAddPatientModal(false)}>
                Отмена
            </button>
            </div>
        </div>
        )}


{showAppointmentModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-4 rounded shadow-lg">
      <h2 className="text-xl font-semibold mb-2">Запись к врачу</h2>
      <select
        value={selectedDoctor}
        onChange={(e) => setSelectedDoctor(e.target.value)}
        className="border p-2 w-full mb-2"
      >
        <option value="">Выберите врача</option>
        {doctors.map((doctor) => (
          <option key={doctor.id} value={doctor.id}>
            {doctor.name}
          </option>
        ))}
      </select>
      <input
        type="datetime-local"
        value={appointmentDate}
        onChange={(e) => setAppointmentDate(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <div className="flex justify-end">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={handleAddAppointment}
        >
          Записать
        </button>
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded ml-2"
          onClick={() => setShowAppointmentModal(false)}
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default SupervisorDashboard;
