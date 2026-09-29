/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import {
  auth,
  db,
  logoutUser,
  handleFirestoreError,
  OperationType,
} from './firebase';
import {
  Transaction,
  TransactionType,
  THAI_MONTHS,
  THAI_MONTHS_SHORT,
  formatBaht,
  formatThaiDate,
  formatThaiMonthYear,
  getCategoryMeta,
  EXPENSE_CATEGORIES,
} from './types';
import { LoginScreen } from './components/LoginScreen';
import { MonthlySummary } from './components/MonthlySummary';
import { ExpensePieChart } from './components/ExpensePieChart';
import { MonthlyComparisonBarChart, MonthlyDataPoint } from './components/MonthlyComparisonBarChart';
import { TransactionItem } from './components/TransactionItem';
import { TransactionModal } from './components/TransactionModal';
import {
  Wallet,
  Plus,
  LogOut,
  Search,
  Filter,
  BarChart2,
  ListFilter,
  FileSpreadsheet,
  Calendar,
  Sparkles,
  PieChart as PieChartIcon,
  Layers,
  ArrowUpDown,
  Download,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Active Tab: 'dashboard' | 'analytics' | 'history'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'history'>('dashboard');

  // Month & Year state (defaults to current date)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-11

  // Transactions list from Firestore
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);

      if (user) {
        // Sync user profile document into Firestore
        const userDocPath = `users/${user.uid}`;
        try {
          await setDoc(
            doc(db, 'users', user.uid),
            {
              uid: user.uid,
              displayName: user.displayName || 'ผู้ใช้งาน',
              email: user.email || '',
              photoURL: user.photoURL || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (error) {
          // Non-fatal if rule restricts, but log properly
          console.warn('User profile sync notice:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to Transactions in Firestore for Current User
  useEffect(() => {
    if (!currentUser) {
      setTransactions([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    const txCollectionPath = `users/${currentUser.uid}/transactions`;
    const q = query(collection(db, 'users', currentUser.uid, 'transactions'), orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          items.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Transaction, 'id'>),
          });
        });
        setTransactions(items);
        setDataLoading(false);
      },
      (error) => {
        setDataLoading(false);
        handleFirestoreError(error, OperationType.LIST, txCollectionPath);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Selected Month Key: "YYYY-MM"
  const selectedMonthKey = useMemo(() => {
    return `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  }, [selectedYear, selectedMonth]);

  // Filter transactions for the selected month
  const monthlyTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonthKey));
  }, [transactions, selectedMonthKey]);

  // Monthly totals
  const totalIncome = useMemo(() => {
    return monthlyTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthlyTransactions]);

  const totalExpense = useMemo(() => {
    return monthlyTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthlyTransactions]);

  const balance = totalIncome - totalExpense;

  // Expense breakdown by category for the Pie Chart
  const expenseCategoryTotals = useMemo(() => {
    const map = new Map<string, number>();

    monthlyTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
      });

    const list = Array.from(map.entries()).map(([cat, total]) => {
      const meta = getCategoryMeta(cat, 'expense');
      const percentage = totalExpense > 0 ? (total / totalExpense) * 100 : 0;
      return {
        category: cat,
        total,
        color: meta.color,
        iconName: meta.iconName,
        percentage,
      };
    });

    return list.sort((a, b) => b.total - a.total);
  }, [monthlyTransactions, totalExpense]);

  // 6-Month Comparison Data for the Bar Chart
  const multiMonthData: MonthlyDataPoint[] = useMemo(() => {
    const result: MonthlyDataPoint[] = [];

    for (let i = 5; i >= 0; i--) {
      let m = selectedMonth - i;
      let y = selectedYear;
      while (m < 0) {
        m += 12;
        y -= 1;
      }

      const key = `${y}-${String(m + 1).padStart(2, '0')}`;
      const monthTx = transactions.filter((t) => t.date.startsWith(key));
      const inc = monthTx
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const exp = monthTx
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      result.push({
        year: y,
        month: m,
        label: `${THAI_MONTHS_SHORT[m]} ${String(y + 543).slice(-2)}`,
        income: inc,
        expense: exp,
        net: inc - exp,
      });
    }

    return result;
  }, [transactions, selectedYear, selectedMonth]);

  // Filtered transactions for the display list
  const filteredTransactions = useMemo(() => {
    return monthlyTransactions.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCategory = t.category.toLowerCase().includes(q);
        const matchNote = t.note?.toLowerCase().includes(q) || false;
        const matchAmount = t.amount.toString().includes(q);
        if (!matchCategory && !matchNote && !matchAmount) return false;
      }
      return true;
    });
  }, [monthlyTransactions, filterType, filterCategory, searchQuery]);

  // Unique categories in the current month for filter dropdown
  const availableCategoriesInMonth = useMemo(() => {
    const set = new Set<string>();
    monthlyTransactions.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [monthlyTransactions]);

  // Save or Update Transaction Handler
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    if (!currentUser) return;

    const txCollectionPath = `users/${currentUser.uid}/transactions`;
    try {
      if (editId) {
        const txDocRef = doc(db, 'users', currentUser.uid, 'transactions', editId);
        await updateDoc(txDocRef, {
          ...data,
          updatedAt: new Date().toISOString(),
        });
      } else {
        const txDocRef = doc(collection(db, 'users', currentUser.uid, 'transactions'));
        const newTransaction: Transaction = {
          id: txDocRef.id,
          userId: currentUser.uid,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(txDocRef, newTransaction);
      }
    } catch (error) {
      handleFirestoreError(
        error,
        editId ? OperationType.UPDATE : OperationType.CREATE,
        editId ? `${txCollectionPath}/${editId}` : txCollectionPath
      );
    }
  };

  // Delete Transaction Handler
  const handleDeleteTransaction = async (id: string) => {
    if (!currentUser) return;
    const docPath = `users/${currentUser.uid}/transactions/${id}`;
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'transactions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  };

  // Seed sample transactions for first-time exploration
  const handleSeedSampleData = async () => {
    if (!currentUser) return;
    const sampleItems = [
      {
        type: 'income' as TransactionType,
        amount: 15000,
        category: 'เงินช่วยเหลือ/ครอบครัว',
        date: `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`,
        note: 'เงินค่าใช้จ่ายประจำเดือน',
      },
      {
        type: 'expense' as TransactionType,
        amount: 3500,
        category: 'ที่พัก/ค่าหอพัก',
        date: `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-02`,
        note: 'ค่าเช่าหอพัก',
      },
      {
        type: 'expense' as TransactionType,
        amount: 650,
        category: 'ค่าน้ำค่าไฟ/เน็ต',
        date: `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-03`,
        note: 'ค่าอินเทอร์เน็ตและไฟ',
      },
      {
        type: 'expense' as TransactionType,
        amount: 120,
        category: 'อาหารและเครื่องดื่ม',
        date: `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-05`,
        note: 'ข้าวกะเพรา + กาแฟเย็น',
      },
      {
        type: 'expense' as TransactionType,
        amount: 350,
        category: 'การเรียน/หนังสือ/อุปกรณ์',
        date: `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-08`,
        note: 'สมุดและชีทเรียน',
      },
      {
        type: 'income' as TransactionType,
        amount: 2500,
        category: 'งานพาร์ทไทม์/ฟรีแลนซ์',
        date: `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-12`,
        note: 'รับงานพิมพ์เอกสารและออกแบบ',
      },
      {
        type: 'expense' as TransactionType,
        amount: 450,
        category: 'การเดินทาง',
        date: `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-15`,
        note: 'เติมน้ำมันรถมอเตอร์ไซค์',
      },
    ];

    for (const item of sampleItems) {
      await handleSaveTransaction(item);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (monthlyTransactions.length === 0) return;

    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน(บาท)', 'หมายเหตุ'];
    const rows = monthlyTransactions.map((t) => [
      t.date,
      t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      `"${t.category}"`,
      t.amount,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `รายการรับจ่าย_${selectedMonthKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">กำลังโหลดระบบ...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col pb-24 md:pb-12">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
              <Wallet size={20} />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-base sm:text-lg leading-tight">
                จัดการรายรับรายจ่าย
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Firebase Firestore (แยกข้อมูลตาม UID)
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ภาพรวม & รายการ
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChartIcon size={14} />
              กราฟวิเคราะห์ข้อมูล
            </button>
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingTransaction(null);
                setIsModalOpen(true);
              }}
              className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs shadow-emerald-200 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>เพิ่มรายการ</span>
            </button>

            {/* User Profile Capsule */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  {currentUser.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <span className="text-xs font-semibold text-slate-800 block truncate max-w-[120px]">
                  {currentUser.displayName || 'ผู้ใช้งาน'}
                </span>
                <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                  {currentUser.email}
                </span>
              </div>
              <button
                onClick={() => logoutUser()}
                title="ออกจากระบบ"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Monthly Summary Section (Always visible for quick reference) */}
        <MonthlySummary
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onMonthChange={(y, m) => {
            setSelectedYear(y);
            setSelectedMonth(m);
          }}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          balance={balance}
        />

        {/* View Switcher based on Active Tab */}
        {activeTab === 'analytics' ? (
          /* ANALYTICS TAB: Charts Section */
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. กราฟวงกลมแยกหมวดรายจ่าย */}
              <ExpensePieChart
                categoryTotals={expenseCategoryTotals}
                totalExpense={totalExpense}
              />

              {/* 2. แท่งเปรียบเทียบรายรับ-รายจ่ายรายเดือน */}
              <MonthlyComparisonBarChart
                monthlyData={multiMonthData}
                selectedMonthKey={selectedMonthKey}
                onSelectMonth={(y, m) => {
                  setSelectedYear(y);
                  setSelectedMonth(m);
                }}
              />
            </div>
          </div>
        ) : (
          /* DASHBOARD & TRANSACTIONS TAB */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Quick Chart Glance on Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpensePieChart
                categoryTotals={expenseCategoryTotals}
                totalExpense={totalExpense}
              />
              <MonthlyComparisonBarChart
                monthlyData={multiMonthData}
                selectedMonthKey={selectedMonthKey}
                onSelectMonth={(y, m) => {
                  setSelectedYear(y);
                  setSelectedMonth(m);
                }}
              />
            </div>

            {/* Transactions Section */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800 text-base sm:text-lg">
                    รายการประจำเดือน {formatThaiMonthYear(selectedYear, selectedMonth)}
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                    {monthlyTransactions.length} รายการ
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Search Input */}
                  <div className="relative flex-1 sm:w-48">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ค้นหาหมวด/หมายเหตุ..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  {/* Filter Type (ทั้งหมด / รายรับ / รายจ่าย) */}
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="all">ประเภททั้งหมด</option>
                    <option value="income">เฉพาะรายรับ</option>
                    <option value="expense">เฉพาะรายจ่าย</option>
                  </select>

                  {/* Filter Category */}
                  {availableCategoriesInMonth.length > 0 && (
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none cursor-pointer max-w-[130px] truncate"
                    >
                      <option value="all">ทุกหมวดหมู่</option>
                      {availableCategoriesInMonth.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Export CSV Button */}
                  {monthlyTransactions.length > 0 && (
                    <button
                      onClick={handleExportCSV}
                      title="ส่งออกเป็นไฟล์ CSV"
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-colors flex items-center gap-1 text-xs font-medium"
                    >
                      <Download size={14} />
                      <span className="hidden sm:inline">CSV</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Transactions List */}
              {dataLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                  <span className="text-xs">กำลังซิงก์ข้อมูลจาก Firestore...</span>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <Layers size={24} />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700">ไม่มีรายการในเดือนนี้</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    {searchQuery || filterType !== 'all' || filterCategory !== 'all'
                      ? 'ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา'
                      : 'คุณยังไม่มีการบันทึกรายรับหรือรายจ่ายสำหรับเดือนนี้'}
                  </p>

                  {monthlyTransactions.length === 0 && (
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditingTransaction(null);
                          setIsModalOpen(true);
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <Plus size={15} />
                        <span>เพิ่มรายการแรก</span>
                      </button>
                      <button
                        onClick={handleSeedSampleData}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Sparkles size={14} className="text-amber-500" />
                        <span>ใส่ข้อมูลตัวอย่าง</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredTransactions.map((tx) => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      onEdit={(item) => {
                        setEditingTransaction(item);
                        setIsModalOpen(true);
                      }}
                      onDelete={handleDeleteTransaction}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button (Mobile & Desktop) */}
      <div className="fixed right-6 bottom-20 md:bottom-8 z-40">
        <button
          onClick={() => {
            setEditingTransaction(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-3.5 rounded-full shadow-lg shadow-emerald-500/30 font-semibold text-sm transition-all transform active:scale-95 cursor-pointer"
        >
          <Plus size={20} />
          <span>เพิ่มรายการ</span>
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-6 py-2.5 z-40 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeTab === 'dashboard' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Wallet size={19} />
          <span>ภาพรวม</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeTab === 'analytics' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <PieChartIcon size={19} />
          <span>กราฟวิเคราะห์</span>
        </button>

        <button
          onClick={() => logoutUser()}
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-rose-600"
        >
          <LogOut size={19} />
          <span>ออกจากระบบ</span>
        </button>
      </nav>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editItem={editingTransaction}
        defaultDate={`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(
          new Date().getDate()
        ).padStart(2, '0')}`}
      />
    </div>
  );
}
