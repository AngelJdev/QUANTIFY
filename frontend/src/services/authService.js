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

export const googleLoginService = async (credential, action = 'login', otp = '') => {
    const response = await api.post('/auth/google', { credential, action, otp });
    return response.data;
};

export const sendVerificationService = async (email, nombre) => {
    const response = await api.post('/auth/send-verification', { email, nombre });
    return response.data;
};
