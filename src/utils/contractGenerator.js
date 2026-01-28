import { jsPDF } from 'jspdf';
// Quick Helper for PLN since we might not have the import easily available or circular deps
const pln = (val) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(val);

export const generateContract = (debts, totalDebt, freedomDate, strategyName, userName = "Wojownik Długów") => {
    const doc = new jsPDF();

    // -- STYLING CONFIG --
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;
    const margin = 20;

    // -- HEADER --
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("CYROGRAF WOLNOSCI", centerX, 20, { align: "center" });

    doc.setLineWidth(0.5);
    doc.line(margin, 25, pageWidth - margin, 25);

    // -- INTRODUCTION --
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Ja, ${userName}, uroczyście oświadczam, że wypowiadam wojnę`, centerX, 40, { align: "center" });
    doc.text("mojemu zadłużeniu i nie spocznę, dopóki nie odzyskam", centerX, 46, { align: "center" });
    doc.text("CAŁKOWITEJ WOLNOŚCI FINANSOWEJ.", centerX, 52, { align: "center" });

    // -- MISSION DATA --
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("MOI WROGOWIE (DO ZNISZCZENIA):", margin, 70);

    // -- DEBT LIST --
    let y = 80;
    doc.setFont("courier", "normal");
    doc.setFontSize(11);

    debts.forEach((debt, index) => {
        const line = `${index + 1}. ${debt.name.toUpperCase()} - ${pln(debt.current_amount)} (${debt.interest_rate}%)`;
        doc.text(line, margin + 5, y);
        y += 7;
    });

    y += 5;
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // -- SUMMARY STATS --
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`W SUMIE DO SPŁATY: ${pln(totalDebt)}`, margin, y);
    y += 8;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Strategia bojowa: ${strategyName.toUpperCase()}`, margin, y);
    y += 8;
    doc.text(`Przewidywana data zwycięstwa: ${freedomDate}`, margin, y);


    // -- OATH --
    y += 30;
    doc.setFont("times", "italic");
    doc.setFontSize(12);
    const oath = "Zobowiązuję się do regularnych spłat, unikania nowych długów i świętowania każdego małego zwycięstwa. To jest moja droga. To jest mój cel.";
    const splitOath = doc.splitTextToSize(oath, pageWidth - (margin * 2));
    doc.text(splitOath, centerX, y, { align: "center" });

    // -- SIGNATURE --
    y += 50;
    doc.setLineWidth(0.5);
    doc.line(centerX - 40, y, centerX + 40, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Podpis Właściciela", centerX, y + 5, { align: "center" });

    // -- FOOTER --
    doc.setFontSize(8);
    doc.text(`Wygenerowano przez Debt Crusher - ${new Date().toLocaleDateString('pl-PL')}`, margin, pageWidth - 10); // Page height roughly
    // Actually pageSize.getHeight() is better
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.text(`Wygenerowano przez Debt Crusher - ${new Date().toLocaleDateString('pl-PL')}`, margin, pageHeight - 10);

    doc.save("Cyrograf_Wolnosci.pdf");
};
