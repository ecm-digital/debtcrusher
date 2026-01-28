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
  Users
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- Supabase Configuration & Initialization ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
try {
  if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('YOUR_SUPABASE_URL')) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (e) {
  console.error('Supabase init error:', e);
}

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

// Initial data backup
const INITIAL_DEBTS = [
  { id: 1, name: 'Vivigo', category: 'Chwilówka', initial_amount: 1458.60, current_amount: 1458.60, rate: '?', priority: 1, note: 'BARDZO WYSOKI - Spłać to natychmiast!' },
  { id: 2, name: 'Santander Karta', category: 'Prywatne', initial_amount: 2092.01, current_amount: 2092.01, rate: '?', priority: 2, note: 'Wysoki - Szybkie zwycięstwo' },
  { id: 3, name: 'Net Credit', category: 'Chwilówka', initial_amount: 4704.50, current_amount: 4704.50, rate: '?', priority: 3, note: 'Wysoki - Uważaj na ukryte koszty' },
  { id: 4, name: 'Wonga', category: 'Pożyczka', initial_amount: 8153.46, current_amount: 8153.46, rate: '?', installment: 1012.55, priority: 4, note: 'Zabójca Cashflow - Rata 1000zł!' },
  { id: 5, name: 'mBank Karta Kredytowa', category: 'Firmowe', initial_amount: 9245.08, current_amount: 9245.08, rate: '15%', priority: 5, note: 'Wysokie oprocentowanie' },
  { id: 6, name: 'Smartkey', category: 'Pożyczka', initial_amount: 12070.71, current_amount: 12070.71, rate: '?', installment: 574.85, priority: 6, note: '' },
  { id: 7, name: 'mBank Odnawialny (Pryw)', category: 'Prywatne', initial_amount: 15200.00, current_amount: 15200.00, rate: '12.10%', priority: 7, note: 'Spłacaj nadwyżkami' },
  { id: 8, name: 'mBank Pożyczka', category: 'Firmowe', initial_amount: 18191.51, current_amount: 18191.51, rate: '12.7%', priority: 8, note: '' },
  { id: 9, name: 'mBank Odnawialny (Firma)', category: 'Firmowe', initial_amount: 18400.00, current_amount: 18400.00, rate: '10.7%', priority: 9, note: 'Najniższy procent' },
  { id: 10, name: 'mBank Raty', category: 'Firmowe', initial_amount: 23072.72, current_amount: 23072.72, rate: '10%', installment: 878.99, priority: 10, note: 'Stabilna rata' },
  { id: 11, name: 'mBank Gotówkowy', category: 'Prywatne', initial_amount: 50119.53, current_amount: 50119.53, rate: '9.88%', installment: 815.56, priority: 11, note: 'Długi termin' },
];

