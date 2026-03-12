/**
 * مكون التخطيط العام (Layout Component)
 * =====================================
 * هذا المكون يُحدد الهيكل العام للصفحات الداخلية
 *
 * الأجزاء الرئيسية:
 * 1. شريط التنقل (Navigation Bar) - في الأعلى
 * 2. المحتوى الرئيسي (Main Content) - في الوسط
 * 3. التذييل (Footer) - في الأسفل
 *
 * المميزات:
 * - قائمة تنقل متجاوبة (Desktop + Mobile)
 * - عرض معلومات المستخدم
 * - زر تسجيل الخروج
 * - تحديد الصفحة النشطة
 * - زر تبديل اللغة (EN/AR)
 *
 * كيف يعمل:
 * - يستخدم <Outlet /> من react-router لعرض الصفحة الفرعية
 * - الصفحات (Dashboard, Books, Borrow) تُعرض داخل هذا المكون
 */

// استيراد React و useState
import React, { useState } from 'react';

// استيراد أدوات التوجيه
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

// استيراد hook المصادقة
import { useAuth } from '../context/AuthContext';

// استيراد hook الترجمة
import { useTranslation } from 'react-i18next';

/**
 * مكون التخطيط العام
 */
const Layout = () => {
  // ==================== الـ Hooks ====================

  // hook الترجمة
  const { t, i18n } = useTranslation();

  // بيانات المستخدم ودالة الخروج من سياق المصادقة
  const { user, logout } = useAuth();

  // دالة التوجيه
  const navigate = useNavigate();

  // الموقع الحالي (المسار)
  const location = useLocation();

  // حالة قائمة الجوال (مفتوحة/مغلقة)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
   * معالجة تسجيل الخروج
   * - تُسجل الخروج
   * - تُوجه لصفحة الدخول
   * - تُغلق قائمة الجوال
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  /**
   * التحقق من المسار النشط
   * @param {string} path - المسار للتحقق منه
   * @returns {boolean} - هل هذا المسار النشط؟
   */
  const isActive = (path) => {
    return location.pathname === path;
  };

  // ==================== روابط التنقل ====================

  /**
   * قائمة روابط التنقل
   * كل رابط يحتوي على:
   * - path: المسار
   * - labelKey: مفتاح الترجمة
   * - icon: مسار SVG للأيقونة
   * - staffOnly: هل يظهر للموظفين فقط؟
   */
  const navLinks = [
    {
      path: '/',
      labelKey: 'nav.dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    {
      path: '/books',
      labelKey: 'nav.books',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
    },
    {
      path: '/borrow',
      labelKey: 'nav.borrowing',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      staffOnly: true
    },
  ];

  // ==================== واجهة المستخدم ====================

  return (
    // الحاوية الرئيسية مع خلفية متدرجة
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {/* ===== شريط التنقل ===== */}
      <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">

            {/* ===== الشعار ===== */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold hover:scale-105 transition-transform">
                {/* أيقونة الكتاب */}
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                {/* اسم النظام - يختلف حسب حجم الشاشة */}
                <span className="hidden sm:inline">{t('nav.librarySystem')}</span>
                <span className="sm:hidden">{t('nav.library')}</span>
              </Link>
            </div>

            {/* ===== روابط التنقل (سطح المكتب) ===== */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => {
                // إخفاء الروابط المخصصة للموظفين إذا كان المستخدم عادياً
                if (link.staffOnly && user?.role !== 'ADMIN' && user?.role !== 'STAFF') {
                  return null;
                }
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`group px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(link.path)
                        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {/* أيقونة الرابط */}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                      </svg>
                      {t(link.labelKey)}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* ===== زر اللغة ومعلومات المستخدم وتسجيل الخروج (سطح المكتب) ===== */}
            <div className="hidden md:flex items-center gap-3">
              {/* زر تبديل اللغة */}
              <button
                onClick={toggleLanguage}
                className="group bg-white/20 hover:bg-white/30 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                title={currentLanguage === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  {currentLanguage === 'ar' ? 'EN' : 'AR'}
                </span>
              </button>

              {/* بطاقة معلومات المستخدم */}
              <div className="text-sm bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                <p className="font-bold">{user?.fullName}</p>
                <p className="text-xs text-white/70">{user?.role}</p>
              </div>
              {/* زر تسجيل الخروج */}
              <button
                onClick={handleLogout}
                className="group bg-white/20 hover:bg-red-500 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <span className="flex items-center gap-2">
                  {/* أيقونة الخروج */}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t('nav.logout')}
                </span>
              </button>
            </div>

            {/* ===== زر قائمة الجوال ===== */}
            <div className="md:hidden flex items-center gap-2">
              {/* زر تبديل اللغة للجوال */}
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors font-bold text-sm"
              >
                {currentLanguage === 'ar' ? 'EN' : 'AR'}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                {mobileMenuOpen ? (
                  // أيقونة الإغلاق (X)
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  // أيقونة القائمة (☰)
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ===== قائمة الجوال ===== */}
        {/* تُعرض فقط عندما mobileMenuOpen = true */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gradient-to-b from-purple-600 to-indigo-700 border-t border-white/20">
            <div className="px-4 py-4 space-y-2">

              {/* معلومات المستخدم */}
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl mb-4">
                {/* صورة افتراضية */}
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold">{user?.fullName}</p>
                  <p className="text-xs text-white/70">{user?.role}</p>
                </div>
              </div>

              {/* روابط التنقل */}
              {navLinks.map((link) => {
                if (link.staffOnly && user?.role !== 'ADMIN' && user?.role !== 'STAFF') {
                  return null;
                }
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      isActive(link.path)
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                    </svg>
                    {t(link.labelKey)}
                  </Link>
                );
              })}

              {/* زر تسجيل الخروج */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium bg-red-500/80 hover:bg-red-500 transition-all mt-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t('nav.logout')}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ===== المحتوى الرئيسي ===== */}
      {/* Outlet: هنا تُعرض الصفحة الفرعية (Dashboard, Books, Borrow) */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* ===== التذييل ===== */}
      <footer className="bg-white border-t border-gray-200 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-xs sm:text-sm">
            <p>© 2026 {t('footer.copyright')}</p>
            <p className="mt-1">{t('footer.projectBy')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// تصدير المكون
export default Layout;
