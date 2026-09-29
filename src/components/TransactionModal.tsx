import React, { useState, useEffect } from 'react';
import {
  Transaction,
  TransactionType,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  getCategoryMeta,
} from '../types';
import { CategoryIcon } from './CategoryIcon';
import { X, Check, Calendar, Tag, FileText, Plus, DollarSign } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, editId?: string) => Promise<void>;
  editItem?: Transaction | null;
  defaultDate?: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
  defaultDate,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editItem) {
      setType(editItem.type);
      setAmount(editItem.amount.toString());
      setCategory(editItem.category);
      setDate(editItem.date);
      setNote(editItem.note || '');
    } else {
      const today = defaultDate || new Date().toISOString().split('T')[0];
      setType('expense');
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[0].label);
      setDate(today);
      setNote('');
    }
    setErrorMessage(null);
  }, [editItem, defaultDate, isOpen]);

  if (!isOpen) return null;

  const currentCategoryList = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const defaultCat = newType === 'expense' ? EXPENSE_CATEGORIES[0].label : INCOME_CATEGORIES[0].label;
    setCategory(defaultCat);
  };

  const handleAddQuickAmount = (val: number) => {
    const cur = parseFloat(amount) || 0;
    setAmount((cur + val).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('กรุณาระบุจำนวนเงินที่มากกว่า 0');
      return;
    }

    if (!category.trim()) {
      setErrorMessage('กรุณาเลือกหรือระบุหมวดหมู่');
      return;
    }

    if (!date) {
      setErrorMessage('กรุณาเลือกวันที่');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(
        {
          type,
          amount: Math.round(parsedAmount * 100) / 100,
          category: category.trim(),
          date,
          note: note.trim() || undefined,
        },
        editItem?.id
      );
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
                type === 'expense' ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
            >
              ฿
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">
                {editItem ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}
              </h3>
              <p className="text-xs text-slate-500">บันทึกรายรับหรือรายจ่ายลงในระบบ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {errorMessage && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* Type Toggle: รายจ่าย vs รายรับ */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              ประเภทรายการ
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2.5 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>รายจ่าย (Expense)</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2.5 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  type === 'income'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>รายรับ (Income)</span>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                ฿
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-3.5 text-2xl font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            {/* Quick Amount presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[20, 50, 100, 200, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddQuickAmount(val)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  +{val}฿
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-400" />
              <span>วันที่ *</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag size={14} className="text-slate-400" />
              <span>หมวดหมู่ *</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
              {currentCategoryList.map((cat) => {
                const isSelected = category === cat.label;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.label)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 font-semibold shadow-xs ring-1 ring-emerald-500'
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.iconName} size={14} className="text-white" />
                    </div>
                    <span className="text-xs truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText size={14} className="text-slate-400" />
              <span>หมายเหตุ / รายละเอียด (ถ้ามี)</span>
            </label>
            <input
              type="text"
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น ข้าวกะเพราหมูกรอบ, ค่าน้ำมัน, เงินเดือนเดือนนี้"
              className="w-full px-4 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 rounded-xl shadow-md shadow-emerald-200 flex items-center gap-2 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <span>กำลังบันทึก...</span>
              ) : (
                <>
                  <Check size={16} />
                  <span>{editItem ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
