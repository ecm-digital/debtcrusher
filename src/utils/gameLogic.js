export const LEVELS = [
    { level: 1, name: 'Nowicjusz', threshold: 0 },
    { level: 2, name: 'Czeladnik', threshold: 5000 },
    { level: 3, name: 'Wojownik', threshold: 10000 },
    { level: 4, name: 'Łowca Długów', threshold: 15000 },
    { level: 5, name: 'Pogromca Odsetek', threshold: 25000 },
    { level: 6, name: 'Rycerz Wolności', threshold: 40000 },
    { level: 7, name: 'Mistrz Oszczędzania', threshold: 60000 },
    { level: 8, name: 'Tytan Finansów', threshold: 80000 },
    { level: 9, name: 'Legenda', threshold: 100000 },
    { level: 10, name: 'Wolny Człowiek', threshold: 150000 }
];

export const calculateLevel = (totalPaid) => {
    let currentLevel = LEVELS[0];
    let nextLevel = LEVELS[1];

    for (let i = 0; i < LEVELS.length; i++) {
        if (totalPaid >= LEVELS[i].threshold) {
            currentLevel = LEVELS[i];
            nextLevel = LEVELS[i + 1] || { threshold: currentLevel.threshold * 1.5 }; // Fallback
        } else {
            break;
        }
    }

    // Handle max level case
    if (!nextLevel) {
        return {
            level: currentLevel.level,
            title: currentLevel.name,
            currentXP: 100,
            maxXP: 100,
            progressPercent: 100,
            totalPaid
        };
    }

    const xpForCurrentLevel = nextLevel.threshold - currentLevel.threshold;
    const xpProgress = totalPaid - currentLevel.threshold;
    const progressPercent = Math.min(100, Math.max(0, (xpProgress / xpForCurrentLevel) * 100));

    return {
        level: currentLevel.level,
        title: currentLevel.name,
        currentXP: Math.round(xpProgress),
        maxXP: Math.round(xpForCurrentLevel),
        progressPercent,
        totalPaid
    };
};
