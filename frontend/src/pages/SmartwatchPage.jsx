import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiWatch, FiWifi, FiCheckCircle, FiAlertTriangle, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { verifyPairingCode, getSmartwatchDashboard, unlinkSmartwatch } from '../services/smartwatchService';
import ConfirmModal from '../components/ConfirmModal';

const SmartwatchPage = () => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [status, setStatus] = useState('idle'); // idle | loading | success | error | linked
    const [errorMsg, setErrorMsg] = useState('');
    const [linkedDevice, setLinkedDevice] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        title: '',
        message: '',
        variant: 'danger',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        showCancel: true,
        onConfirm: null
    });
    const inputRefs = useRef([]);

    useEffect(() => {
        checkLinkedDevice();

        // Polling fallback for real-time updates in serverless environments
        const interval = setInterval(() => {
            checkLinkedDevice();
        }, 4000);

        let socketInstance;
        import('../services/api').then(({ default: apiInstance }) => {
            apiInstance.get('/auth/profile').then(res => {
                const uid = res.data?.data?.user?.id;
                import('../services/socket').then(({ initSocket }) => {
                    socketInstance = initSocket(uid);
                    socketInstance?.on('smartwatch_unlinked', () => {
                        setLinkedDevice(null);
                        setDashboardData(null);
                        setStatus('idle');
                    });
                    socketInstance?.on('smartwatch_linked', () => {
                        checkLinkedDevice();
                    });
                    socketInstance?.on('habit_updated', () => {
                        checkLinkedDevice();
                    });
                });
            }).catch(() => {});
        });

        return () => {
            clearInterval(interval);
            socketInstance?.off('smartwatch_unlinked');
            socketInstance?.off('smartwatch_linked');
            socketInstance?.off('habit_updated');
        };
    }, []);

    const checkLinkedDevice = async () => {
        try {
            const res = await getSmartwatchDashboard();
            if (res.success && res.data) {
                setLinkedDevice(res.data.user);
                setDashboardData(res.data);
                setStatus('linked');
            } else {
                setLinkedDevice(null);
                setDashboardData(null);
                setStatus('idle');
            }
        } catch {
            // No device linked — show pairing UI
            setLinkedDevice(null);
            setDashboardData(null);
            setStatus('idle');
        }
    };

    const handleInputChange = (index, value) => {
        if (!/^[a-zA-Z0-9]?$/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value.toUpperCase();
        setCode(newCode);

        // Auto-advance to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 filled
        if (value && index === 5 && newCode.every(c => c !== '')) {
            handleSubmit(newCode.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
        if (pasted.length === 6) {
            setCode(pasted.split(''));
            handleSubmit(pasted);
        }
    };

    const handleSubmit = async (codeStr) => {
        const fullCode = codeStr || code.join('');
        if (fullCode.length !== 6) return;

        setStatus('loading');
        setErrorMsg('');

        try {
            const res = await verifyPairingCode(fullCode);
            if (res.success) {
                setStatus('success');
                setLinkedDevice({ nombre: res.data?.userName || 'Dispositivo' });
                setTimeout(() => {
                    checkLinkedDevice();
                }, 2000);
            } else {
                setStatus('error');
                setErrorMsg(res.message || 'Código inválido o expirado');
            }
        } catch (err) {
            setStatus('error');
            setErrorMsg(err.response?.data?.message || 'Error de conexión con el servidor');
        }
    };

    const resetCode = () => {
        setCode(['', '', '', '', '', '']);
        setStatus('idle');
        setErrorMsg('');
        inputRefs.current[0]?.focus();
    };

    const handleUnlink = () => {
        setConfirmModal({
            open: true,
            title: 'Desvincular Smartwatch',
            message: '¿Seguro que deseas desvincular tu Smartwatch? Dejarás de recibir sincronizaciones biométricas en tiempo real.',
            variant: 'danger',
            confirmText: 'Desvincular Dispositivo',
            cancelText: 'Cancelar',
            showCancel: true,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, open: false }));
                try {
                    setStatus('loading');
                    await unlinkSmartwatch();
                    setLinkedDevice(null);
                    setDashboardData(null);
                    resetCode();
                } catch (err) {
                    setStatus('linked');
                    setConfirmModal({
                        open: true,
                        title: 'Error al Desvincular',
                        message: err.response?.data?.message || 'No se pudo desvincular el dispositivo.',
                        variant: 'warning',
                        confirmText: 'Entendido',
                        cancelText: 'Cerrar',
                        showCancel: false,
                        onConfirm: () => setConfirmModal(prev => ({ ...prev, open: false }))
                    });
                }
            }
        });
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-cyan-500/10 dark:bg-cyan-400/10 rounded-2xl">
                        <FiWatch className="w-7 h-7 text-cyan-500 dark:text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Smartwatch</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Vincula tu reloj QUANTIFY para seguir tus hábitos desde la muñeca</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Pairing Card */}
                    <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200 dark:border-white/5 p-8 shadow-sm">
                        <AnimatePresence mode="wait">
                            {status === 'linked' ? (
                                <LinkedDeviceView
                                    key="linked"
                                    device={linkedDevice}
                                    dashboard={dashboardData}
                                    onUnlink={handleUnlink}
                                />
                            ) : status === 'success' ? (
                                <SuccessView key="success" device={linkedDevice} />
                            ) : (
                                <PairingView
                                    key="pairing"
                                    code={code}
                                    status={status}
                                    errorMsg={errorMsg}
                                    inputRefs={inputRefs}
                                    onInputChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    onPaste={handlePaste}
                                    onSubmit={() => handleSubmit()}
                                    onReset={resetCode}
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right: Instructions */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200 dark:border-white/5 p-8 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">¿Cómo vincular?</h3>
                            <div className="space-y-5">
                                {[
                                    { step: '1', title: 'Abre QUANTIFY en tu reloj', desc: 'La app mostrará un código de 6 caracteres.' },
                                    { step: '2', title: 'Ingresa el código aquí', desc: 'Escríbelo o pégalo en los campos de la izquierda.' },
                                    { step: '3', title: '¡Listo!', desc: 'Tu reloj se sincronizará automáticamente con tu cuenta.' },
                                ].map((item) => (
                                    <div key={item.step} className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/10 dark:bg-cyan-400/10 flex items-center justify-center">
                                            <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{item.step}</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 dark:from-cyan-400/5 dark:to-blue-400/5 rounded-3xl border border-cyan-200/50 dark:border-cyan-500/10 p-8">
                            <div className="flex items-start gap-3">
                                <FiWifi className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">Conexión WiFi requerida</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        Tu reloj necesita estar conectado a una red WiFi para la vinculación inicial
                                        y la sincronización de datos. Los hábitos registrados sin conexión se
                                        sincronizarán automáticamente cuando el WiFi esté disponible.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
            
            <ConfirmModal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                variant={confirmModal.variant}
                confirmText={confirmModal.confirmText}
                cancelText={confirmModal.cancelText}
                showCancel={confirmModal.showCancel}
            />
        </>
    );
};

/* ─── Sub-Components ─── */

const PairingView = ({ code, status, errorMsg, inputRefs, onInputChange, onKeyDown, onPaste, onSubmit, onReset }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-cyan-500/10 dark:bg-cyan-400/10 rounded-full flex items-center justify-center">
                <FiWatch className="w-8 h-8 text-cyan-500 dark:text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vincular Smartwatch</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ingresa el código que aparece en tu reloj</p>
        </div>

        {/* Code Input */}
        <div className="flex justify-center gap-2.5 mb-6" onPaste={onPaste}>
            {code.map((char, i) => (
                <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    maxLength={1}
                    value={char}
                    onChange={e => onInputChange(i, e.target.value)}
                    onKeyDown={e => onKeyDown(i, e)}
                    disabled={status === 'loading'}
                    className={`w-12 h-14 text-center text-xl font-mono font-bold rounded-xl border-2 transition-all outline-none
                        ${status === 'error'
                            ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                            : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                        }
                        ${status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    autoFocus={i === 0}
                />
            ))}
        </div>

        {/* Error message */}
        <AnimatePresence>
            {status === 'error' && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 justify-center mb-4 text-red-500 dark:text-red-400"
                >
                    <FiAlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">{errorMsg}</span>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
            {status === 'error' && (
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10"
                >
                    <FiRefreshCw className="w-4 h-4" /> Reintentar
                </button>
            )}
            <button
                onClick={onSubmit}
                disabled={code.some(c => !c) || status === 'loading'}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all
                    ${code.every(c => c) && status !== 'loading'
                        ? 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/25'
                        : 'bg-gray-200 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    }`}
            >
                {status === 'loading' ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verificando...
                    </>
                ) : (
                    'Vincular'
                )}
            </button>
        </div>
    </motion.div>
);

const SuccessView = ({ device }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="text-center py-8"
    >
        <div className="w-20 h-20 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
            <FiCheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">¡Vinculado exitosamente!</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {device?.nombre || 'Tu dispositivo'} está conectado a tu cuenta
        </p>
    </motion.div>
);

const LinkedDeviceView = ({ device, dashboard, onUnlink }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 rounded-full flex items-center justify-center">
                <FiWatch className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Smartwatch Vinculado</h2>
            <p className="text-sm text-green-500 font-medium mt-1">● Conectado</p>
        </div>

        {dashboard?.stats && (
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 text-center border border-gray-100 dark:border-white/5">
                    <p className="text-2xl font-bold text-cyan-500">{dashboard.stats.completedToday}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-1">Completados hoy</p>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 text-center border border-gray-100 dark:border-white/5">
                    <p className="text-2xl font-bold text-cyan-500">{dashboard.stats.totalHabits}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-1">Hábitos totales</p>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 text-center border border-gray-100 dark:border-white/5">
                    <p className="text-2xl font-bold text-orange-500">{dashboard.stats.completionPercent}%</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-1">Completado</p>
                </div>
            </div>
        )}

        {dashboard?.user && (
            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/5 mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Racha actual</p>
                        <p className="text-lg font-bold text-orange-500">🔥 {dashboard.user.current_streak} días</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Mejor racha</p>
                        <p className="text-lg font-bold text-cyan-500">⭐ {dashboard.user.max_streak} días</p>
                    </div>
                </div>
            </div>
        )}

        <button
            onClick={onUnlink}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-sm transition-all border border-red-200 dark:border-red-500/20"
        >
            <FiTrash2 className="w-4 h-4" /> Desvincular Smartwatch
        </button>
    </motion.div>
);

export default SmartwatchPage;
