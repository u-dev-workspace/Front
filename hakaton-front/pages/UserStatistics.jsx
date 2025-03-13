import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Tabs, Tab, Box, Typography, Card, CardContent, Button } from "@mui/material";
import axios from "axios";
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
                const response = axios.get(`${API_URL}/user/getUserAnalitics/${userId}`, {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = (await response).data;
                setUserData(data);
            } catch (error) {
                console.error("Ошибка загрузки данных пользователя", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const barColor = (score) => {
        if (score >= 7) return "#00C853"; // Green
        if (score >= 4) return "#FFD600"; // Yellow
        return "#D50000"; // Red
    };

    if (loading) {
        return <Typography align="center" mt={5}>Загрузка данных...</Typography>;
    }

    if (!userData) {
        return <Typography align="center" mt={5}>Ошибка загрузки данных</Typography>;
    }

    return (
        <Box sx={{ maxWidth: 800, margin: "auto", p: 3 }}>
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
                <Box textAlign="center" mt={3}>
                    <Box sx={{ width: 150, height: 150, margin: "auto" }}>
                        <CircularProgressbar
                            value={userData.score}
                            maxValue={10}
                            text={`${userData.score}`}
                            styles={buildStyles({
                                textSize: "24px",
                                pathColor: barColor(userData.score),
                                textColor: barColor(userData.score),
                                trailColor: "#E0E0E0",
                            })}
                        />
                    </Box>
                    <Typography mt={2}>Всего рецептов: {userData.totalRecipes}</Typography>
                    <Typography>Активных рецептов: {userData.activeRecipes}</Typography>
                    <Typography>Завершенных рецептов: {userData.completedRecipes}</Typography>
                    <Typography>Всего приемов: {userData.totalEvents}</Typography>
                    <Typography>Пропущенных приемов: {userData.missedEvents}</Typography>
                </Box>
            )}

            {activeTab === 1 && (
                <Box mt={3}>
                    <Typography variant="h6">Действующие рецепты</Typography>
                    {userData.recipes.filter(r => r.description !== "").map((recipe, index) => (
                        <Card key={index} sx={{ mt: 2 }}>
                            <CardContent>
                                <Typography fontWeight="bold">{recipe.disease}</Typography>
                                <Typography>{recipe.description}</Typography>
                                <Typography color="text.secondary">Комментарий: {recipe.comment}</Typography>
                            </CardContent>
                        </Card>
                    ))}

                    <Typography variant="h6" mt={3}>Завершенные рецепты</Typography>
                    {userData.recipes.filter(r => r.description === "").map((recipe, index) => (
                        <Card key={index} sx={{ mt: 2 }}>
                            <CardContent>
                                <Typography fontWeight="bold">{recipe.disease}</Typography>
                                <Typography color="text.secondary">Комментарий: {recipe.comment}</Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default UserStatistics;
