import React, { useState, useEffect } from "react";

const DoctorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [searchIIN, setSearchIIN] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescription, setPrescription] = useState("");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/patients`)
      .then((res) => res.json())
      .then((data) => {
        setPatients(data);
        setFilteredPatients(data);
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

  const submitPrescription = () => {
    fetch(`${process.env.REACT_APP_API_URL}/prescriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: selectedPatient.id,
        prescription,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Рецепт сохранен");
        setPrescription("");
        setSelectedPatient(null);
      })
      .catch((err) => console.error("Ошибка при сохранении рецепта", err));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Панель врача</h1>
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">Список пациентов</h2>
        <input
          type="text"
          placeholder="Введите ИИН для поиска"
          value={searchIIN}
          onChange={(e) => setSearchIIN(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSearch}>
          Искать
        </button>
        <table className="min-w-full mt-4 bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">Имя</th>
              <th className="p-2 text-left">Статус</th>
              <th className="p-2 text-left">ИИН</th>
              <th className="p-2 text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="border-t">
                <td className="p-2">{patient.name}</td>
                <td className="p-2">{patient.status}</td>
                <td className="p-2">{patient.iin}</td>
                <td className="p-2">
                  <button
                    className="px-2 py-1 bg-green-500 text-white rounded"
                    onClick={() => handlePrescription(patient)}
                  >
                    Назначить лечение
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPatient && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Рецепт для {selectedPatient.name}</h2>
            <textarea
              className="border p-2 w-full"
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder="Введите рецепт"
            />
            <div className="mt-4">
              <button className="px-4 py-2 bg-green-500 text-white rounded mr-2" onClick={submitPrescription}>
                Сохранить
              </button>
              <button className="px-4 py-2 bg-gray-500 text-white rounded" onClick={() => setSelectedPatient(null)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
