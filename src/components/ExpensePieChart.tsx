import React, { useState } from 'react';
import { formatBaht, getCategoryMeta } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { PieChart as PieChartIcon } from 'lucide-react';

interface ExpenseCategoryTotal {
  category: string;
  total: number;
  color: string;
  iconName: string;
  percentage: number;
}

interface ExpensePieChartProps {
  categoryTotals: ExpenseCategoryTotal[];
  totalExpense: number;
}

export const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ categoryTotals, totalExpense }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (totalExpense === 0 || categoryTotals.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[340px] text-center">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3">
          <PieChartIcon size={32} />
        </div>
        <h4 className="text-base font-semibold text-slate-700">ไม่มีข้อมูลรายจ่ายในเดือนนี้</h4>
        <p className="text-sm text-slate-400 mt-1 max-w-xs">
          เมื่อคุณเพิ่มรายการรายจ่าย กราฟวงกลมจะแสดงสัดส่วนค่าใช้จ่ายตามหมวดหมู่ทันที
        </p>
      </div>
    );
  }

  // Calculate SVG donut slice paths
  const size = 260;
  const center = size / 2;
  const radius = 95;
  const innerRadius = 55;

  let cumulativeAngle = 0;

  const slices = categoryTotals.map((item, idx) => {
    const angle = (item.total / totalExpense) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const x3 = center + innerRadius * Math.cos(endRad);
    const y3 = center + innerRadius * Math.sin(endRad);
    const x4 = center + innerRadius * Math.cos(startRad);
    const y4 = center + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    // SVG path for donut slice
    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');

    return {
      ...item,
      pathData,
      startAngle,
      endAngle,
      index: idx,
    };
  });

  const activeCategory = hoveredIndex !== null ? categoryTotals[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800 text-lg">สัดส่วนรายจ่ายตามหมวดหมู่</h3>
          <p className="text-xs text-slate-500">กราฟวงกลมแสดง % การใช้จ่ายในเดือนนี้</p>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full border border-rose-100">
          รวม ฿{formatBaht(totalExpense)}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
        {/* SVG Donut */}
        <div className="relative w-[260px] h-[260px] flex items-center justify-center shrink-0">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            {slices.map((slice) => {
              const isHovered = hoveredIndex === slice.index;
              return (
                <path
                  key={slice.category}
                  d={slice.pathData}
                  fill={slice.color}
                  className="transition-all duration-200 cursor-pointer"
                  style={{
                    opacity: hoveredIndex === null || isHovered ? 1 : 0.45,
                    transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                    transformOrigin: `${center}px ${center}px`,
                  }}
                  onMouseEnter={() => setHoveredIndex(slice.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>

          {/* Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            {activeCategory ? (
              <>
                <span className="text-xs font-medium text-slate-500 truncate max-w-[120px]">
                  {activeCategory.category}
                </span>
                <span className="text-base font-bold text-slate-800">
                  ฿{formatBaht(activeCategory.total)}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5" style={{ backgroundColor: `${activeCategory.color}20`, color: activeCategory.color }}>
                  {activeCategory.percentage.toFixed(1)}%
                </span>
              </>
            ) : (
              <>
                <span className="text-xs text-slate-400 font-medium">รายจ่ายรวม</span>
                <span className="text-sm font-bold text-slate-800">฿{formatBaht(totalExpense)}</span>
                <span className="text-[11px] text-slate-400">{categoryTotals.length} หมวดหมู่</span>
              </>
            )}
          </div>
        </div>

        {/* Categories Legend */}
        <div className="flex-1 w-full max-h-[260px] overflow-y-auto space-y-2 pr-1">
          {categoryTotals.map((item, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <div
                key={item.category}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                  isHovered ? 'bg-slate-100/90 shadow-xs' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: item.color }}
                  >
                    <CategoryIcon name={item.iconName} size={14} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 truncate max-w-[130px]">
                    {item.category}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-semibold text-slate-800">
                    ฿{formatBaht(item.total)}
                  </div>
                  <div className="text-[11px] font-medium text-slate-400">
                    {item.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
