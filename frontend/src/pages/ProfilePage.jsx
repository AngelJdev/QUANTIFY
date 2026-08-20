import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
    LuUser, LuPencil, LuCamera, LuCheck, LuX, 
    LuMail, LuLock, LuTrendingUp, 
    LuAward, LuLogOut, LuArrowRight, LuShield,
    LuActivity, LuScale, LuRuler, LuHeart, LuRefreshCw,
    LuCircleAlert, LuCircleCheck, LuInfo, LuCrop, LuZoomIn
} from 'react-icons/lu';
import api from '../services/api';

const ROL_CONFIG = {
    0: { name: 'Administrador', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30', icon: LuShield },
    1: { name: 'Usuario Standard', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30', icon: LuUser },
    2: { name: 'Moderador', badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30', icon: LuShield }
};

export default function ProfilePage() {
    const { user, updateLocalUser, logout } = useAuth();
    const navigate = useNavigate();
    
    if (!user) return null;

    // Estado Nombre y Bio
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(user?.nombre || '');
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioText, setBioText] = useState(user?.bio || '');

    // Estado Biometría
    const [biometrics, setBiometrics] = useState({
        peso: user?.peso || '',
        altura: user?.altura || '',
        edad: user?.edad || '',
        genero: user?.genero || 'Masculino',
        nivel_actividad: user?.nivel_actividad || 'Moderado',
        meta_peso: user?.meta_peso || ''
    });
    const [savingBiometrics, setSavingBiometrics] = useState(false);

    // Estado Correo Electrónico
    const [isChangingEmail, setIsChangingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [emailOtp, setEmailOtp] = useState('');
    const [emailStep, setEmailStep] = useState(1);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Estado Cambio de Contraseña Directo
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Estado Modal Emergente Pop-Up (Flotante Superpuesto)
    const [popupModal, setPopupModal] = useState({ open: false, title: '', message: '', type: 'success' });
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    // Estado Herramienta de Recorte de Avatar
    const [cropperModal, setCropperModal] = useState({ open: false, imageSrc: null });
    const [zoomScale, setZoomScale] = useState(1);
    const canvasRef = useRef(null);

    // Cargar datos biométricos iniciales si existen
    useEffect(() => {
        const fetchInitialBiometrics = async () => {
            try {
                const res = await api.get('/onboarding/recommendations').catch(() => null);
                if (res?.data?.data?.metrics) {
                    const m = res.data.data.metrics;
                    setBiometrics(prev => ({
                        peso: user?.peso || m.peso || prev.peso,
                        altura: user?.altura || m.estatura || prev.altura,
                        edad: user?.edad || m.edad || prev.edad,
                        genero: user?.genero || m.genero || prev.genero,
                        nivel_actividad: user?.nivel_actividad || m.nivel_actividad || prev.nivel_actividad,
                        meta_peso: user?.meta_peso || prev.meta_peso
                    }));
                }
            } catch (err) {
                console.error('Error al cargar datos biométricos:', err);
            }
        };
        fetchInitialBiometrics();
    }, [user]);

    // Temporizador Reenviar Código
    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const showPopup = (title, message, type = 'success') => {
        setPopupModal({ open: true, title, message, type });
    };

    const closePopup = () => {
        setPopupModal({ open: false, title: '', message: '', type: 'success' });
    };

    // Actualizar Nombre por separado
    const handleUpdateName = async () => {
        if (!newName.trim()) return;
        if (newName.trim() === user?.nombre) {
            setIsEditingName(false);
            return;
        }
        setLoading(true);
        try {
            await api.patch('/profile/name', { nombre: newName.trim() });
            updateLocalUser({ nombre: newName.trim() });
            setIsEditingName(false);
            showPopup('¡Nombre Actualizado!', 'Tu nombre de usuario se ha actualizado correctamente.', 'success');
        } catch (error) {
            showPopup('Error al Actualizar', error.response?.data?.message || 'No se pudo actualizar el nombre.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Actualizar Biografía por separado
    const handleUpdateBio = async () => {
        setLoading(true);
        try {
            await api.patch('/profile/bio', { bio: bioText.trim() });
            updateLocalUser({ bio: bioText.trim() });
            setIsEditingBio(false);
            showPopup('¡Biografía Actualizada!', 'Tu biografía personal ha sido guardada.', 'success');
        } catch (error) {
            showPopup('Error al Actualizar', error.response?.data?.message || 'No se pudo actualizar la biografía.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Recorte de Foto de Perfil (Avatar Cropper)
    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setCropperModal({ open: true, imageSrc: event.target.result });
            setZoomScale(1);
        };
        reader.readAsDataURL(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleApplyCrop = async () => {
        if (!cropperModal.imageSrc) return;

        setLoading(true);
        try {
            const img = new Image();
            img.src = cropperModal.imageSrc;
            await new Promise(res => img.onload = res);

            const canvas = document.createElement('canvas');
            const size = 300;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            // Dibujar recorte circular con zoom
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            ctx.clip();

            const drawWidth = size * zoomScale;
            const drawHeight = (img.height / img.width) * drawWidth;
            const offsetX = (size - drawWidth) / 2;
            const offsetY = (size - drawHeight) / 2;

            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            const croppedBase64 = canvas.toDataURL('image/jpeg', 0.85);

            const res = await api.patch('/profile/avatar', { avatar_url: croppedBase64 });
            const updatedAvatar = res.data?.data?.avatar_url || croppedBase64;

            updateLocalUser({ avatar_url: updatedAvatar });
            setCropperModal({ open: false, imageSrc: null });
            showPopup('¡Foto de Perfil Actualizada!', 'Tu avatar se ha recortado y guardado correctamente.', 'success');
        } catch (error) {
            console.error('Error recortando foto:', error);
            showPopup('Error al Aplicar Recorte', 'No se pudo guardar la imagen recortada.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Guardar Métricas Biométricas
    const handleSaveBiometrics = async (e) => {
        e.preventDefault();
        setSavingBiometrics(true);
        try {
            await api.patch('/profile/biometrics', biometrics);
            updateLocalUser(biometrics);
            showPopup(
                '¡Métricas Biométricas Guardadas!',
                'Tus datos biométricos se han actualizado correctamente. Si completaste tu perfil por completo, ¡has desbloqueado el logro Perfil de Alta Precisión 👤!',
                'success'
            );
        } catch (error) {
            showPopup('Error de Biometría', error.response?.data?.message || 'Error al guardar los datos biométricos.', 'error');
        } finally {
            setSavingBiometrics(false);
        }
    };

    // Cálculo de IMC
    const calculateIMC = () => {
        const p = parseFloat(biometrics.peso);
        const a = parseFloat(biometrics.altura) / 100;
        if (!p || !a || a <= 0) return null;
        const imc = (p / (a * a)).toFixed(1);
        
        let label = 'Peso Saludable';
        let color = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
        if (imc < 18.5) {
            label = 'Bajo Peso';
            color = 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30';
        } else if (imc >= 25 && imc < 30) {
            label = 'Sobrepeso';
            color = 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30';
        } else if (imc >= 30) {
            label = 'Obesidad';
            color = 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30';
        }
        return { value: imc, label, color };
    };

    const imcData = calculateIMC();

    // Cambio de Correo con Reenvío de Código
    const handleRequestEmailChange = async (e) => {
        if (e) e.preventDefault();
        if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
            showPopup('Correo Inválido', 'Ingresa un formato de correo electrónico válido.', 'error');
            return;
        }

        setLoading(true);
        try {
            await api.post('/profile/request-email-change', { newEmail });
            setEmailStep(2);
            setResendCooldown(30);
            showPopup(
                'Código Enviado',
                `Enviamos un código de verificación de 6 dígitos a ${newEmail}. Revisa tu bandeja de entrada o Mailtrap.`,
                'success'
            );
        } catch (error) {
            showPopup('Error al Enviar', error.response?.data?.message || 'Error al solicitar cambio de correo.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmEmailChange = async (e) => {
        e.preventDefault();
        if (emailOtp.trim().length !== 6) {
            showPopup('Código Incompleto', 'El código de seguridad debe tener exactamente 6 dígitos.', 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/profile/confirm-email-change', { otp: emailOtp.trim() });
            updateLocalUser({ email: res.data.data.user.email });
            setIsChangingEmail(false);
            setEmailStep(1);
            setNewEmail('');
            setEmailOtp('');
            showPopup('¡Correo Actualizado!', 'Tu dirección de correo electrónico principal ha sido cambiada con éxito.', 'success');
        } catch (error) {
            showPopup('Código Inválido', error.response?.data?.message || 'El código es incorrecto o ha expirado.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Cambio Directo de Contraseña
    const handleDirectPasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showPopup('Contraseñas no Coinciden', 'La nueva contraseña y la confirmación no son iguales.', 'error');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            showPopup('Contraseña Corta', 'La nueva contraseña debe contener al menos 6 caracteres.', 'error');
            return;
        }

        setLoading(true);
        try {
            await api.patch('/profile/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setIsChangingPassword(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            showPopup('¡Contraseña Actualizada!', 'Tu contraseña de acceso ha sido cambiada correctamente.', 'success');
        } catch (error) {
            showPopup('Error de Contraseña', error.response?.data?.message || 'Error al actualizar contraseña.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const rolConfig = ROL_CONFIG[user?.rol] || ROL_CONFIG[1];
    const RolIcon = rolConfig.icon;
    const isAdminOrMod = user?.rol === 0 || user?.rol === 2;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="max-w-5xl mx-auto space-y-8 pb-16 px-4"
        >
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-textPrimary dark:text-white tracking-tight uppercase">
                        Mi Perfil
                    </h1>
                    <p className="text-textMuted dark:text-gray-400 text-sm font-medium">
                        Gestión de identidad, métricas biométricas y configuración de seguridad.
                    </p>
                </div>
            </header>

            {/* Profile Hero Card */}
            <div className="glass-card border border-gray-200 dark:border-white/10 rounded-3xl p-8 relative overflow-hidden space-y-6">
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    {/* Avatar Group */}
                    <div className="relative group shrink-0">
                        <div 
                            onClick={handleAvatarClick}
                            className="w-32 h-32 rounded-full border-4 border-white dark:border-zinc-800 shadow-2xl overflow-hidden cursor-pointer relative"
                        >
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt={user?.nombre} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-blue-500/10 dark:bg-cyan-500/10 flex items-center justify-center text-blue-600 dark:text-cyan-400 text-4xl font-black uppercase">
                                    {user?.nombre?.charAt(0)}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <LuCrop className="text-white" size={28} />
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
                            className="absolute bottom-1 right-1 bg-blue-600 dark:bg-white text-white dark:text-black p-2.5 rounded-full shadow-lg border-2 border-white dark:border-zinc-900 group-hover:scale-110 transition-transform"
                            title="Cambiar y recortar foto de perfil"
                        >
                            <LuCamera size={14} />
                        </button>
                    </div>

                    {/* Info Group */}
                    <div className="flex-1 text-center md:text-left space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <AnimatePresence mode="wait">
                                {isEditingName ? (
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="text" 
                                            value={newName} 
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2 text-xl font-bold text-textPrimary dark:text-white focus:outline-none focus:border-blue-600"
                                            autoFocus
                                        />
                                        <button onClick={handleUpdateName} className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg hover:bg-emerald-500/20" title="Guardar Nombre">
                                            <LuCheck size={20} />
                                        </button>
                                        <button onClick={() => { setIsEditingName(false); setNewName(user?.nombre || ''); }} className="p-2 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20">
                                            <LuX size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <h2 className="text-3xl font-black text-textPrimary dark:text-white">
                                        {user?.nombre}
                                    </h2>
                                )}
                            </AnimatePresence>
                            {!isEditingName && (
                                <button 
                                    onClick={() => setIsEditingName(true)}
                                    className="p-1.5 text-textMuted hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                                    title="Editar nombre"
                                >
                                    <LuPencil size={18} />
                                </button>
                            )}
                        </div>

                        {/* Biografía */}
                        <div className="text-sm">
                            {isEditingBio ? (
                                <div className="flex gap-2 max-w-lg">
                                    <input
                                        type="text"
                                        value={bioText}
                                        onChange={(e) => setBioText(e.target.value)}
                                        placeholder="Escribe tu lema personal o biografía..."
                                        className="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-xs text-textPrimary dark:text-white focus:outline-none"
                                    />
                                    <button onClick={handleUpdateBio} className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold">Guardar</button>
                                    <button onClick={() => setIsEditingBio(false)} className="px-3 py-1.5 bg-gray-200 dark:bg-white/10 text-textMuted rounded-xl text-xs font-bold">Cancelar</button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center md:justify-start gap-2 text-textMuted dark:text-gray-300 italic">
                                    <span>"{user?.bio || 'Sin biografía especificada aún.'}"</span>
                                    <button onClick={() => setIsEditingBio(true)} className="text-textMuted hover:text-blue-600" title="Editar biografía">
                                        <LuPencil size={12} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Badges de Correo y Rol */}
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                            <div className="flex items-center gap-2 text-textMuted dark:text-gray-400 text-sm font-medium">
                                <LuMail size={14} className="text-blue-600 dark:text-cyan-400" />
                                {user?.email}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 ${rolConfig.badge}`}>
                                <RolIcon size={12} /> {rolConfig.name}
                            </span>
                        </div>

                        {/* Botón directo a Panel Admin si es Admin o Mod */}
                        {isAdminOrMod && (
                            <div className="pt-2">
                                <button
                                    onClick={() => navigate('/admin-panel')}
                                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                                >
                                    <LuShield size={16} /> Acceder al Panel de Administrador
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Resumen de Rachas */}
                    <div className="flex gap-4 p-4 bg-gray-100 dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/10 shrink-0">
                        <div className="text-center px-4">
                            <p className="text-[10px] font-black text-textMuted dark:text-gray-400 uppercase tracking-widest mb-1">Racha Actual</p>
                            <div className="flex items-center gap-1.5 justify-center">
                                <LuTrendingUp className="text-blue-600 dark:text-cyan-400" size={18} />
                                <span className="text-2xl font-black text-textPrimary dark:text-white">{user?.current_streak || 0}</span>
                            </div>
                        </div>
                        <div className="w-px bg-gray-300 dark:bg-white/10" />
                        <div className="text-center px-4">
                            <p className="text-[10px] font-black text-textMuted dark:text-gray-400 uppercase tracking-widest mb-1">Racha Máxima</p>
                            <div className="flex items-center gap-1.5 justify-center">
                                <LuAward className="text-amber-500" size={18} />
                                <span className="text-2xl font-black text-textPrimary dark:text-white">{user?.max_streak || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 1: DATOS BIOMÉTRICOS & CALCULADORA IMC */}
            <div className="glass-card border border-gray-200 dark:border-white/10 rounded-3xl p-8 space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/10 pb-4">
                    <div>
                        <h3 className="text-xl font-black text-textPrimary dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <LuActivity className="text-blue-600 dark:text-cyan-400" /> Datos Biométricos & Salud Física
                        </h3>
                        <p className="text-xs text-textMuted dark:text-gray-400 font-medium mt-0.5">
                            Métricas registradas al iniciar tu protocolo. El nivel de actividad y peso son modificables.
                        </p>
                    </div>
                    {imcData && (
                        <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 ${imcData.color}`}>
                            <LuHeart size={16} />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider">IMC: {imcData.value}</p>
                                <p className="text-xs font-bold">{imcData.label}</p>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSaveBiometrics} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                        {/* Peso */}
                        <div className="space-y-2">
                            <label className="h-6 flex items-end text-xs font-black uppercase tracking-widest text-textMuted dark:text-gray-400 gap-1">
                                <LuScale size={14} /> Peso Actual (kg)
                            </label>
                            <input 
                                type="number" 
                                step="0.1"
                                value={biometrics.peso}
                                onChange={(e) => setBiometrics({ ...biometrics, peso: e.target.value })}
                                placeholder="Ej: 72.5"
                                className="h-12 w-full px-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold text-textPrimary dark:text-white focus:outline-none focus:border-blue-600 transition-all text-center sm:text-left"
                            />
                        </div>

                        {/* Altura */}
                        <div className="space-y-2">
                            <label className="h-6 flex items-end text-xs font-black uppercase tracking-widest text-textMuted dark:text-gray-400 gap-1">
                                <LuRuler size={14} /> Altura (cm)
                            </label>
                            <input 
                                type="number" 
                                value={biometrics.altura}
                                onChange={(e) => setBiometrics({ ...biometrics, altura: e.target.value })}
                                placeholder="Ej: 175"
                                className="h-12 w-full px-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold text-textPrimary dark:text-white focus:outline-none focus:border-blue-600 transition-all text-center sm:text-left"
                            />
                        </div>

                        {/* Edad */}
                        <div className="space-y-2">
                            <label className="h-6 flex items-end text-xs font-black uppercase tracking-widest text-textMuted dark:text-gray-400">
                                Edad (Años)
                            </label>
                            <input 
                                type="number" 
                                value={biometrics.edad}
                                onChange={(e) => setBiometrics({ ...biometrics, edad: e.target.value })}
                                placeholder="Ej: 24"
                                className="h-12 w-full px-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold text-textPrimary dark:text-white focus:outline-none focus:border-blue-600 transition-all text-center sm:text-left"
                            />
                        </div>

                        {/* Género (No Modificable) */}
                        <div className="space-y-2">
                            <div className="h-6 flex items-end justify-between w-full">
                                <label className="text-xs font-black uppercase tracking-widest text-textMuted dark:text-gray-400">
                                    Género Biológico
                                </label>
                                <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                                    <LuInfo size={12} /> No modificable
                                </span>
                            </div>
                            <input 
                                type="text"
                                disabled
                                value={biometrics.genero || 'Masculino'}
                                className="h-12 w-full px-4 bg-gray-200/60 dark:bg-white/10 border border-gray-300 dark:border-white/10 rounded-2xl text-sm font-bold text-textMuted dark:text-gray-400 cursor-not-allowed text-center sm:text-left"
                            />
                        </div>

                        {/* Nivel de Actividad */}
                        <div className="space-y-2">
                            <label className="h-6 flex items-end text-xs font-black uppercase tracking-widest text-textMuted dark:text-gray-400">
                                Nivel de Actividad
                            </label>
                            <select 
                                value={biometrics.nivel_actividad}
                                onChange={(e) => setBiometrics({ ...biometrics, nivel_actividad: e.target.value })}
                                className="h-12 w-full px-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold text-textPrimary dark:text-white focus:outline-none focus:border-blue-600 transition-all"
                            >
                                <option value="Sedentario" className="bg-surface text-textPrimary">Sedentario (poco o nada)</option>
                                <option value="Moderado" className="bg-surface text-textPrimary">Moderado (1-3 días/sem)</option>
                                <option value="Activo" className="bg-surface text-textPrimary">Activo (4-5 días/sem)</option>
                                <option value="Muy Activo" className="bg-surface text-textPrimary">Muy Activo (6-7 días/sem)</option>
                            </select>
                        </div>

                        {/* Meta de Peso */}
                        <div className="space-y-2">
                            <label className="h-6 flex items-end text-xs font-black uppercase tracking-widest text-textMuted dark:text-gray-400">
                                Meta de Peso (Opcional, kg)
                            </label>
                            <input 
                                type="number" 
                                step="0.1"
                                value={biometrics.meta_peso}
                                onChange={(e) => setBiometrics({ ...biometrics, meta_peso: e.target.value })}
                                placeholder="Ej: 68.0"
                                className="h-12 w-full px-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold text-textPrimary dark:text-white focus:outline-none focus:border-blue-600 transition-all text-center sm:text-left"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={savingBiometrics}
                            className="px-6 py-3.5 bg-blue-600 text-white dark:bg-white dark:text-black font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 dark:shadow-white/10 hover:brightness-110 transition-all flex items-center gap-2"
                        >
                            {savingBiometrics ? <LuRefreshCw className="animate-spin" size={16} /> : <LuCheck size={16} />}
                            Guardar Métricas Biométricas
                        </button>
                    </div>
                </form>
            </div>

            {/* SECCIÓN 2: SEGURIDAD & CREDENCIALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cambiar Correo Electrónico */}
                <div className="glass-card border border-gray-200 dark:border-white/10 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-cyan-400 rounded-2xl">
                            <LuMail size={22} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-textPrimary dark:text-white">Correo Electrónico</h3>
                            <p className="text-xs text-textMuted dark:text-gray-400 font-medium">Verificación por email de seguridad.</p>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {!isChangingEmail ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                                    <p className="text-[10px] text-textMuted dark:text-gray-400 font-black uppercase tracking-widest mb-1">Correo Actual Registrado</p>
                                    <p className="text-sm font-bold text-textPrimary dark:text-white">{user?.email}</p>
                                </div>
                                <button 
                                    onClick={() => setIsChangingEmail(true)}
                                    className="w-full py-3.5 bg-gray-200 dark:bg-white/10 text-textPrimary dark:text-white rounded-2xl text-xs font-extrabold hover:bg-gray-300 dark:hover:bg-white/20 transition-all"
                                >
                                    Solicitar Cambio de Correo
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {emailStep === 1 ? (
                                    <form onSubmit={handleRequestEmailChange} className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-textMuted dark:text-gray-400 uppercase tracking-widest ml-1">Nuevo Correo Electrónico</label>
                                            <input 
                                                type="email" 
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm font-medium text-textPrimary dark:text-white focus:outline-none focus:border-blue-600"
                                                placeholder="nuevo_correo@ejemplo.com"
                                                required
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                type="submit" 
                                                disabled={loading}
                                                className="flex-1 py-3 bg-blue-600 text-white dark:bg-white dark:text-black rounded-2xl text-xs font-extrabold shadow-lg shadow-blue-500/20 dark:shadow-white/10 flex items-center justify-center gap-2"
                                            >
                                                {loading ? 'Enviando...' : 'Enviar Código OTP'} <LuArrowRight size={14} />
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => setIsChangingEmail(false)}
                                                className="px-5 py-3 bg-gray-200 dark:bg-white/10 rounded-2xl text-xs font-bold text-textPrimary dark:text-white"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={handleConfirmEmailChange} className="space-y-4">
                                        <p className="text-xs text-textMuted dark:text-gray-400 font-bold text-center">
                                            Enviamos un código de 6 dígitos a <strong className="text-textPrimary dark:text-white">{newEmail}</strong>
                                        </p>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-textMuted dark:text-gray-400 uppercase tracking-widest ml-1">Código de 6 Dígitos</label>
                                            <input 
                                                type="text" 
                                                value={emailOtp}
                                                onChange={(e) => setEmailOtp(e.target.value)}
                                                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-center text-2xl font-black tracking-[0.5em] text-textPrimary dark:text-white focus:outline-none focus:border-blue-600"
                                                placeholder="••••••"
                                                maxLength={6}
                                                required
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="w-full py-3 bg-emerald-600 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-emerald-500/20"
                                        >
                                            {loading ? 'Verificando...' : 'Confirmar Cambio de Correo'}
                                        </button>
                                        <div className="flex justify-between items-center pt-1">
                                            <button 
                                                type="button"
                                                disabled={resendCooldown > 0 || loading}
                                                onClick={() => handleRequestEmailChange()}
                                                className="text-xs font-bold text-blue-600 dark:text-cyan-400 disabled:text-gray-400"
                                            >
                                                {resendCooldown > 0 ? `Reenviar código (${resendCooldown}s)` : 'Reenviar Código'}
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => setEmailStep(1)}
                                                className="text-xs text-textMuted font-bold hover:text-textPrimary dark:hover:text-white"
                                            >
                                                Cambiar correo
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Cambiar Contraseña Directamente */}
                <div className="glass-card border border-gray-200 dark:border-white/10 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                            <LuLock size={22} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-textPrimary dark:text-white">Seguridad de la Cuenta</h3>
                            <p className="text-xs text-textMuted dark:text-gray-400 font-medium">Actualización directa de contraseña.</p>
                        </div>
                    </div>

                    {!isChangingPassword ? (
                        <div className="space-y-3">
                            <button 
                                onClick={() => setIsChangingPassword(true)}
                                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <LuLock size={16} /> Cambiar Contraseña Directamente
                            </button>
                            <button 
                                onClick={() => navigate('/forgot-password')}
                                className="w-full flex items-center justify-between p-3.5 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-xs font-bold text-textMuted dark:text-gray-300"
                            >
                                Olvidé mi contraseña (Página de recuperación con OTP)
                                <LuArrowRight size={14} />
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleDirectPasswordChange} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-textMuted dark:text-gray-400 uppercase tracking-widest ml-1">Contraseña Actual *</label>
                                <input 
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-2.5 text-xs font-medium text-textPrimary dark:text-white focus:outline-none focus:border-amber-500"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-textMuted dark:text-gray-400 uppercase tracking-widest ml-1">Nueva Contraseña (mín. 6 carac.) *</label>
                                <input 
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-2.5 text-xs font-medium text-textPrimary dark:text-white focus:outline-none focus:border-amber-500"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-textMuted dark:text-gray-400 uppercase tracking-widest ml-1">Confirmar Nueva Contraseña *</label>
                                <input 
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-2.5 text-xs font-medium text-textPrimary dark:text-white focus:outline-none focus:border-amber-500"
                                    required
                                />
                            </div>

                            <div className="flex gap-2 pt-1">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 bg-amber-500 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-amber-500/20"
                                >
                                    {loading ? 'Guardando...' : 'Actualizar Contraseña'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsChangingPassword(false)}
                                    className="px-4 py-3 bg-gray-200 dark:bg-white/10 rounded-2xl text-xs font-bold text-textPrimary dark:text-white"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="pt-2">
                        <button 
                            onClick={logout}
                            className="w-full flex items-center justify-between p-3.5 bg-red-500/10 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all text-xs font-bold text-red-600 dark:text-red-400"
                        >
                            Cerrar Sesión Global
                            <LuLogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL 1: RECORTE DE FOTO DE PERFIL (AVATAR CROPPER) */}
            {cropperModal.open && createPortal(
                <AnimatePresence mode="wait">
                    <div key="cropper-overlay" className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            key="cropper-card"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-surface dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-3xl p-6 max-w-md w-full text-center space-y-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center border-b border-gray-200 dark:border-white/10 pb-3">
                                <h3 className="text-lg font-black text-textPrimary dark:text-white uppercase tracking-tight flex items-center gap-2">
                                    <LuCrop className="text-blue-600 dark:text-cyan-400" /> Recortar Foto de Perfil
                                </h3>
                                <button onClick={() => setCropperModal({ open: false, imageSrc: null })} className="text-textMuted hover:text-red-500">
                                    <LuX size={20} />
                                </button>
                            </div>

                            {/* Área de Previsualización Circular de Recorte */}
                            <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-blue-600 dark:border-cyan-400 shadow-2xl bg-black/50 flex items-center justify-center">
                                {cropperModal.imageSrc && (
                                    <img 
                                        src={cropperModal.imageSrc} 
                                        alt="Recorte avatar"
                                        style={{ transform: `scale(${zoomScale})` }}
                                        className="w-full h-full object-cover transition-transform duration-100"
                                    />
                                )}
                            </div>

                            {/* Control de Zoom */}
                            <div className="space-y-2 max-w-xs mx-auto">
                                <div className="flex justify-between text-xs font-bold text-textMuted dark:text-gray-400">
                                    <span className="flex items-center gap-1"><LuZoomIn size={12} /> Zoom</span>
                                    <span>{(zoomScale * 100).toFixed(0)}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="3" 
                                    step="0.05"
                                    value={zoomScale}
                                    onChange={(e) => setZoomScale(parseFloat(e.target.value))}
                                    className="w-full accent-blue-600 dark:accent-cyan-400"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleApplyCrop}
                                    disabled={loading}
                                    className="flex-1 py-3.5 bg-blue-600 text-white dark:bg-white dark:text-black font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-500/20"
                                >
                                    {loading ? 'Aplicando Recorte...' : 'Cortar y Aplicar Foto'}
                                </button>
                                <button
                                    onClick={() => setCropperModal({ open: false, imageSrc: null })}
                                    className="px-5 py-3.5 bg-gray-200 dark:bg-white/10 font-bold text-xs rounded-2xl text-textPrimary dark:text-white"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </AnimatePresence>,
                document.body
            )}

            {/* MODAL 2: NOTIFICACIÓN POP-UP FLOTANTE DE PANTALLA COMPLETA */}
            {popupModal.open && createPortal(
                <AnimatePresence mode="wait">
                    <div key="popup-overlay" className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            key="popup-card"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-surface dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-3xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl relative"
                        >
                            <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center border ${
                                popupModal.type === 'success' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
                                popupModal.type === 'error' ? 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30' :
                                'bg-blue-500/20 text-blue-600 dark:text-cyan-400 border-blue-500/30'
                            }`}>
                                {popupModal.type === 'success' ? <LuCircleCheck size={28} /> :
                                 popupModal.type === 'error' ? <LuCircleAlert size={28} /> :
                                 <LuInfo size={28} />}
                            </div>

                            <div>
                                <h3 className="text-xl font-extrabold text-textPrimary dark:text-white">{popupModal.title}</h3>
                                <p className="text-xs font-medium text-textMuted dark:text-gray-300 mt-2 leading-relaxed">{popupModal.message}</p>
                            </div>

                            <button
                                onClick={closePopup}
                                className="w-full py-3.5 bg-blue-600 text-white dark:bg-white dark:text-black font-extrabold text-xs rounded-2xl shadow-lg hover:brightness-110 transition-all"
                            >
                                Entendido
                            </button>
                        </motion.div>
                    </div>
                </AnimatePresence>,
                document.body
            )}
        </motion.div>
    );
}
