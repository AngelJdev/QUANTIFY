import api from './api';

export const verifySmartTVCode = async (code) => {
    const response = await api.post('/smarttv/verify-code', { code });
    return response.data;
};

export const getSmartTVDashboard = async () => {
    const response = await api.get('/smarttv/dashboard');
    return response.data;
};

export const unlinkSmartTV = async () => {
    const response = await api.post('/smarttv/unlink');
    return response.data;
};
