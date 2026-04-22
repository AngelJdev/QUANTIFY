import React from 'react';
import { motion } from 'framer-motion';
import { 
    LuUsers, LuActivity, LuTarget, 
    LuUserCog, LuTrash2, LuShield, 
    LuMail, LuCalendar,
    LuArrowUpRight, LuTrendingUp
} from 'react-icons/lu';

// Mock Data for Top Metrics
const metrics = [
    { 
        id: 1, 
        title: 'Usuarios Totales', 
        value: '1,245', 
        change: '+12.5%', 
        icon: LuUsers, 
        color: 'text-blue-500', 
        bg: 'bg-blue-500/10' 
    },
    { 
        id: 2, 
        title: 'Hábitos Activos', 
        value: '8,302', 
        change: '+5.2%', 
        icon: LuActivity, 
        color: 'text-emerald-500', 
        bg: 'bg-emerald-500/10' 
    },
    { 
        id: 3, 
        title: 'Adherencia Promedio', 
        value: '76%', 
        change: '+2.1%', 
        icon: LuTarget, 
        color: 'text-amber-500', 
        bg: 'bg-amber-500/10' 
    }
];

// Mock Data for Users Table
const mockUsers = [
    { id: 1, nombre: 'Admin Tester', email: 'admin_tester@quantify.ai', fecha_registro: '2026-03-12', rol: 'ADMIN', status: 'Active' },
    { id: 2, nombre: 'Ana García', email: 'ana.garcia@gmail.com', fecha_registro: '2026-04-01', rol: 'USUARIO', status: 'Active' },
    { id: 3, nombre: 'Carlos Ruiz', email: 'c.ruiz@outlook.com', fecha_registro: '2026-04-05', rol: 'USUARIO', status: 'Inactive' },
    { id: 4, nombre: 'Elena Vega', email: 'elena_v@proton.me', fecha_registro: '2026-04-07', rol: 'MODERADOR', status: 'Active' },
    { id: 5, nombre: 'David Soto', email: 'dsoto@quantify.ai', fecha_registro: '2026-04-10', rol: 'USUARIO', status: 'Active' },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 260, damping: 20 }
    }
};

export default function AdminDashboard() {
    return (
        <div className="space-y-8 pb-12">
            <header>
                <h1 className="text-3xl font-black text-textPrimary dark:text-white tracking-tight">
                    Panel de Control
                </h1>
                <p className="text-textMuted text-sm font-medium mt-1">
                    Gestión global de la plataforma e indicadores de rendimiento.
                </p>
            </header>

            {/* Metrics Cards */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {metrics.map((metric) => (
                    <motion.div
                        key={metric.id}
                        variants={itemVariants}
                        className="bg-surface dark:bg-zinc-900 border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                        <div className="flex justify-between items-start relative z-10">
                            <div className={`p-3 rounded-2xl ${metric.bg} ${metric.color}`}>
                                <metric.icon size={24} />
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                <LuTrendingUp size={10} />
                                {metric.change}
                            </div>
                        </div>
                        
                        <div className="mt-4 relative z-10">
                            <p className="text-xs font-bold text-textMuted uppercase tracking-widest">{metric.title}</p>
                            <h3 className="text-4xl font-black text-textPrimary dark:text-white mt-1">
                                {metric.value}
                            </h3>
                        </div>

                        {/* Decoration SVG */}
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <metric.icon size={120} />
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* User Management Table */}
            <motion.section 
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="bg-surface dark:bg-zinc-900 border border-gray-100 dark:border-white/5 rounded-[2.5rem] overflow-hidden"
            >
                <div className="p-8 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-textPrimary dark:text-white flex items-center gap-2">
                            <LuUsers className="text-primary" /> Gestión de Usuarios
                        </h2>
                        <p className="text-xs text-textMuted mt-1">Lista completa de usuarios registrados y permisos.</p>
                    </div>
                    <div className="relative w-full md:w-64">
                        <input 
                            type="text" 
                            placeholder="Buscar usuario..." 
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 dark:border-white/5">
                                <th className="px-8 py-5 text-[10px] font-black text-textMuted uppercase tracking-widest">Usuario</th>
                                <th className="px-8 py-5 text-[10px] font-black text-textMuted uppercase tracking-widest">Rol</th>
                                <th className="px-8 py-5 text-[10px] font-black text-textMuted uppercase tracking-widest">Registro</th>
                                <th className="px-8 py-5 text-[10px] font-black text-textMuted uppercase tracking-widest">Estado</th>
                                <th className="px-8 py-5 text-[10px] font-black text-textMuted uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {mockUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20">
                                                {user.nombre.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-textPrimary dark:text-white">{user.nombre}</p>
                                                <p className="text-xs text-textMuted truncate max-w-[180px]">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-tighter ${
                                            user.rol === 'ADMIN' 
                                            ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' 
                                            : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                        }`}>
                                            <LuShield size={10} />
                                            {user.rol}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-textMuted font-medium text-xs">
                                            <LuCalendar size={12} />
                                            {user.fecha_registro}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-success' : 'bg-gray-400'}`} />
                                            <span className="text-xs font-bold text-textMuted">{user.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                title="Editar Rol"
                                                className="p-2 hover:bg-primary/10 text-textMuted hover:text-primary rounded-lg transition-colors border border-transparent hover:border-primary/20"
                                            >
                                                <LuUserCog size={16} />
                                            </button>
                                            <button 
                                                title="Suspender Usuario"
                                                className="p-2 hover:bg-danger/10 text-textMuted hover:text-danger rounded-lg transition-colors border border-transparent hover:border-danger/20"
                                            >
                                                <LuTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-6 bg-gray-50/50 dark:bg-white/[0.01] border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                    <p className="text-xs text-textMuted font-medium">Mostrando 5 de 1,245 usuarios</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-bold hover:bg-white/5 disabled:opacity-50 transition-all">Anterior</button>
                        <button className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:brightness-110 transition-all shadow-sm">Siguiente</button>
                    </div>
                </div>
            </motion.section>
        </div>
    );
}
