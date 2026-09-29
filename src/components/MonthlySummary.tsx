import React from 'react';
import {
  formatBaht,
  formatThaiMonthYear,
  THAI_MONTHS,
} from '../types';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Calendar,
  PiggyBank,
} from 'lucide-react';

interface MonthlySummaryProps {
  selectedYear: number;
  selectedMonth: number; // 0-11
  onMonthChange: (year: number, month: number) => void;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  selectedYear,
  selectedMonth,
  onMonthChange,
  totalIncome,
  totalExpense,
  balance,
}) => {
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      onMonthChange(selectedYear - 1, 11);
    } else {
      onMonthChange(selectedYear, selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      onMonthChange(selectedYear + 1, 0);
    } else {
      onMonthChange(selectedYear, selectedMonth + 1);
    }
  };

  const handleJumpToCurrent = () => {
    const now = new Date();
    onMonthChange(now.getFullYear(), now.getMonth());
  };

  // Savings rate calculation
  const savingsRate =
    totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Month Selector Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Calendar size={18} />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            เลือกเดือนที่ต้องการดูข้อมูล
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={handlePrevMonth}
            title="เดือนก่อนหน้า"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-semibold text-slate-800 text-sm">
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(selectedYear, parseInt(e.target.value, 10))}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              {THAI_MONTHS.map((m, idx) => (
                <option key={m} value={idx}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => onMonthChange(parseInt(e.target.value, 10), selectedMonth)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 7 }, (_, i) => 2023 + i).map((y) => (
                <option key={y} value={y}>
                  พ.ศ. {y + 543}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleNextMonth}
            title="เดือนถัดไป"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ChevronRight size={20} />
          </button>

          <button
            onClick={handleJumpToCurrent}
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors border border-emerald-200 ml-1"
          >
            เดือนปัจจุบัน
          </button>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Income Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100/80 relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">รายรับรวม</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <ArrowDownLeft size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 tracking-tight">
            ฿{formatBaht(totalIncome)}
          </div>
          <div className="mt-2 text-xs font-medium text-emerald-600 flex items-center gap-1">
            <span>รายรับของเดือน {formatThaiMonthYear(selectedYear, selectedMonth)}</span>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100/80 relative overflow-hidden group hover:border-rose-300 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">รายจ่ายรวม</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 tracking-tight">
            ฿{formatBaht(totalExpense)}
          </div>
          <div className="mt-2 text-xs font-medium text-rose-600 flex items-center gap-1">
            <span>รายจ่ายของเดือน {formatThaiMonthYear(selectedYear, selectedMonth)}</span>
          </div>
        </div>

        {/* Balance Card */}
        <div
          className={`bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden group transition-all border ${
            balance >= 0 ? 'border-sky-100 hover:border-sky-300' : 'border-amber-200 hover:border-amber-300'
          }`}
        >
          <div
            className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none ${
              balance >= 0 ? 'bg-sky-50' : 'bg-amber-50'
            }`}
          />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">ยอดคงเหลือ</span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${
                balance >= 0 ? 'bg-sky-50 text-sky-600' : 'bg-amber-50 text-amber-600'
              }`}
            >
              <Wallet size={18} />
            </div>
          </div>
          <div
            className={`text-2xl font-bold tracking-tight ${
              balance >= 0 ? 'text-sky-700' : 'text-amber-600'
            }`}
          >
            {balance >= 0 ? '' : '-'}฿{formatBaht(Math.abs(balance))}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <PiggyBank size={14} className="text-emerald-500" />
              ออมได้ {savingsRate.toFixed(0)}%
            </span>
            <span className={balance >= 0 ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
              {balance >= 0 ? 'สถานะการเงินปกติ' : 'ใช้เกินรายรับ'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
