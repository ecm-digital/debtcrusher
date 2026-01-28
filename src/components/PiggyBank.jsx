import React, { useState, useEffect } from 'react';
import { PiggyBank as PiggyIcon, PlusCircle, Hammer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PiggyBank = ({ onSmash }) => {
    const [savings, setSavings] = useState(() => {
        const saved = localStorage.getItem('piggyBankSavings');
        return saved ? parseFloat(saved) : 0;
    });
    const [inputAmount, setInputAmount] = useState('');
    const [isShake, setIsShake] = useState(false);

    useEffect(() => {
        localStorage.setItem('piggyBankSavings', savings.toString());
    }, [savings]);

    const handleAddSavings = () => {
        const amount = parseFloat(inputAmount);
        if (!amount || amount <= 0) return;

        setSavings(prev => prev + amount);
        setInputAmount('');
        setIsShake(true);
        setTimeout(() => setIsShake(false), 500);
    };

    const handleSmash = () => {
        if (savings <= 0) return;
        onSmash(savings); // Callback to App to open payment modal with this amount
        setSavings(0); // Reset after smash
    };

    return (
        <div className="bg-gradient-to-br from-pink-900/40 to-rose-900/40 border border-pink-500/20 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <PiggyIcon size={120} />
            </div>

            <div className="relative z-10">
                <h3 className="text-xl font-bold text-pink-200 mb-2 flex items-center gap-2">
                    🐷 Skarbonka Oszczędności
                </h3>
                <p className="text-pink-300/60 text-xs mb-6 max-w-xs">
                    Zrezygnowałeś z kawy? Kupiłeś tańszy obiad? Wrzuć różnicę tutaj!
                </p>

                <div className="flex items-end gap-2 mb-6">
                    <motion.div
                        animate={isShake ? { x: [-5, 5, -5, 5, 0] } : {}}
                        className="text-4xl font-mono font-bold text-white"
                    >
                        {savings.toFixed(2)} <span className="text-sm text-pink-400">PLN</span>
                    </motion.div>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="number"
                            value={inputAmount}
                            onChange={(e) => setInputAmount(e.target.value)}
                            className="w-full bg-pink-950/50 border border-pink-500/30 rounded-lg px-3 py-2 text-white focus:border-pink-400 focus:outline-none placeholder:text-pink-700/50"
                            placeholder="Np. 15"
                        />
                        <button
                            onClick={handleAddSavings}
                            className="absolute right-1 top-1 bottom-1 px-3 bg-pink-600 hover:bg-pink-500 rounded text-white transition-colors"
                            title="Wrzuć do skarbonki"
                        >
                            <PlusCircle size={16} />
                        </button>
                    </div>

                    <button
                        onClick={handleSmash}
                        disabled={savings <= 0}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-rose-900/50"
                    >
                        <Hammer size={18} className={savings > 0 ? "animate-bounce" : ""} />
                        ROZBIJ!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PiggyBank;
