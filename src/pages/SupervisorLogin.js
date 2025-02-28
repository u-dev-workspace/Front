import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SupervisorLogin = () => {
  const [credentials, setCredentials] = useState({ name: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/register/supervisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) throw new Error("Ошибка входа");

      const result = await response.json();
      localStorage.setItem("token", result.token);
      navigate("/supervisor");
    } catch (error) {
      setError("Неверные данные");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
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
