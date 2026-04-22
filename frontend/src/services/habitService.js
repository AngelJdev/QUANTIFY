import api from './api';

export const getHabits = async () => {
    const response = await api.get('/habits');
    return response.data;
};

export const createHabit = async (habitData) => {
    const response = await api.post('/habits', habitData);
    return response.data;
};

export const createLog = async (logData) => {
    const response = await api.post('/logs', logData);
    return response.data;
};

export const getAdherence = async (habitId) => {
    const response = await api.get(`/logs/adherence/${habitId}`);
    return response.data;
};

export const getGlobalStats = async () => {
    const response = await api.get('/logs/global-stats');
    return response.data;
};

export const deleteHabit = async (habitId) => {
    const response = await api.delete(`/habits/${habitId}`);
    return response.data;
};

export const getAchievements = async () => {
    const response = await api.get('/achievements');
    return response.data;
};
