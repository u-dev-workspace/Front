import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";

const SupervisorLogin = () => {
  const [credentials, setCredentials] = useState({ name: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("Токен отсутствует, редирект на /login");
        setTimeout(() => navigate("/"), 0);
        return;
      }

      try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/check-auth`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` },
        });

        const data = await response.json();
        console.log("Ответ от сервера:", data);

        if (data.isAuthenticated) {
          console.log("Пользователь авторизован, редирект на /supervisor");
          setTimeout(() => navigate("/supervisor"), 0);
        } else {
          console.log("Токен недействителен, удаление токена и редирект");
          localStorage.removeItem("token");
          setTimeout(() => navigate("/"), 0);
        }
      } catch (err) {
        console.log("Ошибка запроса:", err);
        localStorage.removeItem("token");
        setTimeout(() => navigate("/"), 0);
      }
    };

    checkAuth();
  }, [navigate]);



  const handleLogin = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login/supervisor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) throw new Error("Ошибка входа");

      const { token } = await response.json();
      console.log("Получен токен:", token);

      if (token) {
        localStorage.setItem("token", token);
        console.log("Токен сохранен, редирект на /supervisor");
        navigate("/supervisor");
      } else {
        throw new Error("Ошибка авторизации");
      }
    } catch (error) {
      console.log("Ошибка входа:", error);
      setError("Неверные данные");
    }
  };




  return (
    <div className="flex items-center w-[100%] h-auto justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Вход для супервизора</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <input
          type="text"
          placeholder="Имя"
          value={credentials.name}
          className="border p-2 w-full mb-2"
          onChange={(e) => setCredentials({ ...credentials, name: e.target.value })}
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

export default SupervisorLogin;