export default function App() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newDebt, setNewDebt] = useState({ name: '', initial_amount: '', category: 'Prywatne', note: '' });

  // 1. Data Loading
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Try Supabase first
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('debts')
            .select('*')
            .order('priority', { ascending: true });

          if (error) throw error;

          if (data && data.length > 0) {
            setDebts(data);
            localStorage.setItem('tomek_debts_v1', JSON.stringify(data));
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Supabase error:", e);
        }
      }

      // Fallback to localStorage
      const localData = localStorage.getItem('tomek_debts_v1');
      if (localData) {
        setDebts(JSON.parse(localData));
      } else {
        setDebts(INITIAL_DEBTS);
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

  const handlePayment = async (id) => {
    if (!payAmount) return;
    const amount = parseFloat(payAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;

    const debt = debts.find(d => d.id === id);
    if (!debt) return;

    const newAmount = Math.max(0, debt.current_amount - amount);
    if (newAmount === 0) triggerSuccess();

    if (supabase) {
      const { error } = await supabase
        .from('debts')
        .update({ current_amount: newAmount })
        .eq('id', id);
      if (error) console.error("Update error:", error);
    }

    const updatedDebts = debts.map(d => d.id === id ? { ...d, current_amount: newAmount } : d);
    persistDebts(updatedDebts);
    setPayAmount('');
    setEditingId(null);
  };

  const handleAddDebt = async (e) => {
    e.preventDefault();
    if (!newDebt.name || !newDebt.initial_amount) return;

    const debtData = {
      name: newDebt.name,
      category: newDebt.category,
      initial_amount: parseFloat(newDebt.initial_amount),
      current_amount: parseFloat(newDebt.initial_amount),
      priority: debts.length + 1,
      note: newDebt.note
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('debts')
        .insert([debtData])
        .select();

      if (!error && data) {
        persistDebts([...debts, data[0]]);
      } else {
        console.error("Insert error:", error);
        // Local only fallback
        persistDebts([...debts, { ...debtData, id: Date.now() }]);
      }
    } else {
      persistDebts([...debts, { ...debtData, id: Date.now() }]);
    }

    setIsAdding(false);
    setNewDebt({ name: '', initial_amount: '', category: 'Prywatne', note: '' });
  };

  const handleDeleteDebt = async (id) => {
    if (!confirm('Czy na pewno chcesz usunąć ten dług?')) return;

    if (supabase) {
      const { error } = await supabase.from('debts').delete().eq('id', id);
      if (error) console.error("Delete error:", error);
    }

    const updatedDebts = debts.filter(d => d.id !== id);
    persistDebts(updatedDebts);
  };

  const handleUndo = async (id) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;

    const newAmount = 100; // Restore small amount as per original logic

    if (supabase) {
      await supabase.from('debts').update({ current_amount: newAmount }).eq('id', id);
    }

    const updatedDebts = debts.map(d => d.id === id ? { ...d, current_amount: newAmount } : d);
    persistDebts(updatedDebts);
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

  const activeDebts = debts
    .filter(d => parseFloat(d.current_amount) > 0)
    .sort((a, b) => parseFloat(a.current_amount) - parseFloat(b.current_amount));

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

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 font-sans selection:bg-emerald-500/30 pb-20">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header Dashboard */}
        <header className="space-y-6 pt-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                Debt Crusher
              </h1>
              <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                <Users size={14} className="text-emerald-500" />
                <span>{supabase ? 'Tryb online: Supabase' : 'Tryb offline: Dane lokalne'}</span>
              </div>
            </div>
            {showConfetti && (
              <div className="animate-bounce bg-yellow-500 text-black font-bold px-4 py-2 rounded-full shadow-lg shadow-yellow-500/50 z-50">
                🎉 GRATULACJE!
              </div>
            )}
          </div>

          <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Pozostało do spłaty</p>
                <div className="text-3xl font-bold text-white">{formatPLN(totalDebt)}</div>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Już spłacono</p>
                <div className="text-3xl font-bold text-emerald-400 flex items-center justify-center md:justify-start gap-2">
                  {formatPLN(totalPaid)}
                  <TrendingDown size={20} />
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Postęp całkowity</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-blue-400">{percentPaid}%</span>
                </div>
                <ProgressBar current={totalDebt} total={initialTotal} colorClass="bg-gradient-to-r from-emerald-500 to-blue-500" />
              </div>
            </div>
          </Card>
        </header>

        {/* ACTIVE DEBTS SECTION */}
        <div className="space-y-4">
          <div className="flex justify-between items-end border-b border-gray-800 pb-2 mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <Zap size={20} className="text-yellow-400 fill-yellow-400" />
              Do spłacenia
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-800 hidden md:block">
                Metoda Kuli Śnieżnej
              </span>
              <Button onClick={() => setIsAdding(!isAdding)} variant="outline" size="sm">
                {isAdding ? 'Anuluj' : '+ Dodaj dług'}
              </Button>
            </div>
          </div>

          {!supabase && (
            <div className="text-xs text-red-400 bg-red-950/20 p-3 rounded border border-red-900/30 mb-4 space-y-1">
              <p><strong>Błąd konfiguracji Supabase (Tryb Offline):</strong></p>
              <p>• URL: {supabaseUrl ? `Wykryto (${supabaseUrl.substring(0, 10)}...)` : 'BRAK'}</p>
              <p>• KEY: {supabaseAnonKey ? `Wykryto (${supabaseAnonKey.substring(0, 5)}...)` : 'BRAK'}</p>
              <p className="mt-2 italic opacity-70">Upewnij się, że plik .env znajduje się w: {`/Users/tomaszgt/Debt Crusher/.env`}</p>
            </div>
          )}

          {isAdding && (
            <Card className="p-6 mb-6 border-emerald-500/30 bg-gray-800 animate-in fade-in slide-in-from-top-4">
              <form onSubmit={handleAddDebt} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase">Nazwa długu</label>
                    <input
                      required
                      value={newDebt.name}
                      onChange={e => setNewDebt({ ...newDebt, name: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                      placeholder="np. Pożyczka Vivus"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase">Kwota (PLN)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={newDebt.initial_amount}
                      onChange={e => setNewDebt({ ...newDebt, initial_amount: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                      placeholder="np. 2500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase">Kategoria</label>
                    <select
                      value={newDebt.category}
                      onChange={e => setNewDebt({ ...newDebt, category: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Chwilówka">Chwilówka</option>
                      <option value="Prywatne">Prywatne</option>
                      <option value="Firmowe">Firmowe</option>
                      <option value="Pożyczka">Pożyczka</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase">Notatka (opcjonalnie)</label>
                    <input
                      value={newDebt.note}
                      onChange={e => setNewDebt({ ...newDebt, note: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                      placeholder="np. Spłać to natychmiast!"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button onClick={() => setIsAdding(false)} variant="secondary">Anuluj</Button>
                  <Button type="submit">Dodaj do listy</Button>
                </div>
              </form>
            </Card>
          )}

          {activeDebts.length === 0 && (
            <div className="p-8 text-center border border-dashed border-gray-700 rounded-xl bg-gray-900/50">
              <Trophy size={48} className="mx-auto text-yellow-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">JESTEŚ WOLNY!</h3>
              <p className="text-gray-400">Wszystkie zobowiązania zostały spłacone. Czas na nowe cele!</p>
            </div>
          )}

          {activeDebts.map((debt, index) => {
            const isTopPriority = index === 0;

            return (
              <Card
                key={debt.id}
                className={`transition-all duration-300 hover:shadow-xl hover:shadow-black/50 ${isTopPriority ? 'ring-1 ring-emerald-500/50 bg-gray-800' : 'bg-gray-800/80 hover:bg-gray-800'}`}
              >
                <div className="p-5">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-white tracking-tight">
                          {debt.name}
                        </h3>
                        {isTopPriority && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-wide animate-pulse">
                            Priorytet
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
                    <ProgressBar current={debt.current_amount} total={debt.initial_amount} colorClass={isTopPriority ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-emerald-600"} />

                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => handleDeleteDebt(debt.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                        title="Usuń dług"
                      >
                        <RotateCcw size={14} className="rotate-45" />
                      </button>

                      {editingId === debt.id ? (
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
                          variant={isTopPriority ? "primary" : "secondary"}
                          size="sm"
                          className="w-full md:w-auto"
                        >
                          <ArrowUpRight size={16} />
                          {isTopPriority ? "Atakuj ten dług!" : "Dodaj wpłatę"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* PAID DEBTS SECTION */}
        {paidDebts.length > 0 && (
          <div className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-gradient-to-r from-transparent via-emerald-900 to-transparent flex-1"></div>
              <h2 className="text-emerald-500 font-bold flex items-center gap-2 text-sm uppercase tracking-[0.2em] px-4 py-1 border border-emerald-900/50 rounded-full bg-emerald-950/30">
                <Trophy size={16} className="text-yellow-500" />
                Hala Zwycięstw ({paidDebts.length})
              </h2>
              <div className="h-px bg-gradient-to-r from-transparent via-emerald-900 to-transparent flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75 hover:opacity-100 transition-opacity">
              {paidDebts.map((debt) => (
                <div key={debt.id} className="group bg-gray-900/40 border border-gray-800 rounded-lg p-4 flex items-center justify-between hover:border-emerald-900/50 hover:bg-gray-900/60 transition-all">
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
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
