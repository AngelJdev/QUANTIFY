import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
    LuUser, LuPencil, LuCamera, LuCheck, LuX, 
    LuMail, LuLock, LuSave, LuTrendingUp, 
    LuAward, LuLogOut, LuArrowRight 
} from 'react-icons/lu';
import api from '../services/api';

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
        y: 0, 
        opacity: 1, 
        transition: { type: 'spring', stiffness: 260, damping: 20 } 
    }
};

export default function ProfilePage() {
    const { user, updateLocalUser, logout } = useAuth();
    
    if (!user) return null; // Safety guard for component render
    
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(user?.nombre || '');
    const [isChangingEmail, setIsChangingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [emailOtp, setEmailOtp] = useState('');
    const [emailStep, setEmailStep] = useState(1); // 1: request, 2: confirm
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    const showMsg = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleUpdateName = async () => {
        if (newName === user?.nombre) {
            setIsEditingName(false);
            return;
        }
        setLoading(true);
        try {
            await api.patch('/api/profile/name', { nombre: newName });
            updateLocalUser({ nombre: newName });
            showMsg('success', 'Nombre actualizado con éxito');
            setIsEditingName(false);
        } catch (error) {
            showMsg('error', error.response?.data?.message || 'Error al actualizar nombre');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 500000) {
            showMsg('error', 'La imagen es demasiado grande (máximo 500KB)');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result;
            setLoading(true);
            try {
                await api.patch('/api/profile/avatar', { avatar_url: base64 });
                updateLocalUser({ avatar_url: base64 });
                showMsg('success', 'Foto de perfil actualizada');
            } catch (error) {
                showMsg('error', error.response?.data?.message || 'Error al subir imagen');
            } finally {
                setLoading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRequestEmailChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/profile/request-email-change', { newEmail });
            setEmailStep(2);
            showMsg('success', 'Código de verificación enviado');
        } catch (error) {
            showMsg('error', error.response?.data?.message || 'Error al solicitar cambio');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmEmailChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/api/profile/confirm-email-change', { otp: emailOtp });
            updateLocalUser({ email: res.data.user.email });
            showMsg('success', 'Correo actualizado correctamente');
            setIsChangingEmail(false);
            setEmailStep(1);
            setNewEmail('');
            setEmailOtp('');
        } catch (error) {
            showMsg('error', error.response?.data?.message || 'Código incorrecto o expirado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial="hidden" 
            animate="visible" 
            className="max-w-4xl mx-auto space-y-8 pb-16"
        >
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-textPrimary dark:text-white tracking-tighter">Mi Perfil</h1>
                    <p className="text-textMuted text-sm font-medium">Control total de tu identidad y progreso.</p>
                </div>
            </header>

            {/* Profile Hero Card */}
            <motion.div variants={itemVariants} className="bg-surface dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    {/* Avatar Group */}
                    <div className="relative group">
                        <div 
                            onClick={handleAvatarClick}
                            className="w-32 h-32 rounded-full border-4 border-white dark:border-zinc-800 shadow-2xl overflow-hidden cursor-pointer relative"
                        >
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt={user?.nombre} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-black uppercase">
                                    {user?.nombre?.charAt(0)}
                                </div>
                            )}
                            
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <LuCamera className="text-white" size={24} />
                            </div>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden" 
                        />
                        <button 
                            onClick={handleAvatarClick}
                            className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-zinc-900 group-hover:scale-110 transition-transform"
                        >
                            <LuCamera size={14} />
                        </button>
                    </div>

                    {/* Name/Info Group */}
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <AnimatePresence mode="wait">
                                {isEditingName ? (
                                    <motion.div 
                                        key="editing" 
                                        initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:10 }}
                                        className="flex items-center gap-2"
                                    >
                                        <input 
                                            type="text" 
                                            value={newName} 
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="bg-white dark:bg-zinc-800 border border-primary/20 rounded-xl px-4 py-2 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            autoFocus
                                        />
                                        <button onClick={handleUpdateName} className="p-2 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors">
                                            <LuCheck size={20} />
                                        </button>
                                        <button onClick={() => { setIsEditingName(false); setNewName(user?.nombre || ''); }} className="p-2 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors">
                                            <LuX size={20} />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.h2 
                                        key="display" 
                                        initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:10 }}
                                        className="text-3xl font-black text-textPrimary dark:text-white"
                                    >
                                        {user?.nombre}
                                    </motion.h2>
                                )}
                            </AnimatePresence>
                            {!isEditingName && (
                                <button 
                                    onClick={() => setIsEditingName(true)}
                                    className="p-1.5 text-textMuted hover:text-primary transition-colors opacity-0 md:opacity-100"
                                >
                                    <LuPencil size={18} />
                                </button>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="flex items-center gap-2 text-textMuted text-sm font-medium">
                                <LuMail size={14} className="text-primary" />
                                {user?.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-primary/20">
                                    {user?.rol}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="flex gap-4 p-4 bg-black/5 dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/5">
                        <div className="text-center px-4">
                            <p className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-1">Racha</p>
                            <div className="flex items-center gap-1 justify-center">
                                <LuTrendingUp className="text-primary" size={16} />
                                <span className="text-xl font-black text-textPrimary dark:text-white">{user?.current_streak}</span>
                            </div>
                        </div>
                        <div className="w-px bg-black/10 dark:bg-white/10" />
                        <div className="text-center px-4">
                            <p className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-1">Máxima</p>
                            <div className="flex items-center gap-1 justify-center">
                                <LuAward className="text-amber-500" size={16} />
                                <span className="text-xl font-black text-textPrimary dark:text-white">{user?.max_streak}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Actions / Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Email Settings */}
                <motion.section variants={itemVariants} className="bg-surface dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-[2.5rem] p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                            <LuMail size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-textPrimary dark:text-white">Correo Electrónico</h3>
                            <p className="text-xs text-textMuted font-medium">Gestión segura de tu contacto.</p>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {!isChangingEmail ? (
                            <motion.div key="main" exit={{ opacity:0, y:-10 }}>
                                <div className="space-y-4">
                                    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                                        <p className="text-xs text-textMuted font-bold uppercase tracking-widest mb-1">Correo Actual</p>
                                        <p className="text-sm font-medium text-textPrimary dark:text-white">{user?.email}</p>
                                    </div>
                                    <button 
                                        onClick={() => setIsChangingEmail(true)}
                                        className="w-full py-3 bg-primary/10 text-primary border border-primary/20 rounded-2xl text-xs font-bold hover:bg-primary/20 transition-all"
                                    >
                                        Cambiar Correo
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="form" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="space-y-4">
                                {emailStep === 1 ? (
                                    <form onSubmit={handleRequestEmailChange} className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-textMuted uppercase tracking-widest pl-1">Nuevo Correo</label>
                                            <input 
                                                type="email" 
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                className="w-full bg-black/5 dark:bg-zinc-800 border border-black/5 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                                                placeholder="nuevo_correo@servidor.com"
                                                required
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                type="submit" 
                                                disabled={loading}
                                                className="flex-1 py-3 bg-primary text-white rounded-2xl text-xs font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                            >
                                                {loading ? 'Enviando...' : 'Pedir Código'} <LuArrowRight size={14} />
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => setIsChangingEmail(false)}
                                                className="px-6 py-3 bg-black/5 dark:bg-white/5 rounded-2xl text-xs font-bold"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={handleConfirmEmailChange} className="space-y-4">
                                        <p className="text-xs text-textMuted font-medium text-center italic">Enviamos un código a {newEmail}</p>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-textMuted uppercase tracking-widest pl-1">Código de Seguridad</label>
                                            <input 
                                                type="text" 
                                                value={emailOtp}
                                                onChange={(e) => setEmailOtp(e.target.value)}
                                                className="w-full bg-black/5 dark:bg-zinc-800 border border-black/5 dark:border-white/5 rounded-2xl px-4 py-3 text-center text-2xl font-black tracking-[1em] focus:ring-2 focus:ring-primary/20 outline-none"
                                                placeholder="••••••"
                                                maxLength={6}
                                                required
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="w-full py-3 bg-success text-white rounded-2xl text-xs font-bold shadow-lg shadow-success/20"
                                        >
                                            {loading ? 'Confirmando...' : 'Actualizar Perfil'}
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setEmailStep(1)}
                                            className="w-full py-3 text-xs text-textMuted font-bold hover:text-textPrimary"
                                        >
                                            Cambiar correo destino
                                        </button>
                                    </form>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.section>

                {/* Account Actions */}
                <motion.section variants={itemVariants} className="bg-surface dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-[2.5rem] p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                            <LuLock size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-textPrimary dark:text-white">Seguridad</h3>
                            <p className="text-xs text-textMuted font-medium">Contraseña y acceso.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Link 
                            to="/forgot-password" 
                            className="w-full flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 group hover:bg-black/10 dark:hover:bg-white/10 transition-all text-sm font-bold text-textPrimary dark:text-white"
                        >
                            Cambiar Contraseña
                            <LuPencil className="text-textMuted group-hover:text-primary transition-colors" size={16} />
                        </Link>
                        
                        <div className="p-1 px-4">
                            <p className="text-[10px] text-textMuted font-medium mb-4 italic">El cambio de contraseña utiliza el flujo de recuperación por seguridad auditada.</p>
                        </div>

                        <button 
                            onClick={logout}
                            className="w-full flex items-center justify-between p-4 bg-danger/5 rounded-2xl border border-danger/10 group hover:bg-danger/10 transition-all text-sm font-bold text-danger"
                        >
                            Cerrar Sesión Global
                            <LuLogOut size={16} />
                        </button>
                    </div>
                </motion.section>
            </div>

            {/* Global Message Status */}
            <AnimatePresence>
                {message.text && (
                    <motion.div 
                        initial={{ opacity:0, y:100 }} 
                        animate={{ opacity:1, y:0 }} 
                        exit={{ opacity:0, y:100 }}
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border ${
                            message.type === 'success' 
                            ? 'bg-success text-white border-white/20' 
                            : 'bg-danger text-white border-white/20'
                        }`}
                    >
                        {message.type === 'success' ? <LuCheck size={18} /> : <LuX size={18} />}
                        <span className="text-sm font-bold">{message.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
