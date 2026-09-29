import React, { useState } from 'react';
import { formatBaht, THAI_MONTHS_SHORT } from '../types';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

export interface MonthlyDataPoint {
  year: number;
  month: number; // 0-11
  label: string; // e.g. "ก.ย. 69"
  income: number;
  expense: number;
  net: number;
}

interface MonthlyComparisonBarChartProps {
  monthlyData: MonthlyDataPoint[];
  selectedMonthKey: string; // e.g. "2026-09"
  onSelectMonth?: (year: number, month: number) => void;
}

export const MonthlyComparisonBarChart: React.FC<MonthlyComparisonBarChartProps> = ({
  monthlyData,
  selectedMonthKey,
  onSelectMonth,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Find max value for scaling
  const maxVal = Math.max(
    ...monthlyData.map((d) => Math.max(d.income, d.expense)),
    1000
  );

  const totalIncomeAll = monthlyData.reduce((acc, d) => acc + d.income, 0);
  const totalExpenseAll = monthlyData.reduce((acc, d) => acc + d.expense, 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BarChart3 size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">เปรียบเทียบรายรับ-รายจ่ายรายเดือน</h3>
              <p className="text-xs text-slate-500">กราฟแท่งเปรียบเทียบย้อนหลัง 6 เดือน</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium self-start sm:self-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span>
            <span className="text-slate-600">รายรับ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block"></span>
            <span className="text-slate-600">รายจ่าย</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full overflow-x-auto pb-2">
        <div className="min-w-[480px] h-64 flex flex-col justify-end pt-6 pb-2">
          {/* Grid lines and bars */}
          <div className="relative flex-1 flex items-end justify-around gap-2 px-2 border-b border-slate-100">
            {/* Horizontal guideline */}
            <div className="absolute inset-x-0 top-0 border-t border-dashed border-slate-200 pointer-events-none" />
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-200 pointer-events-none" />

            {monthlyData.map((d, index) => {
              const incomeHeightPercent = (d.income / maxVal) * 100;
              const expenseHeightPercent = (d.expense / maxVal) * 100;
              const monthKey = `${d.year}-${String(d.month + 1).padStart(2, '0')}`;
              const isSelected = selectedMonthKey === monthKey;
              const isHovered = hoveredIndex === index;

              return (
                <div
                  key={monthKey}
                  onClick={() => onSelectMonth && onSelectMonth(d.year, d.month)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`group relative flex flex-col items-center cursor-pointer transition-all px-2 py-1 rounded-xl ${
                    isSelected ? 'bg-emerald-50/70 ring-1 ring-emerald-200' : 'hover:bg-slate-50'
                  }`}
                  style={{ minWidth: '60px' }}
                >
                  {/* Tooltip on Hover */}
                  {(isHovered || isSelected) && (
                    <div className="absolute -top-24 z-20 bg-slate-900 text-white rounded-xl py-2 px-3 shadow-xl text-center pointer-events-none whitespace-nowrap text-xs border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
                      <div className="font-semibold text-slate-200 pb-1 border-b border-slate-800 mb-1">
                        {d.label}
                      </div>
                      <div className="flex items-center justify-between gap-3 text-emerald-400">
                        <span>รับ:</span>
                        <span className="font-bold">฿{formatBaht(d.income)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-rose-400">
                        <span>จ่าย:</span>
                        <span className="font-bold">฿{formatBaht(d.expense)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-slate-300 pt-1 mt-1 border-t border-slate-800 text-[11px]">
                        <span>คงเหลือ:</span>
                        <span className={d.net >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {d.net >= 0 ? '+' : ''}฿{formatBaht(d.net)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Dual Bars */}
                  <div className="h-44 w-12 flex items-end justify-center gap-1.5">
                    {/* Income Bar */}
                    <div className="w-5 h-full flex items-end">
                      <div
                        style={{ height: `${Math.max(incomeHeightPercent, 3)}%` }}
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          d.income > 0
                            ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-xs group-hover:brightness-110'
                            : 'bg-slate-100'
                        }`}
                      />
                    </div>

                    {/* Expense Bar */}
                    <div className="w-5 h-full flex items-end">
                      <div
                        style={{ height: `${Math.max(expenseHeightPercent, 3)}%` }}
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          d.expense > 0
                            ? 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-xs group-hover:brightness-110'
                            : 'bg-slate-100'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Month Label */}
                  <div className="mt-2 text-center">
                    <span
                      className={`text-xs font-medium block ${
                        isSelected ? 'text-emerald-700 font-bold' : 'text-slate-600'
                      }`}
                    >
                      {d.label}
                    </span>
                    <span
                      className={`text-[10px] block ${
                        d.net >= 0 ? 'text-emerald-600' : 'text-rose-500'
                      }`}
                    >
                      {d.net >= 0 ? '+' : ''}{Math.round(d.net / 1000)}k
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-slate-50 p-2.5 rounded-xl">
          <span className="text-[11px] text-slate-500 block">รายรับรวม 6 เดือน</span>
          <span className="text-sm font-bold text-emerald-600">฿{formatBaht(totalIncomeAll)}</span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl">
          <span className="text-[11px] text-slate-500 block">รายจ่ายรวม 6 เดือน</span>
          <span className="text-sm font-bold text-rose-600">฿{formatBaht(totalExpenseAll)}</span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl col-span-2 sm:col-span-1">
          <span className="text-[11px] text-slate-500 block">ผลต่างสะสม</span>
          <span
            className={`text-sm font-bold ${
              totalIncomeAll - totalExpenseAll >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {totalIncomeAll - totalExpenseAll >= 0 ? '+' : ''}฿{formatBaht(totalIncomeAll - totalExpenseAll)}
          </span>
        </div>
      </div>
    </div>
  );
};
