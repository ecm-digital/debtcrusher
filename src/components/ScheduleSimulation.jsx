import React, { useMemo } from 'react';
import { Calendar, TrendingDown, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ScheduleSimulation = ({ totalDebt, monthlyInstallments, initialTotalDebt }) => {
    const simulation = useMemo(() => {
        if (!totalDebt || !monthlyInstallments || monthlyInstallments <= 0) return [];

        let currentDebt = totalDebt;
        const schedule = [];
        const today = new Date();
        let monthIndex = 0;

        // Safety limit: 120 months (10 years)
        while (currentDebt > 0 && monthIndex < 120) {
            monthIndex++;
            const date = new Date(today.getFullYear(), today.getMonth() + monthIndex, 1);

            // Apply payment
            currentDebt -= monthlyInstallments;

            schedule.push({
                id: monthIndex,
                date: date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' }),
                remaining: currentDebt < 0 ? 0 : currentDebt,
                progress: Math.max(0, ((initialTotalDebt - Math.max(0, currentDebt)) / initialTotalDebt) * 100)
            });
        }

        return schedule;
    }, [totalDebt, monthlyInstallments, initialTotalDebt]);

    if (monthlyInstallments <= 0) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center text-gray-500">
                <p>Brak danych o ratach, by wyliczyć harmonogram.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-[270px] flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-blue-400" />
                Harmonogram Wolności (Symulacja)
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {simulation.map((row) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={row.id}
                        className="flex items-center justify-between text-xs p-2 bg-gray-800/50 rounded border border-gray-700/50 hover:bg-gray-800 transition-colors"
                    >
                        <div className="w-1/3 text-gray-400 font-medium capitalize flex items-center gap-2">
                            <span className="text-[10px] w-5 h-5 flex items-center justify-center rounded-full bg-gray-700 text-gray-500">
                                {row.id}
                            </span>
                            {row.date}
                        </div>

                        <div className="w-1/3 px-2">
                            <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500"
                                    style={{ width: `${row.progress}%` }}
                                />
                            </div>
                        </div>

                        <div className="w-1/3 text-right font-mono font-bold text-gray-200">
                            {row.remaining > 0 ? (
                                <span>{Math.round(row.remaining).toLocaleString('pl-PL')} PLN</span>
                            ) : (
                                <span className="text-emerald-400 flex items-center justify-end gap-1">
                                    WOLNOŚĆ <TrendingDown size={12} />
                                </span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-800 text-[10px] text-gray-500 text-center flex justify-between">
                <span>Symulacja przy racie: <strong>{monthlyInstallments.toLocaleString('pl-PL')} PLN</strong></span>
                <span>Koniec: <strong>{simulation[simulation.length - 1]?.date || 'Nigdy'}</strong></span>
            </div>
        </div>
    );
};

export default ScheduleSimulation;
