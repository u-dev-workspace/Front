import React, { useState, useEffect } from "react";
import axios from "axios";
import AppointmentButton from "./AppointmentButton.jsx";

const API_URL = import.meta.env.REACT_APP_API_URL;


const SearchableTable = ({ title, endpoint, searchEndpoint, columns, renderRow }) => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    console.log("Запрашиваем:", endpoint);
    fetchData(endpoint);
  }, [endpoint]);

  const fetchData = async (url) => {
    try {
      const response = await axios.get(`${API_URL}${url}`, { withCredentials: true });
      console.log(`Data from ${url}:`, response.data); // Debug log
      const result = response.data;

      if (Array.isArray(result.users)) {
        setData(result.users);
      } else if (typeof result.users === "object") {
        setData([result.users]); // Wrap single object in array
      } else if (Array.isArray(result)) {
        setData(result); // Если весь ответ — массив, просто сохраняем его
      } else {
        setData([]);
      }
    } catch (error) {
      console.error(`Ошибка загрузки данных с ${url}:`, error);
      setData([]);
    }
  };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            fetchData(endpoint);
            return;
        }
        try {
            const encodedQuery = encodeURIComponent(query); // Кодируем запрос
            console.log("Encoded search query:", encodedQuery);

            const response = await axios.get(`${API_URL}${searchEndpoint}/${encodedQuery}`, { withCredentials: true });

            console.log(`Search result for ${query}:`, response.data); // Debug log
            const result = response.data;

            if (Array.isArray(result.users)) {
                setData(result.users);
            } else if (typeof result.users === "object") {
                setData([result.users]); // Wrap single object in array
            } else {
                setData([]);
            }
        } catch (error) {
            console.error("Ошибка поиска: ", error);
            setData([]);
        }
    };



    return (
      <div className="bg-white shadow-md rounded-lg p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2">{title} ({data.length})</h2>
        <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="border p-2 w-full mb-4 rounded"
        />
        <table className="w-full border-collapse">
          <thead>
          <tr className="bg-gray-200">
            {columns.map((col, index) => <th key={index} className="p-2 text-left">{col}</th>)}
          </tr>
          </thead>
          <tbody>
          {Array.isArray(data) && data.length > 0 ? (
              data.map(renderRow)
          ) : (
              <tr>
                <td colSpan={columns.length} className="p-2 text-center text-gray-500">
                  Нет данных
                </td>
              </tr>
          )}
          </tbody>
        </table>
      </div>
  );
};

const PatientsTable = () => (
    <SearchableTable
        title="Пациенты"
        endpoint="/general/getAllUsers"
        searchEndpoint="/search/users"
        columns={["Имя", "Телефон", "ИИН", "Больницы", "Доктора", "Действия"]}
        renderRow={(patient) => (
            <tr key={patient._id} className="border-t">
              <td className="p-2">{patient.fname}</td>
              <td className="p-2">{patient.phone || "Не указан"}</td>
              <td className="p-2">{patient.iin || "Не указан"}</td>
              <td className="p-2">{Array.isArray(patient.hospital) ? patient.hospital.map(h => h.name).join(", ") : "Нет"}</td>
              <td className="p-2">{Array.isArray(patient.doctor) ? patient.doctor.map(d => d.fname).join(", ") : "Нет"}</td>
              <td className="p-2 flex space-x-2">
                  <AppointmentButton userId={patient._id} />
                <button className="px-2 py-1 bg-blue-500 text-white rounded">Привязать к больнице</button>
              </td>
            </tr>
        )}
    />
);

const DoctorsTable = () => (
    <SearchableTable
        title="Врачи"
        endpoint="/general/getAllDoctors"
        searchEndpoint="/search/doctors"
        columns={["Имя", "Телефон", "Специальность", "Больницы", "Действия"]}
        renderRow={(doctor) => (
            <tr key={doctor._id} className="border-t">
              <td className="p-2">{doctor.fname}</td>
              <td className="p-2">{doctor.phone || "Не указан"}</td>
              <td className="p-2">{doctor.speciality}</td>
              <td className="p-2">{Array.isArray(doctor.hospital) ? doctor.hospital.map(h => h.name).join(", ") : "Нет"}</td>
              <td className="p-2">
                <button className="px-2 py-1 bg-blue-500 text-white rounded">Привязать к больнице</button>
              </td>
            </tr>
        )}
    />
);

const HospitalsTable = () => (
    <SearchableTable
        title="Больницы"
        endpoint="/general/getAllHospitals"
        searchEndpoint="/search/hospitals"
        columns={["Название", "Адрес", "Пациентов", "Врачей"]}
        renderRow={(hospital) => (
            <tr key={hospital._id} className="border-t">
              <td className="p-2">{hospital.name}</td>
              <td className="p-2">{hospital.address}</td>
              <td className="p-2">{Array.isArray(hospital.patients) ? hospital.patients.length : 0}</td>
              <td className="p-2">{Array.isArray(hospital.doctors) ? hospital.doctors.length : 0}</td>
            </tr>
        )}
    />
);

const SupervisorDashboard = () => {
  const [activeTab, setActiveTab] = useState("patients");

  return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Панель супервизора</h1>

        <div className="flex space-x-4 border-b pb-2 mb-4">
          {[
            { name: "Пациенты", key: "patients" },
            { name: "Врачи", key: "doctors" },
            { name: "Больницы", key: "hospitals" },
          ].map((tab) => (
              <button
                  key={tab.key}
                  className={`px-4 py-2 rounded-t-lg ${activeTab === tab.key ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500"}`}
                  onClick={() => setActiveTab(tab.key)}
              >
                {tab.name}
              </button>
          ))}
        </div>

        {activeTab === "patients" && <PatientsTable />}
        {activeTab === "doctors" && <DoctorsTable />}
        {activeTab === "hospitals" && <HospitalsTable />}
      </div>
  );
};

export default SupervisorDashboard;