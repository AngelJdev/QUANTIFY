import { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser, fetchProfile, googleLoginService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const res = await fetchProfile();
                    setUser(res.data.user);
                } catch (error) {
                    console.error('Session expired or invalid');
                    logout();
                }
            }
            setLoading(false);
        };
        loadUser();
    }, [token]);

    const login = async (credentials) => {
        const res = await loginUser(credentials);
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data.user;
    };

    const loginWithGoogle = async (credential) => {
        const res = await googleLoginService(credential);
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data.user;
    };

    const register = async (userData) => {
        const res = await registerUser(userData);
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
    };

    const refreshUser = async () => {
        try {
            const res = await fetchProfile();
            setUser(res.data.user);
        } catch (error) {
            console.error('Failed to refresh profile');
        }
    };

    const updateLocalUser = (changes) => {
        setUser(prevUser => prevUser ? { ...prevUser, ...changes } : null);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ 
            user, token, loading, login, loginWithGoogle, register, logout, refreshUser, updateLocalUser, isAuthenticated: !!user 
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
