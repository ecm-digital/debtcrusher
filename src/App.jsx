import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertCircle,
  TrendingDown,
  ArrowUpRight,
  Trophy,
  CreditCard,
  Briefcase,
  User,
  Zap,
  RotateCcw,
  Lock,
  Loader2,
  Users,
  Calendar,
  History,
  PieChart as PieChartIcon,
  Plus,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import { supabase } from './supabaseConfig';
import AICoach from './components/AICoach';
import { calculateLevel } from './utils/gameLogic';
import TrophyRoom from './components/TrophyRoom';
import TrendsChart from './components/TrendsChart';
import PiggyBank from './components/PiggyBank';
import ScheduleSimulation from './components/ScheduleSimulation';
import { checkAchievements } from './utils/achievements';

// --- Components ---
const Card = ({ children, className = '' }) => (
  <div className={`bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, size = 'normal', type = 'button' }) => {
  const baseStyle = "rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
  const sizes = {
    normal: "px-4 py-2",
    sm: "px-3 py-1.5 text-sm"
  };

  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20",
    secondary: "bg-gray-700 hover:bg-gray-600 text-gray-200",
    danger: "bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-900/50",
    outline: "border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500",
    ghost: "text-gray-500 hover:text-emerald-400 hover:bg-gray-800"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10"
        >
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-6">{title}</h3>
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const ProgressBar = ({ current, total, colorClass = "bg-emerald-500" }) => {
  const percentage = Math.min(100, Math.max(0, ((total - current) / total) * 100));

  return (
    <div className="h-3 w-full bg-gray-900 rounded-full overflow-hidden mt-2 relative border border-gray-800">
      <div
        className={`h-full ${colorClass} transition-all duration-1000 ease-out relative`}
        style={{ width: `${percentage}%` }}
      >
        <div className="absolute inset-0 bg-white/20"></div>
      </div>
    </div>
  );
};

// Initial data - Real User Debts
const INITIAL_DEBTS = [
  { id: 1, name: 'Vivigo (Chwilówka)', category: 'Chwilówka', initial_amount: 1458.60, current_amount: 1458.60, rate: '?', priority: 1, note: 'BARDZO WYSOKI (Mała kwota, zamknij to natychmiast)' },
  { id: 2, name: 'Santander (Karta Kredytowa)', category: 'Prywatne', initial_amount: 2092.01, current_amount: 2092.01, rate: '?', priority: 2, note: 'WYSOKI (Łatwe do spłaty, uwalnia zdolność)' },
  { id: 3, name: 'Net Credit (Chwilówka/Karta)', category: 'Chwilówka', initial_amount: 4704.50, current_amount: 4704.50, rate: '?', priority: 3, note: 'WYSOKI (Prawdopodobnie wysokie koszty ukryte)' },
  { id: 4, name: 'Wonga (Pożyczka)', category: 'Pożyczka', initial_amount: 8153.46, current_amount: 8153.46, rate: '?', installment: 1012.55, priority: 4, note: 'WYSOKI (Ogromna rata w stosunku do długu!)' },
  { id: 5, name: 'mBank Firma (Karta Kredytowa)', category: 'Firmowe', initial_amount: 9245.08, current_amount: 9245.08, rate: '15%', priority: 5, note: 'ŚREDNI (Wysoki %, ale bankowy)' },
  { id: 6, name: 'Smartkey (Pożyczka)', category: 'Pożyczka', initial_amount: 12070.71, current_amount: 12070.71, rate: '?', installment: 574.85, priority: 6, note: 'ŚREDNI' },
  { id: 7, name: 'mBank Pryw. (Kredyt Odnawialny)', category: 'Prywatne', initial_amount: 15200.00, current_amount: 15200.00, rate: '12.10%', priority: 7, note: 'ŚREDNI (Pętla zadłużenia, spłacaj nadwyżkami)' },
  { id: 8, name: 'mBank Firma (Pożyczka)', category: 'Firmowe', initial_amount: 18191.51, current_amount: 18191.51, rate: '12.7%', priority: 8, note: 'ŚREDNI' },
  { id: 9, name: 'mBank Firma (Kredyt Odnawialny)', category: 'Firmowe', initial_amount: 18400.00, current_amount: 18400.00, rate: '10.7%', priority: 9, note: 'NISKI (Najniższy %, zostaw na koniec)' },
  { id: 10, name: 'mBank Firma (Raty)', category: 'Firmowe', initial_amount: 23072.72, current_amount: 23072.72, rate: '10%', installment: 878.99, priority: 10, note: 'NISKI (Stabilna rata)' },
  { id: 11, name: 'mBank Pryw. (Kredyt Gotówkowy)', category: 'Prywatne', initial_amount: 50119.53, current_amount: 50119.53, rate: '9.88%', installment: 815.56, priority: 11, note: 'NISKI (Długi termin, niska rata)' },
];

export default function App() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [syncStatus, setSyncStatus] = useState('checking'); // 'checking', 'connected', 'offline'
  const [syncError, setSyncError] = useState(null);
  const [payments, setPayments] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [newDebt, setNewDebt] = useState({ name: '', initial_amount: '', current_amount: '', category: 'Prywatne', installment: '', rate: '', priority: 5, note: '' });
  const [strategy, setStrategy] = useState('snowball'); // 'snowball' or 'avalanche'

  // 1. Data Loading
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (supabase) {
        try {
          const { data: debtData, error: debtError } = await supabase
            .from('debts')
            .select('*')
            .order('priority', { ascending: true });

          const { data: paymentData, error: paymentError } = await supabase
            .from('payments')
            .select('*, debts(name)')
            .order('created_at', { descending: true })
            .limit(10);

          if (debtError) throw debtError;
          if (paymentError) console.error("History fetch error:", paymentError);

          if (debtData && debtData.length > 0) {
            setDebts(debtData);
            localStorage.setItem('tomek_debts_v1', JSON.stringify(debtData));
            setSyncStatus('connected');
          } else {
            // Seeding logic...
            const localData = localStorage.getItem('tomek_debts_v1');
            const dataToSeed = localData ? JSON.parse(localData) : INITIAL_DEBTS;
            const dataToInsert = dataToSeed.map(({ id, ...rest }) => rest);

            const { data: inserted, error: insertError } = await supabase
              .from('debts')
              .insert(dataToInsert)
              .select();

            if (insertError) {
              setSyncError(`Błąd wgrywania: ${insertError.message}`);
              setDebts(dataToSeed);
            } else if (inserted) {
              setDebts(inserted);
              localStorage.setItem('tomek_debts_v1', JSON.stringify(inserted));
              setSyncStatus('connected');
            }
          }
          if (paymentData) setPayments(paymentData);
        } catch (e) {
          console.error("Supabase fail:", e);
          setSyncStatus('offline');
          setSyncError(e.message);
          const localData = localStorage.getItem('tomek_debts_v1');
          setDebts(localData ? JSON.parse(localData) : INITIAL_DEBTS);
        }
      } else {
        setSyncStatus('offline');
        const localData = localStorage.getItem('tomek_debts_v1');
        setDebts(localData ? JSON.parse(localData) : INITIAL_DEBTS);
      }
      setLoading(false);
    };

    fetchData();
  }, []);


  // Helper to save data
  const persistDebts = async (updatedDebts) => {
    setDebts(updatedDebts);
    localStorage.setItem('tomek_debts_v1', JSON.stringify(updatedDebts));
  };

  // Management Functions
  const handleSaveNewDebt = async () => {
    if (!newDebt.name || !newDebt.initial_amount) {
      toast.error("Podaj nazwę i kwotę początkową!");
      return;
    }

    const debtToSave = {
      ...newDebt,
      initial_amount: parseFloat(newDebt.initial_amount),
      current_amount: parseFloat(newDebt.current_amount || newDebt.initial_amount),
      installment: newDebt.installment ? parseFloat(newDebt.installment) : null,
      priority: parseInt(newDebt.priority)
    };

    if (supabase) {
      const { data, error } = await supabase.from('debts').insert(debtToSave).select();
      if (error) {
        toast.error(`Błąd: ${error.message}`);
      } else if (data) {
        const updatedDebts = [...debts, data[0]];
        persistDebts(updatedDebts);
        toast.success("Dług dodany pomyślnie!");
        setIsAddModalOpen(false);
        setNewDebt({ name: '', initial_amount: '', current_amount: '', category: 'Prywatne', installment: '', rate: '', priority: 5, note: '' });
      }
    } else {
      const updatedDebts = [...debts, { ...debtToSave, id: Date.now() }];
      persistDebts(updatedDebts);
      toast.success("Dług dodany lokalnie!");
      setIsAddModalOpen(false);
    }
  };

  const handleUpdateDebtDetails = async () => {
    if (!editingDebt) return;

    const updatedData = {
      ...editingDebt,
      initial_amount: parseFloat(editingDebt.initial_amount),
      current_amount: parseFloat(editingDebt.current_amount),
      installment: editingDebt.installment ? parseFloat(editingDebt.installment) : null,
      priority: parseInt(editingDebt.priority)
    };

    if (supabase) {
      const { error } = await supabase.from('debts').update(updatedData).eq('id', editingDebt.id);
      if (error) {
        toast.error(`Błąd: ${error.message}`);
      } else {
        const updatedDebts = debts.map(d => d.id === editingDebt.id ? updatedData : d);
        persistDebts(updatedDebts);
        toast.success("Dług zaktualizowany!");
        setIsEditModalOpen(false);
      }
    } else {
      const updatedDebts = debts.map(d => d.id === editingDebt.id ? updatedData : d);
      persistDebts(updatedDebts);
      toast.success("Zaktualizowano lokalnie!");
      setIsEditModalOpen(false);
    }
  };

  const handlePayment = async (id) => {
    if (!payAmount) return;
    const amount = parseFloat(payAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;

    const debt = debts.find(d => d.id === id);
    if (!debt) return;

    const newAmount = Math.max(0, debt.current_amount - amount);
    if (newAmount === 0) {
      triggerSuccess();
      toast.success(`Wspaniale! Dług ${debt.name} został całkowicie spłacony! 🏆`);
    } else {
      toast.success(`Zaksięgowano wpłatę ${formatPLN(amount)} na poczet ${debt.name}`);
    }

    if (supabase) {
      const { error } = await supabase.from('debts').update({ current_amount: newAmount }).eq('id', id);
      if (error) {
        toast.error(`Błąd zapisu: ${error.message}`);
      } else {
        await supabase.from('payments').insert({ debt_id: id, amount: amount });
        // Refresh payments
        const { data: pData } = await supabase.from('payments').select('*, debts(name)').order('created_at', { descending: true }).limit(10);
        if (pData) setPayments(pData);
      }
    }

    const updatedDebts = debts.map(d => d.id === id ? { ...d, current_amount: newAmount } : d);
    persistDebts(updatedDebts);
    setPayAmount('');
    setEditingId(null);
  };

  const handleDeleteDebt = async (id) => {
    if (!confirm('Czy na pewno chcesz usunąć ten dług?')) return;

    if (supabase) {
      const { error } = await supabase.from('debts').delete().eq('id', id);
      if (error) {
        toast.error(`Błąd usuwania: ${error.message}`);
        return;
      }
    }

    const updatedDebts = debts.filter(d => d.id !== id);
    persistDebts(updatedDebts);
    toast.success("Dług został usunięty.");
  };

  const handleUndo = async (id) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;

    // Restore to 10% or something sensible if paid, or just add back if it was a mistake
    const newAmount = 100;

    if (supabase) {
      const { error } = await supabase.from('debts').update({ current_amount: newAmount }).eq('id', id);
      if (error) {
        toast.error(`Błąd: ${error.message}`);
        return;
      }
    }

    const updatedDebts = debts.map(d => d.id === id ? { ...d, current_amount: newAmount } : d);
    persistDebts(updatedDebts);
    toast.info("Przywrócono dług do aktywnych.");
  };

  const triggerSuccess = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const formatPLN = (amount) => {
    return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(amount);
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Firmowe': return <Briefcase size={16} className="text-blue-400" />;
      case 'Prywatne': return <User size={16} className="text-purple-400" />;
      case 'Chwilówka': return <AlertCircle size={16} className="text-red-400" />;
      default: return <CreditCard size={16} className="text-gray-400" />;
    }
  };

  // Calculations
  const totalDebt = debts.reduce((acc, curr) => acc + (parseFloat(curr.current_amount) || 0), 0);
  const initialTotal = debts.reduce((acc, curr) => acc + (parseFloat(curr.initial_amount) || 0), 0);
  const totalPaid = initialTotal - totalDebt;
  const percentPaid = initialTotal > 0 ? ((totalPaid / initialTotal) * 100).toFixed(1) : "0.0";

  // Freedom Date Calculation
  const monthlyInstallments = debts.reduce((acc, curr) => acc + (parseFloat(curr.installment) || 0), 0);
  const monthsToFreedom = monthlyInstallments > 0 ? Math.ceil(totalDebt / monthlyInstallments) : 0;

  const getFreedomDate = () => {
    if (monthsToFreedom === 0) return "Już wolny!";
    const d = new Date();
    d.setMonth(d.getMonth() + monthsToFreedom);
    return d.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
  };

  const chartData = [
    { name: 'Pozostało', value: totalDebt, color: '#111827' },
    { name: 'Spłacono', value: totalPaid, color: '#10b981' },
  ];

  const activeDebts = debts
    .filter(d => parseFloat(d.current_amount) > 0)
    .sort((a, b) => {
      if (strategy === 'snowball') {
        return parseFloat(a.current_amount) - parseFloat(b.current_amount);
      } else {
        // Avalanche: highest rate first
        const rateA = parseFloat(a.rate) || 0;
        const rateB = parseFloat(b.rate) || 0;
        return rateB - rateA;
      }
    });

  const paidDebts = debts
    .filter(d => parseFloat(d.current_amount) === 0)
    .sort((a, b) => parseFloat(a.initial_amount) - parseFloat(b.initial_amount));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-emerald-500 gap-4">
        <Loader2 className="animate-spin" size={48} />
        <p className="text-gray-400 animate-pulse">Ładowanie danych...</p>
      </div>
    );
  }

  // RPG Logic
  const rpgStats = calculateLevel(totalPaid);

  // Achievements Logic
  const unlockedBadges = checkAchievements(payments, debts, totalDebt);

  // Piggy Bank Handler
  const handleSmashPiggyBank = (amount) => {
    setPayAmount(amount.toString());

    // Find highest interest debt for Avalanche or smallest debt for Snowball to suggest
    let suggestedDebtId = null;
    if (activeDebts.length > 0) {
      // Just pick the first one as it is already sorted by strategy
      suggestedDebtId = activeDebts[0].id;
    }

    if (suggestedDebtId) {
      setEditingId(suggestedDebtId);
      setIsEditModalOpen(true); // Re-using edit modal logic roughly, or maybe we open the quick pay logic?
      // Actually the 'quick pay' is inline in the card. 
      // We'll mimic clicking "Atakuj" on the top priority debt.
      setEditingId(suggestedDebtId);
      setPayAmount(amount.toString());
      // We need to scroll to it or open modal? 
      // The existing logic uses `editingId` to show inline input in the card.
    } else {
      toast.error("Brak aktywnych długów do spłacenia!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 font-sans selection:bg-emerald-500/30 pb-20">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header Dashboard with RPG Profile */}
        <header className="space-y-6 pt-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                Debt Crusher
              </h1>
              <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                <span className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                  LVL {rpgStats.level}
                </span>
                <span className="text-yellow-500 font-bold text-xs">{rpgStats.title}</span>
              </div>
            </div>

            {/* XP Bar */}
            <div className="hidden md:block w-32">
              <div className="flex justify-between text-[8px] uppercase font-bold text-gray-500 mb-0.5">
                <span>XP</span>
                <span>{rpgStats.currentXP} / {rpgStats.maxXP}</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700/50">
                <div className="h-full bg-yellow-500 transition-all duration-1000" style={{ width: `${rpgStats.progressPercent}%` }} />
              </div>
            </div>

            {showConfetti && (
              <div className="animate-bounce bg-yellow-500 text-black font-bold px-4 py-2 rounded-full shadow-lg shadow-yellow-500/50 z-50">
                🎉 CRITICAL HIT!
              </div>
            )}
          </div>

          <Card className="bg-gray-800/40 p-1 relative overflow-hidden group">
            {/* Boss Battle UI */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-500" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 relative z-10">
              <div className="border-r border-gray-700/50 pr-6">
                <div className="mb-4">
                  <div className="flex justify-between items-end mb-1">
                    <p className="text-red-500 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                      <Zap size={12} /> BOSS HP
                    </p>
                    <span className="text-xs text-gray-500 font-mono">{(totalDebt / (totalDebt + totalPaid) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-white mb-2">
                    {formatPLN(totalDebt)}
                  </div>

                  {/* Boss Health Bar */}
                  <div className="h-4 bg-gray-900 rounded border border-red-900/30 overflow-hidden relative shadow-inner">
                    <motion.div
                      key={totalDebt}
                      initial={{ width: '100%' }}
                      animate={{ width: `${(totalDebt / initialTotal) * 100}%` }}
                      transition={{ type: 'spring', stiffness: 50 }}
                      className="h-full bg-gradient-to-r from-red-600 via-red-500 to-orange-600 absolute top-0 left-0"
                    />
                    {/* Shake effect overlay on hit could go here */}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700/30 flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase mb-1">Zadane Obrażenia</p>
                    <div className="flex items-center gap-2 text-xl font-mono font-bold text-emerald-400">
                      {formatPLN(totalPaid)}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-[10px] uppercase mb-1">Do Wolności</p>
                    <p className="text-sm font-bold text-white flex items-center gap-1 justify-end">
                      <Calendar size={12} className="text-blue-400" />
                      {getFreedomDate()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-r border-gray-700/50 pr-6 flex flex-col justify-center">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 text-center">Struktura Zadłużenia</p>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        innerRadius={35}
                        outerRadius={50}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <ReTooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value) => formatPLN(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 text-[10px] uppercase">
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Spłacono</span>
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-900" /> Pozostało</span>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Cel Główny: 100% WOLNOŚCI</p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-5xl font-black text-blue-400 tracking-tighter">{percentPaid}%</span>
                  <span className="text-gray-500 text-sm mb-2 font-mono">UKOŃCZONE</span>
                </div>
                <ProgressBar current={totalDebt} total={initialTotal} colorClass="bg-gradient-to-r from-emerald-500 to-blue-500" />
              </div>
            </div>
          </Card>
        </header>

        {/* ULTIMATE CRUSHER TOOLS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TrophyRoom unlockedBadges={unlockedBadges} />
          <div className="space-y-4">
            <PiggyBank onSmash={handleSmashPiggyBank} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TrendsChart history={payments} totalDebt={totalDebt} totalPaid={totalPaid} />
              <ScheduleSimulation totalDebt={totalDebt} monthlyInstallments={monthlyInstallments} initialTotalDebt={initialTotal} />
            </div>
          </div>
        </div>

        {/* ANALITYKA I HISTORIA ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-800/30 p-5">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <History size={16} className="text-emerald-500" />
              Ostatnie Sukcesy
            </h3>
            <div className="space-y-3">
              {payments.length === 0 ? (
                <p className="text-gray-600 text-sm italic py-4 text-center">Brak historii wpłat...</p>
              ) : (
                payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <ArrowUpRight size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-300">{p.debts?.name || 'Dług'}</p>
                        <p className="text-[10px] text-gray-500">{new Date(p.created_at).toLocaleString('pl-PL')}</p>
                      </div>
                    </div>
                    <div className="text-emerald-400 font-mono text-sm font-bold">
                      +{formatPLN(p.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="bg-gray-800/30 p-5">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <PieChartIcon size={16} className="text-blue-500" />
              Twoja Strategia
            </h3>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <p className="text-[10px] text-emerald-500 uppercase font-bold mb-1">Obecna amunicja miesięczna</p>
                <p className="text-2xl font-mono font-bold text-white">{formatPLN(monthlyInstallments)}</p>
                <p className="text-xs text-gray-500 mt-1">To suma wszystkich Twoich obecnych rat.</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <p className="text-[10px] text-blue-500 uppercase font-bold mb-1">Moc Nadpłaty</p>
                <p className="text-sm text-gray-300">
                  Każde dodatkowe <span className="text-white font-bold">100 zł</span> miesięcznie przyśpieszy Twoją wolność o ok.
                  <span className="text-blue-400 font-bold ml-1">
                    {totalDebt > 0 ? (monthsToFreedom - Math.ceil(totalDebt / (monthlyInstallments + 100))) : 0} msc
                  </span>.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* PAID DEBTS SECTION */}
        {paidDebts.length > 0 && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-gradient-to-r from-transparent via-emerald-900 to-transparent flex-1"></div>
              <h2 className="text-emerald-500 font-bold flex items-center gap-2 text-sm uppercase tracking-[0.2em] px-4 py-1 border border-emerald-900/50 rounded-full bg-emerald-950/30">
                <Trophy size={16} className="text-yellow-500" />
                Hala Zwycięstw ({paidDebts.length})
              </h2>
              <div className="h-px bg-gradient-to-r from-transparent via-emerald-900 to-transparent flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75 hover:opacity-100 transition-opacity">
              <AnimatePresence mode="popLayout">
                {paidDebts.map((debt) => (
                  <motion.div
                    key={debt.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="group bg-gray-900/40 border border-gray-800 rounded-lg p-4 flex items-center justify-between hover:border-emerald-900/50 hover:bg-gray-900/60 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-900/30 p-2 rounded-full text-emerald-500">
                        <Lock size={16} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-400 line-through decoration-emerald-500/50 decoration-2 group-hover:text-gray-300">{debt.name}</h3>
                        <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle size={10} /> Spłacono {formatPLN(debt.initial_amount)}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUndo(debt.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Przywróć do aktywnych (jeśli pomyłka)"
                    >
                      <RotateCcw size={14} />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ACTIVE DEBTS SECTION */}
        <div className="space-y-4">
          <div className="flex justify-between items-end border-b border-gray-800 pb-2 mb-4">
            <div className="space-y-4 w-full">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                  <Zap size={20} className="text-yellow-400 fill-yellow-400" />
                  Do spłacenia
                </h2>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
                <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800">
                  <button
                    onClick={() => setStrategy('snowball')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${strategy === 'snowball' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Kula Śnieżna
                  </button>
                  <button
                    onClick={() => setStrategy('avalanche')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${strategy === 'avalanche' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Lawina
                  </button>
                </div>

                <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${syncStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                  syncStatus === 'offline' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                    'bg-gray-500/10 text-gray-500 border-gray-500/20'
                  }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                    syncStatus === 'offline' ? 'bg-orange-500' :
                      'bg-gray-500'
                    }`} />
                  {syncStatus === 'connected' ? 'Cloud Sync' : syncStatus === 'offline' ? 'Offline Mode' : 'Connecting...'}
                </div>
              </div>

              {/* Strategy Info Box */}
              <motion.div
                key={strategy}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg border ${strategy === 'snowball' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-blue-500/5 border-blue-500/10'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {strategy === 'snowball' ? <Trophy size={14} className="text-emerald-500" /> : <Zap size={14} className="text-blue-500" />}
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                    {strategy === 'snowball' ? 'Skupienie na zwycięstwach' : 'Skupienie na matematyce'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {strategy === 'snowball'
                    ? "Spłacasz najpierw najmniejsze kwoty. To daje szybkie poczucie sukcesu i motywację do dalszej walki. Idealne, by nie stracić zapału!"
                    : "Spłacasz najpierw długi z najwyższym procentem. Matematycznie najszybsza droga do wolności, oszczędzająca najwięcej na odsetkach."
                  }
                </p>
              </motion.div>
            </div>
          </div>


          <AnimatePresence mode="popLayout">
            {activeDebts.map((debt, index) => {
              const isTopPriority = index === 0;

              return (
                <motion.div
                  key={debt.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card
                    className={`transition-all duration-300 hover:shadow-xl hover:shadow-black/50 ${isTopPriority ? (strategy === 'snowball' ? 'ring-1 ring-emerald-500/50 bg-gray-800' : 'ring-1 ring-blue-500/50 bg-gray-800') : 'bg-gray-800/80 hover:bg-gray-800'}`}
                  >
                    <div className="p-5">
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                        <div className="flex-1 relative">
                          <button
                            onClick={() => {
                              setEditingDebt(debt);
                              setIsEditModalOpen(true);
                            }}
                            className="absolute -top-1 -right-1 text-gray-600 hover:text-emerald-500 p-1"
                          >
                            <Edit2 size={12} />
                          </button>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white tracking-tight">
                              {debt.name}
                            </h3>
                            {isTopPriority && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide animate-pulse ${strategy === 'snowball' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                                Cel: {strategy === 'snowball' ? 'Najmniejszy' : 'Najdroższy'}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-gray-700 text-gray-300 border border-gray-600">
                              {getCategoryIcon(debt.category)} {debt.category}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                            {debt.installment && <span className="flex items-center gap-1"><span className="w-1 h-1 bg-gray-600 rounded-full"></span> Rata: <span className="text-gray-200 font-medium">{formatPLN(debt.installment)}</span></span>}
                            {debt.rate !== '?' && <span className="flex items-center gap-1"><span className="w-1 h-1 bg-gray-600 rounded-full"></span> RRSO: <span className="text-gray-200">{debt.rate}</span></span>}
                          </div>

                          {debt.note && (
                            <p className="text-xs text-yellow-500/90 mt-2 flex items-center gap-1.5 font-medium bg-yellow-500/10 px-2 py-1 rounded w-fit">
                              <AlertCircle size={12} /> {debt.note}
                            </p>
                          )}
                        </div>

                        <div className="text-right pl-4 border-l border-gray-700/50">
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pozostało</div>
                          <div className="text-2xl font-mono font-bold text-white">
                            {formatPLN(debt.current_amount)}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <ProgressBar
                          current={debt.current_amount}
                          total={debt.initial_amount}
                          colorClass={isTopPriority
                            ? (strategy === 'snowball' ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-gradient-to-r from-blue-500 to-blue-400")
                            : "bg-gray-600"}
                        />

                        <div className="flex justify-between items-center pt-2">
                          <button
                            onClick={() => handleDeleteDebt(debt.id)}
                            className="text-gray-500 hover:text-red-400 transition-colors p-1"
                            title="Usuń dług"
                          >
                            <RotateCcw size={14} className="rotate-45" />
                          </button>

                          {editingId && editingId === debt.id ? (
                            <div className="flex gap-2 items-center w-full md:w-auto bg-gray-900/90 p-1.5 rounded-lg border border-gray-600 animate-in fade-in slide-in-from-right-4 shadow-xl">
                              <input
                                type="number"
                                placeholder="Kwota..."
                                value={payAmount}
                                onChange={(e) => setPayAmount(e.target.value)}
                                className="bg-gray-800 border border-gray-600 text-white px-3 py-1.5 rounded focus:outline-none focus:border-emerald-500 w-full md:w-32 text-right"
                                autoFocus
                              />
                              <Button onClick={() => handlePayment(debt.id)} variant="primary" size="sm">
                                Zatwierdź
                              </Button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1 text-sm text-gray-400 hover:text-white"
                              >
                                Anuluj
                              </button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => {
                                setEditingId(debt.id);
                                setPayAmount('');
                              }}
                              variant={isTopPriority ? (strategy === 'snowball' ? "primary" : "secondary") : "ghost"}
                              size="sm"
                              className={`w-full md:w-auto ${isTopPriority && strategy === 'avalanche' ? 'bg-blue-600 hover:bg-blue-500 text-white border-none' : ''}`}
                            >
                              <ArrowUpRight size={16} />
                              {isTopPriority ? (strategy === 'snowball' ? "Atakuj (Kula Śnieżna)!" : "Atakuj (Lawina)!") : "Dodaj wpłatę"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {activeDebts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 text-center border border-dashed border-gray-700 rounded-xl bg-gray-900/50"
            >
              <Trophy size={48} className="mx-auto text-yellow-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">JESTEŚ WOLNY!</h3>
              <p className="text-gray-400">Wszystkie zobowiązania zostały spłacone. Czas na nowe cele!</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Dodaj Nowe Zobowiązanie"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nazwa</label>
            <input
              type="text"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              placeholder="np. Santander Karta"
              value={newDebt.name}
              onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kwota Początkowa</label>
              <input
                type="number"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                value={newDebt.initial_amount}
                onChange={(e) => setNewDebt({ ...newDebt, initial_amount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Do Spłaty (Dziś)</label>
              <input
                type="number"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                value={newDebt.current_amount}
                onChange={(e) => setNewDebt({ ...newDebt, current_amount: e.target.value })}
                placeholder="Opcjonalnie"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rata Miesięczna</label>
              <input
                type="number"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                value={newDebt.installment}
                onChange={(e) => setNewDebt({ ...newDebt, installment: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Priorytet (1-10)</label>
              <input
                type="number"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                value={newDebt.priority}
                onChange={(e) => setNewDebt({ ...newDebt, priority: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button className="flex-1" onClick={handleSaveNewDebt}>Dodaj Dług</Button>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Anuluj</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edytuj Dług"
      >
        {editingDebt && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nazwa</label>
              <input
                type="text"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                value={editingDebt.name}
                onChange={(e) => setEditingDebt({ ...editingDebt, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kwota Początkowa</label>
                <input
                  type="number"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  value={editingDebt.initial_amount}
                  onChange={(e) => setEditingDebt({ ...editingDebt, initial_amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Do Spłaty</label>
                <input
                  type="number"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  value={editingDebt.current_amount}
                  onChange={(e) => setEditingDebt({ ...editingDebt, current_amount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rata Miesięczna</label>
                <input
                  type="number"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  value={editingDebt.installment || ''}
                  onChange={(e) => setEditingDebt({ ...editingDebt, installment: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Oprocentowanie (%)</label>
                <input
                  type="text"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  value={editingDebt.rate}
                  onChange={(e) => setEditingDebt({ ...editingDebt, rate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button className="flex-1" onClick={handleUpdateDebtDetails}>Zapisz Zmiany</Button>
              <Button variant="danger" onClick={() => {
                handleDeleteDebt(editingDebt.id);
                setIsEditModalOpen(false);
              }}>Usuń Dług</Button>
            </div>
          </div>
        )}
      </Modal>

      <Toaster position="bottom-right" theme="dark" richColors />
      <AICoach context={{ totalDebt, totalPaid, strategy, monthlyInstallments, monthsToFreedom }} />
    </div >
  );
}
