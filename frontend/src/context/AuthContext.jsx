import { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser, fetchProfile, googleLoginService } from '../services/authService';
import { disconnectSocket, initSocket } from '../services/socket';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);
    const [globalGoogleTransition, setGlobalGoogleTransition] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const res = await fetchProfile();
                    setUser(res.data.user);
                } catch {
                    console.error('Session expired or invalid');
                    disconnectSocket();
                    setToken(null);
                    setUser(null);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        loadUser();
    }, [token]);

    useEffect(() => {
        if (!user?.id || !token) return undefined;

        const socket = initSocket();
        const handleAuthUpdated = (changes) => {
            setUser((previous) => previous ? { ...previous, ...changes } : null);
        };
        socket.on('auth_updated', handleAuthUpdated);

        return () => socket.off('auth_updated', handleAuthUpdated);
    }, [user?.id, token]);

    const login = async (credentials) => {
        const res = await loginUser(credentials);
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data.user;
    };

    const loginWithGoogle = async (credential, action = 'login', otp = '') => {
        const res = await googleLoginService(credential, action, otp);
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
        } catch {
            console.error('Failed to refresh profile');
        }
    };

    const updateLocalUser = (changes) => {
        setUser(prevUser => prevUser ? { ...prevUser, ...changes } : null);
    };

    const logout = () => {
        disconnectSocket();
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{
            user, token, loading, login, loginWithGoogle, register, logout, refreshUser, updateLocalUser, isAuthenticated: !!user,
            globalGoogleTransition, setGlobalGoogleTransition
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
