import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 p-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <p className="text-textPrimary dark:text-white font-bold text-sm mb-1">{label}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Completado: <span className="font-bold text-primary dark:text-white">{payload[0].value}</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

const AdherenceChart = ({ data }) => {
    return (
        <div className="h-[300px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-chart-primary)" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="var(--color-chart-primary)" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis 
                        dataKey="fecha" 
                        stroke="var(--color-chart-text)" 
                        tick={{fill: 'var(--color-chart-text)', fontSize: 12, fontWeight: 500}} 
                        tickFormatter={(str) => {
                            const date = new Date(str);
                            return `${date.getDate()}/${date.getMonth()+1}`;
                        }}
                    />
                    <YAxis stroke="var(--color-chart-text)" tick={{fill: 'var(--color-chart-text)', fontSize: 12, fontWeight: 500}} />
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" vertical={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                        type="monotone" 
                        dataKey="valor" 
                        stroke="#10B981" 
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
