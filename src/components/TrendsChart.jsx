import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingDown } from 'lucide-react';

const TrendsChart = ({ history, totalDebt, totalPaid }) => {
    const data = useMemo(() => {
        // 1. Reconstruct history
        // We have current Total Debt. We need to go BACKWARDS to find initial debt.
        // Or we can just plot "Total Paid Over Time" which is easier and always goes up.
        // BUT "Burn down" is cooler. Let's try to approximate "Debt Remaining".

        // Assuming Initial Total Debt = Current Total Debt + Total Paid So Far.
        const initialTotalDebt = totalDebt + totalPaid;

        // Sort payments by date
        const sortedPayments = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));

        let currentDebt = initialTotalDebt;
        const chartData = [];

        // Add Start Point
        const startDate = sortedPayments.length > 0 ? new Date(sortedPayments[0].date) : new Date();
        startDate.setDate(startDate.getDate() - 1); // Day before first payment
        chartData.push({
            date: startDate.toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' }),
            debt: currentDebt,
            ideal: currentDebt
        });

        sortedPayments.forEach((payment, index) => {
            currentDebt -= parseFloat(payment.amount);
            const idealDrop = initialTotalDebt - ((initialTotalDebt / Math.max(1, sortedPayments.length)) * (index + 1)); // Simple linear ideal line

            chartData.push({
                date: new Date(payment.date).toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' }),
                debt: currentDebt < 0 ? 0 : currentDebt, // Sanity check
                ideal: idealDrop < 0 ? 0 : idealDrop
            });
        });

        // Add "Today"
        if (sortedPayments.length > 0) {
            chartData.push({
                date: 'Teraz',
                debt: totalDebt, // Should match
                ideal: chartData[chartData.length - 1].ideal // Just keep last ideal point
            });
        }

        return chartData;
    }, [history, totalDebt, totalPaid]);

    if (history.length < 2) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center text-center h-64 opacity-50">
                <TrendingDown size={32} className="text-gray-600 mb-2" />
                <p className="text-gray-400 font-bold">Za mało danych na wykres</p>
                <p className="text-xs text-gray-600">Dokonaj kilku wpłat, aby zobaczyć trend.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                📉 Trend Spalania Długu
            </h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="date"
                            stroke="#4b5563"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            hide={true}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="debt"
                            stroke="#ef4444"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorDebt)"
                            name="Pozostały Dług"
                        />
                        <Area
                            type="monotone"
                            dataKey="ideal"
                            stroke="#3b82f6"
                            strokeDasharray="3 3"
                            strokeWidth={1}
                            fill="none"
                            name="Idealna Ścieżka"
                            opacity={0.5}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TrendsChart;
