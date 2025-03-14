import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Tabs, Tab, Box, Typography, Card, CardContent, Button, Grid, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables); // Регистрация компонентов Chart.js

const API_URL = import.meta.env.VITE_API_URL;

const UserStatistics = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_URL}/user/getUserAnalitics/${userId}`, {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUserData(response.data);
            } catch (error) {
                console.error("Ошибка загрузки данных пользователя", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const barColor = (score) => {
        if (score >= 7) return "#00C853"; // Зеленый
        if (score >= 4) return "#FFD600"; // Желтый
        return "#D50000"; // Красный
    };

    if (loading) {
        return <Typography align="center" mt={5}>Загрузка данных...</Typography>;
    }

    if (!userData) {
        return <Typography align="center" mt={5}>Ошибка загрузки данных</Typography>;
    }

    // Данные для графика
    const chartData = {
        labels: ["Всего рецептов", "Активных рецептов", "Завершенных рецептов", "Всего приемов", "Пропущенных приемов"],
        datasets: [
            {
                label: "Количество",
                data: [
                    userData.totalRecipes,
                    userData.activeRecipes,
                    userData.completedRecipes,
                    userData.totalEvents,
                    userData.missedEvents
                ],
                backgroundColor: ["#3f51b5", "#4caf50", "#f44336", "#ff9800", "#9c27b0"],
            },
        ],
    };

    return (
        <Box sx={{ maxWidth: '90%', margin: "auto", p: 3 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Статистика пользователя: {userData.name}
            </Typography>

            <Button variant="contained" color="primary" onClick={() => navigate("/doctor")} sx={{ mb: 2 }}>
                На главную
            </Button>

            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} centered>
                <Tab label="Статистика" />
                <Tab label="Рецепты" />
            </Tabs>

            {activeTab === 0 && (
                <Box textAlign="center" mt={5}>
                    {/* Круговой прогрессбар */}
                    <Box sx={{ width: 250, height: 150, margin: "auto", mb:'10%' }}>
                        <CircularProgressbar
                            value={parseFloat(userData.score)}
                            maxValue={10}
                            text={`${userData.score}`}
                            styles={buildStyles({
                                textSize: "24px",
                                pathColor: barColor(parseFloat(userData.score)),
                                textColor: barColor(parseFloat(userData.score)),
                                trailColor: "#E0E0E0",
                            })}
                        />
                    </Box>

                    {/* Таблица статистики */}
                    <TableContainer component={Paper} sx={{ mt: '10%', maxWidth: 800, margin: "auto" }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left"><strong>Параметр</strong></TableCell>
                                    <TableCell align="right"><strong>Значение</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Всего рецептов</TableCell>
                                    <TableCell align="right">{userData.totalRecipes}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Активных рецептов</TableCell>
                                    <TableCell align="right">{userData.activeRecipes}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Завершенных рецептов</TableCell>
                                    <TableCell align="right">{userData.completedRecipes}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Всего приемов</TableCell>
                                    <TableCell align="right">{userData.totalEvents}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Пропущенных приемов</TableCell>
                                    <TableCell align="right">{userData.missedEvents}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Столбчатая диаграмма */}
                    <Box sx={{ mt: 4, maxWidth: 1200, margin: "auto" }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>График статистики</Typography>
                        <Bar data={chartData} />
                    </Box>
                </Box>
            )}

            {activeTab === 1 && (
                <Box mt={3}>
                    <Typography variant="h6">Действующие рецепты</Typography>

                    {!userData.recipes || userData.recipes.length === 0 ? (
                        <Typography color="text.secondary">Нет активных рецептов</Typography>
                    ) : (
                        userData.recipes
                            .filter(recipe => recipe.description && recipe.description.trim() !== "")
                            .map((recipe, index) => (
                                <Card key={index} sx={{ mt: 2, width: "100%" }}>
                                    <CardContent>
                                        <Typography fontWeight="bold">{recipe.disease}</Typography>
                                        <Typography>{recipe.description}</Typography>
                                        <Typography color="text.secondary">Комментарий: {recipe.comment}</Typography>

                                        {/* Грид для отображения лекарств */}
                                        <Grid container spacing={2} mt={2}>
                                            {recipe.medications && recipe.medications.length > 0 ? (
                                                recipe.medications.map((med, medIndex) => (
                                                    <Grid item xs={12} sm={6} md={4} key={medIndex}>
                                                        <Card variant="outlined" sx={{ padding: 2 }}>
                                                            <CardContent>
                                                                <Typography variant="body1">
                                                                    <strong>{med.drug}</strong>
                                                                </Typography>
                                                                <Typography color="text.secondary">
                                                                    Принимать: {med.timesPerDay} раз(а) в день
                                                                </Typography>
                                                                <Typography color="text.secondary">
                                                                    Длительность: {med.dayDuration} дней
                                                                </Typography>
                                                                <Typography color="text.secondary">
                                                                    Назначил: {med.prescribedBy?.doctorName || "Неизвестный врач"}
                                                                </Typography>
                                                                <Typography color="text.secondary">
                                                                    Специальность: {med.prescribedBy?.doctorSpeciality || "Не указано"}
                                                                </Typography>
                                                                <Typography color="text.secondary">
                                                                    Телефон врача: {med.prescribedBy?.doctorPhone || "Не указан"}
                                                                </Typography>
                                                            </CardContent>
                                                        </Card>
                                                    </Grid>
                                                ))
                                            ) : (
                                                <Typography color="text.secondary">Нет назначенных лекарств</Typography>
                                            )}
                                        </Grid>
                                    </CardContent>
                                </Card>
                            ))
                    )}
                </Box>
            )}
        </Box>
    );
};

export default UserStatistics;
