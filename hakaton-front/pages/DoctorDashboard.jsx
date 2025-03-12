import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // New state for treatment form
  const [treatmentForm, setTreatmentForm] = useState({
    disease: "",
    diseaseDescription: "",
    tryComment: "",
    receptions: [{ drug: "", time: "", day: 1 }]
  });

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
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = patients.filter((patient) => {

      if (patient.iin && patient.iin.toLowerCase().includes(term)) {
        return true;
      }
      
      if (patient.fname && patient.fname.toLowerCase().includes(term)) {
        return true;
      }
      
      if (patient.lname && patient.lname.toLowerCase().includes(term)) {
        return true;
      }
      
      if (patient.mname && patient.mname.toLowerCase().includes(term)) {
        return true;
      }
      
      if (patient.email && patient.email.toLowerCase().includes(term)) {
        return true;
      }
      
      if (patient.phone && patient.phone.toLowerCase().includes(term)) {
        return true;
      }
      
      return false;
    });
    
    setFilteredPatients(filtered);
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
    setTimeout(() => handleSearch(), 300);
  };

  const handlePrescription = (patient) => {
    setSelectedPatient(patient);
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

    // Submit the treatment
    axios.post(`${API_URL}/doctor/createRecipe`, {
      user: selectedPatient._id,
      disease: treatmentForm.disease,
      diseaseDescription: treatmentForm.diseaseDescription,
      tryComment: treatmentForm.tryComment,
      receptions: treatmentForm.receptions
    }, {
      headers: {
        "Content-Type": "application/json",
        "Cookie": document.cookie,
      },
      withCredentials: true,
    })
      .then(() => {
        alert("Лечение назначено успешно");
        setSelectedPatient(null);
      })
      .catch((err) => console.error("Ошибка при назначении лечения", err));
  };

  const groupedAppointments = appointments.reduce((acc, appointment) => {
    const date = new Date(appointment.dateTime).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(appointment);
    return acc;
  }, {});

  // Helper function to display full patient name if available
  const getPatientFullName = (patient) => {
    let fullName = patient.fname || '';
    
    if (patient.lname) {
      fullName = `${fullName} ${patient.lname}`;
    }
    
    if (patient.mname) {
      fullName = `${fullName} ${patient.mname}`;
    }
    
    return fullName || 'Неизвестный пациент';
  };

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
              placeholder="Поиск по имени, ИИН, email, телефону..."
              value={searchTerm}
              onChange={handleSearchInputChange}
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
                      {patient.email && <div>{patient.email}</div>}
                      {patient.phone && <div>{patient.phone}</div>}
                    </td>
                    <td className="p-2">
                      <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => handlePrescription(patient)}>
                        Назначить лечение
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

      {/* Treatment Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              Назначение лечения для {getPatientFullName(selectedPatient)}
            </h2>
            
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