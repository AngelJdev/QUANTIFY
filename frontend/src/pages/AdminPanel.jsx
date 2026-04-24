import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiTrash2, FiUserX, FiShield, FiActivity, FiTrendingUp } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const ROL_LABELS = { 0: 'Admin', 1: 'Usuario', 2: 'Moderador' };
const ROL_COLORS = { 0: 'text-amber-400', 1: 'text-blue-400', 2: 'text-purple-400' };
const ROL_BADGES = { 0: 'bg-amber-500/10 border-amber-500/20 text-amber-400', 1: 'bg-blue-500/10 border-blue-500/20 text-blue-400', 2: 'bg-purple-500/10 border-purple-500/20 text-purple-400' };

const AdminPanel = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [registrationStats, setRegistrationStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [stats, setStats] = useState({ totalUsers: 0, totalHabits: 0 });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [usersRes, regRes, statsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/registration-stats'),
                api.get('/admin/stats')
            ]);
            setUsers(usersRes.data.data);
            setRegistrationStats(regRes.data.data);
            setStats(statsRes.data.data);
        } catch (error) {
            console.error('Error loading admin data:', error);
        } finally {
            setTimeout(() => setLoading(false), 600);
        }
    };

    const handleDeleteHabits = async (userId, userName) => {
        const confirmed = window.confirm(`¿Estás seguro de eliminar TODOS los hábitos y registros de ${userName}?`);
        if (!confirmed) return;
        setActionLoading(`habits-${userId}`);
        try {
            await api.delete(`/admin/users/${userId}/habits`);
            await loadData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al eliminar hábitos.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        const confirmed = window.confirm(`¿Estás seguro de ELIMINAR PERMANENTEMENTE la cuenta de ${userName}? Esta acción no se puede deshacer.`);
        if (!confirmed) return;
        setActionLoading(`user-${userId}`);
        try {
            await api.delete(`/admin/users/${userId}`);
            await loadData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al eliminar cuenta.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        setActionLoading(`role-${userId}`);
        try {
            await api.patch(`/admin/users/${userId}/role`, { rol: newRole });
            await loadData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al cambiar rol.');
        } finally {
            setActionLoading(null);
        }
    };

    const isAdmin = currentUser?.rol === 0;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-surface dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl p-3 shadow-lg">
                    <p className="text-xs font-bold text-textMuted">{label}</p>
                    <p className="text-sm font-extrabold text-primary dark:text-white">{payload[0].value} registros</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full space-y-8 fade-in">
            {/* Header */}
            <header className="flex flex-col lg:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                    <h1 className="text-4xl font-extrabold text-primary dark:text-white mb-2 brightness-110 tracking-tight">
                        Panel de Administrador
                    </h1>
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
                            <FiUsers className="text-primary text-xl" />
                            <div>
                                <p className="text-xs font-bold text-primary uppercase tracking-widest leading-none">Total Usuarios</p>
                                <span className="text-xl font-black text-primary">{stats.totalUsers}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-success/10 rounded-xl border border-success/20">
                            <FiActivity className="text-success text-xl" />
                            <div>
                                <p className="text-xs font-bold text-success uppercase tracking-widest leading-none">Total Hábitos</p>
                                <span className="text-xl font-black text-success">{stats.totalHabits}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                            <FiShield className="text-amber-400 text-xl" />
                            <div>
                                <p className="text-xs font-bold text-amber-400 uppercase tracking-widest leading-none">Tu Rol</p>
                                <span className="text-xl font-black text-amber-400">{isAdmin ? 'Admin' : 'Moderador'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart: User Registration Trend */}
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="glass-card w-full h-[300px] animate-pulse bg-gray-100/50 dark:bg-white/5 flex items-center justify-center">
                            <p className="text-gray-400 dark:text-gray-600 font-bold tracking-widest text-sm uppercase">Cargando Estadísticas...</p>
                        </div>
                    ) : (
                        <div className="glass-card dark:border-white/5 dark:bg-surface">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 border-b border-gray-100 dark:border-white/10 pb-4 gap-4">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-primary dark:text-white mb-1 flex items-center gap-2">
                                        <FiTrendingUp /> Registros de Usuarios
                                    </h2>
                                    <p className="text-textMuted font-medium">Nuevos usuarios registrados en los últimos 30 días</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-4xl font-black text-success">{stats.totalUsers}</span>
                                    <p className="text-sm font-bold text-textMuted uppercase tracking-wider">Usuarios Totales</p>
                                </div>
                            </div>
                            <div className="w-full" style={{ height: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={registrationStats} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                                        <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#888' }} tickFormatter={(v) => v.slice(5)} />
                                        <YAxis tick={{ fontSize: 10, fill: '#888' }} allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="registros" stroke="#6366f1" strokeWidth={2.5} fill="url(#regGradient)" dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Users Table */}
            <div className="glass-card dark:border-white/5 dark:bg-surface overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-textPrimary flex items-center gap-2">
                        <span className="w-2 h-6 rounded bg-primary dark:bg-white"></span>
                        Gestión de Usuarios
                    </h2>
                    <span className="text-xs font-bold text-textMuted uppercase tracking-widest">{users.length} registros</span>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-16 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-white/10">
                                    <th className="text-left py-3 px-4 text-[10px] font-bold text-textMuted uppercase tracking-widest">Usuario</th>
                                    <th className="text-left py-3 px-4 text-[10px] font-bold text-textMuted uppercase tracking-widest">Email</th>
                                    <th className="text-center py-3 px-4 text-[10px] font-bold text-textMuted uppercase tracking-widest">Rol</th>
                                    <th className="text-center py-3 px-4 text-[10px] font-bold text-textMuted uppercase tracking-widest">Hábitos</th>
                                    <th className="text-center py-3 px-4 text-[10px] font-bold text-textMuted uppercase tracking-widest">Racha</th>
                                    <th className="text-center py-3 px-4 text-[10px] font-bold text-textMuted uppercase tracking-widest">Registro</th>
                                    <th className="text-center py-3 px-4 text-[10px] font-bold text-textMuted uppercase tracking-widest">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {users.map((u, idx) => (
                                        <motion.tr
                                            key={u.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className={`border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors ${u.id === currentUser?.id ? 'bg-primary/5 dark:bg-primary/5' : ''}`}
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-primary/10 dark:bg-white/10 rounded-full flex items-center justify-center font-black text-sm text-primary dark:text-white">
                                                        {u.nombre.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-bold text-textPrimary dark:text-white">{u.nombre}</span>
                                                    {u.id === currentUser?.id && <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">TÚ</span>}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-textMuted font-medium">{u.email}</td>
                                            <td className="py-3 px-4 text-center">
                                                {isAdmin && u.id !== currentUser?.id ? (
                                                    <select
                                                        value={u.rol}
                                                        onChange={(e) => handleRoleChange(u.id, parseInt(e.target.value))}
                                                        disabled={actionLoading === `role-${u.id}`}
                                                        className="bg-transparent border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs font-bold dark:bg-surface cursor-pointer focus:ring-1 focus:ring-primary dark:text-white"
                                                    >
                                                        <option value={0}>Admin</option>
                                                        <option value={1}>Usuario</option>
                                                        <option value={2}>Moderador</option>
                                                    </select>
                                                ) : (
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${ROL_BADGES[u.rol]}`}>
                                                        {ROL_LABELS[u.rol]}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center font-bold text-textPrimary dark:text-white">{u.habitCount}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="font-bold text-orange-400">{u.current_streak || 0}d</span>
                                            </td>
                                            <td className="py-3 px-4 text-center text-textMuted text-xs font-medium">
                                                {new Date(u.fecha_creacion).toLocaleDateString('es-MX')}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {u.id !== currentUser?.id ? (
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => handleDeleteHabits(u.id, u.nombre)}
                                                            disabled={actionLoading === `habits-${u.id}`}
                                                            className="p-2 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all disabled:opacity-30"
                                                            title="Eliminar hábitos"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(u.id, u.nombre)}
                                                            disabled={actionLoading === `user-${u.id}`}
                                                            className="p-2 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/10 transition-all disabled:opacity-30"
                                                            title="Eliminar cuenta"
                                                        >
                                                            <FiUserX size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-textMuted font-bold">—</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Info Banner */}
            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                <h4 className="text-primary font-bold mb-2 flex items-center gap-2 uppercase text-xs tracking-widest">
                    <FiShield /> Permisos del Panel
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {isAdmin
                        ? 'Como Administrador puedes cambiar roles, eliminar hábitos y eliminar cuentas de usuarios.'
                        : 'Como Moderador puedes eliminar hábitos y cuentas de usuarios, pero no puedes cambiar roles.'}
                </p>
            </div>
        </div>
    );
};

export default AdminPanel;
