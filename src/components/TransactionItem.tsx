import React, { useState } from 'react';
import { Transaction, formatBaht, formatThaiDate, getCategoryMeta } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { Edit2, Trash2, AlertCircle } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onEdit,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  const catMeta = getCategoryMeta(transaction.category, transaction.type);
  const isIncome = transaction.type === 'income';

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(transaction.id);
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="group relative bg-white hover:bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3">
      {/* Category Icon & Details */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
          style={{ backgroundColor: catMeta.color }}
        >
          <CategoryIcon name={catMeta.iconName} size={20} className="text-white" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 text-sm truncate">
              {transaction.category}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isIncome
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}
            >
              {isIncome ? 'รายรับ' : 'รายจ่าย'}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
            <span>{formatThaiDate(transaction.date)}</span>
            {transaction.note && (
              <>
                <span>•</span>
                <span className="text-slate-600 truncate max-w-[150px] sm:max-w-[240px]">
                  {transaction.note}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Amount and Actions */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="text-right">
          <span
            className={`font-bold text-sm sm:text-base ${
              isIncome ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isIncome ? '+' : '-'}฿{formatBaht(transaction.amount)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(transaction)}
            title="แก้ไขรายการ"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => setShowConfirmDelete(true)}
            title="ลบรายการ"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal / Popover */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-2">
              <AlertCircle size={22} />
              <h4 className="font-semibold text-slate-800 text-base">ยืนยันการลบรายการ</h4>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              คุณต้องการลบรายการ &quot;{transaction.category}&quot; จำนวน ฿{formatBaht(transaction.amount)} ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 rounded-xl shadow-xs transition-colors"
              >
                {isDeleting ? 'กำลังลบ...' : 'ยืนยันลบ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
