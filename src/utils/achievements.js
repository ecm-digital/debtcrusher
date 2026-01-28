import { Trophy, Zap, Crown, Flame, Target, ThumbsUp, Wallet, Star } from 'lucide-react';

export const BADGES = [
    {
        id: 'first_blood',
        name: 'Pierwsza Krew',
        description: 'Dokonaj pierwszej wpłaty na poczet długu.',
        icon: Zap,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400/10 border-yellow-400/20'
    },
    {
        id: 'sniper',
        name: 'Snajper',
        description: 'Spłać jeden dług w całości.',
        icon: Target,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-400/10 border-emerald-400/20'
    },
    {
        id: 'whale',
        name: 'Wieloryb',
        description: 'Dokonaj jednorazowej wpłaty powyżej 1000 PLN.',
        icon: Crown,
        color: 'text-purple-400',
        bgColor: 'bg-purple-400/10 border-purple-400/20'
    },
    {
        id: 'streaker',
        name: 'Systematyczny',
        description: 'Dokonaj min. 3 wpłat w historii.',
        icon: Flame,
        color: 'text-orange-400',
        bgColor: 'bg-orange-400/10 border-orange-400/20'
    },
    {
        id: 'saver',
        name: 'Chomik',
        description: 'Użyj Skarbonki przynajmniej raz.',
        icon: Wallet,
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10 border-blue-400/20'
    },
    {
        id: 'freedom',
        name: 'Wolny Człowiek',
        description: 'Spłać WSZYSTKIE długi!',
        icon: Star,
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-400/10 border-cyan-400/20'
    }
];

export const checkAchievements = (history, debts, totalDebt) => {
    const unlocked = [];

    // 1. First Blood
    if (history.length > 0) {
        unlocked.push('first_blood');
    }

    // 2. Sniper (One debt fully paid)
    // Assuming a debt is fully paid if its current_amount is 0.
    // We need to check if ANY debt in the debts array has 0 current_amount AND initial_amount > 0
    const hasPaidDebt = debts.some(d => parseFloat(d.current_amount) === 0 && parseFloat(d.initial_amount) > 0);
    if (hasPaidDebt) {
        unlocked.push('sniper');
    }

    // 3. Whale (> 1000 pln single payment)
    const hasBigPayment = history.some(p => parseFloat(p.amount) >= 1000);
    if (hasBigPayment) {
        unlocked.push('whale');
    }

    // 4. Streaker (3+ payments)
    if (history.length >= 3) {
        unlocked.push('streaker');
    }

    // 5. Freedom (Total Debt 0)
    if (totalDebt === 0 && debts.length > 0) {
        unlocked.push('freedom');
    }

    // Note: 'saver' badge will be checked separately or passed in context if we track piggy bank usage history.
    // For now we can assume it's checked loosely or we add a flag. 
    // Let's pass a 'piggyBankUsed' flag optionally? 
    // For simplicity, we might just store unlocked badges in local storage or calculate them live.

    return unlocked;
};
