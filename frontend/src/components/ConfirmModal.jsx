import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiTrash2, FiInfo, FiCheckCircle, FiX } from 'react-icons/fi';

const VARIANT_CONFIGS = {
    danger: {
        bgIcon: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        confirmBtn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20',
        Icon: FiTrash2
    },
    warning: {
        bgIcon: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        confirmBtn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20',
        Icon: FiAlertTriangle
    },
    info: {
        bgIcon: 'bg-accent/10 text-accent border-accent/20',
        confirmBtn: 'bg-accent hover:bg-accent/90 text-white shadow-accent/20',
        Icon: FiInfo
    }
};

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = '¿Estás seguro?',
    message = 'Esta acción no se puede deshacer.',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger',
    isLoading = false,
    showCancel = true
}) {
    if (!isOpen) return null;

    const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.danger;
    const { Icon, bgIcon, confirmBtn } = config;

    return typeof document !== 'undefined' ? createPortal(
        <AnimatePresence>
            <div 
                onClick={onClose}
                className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
            >
                <motion.div
                    onClick={(e) => e.stopPropagation()}
                    initial={{ scale: 0.9, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 15 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="bg-zinc-900 border border-white/15 rounded-3xl p-6 md:p-8 max-w-md w-full text-white shadow-2xl relative space-y-6"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white text-sm font-bold bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all"
                    >
                        <FiX size={16} />
                    </button>

                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center shadow-lg ${bgIcon}`}>
                            <Icon size={32} />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-white tracking-tight">
                                {title}
                            </h3>
                            <p className="text-xs font-medium text-gray-400 leading-relaxed max-w-xs mx-auto">
                                {message}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        {showCancel && (
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="flex-1 py-3 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-gray-300 transition-all uppercase tracking-wider"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs shadow-lg transition-all uppercase tracking-wider flex items-center justify-center gap-2 ${confirmBtn}`}
                        >
                            {isLoading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    ) : null;
}
