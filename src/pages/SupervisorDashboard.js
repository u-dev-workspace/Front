import React, { useState, useEffect } from 'react';

const SupervisorDashboard = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/users`)
      .then(response => response.json())
      .then(data => setUsers(data))
      .catch(error => console.error("Ошибка загрузки пользователей:", error));
  }, []);

  const handleAddUser = async (role) => {
    const name = prompt("Введите имя");
    const iin = prompt("Введите ИИН");
    if (!name || !iin) return;

    const newUser = { name, role, iin, status: role === "Врач" ? "Активен" : "На лечении" };
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (response.ok) {
      const createdUser = await response.json();
      setUsers([...users, createdUser]);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    const response = await fetch(`${API_URL}/users/${editingUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingUser),
    });
    if (response.ok) {
      setUsers(users.map(u => (u.id === editingUser.id ? editingUser : u)));
      setShowEditModal(false);
    }
  };

  const handleDelete = async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}`, { method: "DELETE" });
    if (response.ok) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Панель супервизора</h1>
      <div className="bg-white shadow-md rounded-lg p-4">
        <button onClick={() => handleAddUser("Пациент")} className="px-4 py-2 bg-blue-500 text-white rounded">Добавить пациента</button>
        <button onClick={() => handleAddUser("Врач")} className="px-4 py-2 bg-green-500 text-white rounded ml-2">Добавить врача</button>
        <table className="min-w-full mt-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Имя</th>
              <th className="p-2">Роль</th>
              <th className="p-2">Статус</th>
              <th className="p-2">ИИН</th>
              <th className="p-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t">
                <td className="p-2">{user.name}</td>
                <td className="p-2">{user.role}</td>
                <td className="p-2">{user.status}</td>
                <td className="p-2">{user.iin}</td>
                <td className="p-2">
                  <button onClick={() => handleEdit(user)} className="px-2 py-1 bg-yellow-500 text-white rounded mr-2">Редактировать</button>
                  <button onClick={() => handleDelete(user.id)} className="px-2 py-1 bg-red-500 text-white rounded">Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Редактирование пользователя</h2>
            <input type="text" value={editingUser.name} className="border p-2 w-full" onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} />
            <select value={editingUser.role} className="border p-2 w-full mt-2" onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}>
              <option value="Врач">Врач</option>
              <option value="Пациент">Пациент</option>
            </select>
            <input type="text" value={editingUser.status} className="border p-2 w-full mt-2" onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })} />
            <div className="mt-4">
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-green-500 text-white rounded mr-2">Сохранить</button>
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-500 text-white rounded">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorDashboard;
