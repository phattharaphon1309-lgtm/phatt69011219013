export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryMeta {
  id: string;
  label: string;
  color: string;
  iconName: string;
  type: TransactionType;
}

export const EXPENSE_CATEGORIES: CategoryMeta[] = [
  { id: 'food', label: 'อาหารและเครื่องดื่ม', color: '#f97316', iconName: 'Utensils', type: 'expense' },
  { id: 'transport', label: 'การเดินทาง', color: '#0ea5e9', iconName: 'Bus', type: 'expense' },
  { id: 'housing', label: 'ที่พัก/ค่าหอพัก', color: '#8b5cf6', iconName: 'Home', type: 'expense' },
  { id: 'bills', label: 'ค่าน้ำค่าไฟ/เน็ต', color: '#eab308', iconName: 'Zap', type: 'expense' },
  { id: 'shopping', label: 'ช้อปปิ้ง/ของใช้', color: '#ec4899', iconName: 'ShoppingBag', type: 'expense' },
  { id: 'entertainment', label: 'ความบันเทิง/พักผ่อน', color: '#06b6d4', iconName: 'Film', type: 'expense' },
  { id: 'education', label: 'การเรียน/หนังสือ/อุปกรณ์', color: '#3b82f6', iconName: 'GraduationCap', type: 'expense' },
  { id: 'health', label: 'สุขภาพ/ยา/รักษา', color: '#10b981', iconName: 'HeartPulse', type: 'expense' },
  { id: 'beauty', label: 'ความงาม/เสื้อผ้า', color: '#f43f5e', iconName: 'Sparkles', type: 'expense' },
  { id: 'other_expense', label: 'ค่าใช้จ่ายอื่นๆ', color: '#64748b', iconName: 'MoreHorizontal', type: 'expense' },
];

export const INCOME_CATEGORIES: CategoryMeta[] = [
  { id: 'allowance', label: 'เงินช่วยเหลือ/ครอบครัว', color: '#10b981', iconName: 'Gift', type: 'income' },
  { id: 'salary', label: 'เงินเดือน/ค่าจ้าง', color: '#059669', iconName: 'Briefcase', type: 'income' },
  { id: 'parttime', label: 'งานพาร์ทไทม์/ฟรีแลนซ์', color: '#14b8a6', iconName: 'Clock', type: 'income' },
  { id: 'scholarship', label: 'ทุนการศึกษา', color: '#3b82f6', iconName: 'Award', type: 'income' },
  { id: 'business', label: 'ขายของ/ธุรกิจส่วนตัว', color: '#8b5cf6', iconName: 'Store', type: 'income' },
  { id: 'bonus', label: 'โบนัส/เงินรางวัล', color: '#f59e0b', iconName: 'Trophy', type: 'income' },
  { id: 'investment', label: 'เงินปันผล/การลงทุน', color: '#6366f1', iconName: 'TrendingUp', type: 'income' },
  { id: 'other_income', label: 'รายรับอื่นๆ', color: '#64748b', iconName: 'MoreHorizontal', type: 'income' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryMeta(categoryName: string, type?: TransactionType): CategoryMeta {
  const match = ALL_CATEGORIES.find(c => c.label === categoryName);
  if (match) return match;
  return {
    id: 'custom',
    label: categoryName || (type === 'income' ? 'รายรับอื่นๆ' : 'ค่าใช้จ่ายอื่นๆ'),
    color: type === 'income' ? '#10b981' : '#f43f5e',
    iconName: type === 'income' ? 'ArrowDownLeft' : 'ArrowUpRight',
    type: type || 'expense',
  };
}

export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export function formatThaiDate(dateStr: string): string {
  if (!dateStr) return '';
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  const thaiYear = year + 543;
  return `${day} ${THAI_MONTHS_SHORT[month]} ${thaiYear}`;
}

export function formatThaiMonthYear(year: number, monthZeroBased: number): string {
  const thaiYear = year + 543;
  return `${THAI_MONTHS[monthZeroBased]} ${thaiYear}`;
}

export function formatBaht(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
