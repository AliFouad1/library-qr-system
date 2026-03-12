/**
 * صفحة تسجيل الدخول (Login Page)
 * ==============================
 * هذه الصفحة تُعرض للمستخدمين غير المسجلين
 *
 * المميزات:
 * - نموذج تسجيل الدخول (البريد الإلكتروني + كلمة المرور)
 * - عرض رسائل الخطأ
 * - مؤشر التحميل أثناء تسجيل الدخول
 * - عرض بيانات الدخول التجريبية
 * - زر تبديل اللغة (EN/AR)
 *
 * تصميم الصفحة:
 * - خلفية متدرجة الألوان مع تأثيرات متحركة
 * - بطاقة مركزية تحتوي على النموذج
 * - تأثيرات hover وانتقالات سلسة
 */

// استيراد React و useState للتعامل مع الحالة
import React, { useState } from 'react';

// استيراد useNavigate للتوجيه بعد تسجيل الدخول
import { useNavigate } from 'react-router-dom';

// استيراد hook المصادقة
import { useAuth } from '../context/AuthContext';

// استيراد hook الترجمة
import { useTranslation } from 'react-i18next';

/**
 * مكون صفحة تسجيل الدخول
 */
const Login = () => {
  // ==================== الحالات (State) ====================

  // البريد الإلكتروني المُدخل
  const [email, setEmail] = useState('');

  // كلمة المرور المُدخلة
  const [password, setPassword] = useState('');

  // رسالة الخطأ (إن وجدت)
  const [error, setError] = useState('');

  // حالة التحميل (جاري تسجيل الدخول)
  const [loading, setLoading] = useState(false);

  // ==================== الـ Hooks ====================

  // hook الترجمة
  const { t, i18n } = useTranslation();

  // دالة تسجيل الدخول من سياق المصادقة
  const { login } = useAuth();

  // دالة التوجيه للانتقال بين الصفحات
  const navigate = useNavigate();

  // اللغة الحالية
  const currentLanguage = i18n.language;

  // ==================== الدوال ====================

  /**
   * تبديل اللغة بين العربية والإنجليزية
   */
  const toggleLanguage = () => {
    const newLang = currentLanguage === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  /**
   * معالجة إرسال نموذج تسجيل الدخول
   * @param {Event} e - حدث الإرسال
   */
  const handleSubmit = async (e) => {
    // منع السلوك الافتراضي (إعادة تحميل الصفحة)
    e.preventDefault();

    // مسح رسالة الخطأ السابقة
    setError('');

    // تفعيل حالة التحميل
    setLoading(true);

    // محاولة تسجيل الدخول
    const result = await login(email, password);

    if (result.success) {
      // نجاح: التوجيه للصفحة الرئيسية
      navigate('/');
    } else {
      // فشل: عرض رسالة الخطأ
      setError(result.error);
    }

    // إيقاف حالة التحميل
    setLoading(false);
  };

  // ==================== واجهة المستخدم ====================

  return (
    // الحاوية الرئيسية مع الخلفية المتدرجة
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">

      {/* ===== زر تبديل اللغة ===== */}
      <button
        onClick={toggleLanguage}
        className="absolute top-4 end-4 z-10 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-white font-bold text-sm transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        {currentLanguage === 'ar' ? 'English' : 'العربية'}
      </button>

      {/* ===== دوائر الخلفية المتحركة ===== */}
      {/* دائرة علوية يسرى */}
      <div className="absolute top-0 start-0 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
      {/* دائرة سفلية يمنى */}
      <div className="absolute bottom-0 end-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* ===== بطاقة تسجيل الدخول ===== */}
      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-10 m-4 transform hover:scale-[1.02] sm:hover:scale-105 transition-transform duration-300">

        {/* ===== الشعار والعنوان ===== */}
        <div className="text-center mb-6 sm:mb-8">
          {/* أيقونة الكتاب */}
          <div className="inline-block p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4 transform hover:rotate-6 transition-transform duration-300">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          {/* عنوان النظام */}
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">{t('login.title')}</h1>
          {/* وصف النظام */}
          <p className="text-gray-600 font-medium text-sm sm:text-base">{t('login.subtitle')}</p>
        </div>

        {/* ===== رسالة الخطأ ===== */}
        {/* تُعرض فقط إذا وُجد خطأ */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 animate-shake">
            <div className="flex items-center">
              {/* أيقونة الخطأ */}
              <svg className="w-5 h-5 me-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {/* نص الخطأ */}
              {error}
            </div>
          </div>
        )}

        {/* ===== نموذج تسجيل الدخول ===== */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* حقل البريد الإلكتروني */}
          <div className="transform transition-all duration-300 hover:translate-x-1">
            <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-2">
              {/* أيقونة البريد */}
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              {t('login.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
              placeholder="admin@library.local"
              required
            />
          </div>

          {/* حقل كلمة المرور */}
          <div className="transform transition-all duration-300 hover:translate-x-1">
            <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-2">
              {/* أيقونة القفل */}
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              {t('login.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
              placeholder="••••••••"
              required
            />
          </div>

          {/* زر تسجيل الدخول */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="flex items-center justify-center gap-2">
              {loading ? (
                // حالة التحميل: مؤشر دوار
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('login.loggingIn')}
                </>
              ) : (
                // الحالة العادية: نص "Login" مع سهم
                <>
                  {t('login.login')}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </span>
          </button>
        </form>

        {/* ===== بيانات الدخول التجريبية ===== */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t-2 border-gray-100">
          <p className="text-sm text-gray-700 font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {t('login.demoCredentials')}
          </p>
          <div className="space-y-2 text-xs sm:text-sm">
            {/* حساب المدير */}
            <div className="flex flex-col sm:flex-row sm:justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-2 sm:p-3 rounded-lg hover:shadow-md transition-shadow">
              <span className="font-bold text-blue-700">{t('login.admin')}</span>
              <span className="text-gray-700">admin@library.local / admin123</span>
            </div>
            {/* حساب الموظف */}
            <div className="flex flex-col sm:flex-row sm:justify-between bg-gradient-to-r from-green-50 to-teal-50 p-2 sm:p-3 rounded-lg hover:shadow-md transition-shadow">
              <span className="font-bold text-green-700">{t('login.staff')}</span>
              <span className="text-gray-700">staff@library.local / staff123</span>
            </div>
            {/* حساب المستخدم */}
            <div className="flex flex-col sm:flex-row sm:justify-between bg-gradient-to-r from-purple-50 to-pink-50 p-2 sm:p-3 rounded-lg hover:shadow-md transition-shadow">
              <span className="font-bold text-purple-700">{t('login.user')}</span>
              <span className="text-gray-700">john@example.com / user123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// تصدير المكون
export default Login;
