import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const CustomTooltip = ({ active, payload, label, isGlobal }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 p-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <p className="text-textPrimary dark:text-white font-bold text-sm mb-2 uppercase tracking-tighter">{label}</p>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success"></div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {isGlobal ? 'Hábitos Logrados: ' : 'Completado: '}
                            <span className="font-bold text-primary dark:text-white">
                                {isGlobal ? `${payload[0].value} de ${payload[0].payload.total}` : payload[0].value}
                            </span>
                        </p>
                    </div>
                    {isGlobal && (
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-primary opacity-30"></div>
                             <p className="text-gray-400 text-xs">
                                Eficiencia: <span className="font-bold text-white">{payload[0].payload.porcentaje}%</span>
                             </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

const AdherenceChart = ({ data, isGlobal }) => {
    return (
        <div className="h-[350px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={isGlobal ? "#3B82F6" : "#10B981"} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={isGlobal ? "#3B82F6" : "#10B981"} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis 
                        dataKey="fecha" 
                        stroke="var(--color-chart-text)" 
                        tick={{fill: 'var(--color-chart-text)', fontSize: 11, fontWeight: 600}} 
                        tickFormatter={(str) => {
                            const date = new Date(str);
                            return `${date.getDate()}/${date.getMonth()+1}`;
                        }}
                    />
                    <YAxis 
                        stroke="var(--color-chart-text)" 
                        tick={{fill: 'var(--color-chart-text)', fontSize: 12, fontWeight: 500}}
                        domain={isGlobal ? [0, 'dataMax + 1'] : [0, 'auto']}
                    />
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" vertical={false} opacity={0.1} />
                    <Tooltip content={<CustomTooltip isGlobal={isGlobal} />} />
                    <Area 
                        type="monotone" 
                        dataKey={isGlobal ? "completados" : "valor"} 
                        stroke={isGlobal ? "#3B82F6" : "#10B981"} 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorValor)" 
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AdherenceChart;
