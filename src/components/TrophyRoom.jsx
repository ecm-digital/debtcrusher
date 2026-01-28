import React from 'react';
import { BADGES } from '../utils/achievements';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const TrophyRoom = ({ unlockedBadges }) => {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    🏆 Sala Chwały
                </h3>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {unlockedBadges.length} / {BADGES.length} Odblokowane
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {BADGES.map((badge) => {
                    const isUnlocked = unlockedBadges.includes(badge.id);
                    const Icon = badge.icon;

                    return (
                        <div
                            key={badge.id}
                            className={`relative p-3 rounded-lg border flex flex-col items-center text-center gap-2 transition-all duration-300 ${isUnlocked
                                    ? `${badge.bgColor} ${badge.color} border-current shadow-lg shadow-black/20`
                                    : 'bg-gray-800/50 border-gray-700 text-gray-600 grayscale opacity-70'
                                }`}
                        >
                            <div className={`p-2 rounded-full ${isUnlocked ? 'bg-black/20' : 'bg-gray-800'}`}>
                                {isUnlocked ? <Icon size={20} /> : <Lock size={20} />}
                            </div>
                            <div>
                                <p className="text-xs font-bold">{badge.name}</p>
                                <p className="text-[9px] leading-tight mt-1 opacity-80">{badge.description}</p>
                            </div>

                            {isUnlocked && (
                                <motion.div
                                    layoutId={`badge-${badge.id}`}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TrophyRoom;
