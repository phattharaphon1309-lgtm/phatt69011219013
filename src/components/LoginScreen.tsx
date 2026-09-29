import React, { useState } from 'react';
import { loginWithGoogle } from '../firebase';
import { Wallet, ShieldCheck, PieChart, BarChart2, CheckCircle2, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await loginWithGoogle();
    } catch (err: unknown) {
      console.error(err);
      setError('ไม่สามารถเข้าสู่ระบบด้วย Google ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-sky-100/60 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 relative z-10 text-center">
        {/* App Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
          <Wallet size={32} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          ระบบจัดการรายรับรายจ่าย
        </h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          บันทึกเงินเข้า-ออก สรุปผลรายเดือน พร้อมกราฟวิเคราะห์ทางการเงิน แยกข้อมูลความปลอดภัยตามบัญชีผู้ใช้
        </p>

        {/* Feature Highlights */}
        <div className="my-6 py-4 border-y border-slate-100 text-left space-y-3">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            <span>เข้าสู่ระบบปลอดภัยด้วย Google Account</span>
          </div>
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            <span>บันทึกบน Cloud Firestore แยกข้อมูลส่วนตัวตาม UID</span>
          </div>
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            <span>กราฟวงกลมแยกหมวดหมู่ และกราฟแท่งเปรียบเทียบ</span>
          </div>
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            <span>รองรับการใช้งานทั้งบนคอมพิวเตอร์และมือถือ</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer active:scale-98"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span className="text-sm">
            {loading ? 'กำลังเชื่อมต่อ Google...' : 'เข้าสู่ระบบด้วย Google'}
          </span>
        </button>

        <p className="mt-4 text-[11px] text-slate-400">
          ข้อมูลรายรับรายจ่ายของคุณจะถูกเก็บใน Firebase อย่างปลอดภัยและเป็นส่วนตัว
        </p>
      </div>
    </div>
  );
};
