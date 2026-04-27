import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2 } from 'lucide-react';

type Entry = {
  id: string;
  name: string;
  amount: string;
  isDeduction?: boolean;
};

const parseNum = (val: string) => {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
};

const formatNum = (val: number) => {
  const isNegative = val < 0;
  const formatted = Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return isNegative ? `(${formatted})` : formatted;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  const [view, setView] = useState<'ma' | 'is' | 'sofp'>('is');

  // Manufacturing Account State
  const [rawMaterials, setRawMaterials] = useState<Entry[]>([
    { id: generateId(), name: 'Opening inventory of raw materials', amount: '' },
    { id: generateId(), name: 'Purchases of raw materials', amount: '' },
    { id: generateId(), name: 'Carriage inwards', amount: '' },
    { id: generateId(), name: 'Closing inv. of raw materials', amount: '', isDeduction: true }
  ]);
  const [directCosts, setDirectCosts] = useState<Entry[]>([
    { id: generateId(), name: 'Direct labour', amount: '' },
    { id: generateId(), name: 'Direct expenses', amount: '' }
  ]);
  const [factoryOverheads, setFactoryOverheads] = useState<Entry[]>([
    { id: generateId(), name: 'Indirect factory wages', amount: '' },
    { id: generateId(), name: 'Factory rent and rates', amount: '' },
    { id: generateId(), name: 'Depreciation of machinery', amount: '' }
  ]);
  const [workInProgress, setWorkInProgress] = useState<Entry[]>([
    { id: generateId(), name: 'Opening work in progress', amount: '' },
    { id: generateId(), name: 'Closing work in progress', amount: '', isDeduction: true }
  ]);

  // Income Statement State
  const [revenue, setRevenue] = useState<Entry[]>([
    { id: generateId(), name: 'Sales revenue', amount: '' },
    { id: generateId(), name: 'Sales returns', amount: '', isDeduction: true }
  ]);
  const [costOfSales, setCostOfSales] = useState<Entry[]>([
    { id: generateId(), name: 'Opening inventory', amount: '' },
    { id: generateId(), name: 'Purchases', amount: '' },
    { id: generateId(), name: 'Closing inventory', amount: '', isDeduction: true }
  ]);
  const [otherIncome, setOtherIncome] = useState<Entry[]>([
    { id: generateId(), name: 'Discount received', amount: '' }
  ]);
  const [expenses, setExpenses] = useState<Entry[]>([
    { id: generateId(), name: 'Wages and salaries', amount: '' },
    { id: generateId(), name: 'Rent and rates', amount: '' },
    { id: generateId(), name: 'Depreciation', amount: '' }
  ]);

  // Balance Sheet (SOFP) State
  const [nca, setNca] = useState<Entry[]>([
    { id: generateId(), name: 'Fixtures and fittings', amount: '' },
    { id: generateId(), name: 'Motor vehicles', amount: '' }
  ]);
  const [ca, setCa] = useState<Entry[]>([
    { id: generateId(), name: 'Inventory', amount: '' },
    { id: generateId(), name: 'Trade receivables', amount: '' },
    { id: generateId(), name: 'Provision for doubtful debts', amount: '', isDeduction: true },
    { id: generateId(), name: 'Bank', amount: '' }
  ]);
  const [capital, setCapital] = useState({
    opening: '',
    profit: '',
    drawings: ''
  });
  const [ncl, setNcl] = useState<Entry[]>([]);
  const [cl, setCl] = useState<Entry[]>([
    { id: generateId(), name: 'Trade payables', amount: '' },
    { id: generateId(), name: 'Other payables', amount: '' }
  ]);

  // --- Calculations for Manufacturing Account ---
  const totalCostOfRawMaterials = useMemo(() => rawMaterials.reduce((acc, curr) => acc + (curr.isDeduction ? -parseNum(curr.amount) : parseNum(curr.amount)), 0), [rawMaterials]);
  const totalDirectCosts = useMemo(() => directCosts.reduce((acc, curr) => acc + (curr.isDeduction ? -parseNum(curr.amount) : parseNum(curr.amount)), 0), [directCosts]);
  const primeCost = totalCostOfRawMaterials + totalDirectCosts;

  const totalFactoryOverheads = useMemo(() => factoryOverheads.reduce((acc, curr) => acc + (curr.isDeduction ? -parseNum(curr.amount) : parseNum(curr.amount)), 0), [factoryOverheads]);
  const totalWipAdjustments = useMemo(() => workInProgress.reduce((acc, curr) => acc + (curr.isDeduction ? -parseNum(curr.amount) : parseNum(curr.amount)), 0), [workInProgress]);
  const costOfProduction = primeCost + totalFactoryOverheads + totalWipAdjustments;

  const isMaLinked = useMemo(() => {
    return [...rawMaterials, ...directCosts, ...factoryOverheads, ...workInProgress].some(e => e.amount && parseNum(e.amount) !== 0);
  }, [rawMaterials, directCosts, factoryOverheads, workInProgress]);

  // --- Calculations for Income Statement ---
  const totalRevenue = useMemo(() => revenue.reduce((acc, curr) => acc + (curr.isDeduction ? -parseNum(curr.amount) : parseNum(curr.amount)), 0), [revenue]);
  
  const baseCostOfSales = useMemo(() => costOfSales.reduce((acc, curr) => acc + (curr.isDeduction ? -parseNum(curr.amount) : parseNum(curr.amount)), 0), [costOfSales]);
  const totalCostOfSales = baseCostOfSales + (isMaLinked ? costOfProduction : 0);
  
  const grossProfit = totalRevenue - totalCostOfSales;

  const totalOtherIncome = useMemo(() => otherIncome.reduce((acc, curr) => acc + (curr.isDeduction ? -parseNum(curr.amount) : parseNum(curr.amount)), 0), [otherIncome]);
  const totalExpenses = useMemo(() => expenses.reduce((acc, curr) => acc + (curr.isDeduction ? -parseNum(curr.amount) : parseNum(curr.amount)), 0), [expenses]);
  const netProfit = grossProfit + totalOtherIncome - totalExpenses;

  const isNetProfitLinked = useMemo(() => {
    return [...revenue, ...costOfSales, ...otherIncome, ...expenses].some(e => e.amount && parseNum(e.amount) !== 0);
  }, [revenue, costOfSales, otherIncome, expenses]);

  // --- Calculations for Balance Sheet ---
  const totalNca = useMemo(() => nca.reduce((acc, curr) => acc + (curr.isDeduction ? -parseNum(curr.amount) : parseNum(curr.amount)), 0), [nca]);
  const totalCa = useMemo(() => ca.reduce((acc, curr) => acc + (curr.isDeduction ? -parseNum(curr.amount) : parseNum(curr.amount)), 0), [ca]);
  const totalAssets = totalNca + totalCa;

  const effectiveProfit = isNetProfitLinked ? netProfit : parseNum(capital.profit);
  const totalCapital = useMemo(() => parseNum(capital.opening) + effectiveProfit - parseNum(capital.drawings), [capital, effectiveProfit]);
  const totalNcl = useMemo(() => ncl.reduce((acc, curr) => acc + (curr.isDeduction ? -parseNum(curr.amount) : parseNum(curr.amount)), 0), [ncl]);
  const totalCl = useMemo(() => cl.reduce((acc, curr) => acc + (curr.isDeduction ? -parseNum(curr.amount) : parseNum(curr.amount)), 0), [cl]);
  const totalCapAndLiab = totalCapital + totalNcl + totalCl;

  const isBalanced = totalAssets === totalCapAndLiab && totalAssets !== 0;
  const difference = Math.abs(totalAssets - totalCapAndLiab);

  // --- Helpers ---
  const updateEntry = (setter: React.Dispatch<React.SetStateAction<Entry[]>>, id: string, field: keyof Entry, value: string | boolean) => {
    setter(prev => prev.map(entry => entry.id === id ? { ...entry, [field]: value } : entry));
  };

  const removeEntry = (setter: React.Dispatch<React.SetStateAction<Entry[]>>, id: string) => {
    setter(prev => prev.filter(entry => entry.id !== id));
  };

  const addEntry = (setter: React.Dispatch<React.SetStateAction<Entry[]>>, isDeduction = false) => {
    setter(prev => [...prev, { id: generateId(), name: '', amount: '', isDeduction }]);
  };

  const resetSection = () => {
    if (view === 'ma') {
      setRawMaterials(prev => prev.map(e => ({ ...e, amount: '' })));
      setDirectCosts(prev => prev.map(e => ({ ...e, amount: '' })));
      setFactoryOverheads(prev => prev.map(e => ({ ...e, amount: '' })));
      setWorkInProgress(prev => prev.map(e => ({ ...e, amount: '' })));
    } else if (view === 'is') {
      setRevenue(prev => prev.map(e => ({ ...e, amount: '' })));
      setCostOfSales(prev => prev.map(e => ({ ...e, amount: '' })));
      setOtherIncome(prev => prev.map(e => ({ ...e, amount: '' })));
      setExpenses(prev => prev.map(e => ({ ...e, amount: '' })));
    } else {
      setNca(prev => prev.map(e => ({ ...e, amount: '' })));
      setCa(prev => prev.map(e => ({ ...e, amount: '' })));
      setNcl(prev => prev.map(e => ({ ...e, amount: '' })));
      setCl(prev => prev.map(e => ({ ...e, amount: '' })));
      setCapital({ opening: '', profit: '', drawings: '' });
    }
  };

  const renderSection = (
    title: string,
    entries: Entry[],
    setter: React.Dispatch<React.SetStateAction<Entry[]>>
  ) => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[11px] font-bold uppercase text-[#555]">{title}</h4>
        <div className="flex gap-4">
          <button onClick={() => addEntry(setter)} className="text-[9px] uppercase tracking-wider font-bold text-[#8A8A85] hover:text-[#1A1A1A] transition-colors">+ Add</button>
          <button onClick={() => addEntry(setter, true)} className="text-[9px] uppercase tracking-wider font-bold text-red-600 hover:text-red-700 transition-colors">- Less</button>
        </div>
      </div>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-between items-baseline group"
            >
              <input
                type="text"
                value={entry.name}
                onChange={(e) => updateEntry(setter, entry.id, 'name', e.target.value)}
                placeholder="Item name"
                className="text-sm text-[#444] bg-transparent border-b border-transparent hover:border-[#1A1A1A] focus:border-[#1A1A1A] w-[40%] focus:outline-none transition-colors truncate"
              />
              <div className="flex-1 mx-2 sm:mx-4 border-b border-dotted border-[#CCC]"></div>
              <div className="relative w-28 sm:w-32 flex justify-end items-baseline group/input">
                {entry.isDeduction && <span className="text-red-700 font-mono text-sm self-center mr-1">(</span>}
                <input
                  type="number"
                  value={entry.amount}
                  onChange={(e) => updateEntry(setter, entry.id, 'amount', e.target.value)}
                  placeholder="0.00"
                  className={`w-20 sm:w-24 text-right bg-transparent border-none font-mono text-sm focus:ring-0 p-0 focus:outline-none ${entry.isDeduction ? 'text-red-700' : ''}`}
                />
                {entry.isDeduction && <span className="text-red-700 font-mono text-sm self-center ml-1">)</span>}
                
                <button 
                  onClick={() => removeEntry(setter, entry.id)}
                  className="absolute -right-6 text-[#CCC] hover:text-red-500 opacity-0 group-hover/input:opacity-100 transition-opacity flex-shrink-0 self-center"
                  tabIndex={-1}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {entries.length === 0 && (
          <div className="text-sm text-[#8A8A85] italic py-1">No items added.</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#FDFDFB] text-[#1A1A1A] font-sans flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-10 py-6 border-b border-[#E5E5E1] shrink-0">
        <div>
          <h1 className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#8A8A85]">Student Ledger Tool v1.0</h1>
          <h2 className="text-lg md:text-2xl font-serif italic mt-1">BalanceIt: Sole Trader</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[8px] md:text-[10px] uppercase tracking-tighter text-[#8A8A85] mb-1">Status Overview</span>
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                  <span className="font-mono text-xs md:text-sm font-bold text-emerald-600 tracking-tight italic">BALANCED</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
                  <span className="font-mono text-xs md:text-sm font-bold text-red-600 tracking-tight italic">
                    UNBALANCED <span className="hidden md:inline">({formatNum(difference)})</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Menu */}
      <nav className="flex items-center justify-between border-b border-[#E5E5E1] bg-[#FAFAF8] px-6 lg:px-10 shrink-0 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex items-center gap-0">
          <button
            onClick={() => setView('ma')}
            className={`py-4 px-2 sm:px-4 text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${view === 'ma' ? 'text-[#1A1A1A] border-b-[3px] border-[#1A1A1A] mb-[-1px]' : 'text-[#8A8A85] hover:text-[#1A1A1A] border-b-[3px] border-transparent mb-[-1px]'}`}
          >
            Manufacturing Account
          </button>
          <button
            onClick={() => setView('is')}
            className={`py-4 px-2 sm:px-4 text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${view === 'is' ? 'text-[#1A1A1A] border-b-[3px] border-[#1A1A1A] mb-[-1px]' : 'text-[#8A8A85] hover:text-[#1A1A1A] border-b-[3px] border-transparent mb-[-1px]'}`}
          >
            Income Statement
          </button>
          <button
            onClick={() => setView('sofp')}
            className={`py-4 px-2 sm:px-4 text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${view === 'sofp' ? 'text-[#1A1A1A] border-b-[3px] border-[#1A1A1A] mb-[-1px]' : 'text-[#8A8A85] hover:text-[#1A1A1A] border-b-[3px] border-transparent mb-[-1px]'}`}
          >
            Statement of Financial Position
          </button>
        </div>
        <button
          onClick={resetSection}
          className="py-4 px-2 sm:px-4 text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap text-[#8A8A85] hover:text-red-700 transition-colors shrink-0 flex items-center gap-2 group"
          title="Clear all values in this tab"
        >
          <span className="hidden sm:inline">Clear {view === 'ma' ? 'M.A.' : view === 'is' ? 'I.S.' : 'S.O.F.P.'} Values</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </nav>

      {/* Main Grid: Manufacturing Account */}
      {view === 'ma' && (
        <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 pb-32 md:pb-0 relative animate-in fade-in duration-500">
          
          {/* Prime Cost Column */}
          <section className="border-b md:border-b-0 md:border-r border-[#E5E5E1] flex flex-col transition-colors min-h-[300px]">
            <div className="bg-[#F5F5F2] px-6 lg:px-10 py-3 border-b border-[#E5E5E1] flex justify-between items-center shrink-0">
              <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Prime Cost</h3>
              <span className="text-[9px] md:text-[10px] text-[#8A8A85]">Section 1</span>
            </div>
            
            <div className="flex-1 px-6 lg:px-10 py-8 overflow-y-auto">
              {renderSection('Raw Materials', rawMaterials, setRawMaterials)}
              <div className="border-t border-[#E5E5E1] pt-3 mb-10 flex justify-between">
                <span className="text-xs font-bold text-[#1A1A1A] uppercase max-w-[200px] leading-tight flex items-center">Cost of Raw Materials Consumed</span>
                <span className="font-mono text-sm font-bold text-[#1A1A1A] self-center">{formatNum(totalCostOfRawMaterials)}</span>
              </div>

              {renderSection('Direct Costs', directCosts, setDirectCosts)}
            </div>

            <div className="mt-auto px-6 lg:px-10 py-6 border-t border-[#E5E5E1] bg-[#FAFAF8] flex justify-between items-end shrink-0">
              <span className="text-[10px] md:text-xs font-bold uppercase">Prime Cost</span>
              <span className="font-mono text-lg font-bold border-b-4 border-double border-[#1A1A1A] pb-0.5 leading-none">
                {formatNum(primeCost)}
              </span>
            </div>
          </section>

          {/* Factory Overheads & WIP Column */}
          <section className="flex flex-col transition-colors min-h-[300px]">
            <div className="bg-[#F5F5F2] px-6 lg:px-10 py-3 border-b border-[#E5E5E1] flex justify-between items-center shrink-0">
              <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Factory Overheads & WIP</h3>
              <span className="text-[9px] md:text-[10px] text-[#8A8A85]">Section 2</span>
            </div>

            <div className="flex-1 px-6 lg:px-10 py-8 overflow-y-auto">
              {renderSection('Factory Overheads', factoryOverheads, setFactoryOverheads)}
              <div className="border-t border-[#E5E5E1] pt-3 mb-10 flex justify-between">
                <span className="text-xs font-bold text-[#1A1A1A] uppercase">Total Factory Overheads</span>
                <span className="font-mono text-sm font-bold text-[#1A1A1A]">{formatNum(totalFactoryOverheads)}</span>
              </div>

              {renderSection('Work in Progress', workInProgress, setWorkInProgress)}
            </div>

            <div className="mt-auto px-6 lg:px-10 py-6 border-t border-[#E5E5E1] bg-[#FAFAF8] flex justify-between items-end shrink-0">
              <span className="text-[10px] md:text-xs font-bold uppercase">Cost of Production</span>
              <span className="font-mono text-lg font-bold border-b-4 border-double border-[#1A1A1A] pb-0.5 leading-none">
                {formatNum(costOfProduction)}
              </span>
            </div>
          </section>

        </main>
      )}

      {/* Main Grid: Income Statement */}
      {view === 'is' && (
        <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 pb-32 md:pb-0 relative animate-in fade-in duration-500">
          
          {/* Left Column: Trading Account */}
          <section className="border-b md:border-b-0 md:border-r border-[#E5E5E1] flex flex-col transition-colors min-h-[300px]">
            <div className="bg-[#F5F5F2] px-6 lg:px-10 py-3 border-b border-[#E5E5E1] flex justify-between items-center shrink-0">
              <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Trading Account</h3>
              <span className="text-[9px] md:text-[10px] text-[#8A8A85]">Section I</span>
            </div>
            
            <div className="flex-1 px-6 lg:px-10 py-8 overflow-y-auto">
              {renderSection('Revenue', revenue, setRevenue)}
              <div className="border-t border-[#E5E5E1] pt-3 mb-10 flex justify-between">
                <span className="text-xs font-bold text-[#1A1A1A] uppercase">Net Revenue</span>
                <span className="font-mono text-sm font-bold text-[#1A1A1A]">{formatNum(totalRevenue)}</span>
              </div>

              {renderSection('Cost of Sales', costOfSales, setCostOfSales)}
              
              {isMaLinked && (
                <div className="space-y-2 mb-8 -mt-4">
                  <div className="flex justify-between items-baseline group">
                    <span className="text-sm text-[#444] flex items-center gap-2">
                      Add: Cost of Production
                      <span className="text-[8px] bg-[#1A1A1A] text-white px-1.5 py-0.5 pb-[3px] uppercase tracking-wide rounded-sm leading-none shrink-0 self-center mt-[1px]">from M.A.</span>
                    </span>
                    <div className="flex-1 mx-2 sm:mx-4 border-b border-dotted border-[#CCC]"></div>
                    <div className="w-20 sm:w-24 text-right font-mono text-sm self-end">
                      {formatNum(costOfProduction)}
                    </div>
                    <div className="w-4 sm:w-6 ml-0"></div>
                  </div>
                </div>
              )}

              <div className="border-t border-[#E5E5E1] pt-3 mb-8 flex justify-between">
                <span className="text-xs font-bold text-[#1A1A1A] uppercase">Cost of Sales</span>
                <span className="font-mono text-sm font-bold text-red-700">({formatNum(totalCostOfSales)})</span>
              </div>
            </div>

            <div className="mt-auto px-6 lg:px-10 py-6 border-t border-[#E5E5E1] bg-[#FAFAF8] flex justify-between items-end shrink-0">
              <span className="text-[10px] md:text-xs font-bold uppercase">Gross Profit</span>
              <span className="font-mono text-lg font-bold border-b-4 border-double border-[#1A1A1A] pb-0.5 leading-none">
                {formatNum(grossProfit)}
              </span>
            </div>
          </section>

          {/* Right Column: Profit & Loss */}
          <section className="flex flex-col transition-colors min-h-[300px]">
            <div className="bg-[#F5F5F2] px-6 lg:px-10 py-3 border-b border-[#E5E5E1] flex justify-between items-center shrink-0">
              <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Profit & Loss</h3>
              <span className="text-[9px] md:text-[10px] text-[#8A8A85]">Section II</span>
            </div>

            <div className="flex-1 px-6 lg:px-10 py-8 overflow-y-auto">
              {renderSection('Other Income', otherIncome, setOtherIncome)}
              <div className="border-t border-[#E5E5E1] pt-3 mb-10 flex justify-between">
                <span className="text-xs font-bold text-[#1A1A1A] uppercase">Total Other Income</span>
                <span className="font-mono text-sm font-bold text-[#1A1A1A]">{formatNum(totalOtherIncome)}</span>
              </div>

              {renderSection('Expenses', expenses, setExpenses)}
              <div className="border-t border-[#E5E5E1] pt-3 mb-8 flex justify-between">
                <span className="text-xs font-bold text-[#1A1A1A] uppercase">Total Expenses</span>
                <span className="font-mono text-sm font-bold text-red-700">({formatNum(totalExpenses)})</span>
              </div>
            </div>

            <div className="mt-auto px-6 lg:px-10 py-6 border-t border-[#E5E5E1] bg-[#FAFAF8] flex justify-between items-end shrink-0">
              <span className="text-[10px] md:text-xs font-bold uppercase">Net Profit / (Loss)</span>
              <span className={`font-mono text-lg font-bold border-b-4 border-double border-[#1A1A1A] pb-0.5 leading-none ${netProfit < 0 ? 'text-red-700' : 'text-[#1A1A1A]'}`}>
                {formatNum(netProfit)}
              </span>
            </div>
          </section>

        </main>
      )}

      {/* Main Grid: SOFP */}
      {view === 'sofp' && (
        <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 pb-32 md:pb-0 relative animate-in fade-in duration-500">
          
          {/* Assets Column */}
          <section className="border-b md:border-b-0 md:border-r border-[#E5E5E1] flex flex-col transition-colors min-h-[300px]">
            <div className="bg-[#F5F5F2] px-6 lg:px-10 py-3 border-b border-[#E5E5E1] flex justify-between items-center shrink-0">
              <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Assets</h3>
              <span className="text-[9px] md:text-[10px] text-[#8A8A85]">Section A</span>
            </div>
            
            <div className="flex-1 px-6 lg:px-10 py-8 overflow-y-auto">
              {renderSection('Non-current Assets', nca, setNca)}
              {renderSection('Current Assets', ca, setCa)}
            </div>

            <div className="mt-auto px-6 lg:px-10 py-6 border-t border-[#E5E5E1] bg-[#FAFAF8] flex justify-between items-end shrink-0">
              <span className="text-[10px] md:text-xs font-bold uppercase">Total Assets</span>
              <span className="font-mono text-lg font-bold border-b-4 border-double border-[#1A1A1A] pb-0.5 leading-none">
                {formatNum(totalAssets)}
              </span>
            </div>
          </section>

          {/* Capital & Liabilities Column */}
          <section className="flex flex-col transition-colors min-h-[300px]">
            <div className="bg-[#F5F5F2] px-6 lg:px-10 py-3 border-b border-[#E5E5E1] flex justify-between items-center shrink-0">
              <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Capital & Liabilities</h3>
              <span className="text-[9px] md:text-[10px] text-[#8A8A85]">Section B</span>
            </div>

            <div className="flex-1 px-6 lg:px-10 py-8 overflow-y-auto">
              {/* Capital Input Block */}
              <div className="mb-8">
                <h4 className="text-[11px] font-bold uppercase mb-3 text-[#555]">Capital</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline group">
                    <span className="text-sm text-[#444]">Opening Balance</span>
                    <div className="flex-1 mx-2 sm:mx-4 border-b border-dotted border-[#CCC]"></div>
                    <input
                      type="number"
                      value={capital.opening}
                      onChange={(e) => setCapital(prev => ({ ...prev, opening: e.target.value }))}
                      placeholder="0.00"
                      className="w-20 sm:w-24 text-right bg-transparent border-none font-mono text-sm focus:ring-0 p-0 focus:outline-none placeholder-[#CCC]"
                    />
                    <div className="w-4 sm:w-6 ml-0"></div>
                  </div>
                  <div className="flex justify-between items-baseline group">
                    <span className="text-sm text-[#444] flex items-center gap-2">
                      Add: Net Profit (or Less: Loss)
                      {isNetProfitLinked && <span className="text-[8px] bg-[#1A1A1A] text-white px-1.5 py-0.5 pb-[3px] uppercase tracking-wide rounded-sm leading-none shrink-0 self-center mt-[1px]">from I.S.</span>}
                    </span>
                    <div className="flex-1 mx-2 sm:mx-4 border-b border-dotted border-[#CCC]"></div>
                    {isNetProfitLinked ? (
                      <div className={`w-20 sm:w-24 text-right font-mono text-sm self-end ${netProfit < 0 ? 'text-red-700' : ''}`}>
                        {formatNum(netProfit)}
                      </div>
                    ) : (
                      <input
                        type="number"
                        value={capital.profit}
                        onChange={(e) => setCapital(prev => ({ ...prev, profit: e.target.value }))}
                        placeholder="0.00"
                        className="w-20 sm:w-24 text-right bg-transparent border-none font-mono text-sm focus:ring-0 p-0 focus:outline-none placeholder-[#CCC]"
                      />
                    )}
                    <div className="w-4 sm:w-6 ml-0"></div>
                  </div>
                  <div className="flex justify-between items-baseline group">
                    <span className="text-sm text-[#444] font-medium">Less: Drawings</span>
                    <div className="flex-1 mx-2 sm:mx-4 border-b border-dotted border-[#CCC]"></div>
                    <div className="relative w-24 sm:w-32 flex justify-end items-baseline">
                      <span className="text-red-700 font-mono text-sm mr-1">(</span>
                      <input
                        type="number"
                        value={capital.drawings}
                        onChange={(e) => setCapital(prev => ({ ...prev, drawings: e.target.value }))}
                        placeholder="0.00"
                        className="w-20 sm:w-24 text-right bg-transparent border-none font-mono text-sm focus:ring-0 p-0 focus:outline-none text-red-700 placeholder-[#CCC]"
                      />
                      <span className="text-red-700 font-mono text-sm ml-1">)</span>
                    </div>
                    <div className="w-4 sm:w-6 ml-0"></div>
                  </div>
                </div>
              </div>

              {renderSection('Non-current Liabilities', ncl, setNcl)}
              {renderSection('Current Liabilities', cl, setCl)}
            </div>

            <div className="mt-auto px-6 lg:px-10 py-6 border-t border-[#E5E5E1] bg-[#FAFAF8] flex justify-between items-end shrink-0">
              <span className="text-[10px] md:text-xs font-bold uppercase md:max-w-none max-w-[120px] leading-tight">Total Capital & Liab.</span>
              <span className="font-mono text-lg font-bold border-b-4 border-double border-[#1A1A1A] pb-0.5 leading-none">
                {formatNum(totalCapAndLiab)}
              </span>
            </div>
          </section>

        </main>
      )}

      {/* MOBILE BALANCE BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FAFAF8] border-t border-[#E5E5E1] p-0 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        {view === 'sofp' ? (
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A85]">BS Status</span>
              <div className="flex items-center gap-2">
                {isBalanced ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                    <span className="font-mono text-sm font-bold text-emerald-600 tracking-tight italic">BALANCED</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
                    <span className="font-mono text-sm font-bold text-red-600 tracking-tight italic">UNBALANCED</span>
                  </>
                )}
              </div>
            </div>
            {!isBalanced && (
              <div className="bg-[#FFF6F6] px-6 py-3 border-t border-red-100 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Difference</span>
                <span className="font-mono font-bold text-red-600">{formatNum(difference)}</span>
              </div>
            )}
          </div>
        ) : view === 'is' ? (
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-6 py-4">
               <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A85]">Net Profit / (Loss)</span>
               <span className={`font-mono text-sm font-bold tracking-tight italic ${netProfit < 0 ? 'text-red-700' : 'text-[#1A1A1A]'}`}>
                 {formatNum(netProfit)}
               </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-6 py-4">
               <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A85]">Cost of Production</span>
               <span className={`font-mono text-sm font-bold tracking-tight italic text-[#1A1A1A]`}>
                 {formatNum(costOfProduction)}
               </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
