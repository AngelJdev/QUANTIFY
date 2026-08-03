import api from './api';

export const registerUser = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const fetchProfile = async () => {
    const response = await api.get('/auth/profile');
    return response.data;
};

export const googleLoginService = async (credential) => {
    const response = await api.post('/auth/google', { credential });
    return response.data;
};
