import { useState, useEffect, useRef, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { FiTv, FiWifi, FiCheckCircle, FiAlertTriangle, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { verifySmartTVCode, getSmartTVDashboard, unlinkSmartTV } from '../services/smarttvService';
import ConfirmModal from '../components/ConfirmModal';

const SmartTVPage = () => {
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

    const checkLinkedDevice = useCallback(async () => {
        try {
            const data = await getSmartTVDashboard();
            if (data.success && data.is_linked && data.data) {
                setLinkedDevice({ nombre: 'QUANTIFY Smart TV' });
                setDashboardData(data.data);
                setStatus('linked');
            } else {
                setLinkedDevice(null);
                setDashboardData(null);
                setStatus('idle');
            }
        } catch {
            setLinkedDevice(null);
            setDashboardData(null);
            setStatus('idle');
        }
    }, []);

    useEffect(() => {
        const initialCheck = window.setTimeout(checkLinkedDevice, 0);

        let socketInstance;
        import('../services/api').then(({ default: apiInstance }) => {
            apiInstance.get('/auth/profile').then(res => {
                const uid = res.data?.data?.user?.id;
                import('../services/socket').then(({ initSocket }) => {
                    socketInstance = initSocket(uid);
                    socketInstance?.on('smarttv_unlinked', () => {
                        setLinkedDevice(null);
                        setDashboardData(null);
                        setStatus('idle');
                    });
                    socketInstance?.on('smarttv_linked', () => {
                        checkLinkedDevice();
                    });
                });
            }).catch(() => {});
        });

        return () => {
            window.clearTimeout(initialCheck);
            socketInstance?.off('smarttv_unlinked');
            socketInstance?.off('smarttv_linked');
        };
    }, [checkLinkedDevice]);

    const handleInputChange = (index, value) => {
        const val = value.toUpperCase().slice(-1);
        const newCode = [...code];
        newCode[index] = val;
        setCode(newCode);

        if (val && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        if (newCode.every(c => c !== '')) {
            handleCodeSubmit(newCode.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (pasted.length >= 6) {
            const chars = pasted.slice(0, 6).split('');
            setCode(chars);
            inputRefs.current[5]?.focus();
            handleCodeSubmit(chars.join(''));
        }
    };

    const handleCodeSubmit = async (fullCode) => {
        const pairingCode = fullCode || code.join('');
        if (pairingCode.length !== 6) return;

        setStatus('loading');
        setErrorMsg('');

        try {
            const res = await verifySmartTVCode(pairingCode);
            if (res.success) {
                setStatus('success');
                setLinkedDevice({ nombre: res.data?.deviceName || 'QUANTIFY Smart TV' });
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
            title: 'Desvincular Smart TV',
            message: '¿Seguro que deseas desvincular tu Smart TV? Dejará de recibir actualizaciones de tu cuenta.',
            variant: 'danger',
            confirmText: 'Desvincular Televisor',
            cancelText: 'Cancelar',
            showCancel: true,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, open: false }));
                try {
                    setStatus('loading');
                    await unlinkSmartTV();
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
            <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-purple-500/10 dark:bg-purple-400/10 rounded-2xl">
                        <FiTv className="w-7 h-7 text-purple-500 dark:text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Smart TV</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Vincula tu televisor para visualizar métricas y progresos en pantalla gigante</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Pairing Card */}
                    <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200 dark:border-white/5 p-8 shadow-sm">
                        <AnimatePresence mode="wait">
                            {status === 'linked' || linkedDevice ? (
                                <LinkedDeviceView
                                    key="linked"
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
                                    onSubmit={() => handleCodeSubmit()}
                                    onReset={resetCode}
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right: Instructions */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200 dark:border-white/5 p-8 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">¿Cómo vincular tu Smart TV?</h3>
                            <div className="space-y-5">
                                {[
                                    { step: '1', title: 'Abre QUANTIFY en tu Smart TV', desc: 'Inicia la aplicación de QUANTIFY en tu televisor Android TV.' },
                                    { step: '2', title: 'Obtén el código de 6 caracteres', desc: 'En la pantalla principal del televisor aparecerá un código en grande.' },
                                    { step: '3', title: 'Ingresa el código a la izquierda', desc: 'Escribe el código para conectar la TV a tu cuenta en segundos.' },
                                    { step: '4', title: '¡Visualiza todo en grande!', desc: 'Tus gráficos y hábitos se actualizarán automáticamente en el televisor.' }
                                ].map((item) => (
                                    <div key={item.step} className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/10 dark:bg-purple-400/10 flex items-center justify-center">
                                            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{item.step}</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500/5 to-cyan-500/5 dark:from-purple-400/5 dark:to-cyan-400/5 rounded-3xl border border-purple-200/50 dark:border-purple-500/10 p-8">
                            <div className="flex items-start gap-3">
                                <FiWifi className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">Sincronización Multidispositivo</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        Tu Smart TV consulta automáticamente tus avances para mantener visibles tus hábitos, métricas y logros recientes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Motion.div>

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
    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/10 dark:bg-purple-400/10 rounded-full flex items-center justify-center">
                <FiTv className="w-8 h-8 text-purple-500 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vincular Smart TV</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ingresa el código de 6 caracteres que aparece en tu televisor</p>
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
                    className="w-11 h-14 text-center text-xl font-mono font-bold uppercase rounded-xl
                             bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
                             text-gray-900 dark:text-white
                             focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none
                             transition-all"
                />
            ))}
        </div>

        {/* Error message */}
        {status === 'error' && (
            <Motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 p-3 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-semibold text-center"
            >
                <FiAlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
            </Motion.div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-3">
            {code.some(c => c) && (
                <button
                    onClick={onReset}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors flex items-center gap-1.5"
                >
                    <FiRefreshCw className="w-4 h-4" /> Limpiar
                </button>
            )}
            <button
                onClick={onSubmit}
                disabled={code.some(c => !c) || status === 'loading'}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all
                    ${code.every(c => c) && status !== 'loading'
                        ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-gray-200 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    }`}
            >
                {status === 'loading' ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verificando...
                    </>
                ) : (
                    'Vincular TV'
                )}
            </button>
        </div>
    </Motion.div>
);

const SuccessView = ({ device }) => (
    <Motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="text-center py-8"
    >
        <div className="w-20 h-20 mx-auto mb-6 bg-purple-500/10 rounded-full flex items-center justify-center">
            <FiCheckCircle className="w-10 h-10 text-purple-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">¡Smart TV Vinculada!</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {device?.nombre || 'Tu televisor'} está conectado y listo para mostrar tus datos.
        </p>
    </Motion.div>
);

const LinkedDeviceView = ({ dashboard, onUnlink }) => (
    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/10 rounded-full flex items-center justify-center">
                <FiTv className="w-8 h-8 text-purple-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Smart TV Conectada</h2>
            <p className="text-sm text-purple-500 font-medium mt-1">● Vinculación activa</p>
        </div>

        {dashboard?.stats && (
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 text-center border border-gray-100 dark:border-white/5">
                    <p className="text-2xl font-bold text-purple-500">{dashboard.stats.completedToday}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-1">Completados hoy</p>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 text-center border border-gray-100 dark:border-white/5">
                    <p className="text-2xl font-bold text-cyan-500">{dashboard.stats.totalHabits}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-1">Hábitos totales</p>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 text-center border border-gray-100 dark:border-white/5">
                    <p className="text-2xl font-bold text-amber-500">{dashboard.stats.completionPercent}%</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-1">Cumplimiento</p>
                </div>
            </div>
        )}

        <button
            onClick={onUnlink}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-sm transition-all border border-red-200 dark:border-red-500/20"
        >
            <FiTrash2 className="w-4 h-4" /> Desvincular Smart TV
        </button>
    </Motion.div>
);

export default SmartTVPage;
