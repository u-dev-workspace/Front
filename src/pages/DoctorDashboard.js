import React, { useState, useEffect } from "react";

const DoctorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [searchIIN, setSearchIIN] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // New state for treatment form
  const [treatmentForm, setTreatmentForm] = useState({
    disease: "",
    diseaseDescription: "",
    tryComment: "",
    receptions: [{ drug: "", time: "", day: 1 }]
  });

  // Fetch both patients and appointments assigned to this doctor
  useEffect(() => {
    // Get doctor ID from localStorage or context (assuming it's stored during login)
    const doctorId = localStorage.getItem("doctorId");
    
    // Fetch patients list
    fetch(`${process.env.REACT_APP_API_URL}/patients`)
      .then((res) => res.json())
      .then((data) => {
        setPatients(data);
        setFilteredPatients(data);
      })
      .catch((err) => console.error("Ошибка загрузки пациентов", err));
    
    // Fetch appointments for this doctor
    fetch(`${process.env.REACT_APP_API_URL}/doctor/appointments/${doctorId}`)
      .then((res) => res.json())
      .then((data) => {
        setAppointments(data);
      })
      .catch((err) => console.error("Ошибка загрузки назначений", err));
  }, []);

  // Combine patients and appointments to show patients with appointments
  const patientsWithAppointments = appointments.map(appointment => {
    const patient = patients.find(p => p.id === appointment.userId);
    return {
      ...patient,
      appointmentId: appointment.id,
      appointmentDate: appointment.dateTime
    };
  });

  const handleSearch = () => {
    const filtered = patients.filter((p) => p.iin.includes(searchIIN));
    setFilteredPatients(filtered);
  };

  const handlePrescription = (patient) => {
    setSelectedPatient(patient);
    // Reset treatment form
    setTreatmentForm({
      disease: "",
      diseaseDescription: "",
      tryComment: "",
      receptions: [{ drug: "", time: "", day: 1 }]
    });
  };

  const handleTreatmentFormChange = (e) => {
    const { name, value } = e.target;
    setTreatmentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReceptionChange = (index, field, value) => {
    setTreatmentForm(prev => {
      const updatedReceptions = [...prev.receptions];
      updatedReceptions[index] = {
        ...updatedReceptions[index],
        [field]: value
      };
      return {
        ...prev,
        receptions: updatedReceptions
      };
    });
  };

  const addReception = () => {
    setTreatmentForm(prev => ({
      ...prev,
      receptions: [...prev.receptions, { drug: "", time: "", day: 1 }]
    }));
  };

  const removeReception = (index) => {
    setTreatmentForm(prev => ({
      ...prev,
      receptions: prev.receptions.filter((_, i) => i !== index)
    }));
  };

  const submitTreatment = () => {
    // Validate form
    if (!treatmentForm.disease || !treatmentForm.diseaseDescription || treatmentForm.receptions.some(r => !r.drug || !r.time)) {
      alert("Пожалуйста, заполните все поля");
      return;
    }

    fetch("http://localhost:3000/api/doctor/createRecipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: selectedPatient.id,
        disease: treatmentForm.disease,
        diseaseDescription: treatmentForm.diseaseDescription,
        tryComment: treatmentForm.tryComment,
        receptions: treatmentForm.receptions
      }),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Лечение назначено успешно");
        setSelectedPatient(null);
      })
      .catch((err) => console.error("Ошибка при назначении лечения", err));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Панель врача</h1>
      
      {/* Search Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Поиск пациентов</h2>
        <div className="flex">
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
      </div>

      {/* Appointments Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Мои записи на прием</h2>
        {patientsWithAppointments.length > 0 ? (
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">Имя</th>
                <th className="p-2 text-left">ИИН</th>
                <th className="p-2 text-left">Дата приема</th>
                <th className="p-2 text-left">Действия</th>
              </tr>
            </thead>
            <tbody>
              {patientsWithAppointments.map((patient) => (
                <tr key={patient.appointmentId} className="border-t">
                  <td className="p-2">{patient.name}</td>
                  <td className="p-2">{patient.iin}</td>
                  <td className="p-2">{new Date(patient.appointmentDate).toLocaleString()}</td>
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
        ) : (
          <p className="text-gray-500">У вас нет назначенных приемов</p>
        )}
      </div>

      {/* All Patients Section */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">Все пациенты</h2>
        <table className="min-w-full bg-white shadow-md rounded-lg">
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

      {/* Treatment Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Назначение лечения для {selectedPatient.name}</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Диагноз</label>
              <input
                type="text"
                name="disease"
                value={treatmentForm.disease}
                onChange={handleTreatmentFormChange}
                placeholder="Введите диагноз"
                className="border p-2 w-full rounded"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Описание заболевания</label>
              <textarea
                name="diseaseDescription"
                value={treatmentForm.diseaseDescription}
                onChange={handleTreatmentFormChange}
                placeholder="Опишите заболевание"
                className="border p-2 w-full rounded h-24"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Рекомендации</label>
              <textarea
                name="tryComment"
                value={treatmentForm.tryComment}
                onChange={handleTreatmentFormChange}
                placeholder="Введите общие рекомендации"
                className="border p-2 w-full rounded h-24"
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Прием медикаментов</label>
                <button 
                  type="button" 
                  onClick={addReception}
                  className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                >
                  + Добавить медикамент
                </button>
              </div>
              
              {treatmentForm.receptions.map((reception, index) => (
                <div key={index} className="p-3 border rounded mb-3 bg-gray-50">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Медикамент {index + 1}</span>
                    {index > 0 && (
                      <button 
                        type="button" 
                        onClick={() => removeReception(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs mb-1">Препарат</label>
                      <input
                        type="text"
                        value={reception.drug}
                        onChange={(e) => handleReceptionChange(index, 'drug', e.target.value)}
                        placeholder="Название препарата"
                        className="border p-2 w-full rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Время</label>
                      <input
                        type="text"
                        value={reception.time}
                        onChange={(e) => handleReceptionChange(index, 'time', e.target.value)}
                        placeholder="Время приема (напр. 8am)"
                        className="border p-2 w-full rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">День</label>
                      <input
                        type="number"
                        value={reception.day}
                        onChange={(e) => handleReceptionChange(index, 'day', parseInt(e.target.value))}
                        min="1"
                        className="border p-2 w-full rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <button 
                className="px-4 py-2 bg-gray-500 text-white rounded mr-2" 
                onClick={() => setSelectedPatient(null)}
              >
                Отмена
              </button>
              <button 
                className="px-4 py-2 bg-green-500 text-white rounded" 
                onClick={submitTreatment}
              >
                Назначить лечение
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;