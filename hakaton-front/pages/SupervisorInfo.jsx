import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react"; // Иконка домика
import hosImg from "./hospital.png"
const API_URL = import.meta.env.VITE_API_URL;

const SupervisorInfo = () => {
    const [supervisor, setSupervisor] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSupervisorData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_URL}/admin/getSupervisorData`, {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${token}` }
                });

                setSupervisor(response.data);
            } catch (error) {
                console.error("Ошибка загрузки данных супервизора:", error);
            }
        };

        fetchSupervisorData();
    }, []);

    return (
        <div className="bg-white shadow-md rounded-lg p-4 flex  items-start w-[40%]" >
            <div>
                <h2 className="text-xl font-semibold">
                    {supervisor ? supervisor.name : "Загрузка..."}
                </h2>
                <p className="text-gray-600">
                    {supervisor?.hospital?.name || "Больница не найдена"}
                </p>
            </div>
            {/* 🔹 Кнопка с иконкой "Домик"  /supervisor/hospital*/}
            <button
                onClick={() => navigate("/supervisor/hospital")}
                className=" hover:bg-gray-300 p-3 ml-[10%] flex flex-col items-center transition"
                title="Моя больница"
            >
                <img src={hosImg} className="w-[30px] h-[30px]" alt=""/>
                <h3>Больница</h3>
            </button>
            <button
                onClick={() => navigate("/supervisor")}
                className=" hover:bg-gray-300 flex flex-col items-center ml-[10%] p-3  transition"
                title="На главную"
            >
                <Home size={24} className="text-gray-700"/>
                <h3>Главная</h3>
            </button>
        </div>
    );
};

export default SupervisorInfo;
