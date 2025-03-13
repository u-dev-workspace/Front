import React, { useState } from "react";
import axios from "axios";
import {toast} from "react-toastify";
const API_URL = import.meta.env.VITE_API_URL;

const RecipeModalButton = ({ userId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [drugSuggestions, setDrugSuggestions] = useState([]);
    const [searchTimeout, setSearchTimeout] = useState(null);

    const [form, setForm] = useState({
        disease: "",
        diseaseDescription: "",
        tryComment: "",
        receptions: [{ drug: "", day: 1, timesPerDay: 1, usingDescription: "" }]
    });

    // 🔹 Открытие/закрытие модального окна
    const toggleModal = () => setIsOpen(!isOpen);

    // 🔹 Обновление текстовых полей формы
    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // 🔹 Обновление данных конкретного препарата
    const handleReceptionChange = (index, field, value) => {
        const updatedReceptions = [...form.receptions];
        updatedReceptions[index][field] = value;
        setForm({ ...form, receptions: updatedReceptions });

        // Запуск поиска лекарств при вводе
        if (field === "drug") {
            if (searchTimeout) clearTimeout(searchTimeout);
            setSearchTimeout(setTimeout(() => searchDrugs(value, index), 300));
        }
    };

    // 🔹 Поиск лекарств в API
    const searchDrugs = async (query, index) => {
        console.log(index)
        console.log(loading)
        if (!query.trim()) {
            setDrugSuggestions([]);
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/search/drug/${query}`, {
                withCredentials: true
            });

            if (response.data.drugs) {
                setDrugSuggestions(response.data.drugs);
            } else {
                setDrugSuggestions([]);
            }
        } catch (error) {
            console.error("Ошибка поиска лекарств:", error);
            setDrugSuggestions([]);
        }
    };

    // 🔹 Выбор лекарства из списка
    const selectDrug = (drugName, index) => {
        const updatedReceptions = [...form.receptions];
        updatedReceptions[index].drug = drugName;
        setForm({ ...form, receptions: updatedReceptions });
        setDrugSuggestions([]); // Закрываем подсказки
    };

    // 🔹 Добавление нового препарата
    const addReception = () => {
        setForm({
            ...form,
            receptions: [...form.receptions, { drug: "", day: 1, timesPerDay: 1, usingDescription: "" }]
        });
    };

    // 🔹 Удаление препарата
    const removeReception = (index) => {
        const updatedReceptions = form.receptions.filter((_, i) => i !== index);
        setForm({ ...form, receptions: updatedReceptions });
    };

    // 🔹 Отправка формы на сервер
    const submitRecipe = async () => {
        if (!form.disease || !form.receptions.length) {
            toast.error("Ошибка: Проверьте все поля", { position: "top-right", autoClose: 3000 });

            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            await axios.post(`${API_URL}/doctor/createRecipe`, {
                user: userId,
                disease: form.disease,
                diseaseDescription: form.diseaseDescription,
                tryComment: form.tryComment,
                receptions: form.receptions
            }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                withCredentials: true
            });

            toast.success("Рецепт успешно создан", { position: "top-right", autoClose: 3000 });
            toggleModal();
        } catch (error) {
            console.error("Ошибка при создании рецепта:", error);
            toast.error("Ошибка создания записи", { position: "top-right", autoClose: 3000 });

        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={toggleModal}>
                Назначить рецепт
            </button>

            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-[#0000009c] bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-2/3 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Назначение рецепта</h2>

                        {/* 🔹 Основные поля */}
                        <div className="mb-4">
                            <label className="block font-medium">Диагноз</label>
                            <input
                                type="text"
                                name="disease"
                                value={form.disease}
                                onChange={handleInputChange}
                                className="border p-2 w-full rounded"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block font-medium">Описание заболевания</label>
                            <textarea
                                name="diseaseDescription"
                                value={form.diseaseDescription}
                                onChange={handleInputChange}
                                className="border p-2 w-full rounded"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block font-medium">Рекомендации</label>
                            <textarea
                                name="tryComment"
                                value={form.tryComment}
                                onChange={handleInputChange}
                                className="border p-2 w-full rounded"
                            />
                        </div>

                        {/* 🔹 Раздел для препаратов */}
                        <h3 className="text-lg font-semibold mb-2">Препараты</h3>
                        {form.receptions.map((reception, index) => (
                            <div key={index} className="p-3 border rounded mb-3 bg-gray-50 relative">
                                <div className="flex justify-between">
                                    <label className="block font-medium">Препарат {index + 1}</label>
                                    {index > 0 && (
                                        <button onClick={() => removeReception(index)}
                                                className="text-red-500 hover:text-red-700">
                                            Удалить
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                    <div className="relative">
                                        <label className="block text-xs">Название</label>
                                        <input
                                            type="text"
                                            value={reception.drug}
                                            onChange={(e) => handleReceptionChange(index, "drug", e.target.value)}
                                            className="border p-2 w-full rounded"
                                        />
                                        {drugSuggestions.length > 0 && (
                                            <ul className="absolute z-10 bg-white border rounded mt-1 w-full">
                                                {drugSuggestions.map((drug, i) => (
                                                    <li
                                                        key={i}
                                                        onClick={() => selectDrug(drug.name, index)}
                                                        className="p-2 hover:bg-gray-200 cursor-pointer"
                                                    >
                                                        {drug.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs">Дней</label>
                                        <input
                                            type="number"
                                            value={reception.day}
                                            onChange={(e) => handleReceptionChange(index, "day", parseInt(e.target.value))}
                                            className="border p-2 w-full rounded"
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs">Раз в день</label>
                                        <input
                                            type="number"
                                            value={reception.timesPerDay}
                                            onChange={(e) => handleReceptionChange(index, "timesPerDay", parseInt(e.target.value))}
                                            className="border p-2 w-full rounded"
                                            min="1"
                                            max="3"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs">Инструкция</label>
                                        <input
                                            type="text"
                                            value={reception.usingDescription}
                                            onChange={(e) => handleReceptionChange(index, "usingDescription", e.target.value)}
                                            className="border p-2 w-full rounded"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button onClick={addReception} className="px-3 py-1 bg-gray-500 text-white rounded">
                            + Добавить препарат
                        </button>
                        <div className="flex justify-end mt-6">
                            <button onClick={submitRecipe} className="px-4 py-2 bg-green-500 text-white rounded">
                                {loading ? "Назначение..." : "Назначить рецепт"}
                            </button>
                            <button className="px-4 py-2 bg-gray-500 text-white rounded mr-2"
                                    onClick={() => setIsOpen(false)}>Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RecipeModalButton;
