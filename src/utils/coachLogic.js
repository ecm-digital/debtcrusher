export const getCoachResponse = (message, context) => {
    const lowerMsg = message.toLowerCase();
    const { totalDebt, totalPaid, strategy, monthlyInstallments, monthsToFreedom } = context;

    // 1. Simulation: "Co jeśli wpłacę X?"
    const simulationMatch = lowerMsg.match(/(\d+)/);
    if ((lowerMsg.includes('jeśli') || lowerMsg.includes('dodam') || lowerMsg.includes('wpłacę')) && simulationMatch) {
        const extraAmount = parseInt(simulationMatch[0], 10);
        if (!isNaN(extraAmount) && extraAmount > 0) {
            const currentMonths = monthsToFreedom;
            const newMonths = Math.ceil(totalDebt / (monthlyInstallments + extraAmount));
            const savedMonths = currentMonths - newMonths;

            if (savedMonths > 0) {
                return `Fantastyczne pytanie! 🧮 Jeśli będziesz dopłacać **${extraAmount} zł** miesięcznie, skrócisz swoją drogę do wolności o **${savedMonths} miesięcy**! To prawie ${Math.floor(savedMonths / 12) > 0 ? Math.floor(savedMonths / 12) + ' rok życia' : 'pół roku'} odzyskanego życia. Warto?`;
            } else {
                return `Każda kwota pomaga! 🪙 Przy dupłacie **${extraAmount} zł** może nie skróci to drastycznie liczby miesięcy (nadal ok. ${newMonths}), ale zaoszczędzisz sporo na odsetkach i szybciej poczujesz ulgę.`;
            }
        }
    }

    // 2. Status Report
    if (lowerMsg.includes('jak') && (lowerMsg.includes('idzie') || lowerMsg.includes('sytuacja'))) {
        const percent = Math.round((totalPaid / (totalPaid + totalDebt)) * 100) || 0;
        return `Raport Sytuacyjny 📋: Spłaciłeś już **${percent}%** swoich długów. Do końca zostało Ci ok. **${monthsToFreedom} miesięcy** walki. Jesteś bliżej niż myślisz. Trzymaj kurs!`;
    }

    // 3. Strategy Advice
    if (lowerMsg.includes('strategia') || lowerMsg.includes('metoda') || lowerMsg.includes('śnieżna') || lowerMsg.includes('lawina')) {
        if (strategy === 'snowball') {
            return "Aktualnie stosujesz **Kulę Śnieżną** ❄️. To świetny wybór, jeśli potrzebujesz motywacji. Skupiamy się na ubijaniu małych długów, żebyś szybko poczuł smak zwycięstwa. To buduje rozpęd!";
        } else {
            return "Wybrałeś **Lawinę** 🏔️. To wybór analityczny i matematycznie optymalny. Atakujemy najdroższe długi, żeby banki zarobiły na Tobie jak najmniej. Szanuję to podejście!";
        }
    }

    // 4. Motivation
    if (lowerMsg.includes('motywacja') || lowerMsg.includes('cytat') || lowerMsg.includes('trudno') || lowerMsg.includes('nie dam rady')) {
        const quotes = [
            "„Człowiek, który zdobywa wolność finansową, zdobywa prawo do decydowania o swoim życiu.”",
            "„Nie bój się wolnego postępu. Bój się stania w miejscu.”",
            "„Dług to tylko liczby. Ty jesteś czymś więcej niż Twój bilans. Pokaż charakter.”",
            "„Najtrudniejszy krok to ten pierwszy. Ty masz go już dawno za sobą.”",
            "„Każda złotówka nadpłaty to cios w twarz dla systemu, który chce Cię trzymać w garści.”"
        ];
        return `💬 ${quotes[Math.floor(Math.random() * quotes.length)]}`;
    }

    // Fallback
    return "Jestem Twoim Trenerem Finansowym 🤖. Zapytaj mnie o:\n- „Jak mi idzie?” (Status)\n- „Co jeśli wpłacę 200 zł?” (Symulacja)\n- „Daj motywację” (Wsparcie)\n- „O co chodzi w mojej strategii?”";
};
