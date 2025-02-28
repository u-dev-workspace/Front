import React, { useState, useEffect } from "react";

const SupervisorDashboard = () => {
  const [doctors, setDoctors] = useState([
    { id: "67c0b012004ba526fbdec309", name: "Дмитрий Смирнов", speciality: "Терапевт", hospitals: [] },
    { id: "67c0b012004ba526fbdec310", name: "Сергей Иванов", speciality: "Кардиолог", hospitals: [] },
  ]);

  const [patients, setPatients] = useState([
    { id: 1, name: "Иван Иванов", status: "На лечении", iin: "123456789012" },
    { id: 2, name: "Петр Петров", status: "Новый", iin: "987654321098" },
  ]);

  const [hospitals, setHospitals] = useState([
    { id: "67c1829ffd677ae4c1562fbf", name: "Городская больница №1" },
    { id: "67c1829ffd677ae4c1562fc0", name: "Центральная клиника" },
  ]);

  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [hospitalSearchQuery, setHospitalSearchQuery] = useState("");

  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");

  const [newDoctor, setNewDoctor] = useState({ fname: "", phone: "", password: "", speciality: "" });
  const [newPatient, setNewPatient] = useState({ fname: "", phone: "", iin: "", password: "0000" });
  const [newHospital, setNewHospital] = useState({ name: "", address: "", gisLink: "" });

  const [showLinkDoctorModal, setShowLinkDoctorModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedHospitalId, setSelectedHospitalId] = useState("");

  // New state for filtered doctors and doctor search
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");

  // Set filtered hospitals initially
  useEffect(() => {
    setFilteredHospitals(hospitals);
  }, [hospitals]);

  // Set filtered doctors initially
  useEffect(() => {
    setFilteredDoctors(doctors);
  }, [doctors]);

  // Fetch doctor-hospital assignments on initial load
  useEffect(() => {
    fetchDoctorHospitals();
  }, []);

  // Function to fetch doctor-hospital assignments
  const fetchDoctorHospitals = async () => {
    try {
      // For each doctor, fetch their hospitals
      const updatedDoctors = await Promise.all(
        doctors.map(async (doctor) => {
          try {
            // This is where you would typically call your API
            // For example: const response = await fetch(`http://localhost:3000/api/doctor/${doctor.id}/hospitals`);
            // For now, let's assume we're using mock data
            
            // Mock data - in real app, you would get this from API
            const mockHospitals = [];
            if (doctor.id === "67c0b012004ba526fbdec309") {
              mockHospitals.push({ id: "67c1829ffd677ae4c1562fbf", name: "Городская больница №1" });
            }
            
            return {
              ...doctor,
              hospitals: mockHospitals
            };
          } catch (error) {
            console.error(`Failed to fetch hospitals for doctor ${doctor.id}:`, error);
            return doctor;
          }
        })
      );
      
      setDoctors(updatedDoctors);
    } catch (error) {
      console.error("Error fetching doctor hospitals:", error);
    }
  };

  const handleOpenLinkDoctorModal = (doctorId) => {
    setSelectedDoctorId(doctorId);
    setShowLinkDoctorModal(true);
    setHospitalSearchQuery(""); // Reset search query when opening modal
    setFilteredHospitals(hospitals); // Reset filtered hospitals
  };

  const handleLinkDoctorToHospital = async () => {
    if (!selectedHospitalId) {
      alert("Выберите госпиталь!");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/admin/addDoctorToHospital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: selectedDoctorId, hospitalId: selectedHospitalId }),
      });

      if (!response.ok) throw new Error("Ошибка привязки врача к госпиталю");

      // Find the selected hospital to add to the doctor's hospital list
      const selectedHospital = hospitals.find(h => h.id === selectedHospitalId);
      
      // Update the doctors state with the new hospital assignment
      setDoctors(doctors.map(doctor => {
        if (doctor.id === selectedDoctorId) {
          // Check if hospital already exists in doctor's list
          const hospitalExists = doctor.hospitals.some(h => h.id === selectedHospitalId);
          
          if (!hospitalExists && selectedHospital) {
            return {
              ...doctor,
              hospitals: [...doctor.hospitals, selectedHospital]
            };
          }
        }
        return doctor;
      }));

      alert("Врач успешно привязан к госпиталю!");
      setShowLinkDoctorModal(false);
      setSelectedHospitalId("");
      setHospitalSearchQuery("");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSearchHospitals = async (query) => {
    setHospitalSearchQuery(query);
    
    if (query.length === 0) {
      setFilteredHospitals(hospitals);
      return;
    }
    
    if (query.length < 2) return; // Minimum search length

    try {
      const response = await fetch(`http://localhost:3000/api/search/hospitals/${query}`);
      
      if (!response.ok) throw new Error("Ошибка поиска госпиталей");
      
      const data = await response.json();
      setFilteredHospitals(data);
    } catch (error) {
      console.error("Error searching hospitals:", error);
      // Fall back to client-side filtering if API fails
      const results = hospitals.filter(hospital => 
        hospital.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredHospitals(results);
    }
  };

  // New function to search doctors by speciality
  const handleSearchDoctors = async (query) => {
    setDoctorSearchQuery(query);
    
    if (query.length === 0) {
      setFilteredDoctors(doctors);
      return;
    }
    
    if (query.length < 2) return; // Minimum search length

    try {
      const response = await fetch(`http://localhost:3000/api/search/specialities/${query}`);
      
      if (!response.ok) throw new Error("Ошибка поиска врачей");
      
      const data = await response.json();
      setFilteredDoctors(data);
    } catch (error) {
      console.error("Error searching doctors:", error);
      // Fall back to client-side filtering if API fails
      const results = doctors.filter(doctor => 
        doctor.name.toLowerCase().includes(query.toLowerCase()) || 
        doctor.speciality.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredDoctors(results);
    }
  };

  const handleRemoveDoctorHospital = async (doctorId, hospitalId) => {
    if (!confirm("Вы уверены, что хотите удалить привязку врача к этой больнице?")) {
      return;
    }
    
    try {
      // API call to remove the association
      const response = await fetch("http://localhost:3000/api/admin/removeDoctorFromHospital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, hospitalId }),
      });

      if (!response.ok) throw new Error("Ошибка удаления привязки");
      
      // Update local state
      setDoctors(doctors.map(doctor => {
        if (doctor.id === doctorId) {
          return {
            ...doctor,
            hospitals: doctor.hospitals.filter(h => h.id !== hospitalId)
          };
        }
        return doctor;
      }));
      
      alert("Привязка успешно удалена!");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAddHospital = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/addHospital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHospital),
      });

      if (!response.ok) throw new Error("Ошибка добавления госпиталя");

      alert("Госпиталь успешно добавлен!");

      setShowAddHospitalModal(false);
      setNewHospital({ name: "", address: "", gisLink: "" });
    } catch (error) {
      alert(error.message);
    }
  };

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

      setDoctors([...doctors, { id: result.id, name: newDoctor.fname, speciality: newDoctor.speciality, hospitals: [] }]);

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
    setDoctorSearchQuery(""); // Reset search query when opening modal
    setFilteredDoctors(doctors); // Reset filtered doctors
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
          <button className="px-4 py-2 bg-green-500 text-white rounded mr-2" onClick={() => setShowAddPatientModal(true)}>
            Добавить пациента
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={() => setShowAddHospitalModal(true)}>
            Добавить госпиталь
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
                <th className="p-2 text-left">Больницы</th>
                <th className="p-2 text-left">Действия</th>
                </tr>
            </thead>
            <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id} className="border-t">
                <td className="p-2">{doctor.name}</td>
                <td className="p-2">{doctor.speciality}</td>
                <td className="p-2">
                  {doctor.hospitals && doctor.hospitals.length > 0 ? (
                    <div className="flex flex-col">
                      {doctor.hospitals.map(hospital => (
                        <div key={hospital.id} className="flex items-center mb-1">
                          <span className="mr-2">{hospital.name}</span>
                          <button 
                            className="text-red-500 text-xs hover:text-red-700"
                            onClick={() => handleRemoveDoctorHospital(doctor.id, hospital.id)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : "Не привязан"}
                </td>
                <td className="p-2">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={() => handleOpenLinkDoctorModal(doctor.id)}
                  >
                    Привязать к госпиталю
                  </button>
                </td>
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

      {showLinkDoctorModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-2">Привязать врача к госпиталю</h2>
            
            {/* Display doctor name */}
            <div className="mb-3 font-medium">
              Врач: {doctors.find(d => d.id === selectedDoctorId)?.name}
            </div>
            
            {/* Search input for hospitals */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Поиск госпиталей..."
                value={hospitalSearchQuery}
                onChange={(e) => handleSearchHospitals(e.target.value)}
                className="border p-2 w-full"
              />
            </div>
            
            <select
              value={selectedHospitalId}
              onChange={(e) => setSelectedHospitalId(e.target.value)}
              className="border p-2 w-full mb-2"
              size={5} // Show multiple options
            >
              <option value="">Выберите госпиталь</option>
              {filteredHospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={handleLinkDoctorToHospital}
              >
                Привязать
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded ml-2"
                onClick={() => setShowLinkDoctorModal(false)}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

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

{showAddHospitalModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-2">Добавить госпиталь</h2>
            <input
              type="text"
              placeholder="Название"
              value={newHospital.name}
              onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })}
              className="border p-2 w-full mb-2"
            />
            <input
              type="text"
              placeholder="Адрес"
              value={newHospital.address}
              onChange={(e) => setNewHospital({ ...newHospital, address: e.target.value })}
              className="border p-2 w-full mb-2"
            />
            <input
              type="text"
              placeholder="Ссылка GIS"
              value={newHospital.gisLink}
              onChange={(e) => setNewHospital({ ...newHospital, gisLink: e.target.value })}
              className="border p-2 w-full mb-2"
            />
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={handleAddHospital}>
                Добавить
              </button>
              <button className="px-4 py-2 bg-gray-500 text-white rounded ml-2" onClick={() => setShowAddHospitalModal(false)}>
                Отмена
              </button>
            </div>
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
    <div className="bg-white p-4 rounded shadow-lg w-96">
      <h2 className="text-xl font-semibold mb-2">Запись к врачу</h2>
      
      {/* New search field for doctors */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Поиск врачей по специальности..."
          value={doctorSearchQuery}
          onChange={(e) => handleSearchDoctors(e.target.value)}
          className="border p-2 w-full mb-2"
        />
      </div>
      
      <select
        value={selectedDoctor}
        onChange={(e) => setSelectedDoctor(e.target.value)}
        className="border p-2 w-full mb-2"
        size={5} // Show multiple options at once
      >
        <option value="">Выберите врача</option>
        {filteredDoctors.map((doctor) => (
          <option key={doctor.id} value={doctor.id}>
            {doctor.name} - {doctor.speciality}
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