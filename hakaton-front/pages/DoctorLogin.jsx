import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.REACT_APP_API_URL;

const DoctorLogin = () => {
  const [credentials, setCredentials] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login"); // Если нет токена – на страницу входа
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.REACT_APP_API_URL}/auth/check-auth`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.isAuthenticated) {
          navigate("/doctor"); // Если авторизован – на главную
        } else {
          localStorage.removeItem("token"); // Удаляем токен, если невалиден
          navigate("/login");
        }
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);
  const handleLogin = async () => {
    try {
      const response = await fetch(`${import.meta.env.REACT_APP_API_URL}/auth/login/doctor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      // Проверяем статус ответа
      if (!response.ok) throw new Error("Ошибка входа");

      // Получаем JSON с токеном
      const { token } = await response.json();

      if (token) {
        // Сохраняем токен в localStorage (или AsyncStorage для React Native)
        localStorage.setItem("token", token);
        navigate("/doctor"); // Редирект после успешного входа
      } else {
        throw new Error("Ошибка авторизации");
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setError("Неверные данные");
    }
  };



  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Вход для доктора</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <input
          type="tel"
          placeholder="Телефон"
          value={credentials.phone}
          className="border p-2 w-full mb-2"
          onChange={(e) => setCredentials({ ...credentials, phone: e.target.value })}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={credentials.password}
          className="border p-2 w-full mb-2"
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        />
        <button
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          onClick={handleLogin}
        >
          Войти
        </button>
      </div>
    </div>
  );
};

export default DoctorLogin;