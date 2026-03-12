/**
 * صفحة لوحة التحكم (Dashboard Page)
 * ==================================
 * هذه هي الصفحة الرئيسية بعد تسجيل الدخول
 *
 * المحتويات:
 * 1. بطاقات الإحصائيات - عرض أرقام مهمة
 * 2. روابط سريعة - للوصول السريع للصفحات المهمة
 * 3. معلومات النظام - حالة النظام والإحصائيات التفصيلية
 *
 * مصادر البيانات:
 * - reportsAPI.getDashboard(): إحصائيات عامة
 * - booksAPI.getStats(): إحصائيات الكتب
 * - borrowingAPI.getStats(): إحصائيات الاستعارة
 */

// استيراد React والـ Hooks
import React, { useState, useEffect } from 'react';

// استيراد Link للتنقل
import { Link } from 'react-router-dom';

// استيراد واجهات API
import { reportsAPI, booksAPI, borrowingAPI } from '../services/api';

// استيراد hook الترجمة
import { useTranslation } from 'react-i18next';

/**
 * مكون لوحة التحكم
 */
const Dashboard = () => {
  // ==================== الـ Hooks ====================

  // hook الترجمة
  const { t } = useTranslation();

  // ==================== الحالات (State) ====================

  // بيانات الإحصائيات
  const [stats, setStats] = useState(null);

  // حالة التحميل
  const [loading, setLoading] = useState(true);

  // رسالة الخطأ
  const [error, setError] = useState('');

  // ==================== التأثيرات (Effects) ====================

  /**
   * جلب الإحصائيات عند تحميل الصفحة
   */
  useEffect(() => {
    fetchStats();
  }, []);

  // ==================== الدوال ====================

  /**
   * جلب جميع الإحصائيات من السيرفر
   * يُنفذ ثلاث طلبات بالتوازي لتحسين الأداء
   */
  const fetchStats = async () => {
    try {
      // جلب جميع البيانات بالتوازي
      const [dashboard, bookStats, borrowingStats] = await Promise.all([
        reportsAPI.getDashboard(),     // إحصائيات لوحة التحكم
        booksAPI.getStats(),           // إحصائيات الكتب
        borrowingAPI.getStats()        // إحصائيات الاستعارة
      ]);

      // دمج جميع الإحصائيات في كائن واحد
      setStats({
        ...dashboard.data.data,
        ...bookStats.data.data,
        ...borrowingStats.data.data
      });
    } catch (error) {
      console.error('فشل في جلب الإحصائيات:', error);
      setError(t('common.failedToLoad'));
    } finally {
      // إنهاء حالة التحميل في جميع الحالات
      setLoading(false);
    }
  };

  // ==================== حالات العرض الخاصة ====================

  // عرض مؤشر التحميل
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          {/* دائرة التحميل المتحركة */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('dashboard.loadingData')}</p>
        </div>
      </div>
    );
  }

  // عرض رسالة الخطأ
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  // ==================== إعداد بطاقات الإحصائيات ====================

  /**
   * بيانات بطاقات الإحصائيات
   * كل بطاقة تحتوي على:
   * - titleKey: مفتاح ترجمة العنوان
   * - value: القيمة
   * - color: اللون
   * - icon: الأيقونة (إيموجي)
   * - descriptionKey: مفتاح ترجمة الوصف
   */
  const cards = [
    {
      titleKey: 'dashboard.totalBooks',
      value: stats?.totalBooks || 0,
      color: 'blue',
      icon: '📚',
      descriptionKey: 'dashboard.booksInLibrary'
    },
    {
      titleKey: 'dashboard.availableBooks',
      value: stats?.availableBooks || 0,
      color: 'green',
      icon: '✅',
      descriptionKey: 'dashboard.readyToBorrow'
    },
    {
      titleKey: 'dashboard.activeBorrowings',
      value: stats?.activeBorrowings || 0,
      color: 'yellow',
      icon: '📖',
      descriptionKey: 'dashboard.currentlyBorrowed'
    },
    {
      titleKey: 'dashboard.overdueBooks',
      value: stats?.overdueBooks || 0,
      color: 'red',
      icon: '⚠️',
      descriptionKey: 'dashboard.needAttention'
    },
  ];

  // ألوان الخلفية المتدرجة لكل بطاقة
  const cardColors = {
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-green-500 to-teal-600',
    yellow: 'from-yellow-500 to-orange-600',
    red: 'from-red-500 to-pink-600'
  };

  // ==================== واجهة المستخدم ====================

  return (
    <div className="space-y-8">

      {/* ===== العنوان وزر التحديث ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {/* عنوان الصفحة */}
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {t('dashboard.title')}
          </h1>
          {/* وصف الصفحة */}
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            {t('dashboard.welcome')}
          </p>
        </div>
        {/* زر تحديث البيانات */}
        <button
          onClick={fetchStats}
          className="group px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 text-sm sm:text-base"
        >
          {/* أيقونة التحديث (تدور عند الـ hover) */}
          <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t('dashboard.refresh')}
        </button>
      </div>

      {/* ===== بطاقات الإحصائيات ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.titleKey}
            className={`group relative bg-gradient-to-br ${cardColors[card.color]} rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl overflow-hidden`}
          >
            {/* تأثير الخلفية عند الـ hover */}
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

            <div className="relative z-10">
              {/* الأيقونة والعنوان */}
              <div className="flex items-start justify-between mb-4">
                {/* أيقونة البطاقة */}
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <span className="text-3xl">{card.icon}</span>
                </div>
                {/* شارة العنوان */}
                <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  <span className="text-white text-xs font-bold">{t(card.titleKey)}</span>
                </div>
              </div>

              {/* القيمة والوصف */}
              <div className="text-white">
                <p className="text-3xl sm:text-5xl font-bold mb-2 drop-shadow-lg">{card.value}</p>
                <p className="text-white/90 text-xs sm:text-sm font-medium">{t(card.descriptionKey)}</p>
              </div>
            </div>

            {/* عنصر زخرفي في الزاوية */}
            <div className="absolute bottom-0 end-0 w-32 h-32 bg-white/10 rounded-tl-full transform translate-x-16 translate-y-16 group-hover:scale-150 transition-transform duration-500"></div>
          </div>
        ))}
      </div>

      {/* ===== الروابط السريعة ومعلومات النظام ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ===== بطاقة الروابط السريعة ===== */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 border border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 flex items-center gap-2">
            {/* أيقونة الصاعقة */}
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {t('dashboard.quickActions')}
          </h2>
          <div className="space-y-4">

            {/* رابط صفحة الكتب */}
            <Link
              to="/books"
              className="group relative flex items-center p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 duration-200 overflow-hidden"
            >
              {/* شريط جانبي يظهر عند الـ hover */}
              <div className="absolute end-0 top-0 h-full w-2 bg-gradient-to-b from-blue-500 to-indigo-600 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
              {/* الأيقونة */}
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl me-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              {/* النص */}
              <div className="flex-1">
                <p className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{t('dashboard.viewAllBooks')}</p>
                <p className="text-sm text-gray-600">{t('dashboard.browseBooks')}</p>
              </div>
              {/* سهم */}
              <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* رابط صفحة الاستعارة */}
            <Link
              to="/borrow"
              className="group relative flex items-center p-5 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl hover:from-green-100 hover:to-teal-100 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 duration-200 overflow-hidden"
            >
              <div className="absolute end-0 top-0 h-full w-2 bg-gradient-to-b from-green-500 to-teal-600 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl me-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800 group-hover:text-green-600 transition-colors">{t('dashboard.manageBorrowing')}</p>
                <p className="text-sm text-gray-600">{t('dashboard.borrowOrReturn')}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* ===== بطاقة معلومات النظام ===== */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 border border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t('dashboard.systemInfo')}
          </h2>
          <div className="space-y-4">

            {/* حالة النظام */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl">
              <span className="text-gray-700 font-medium flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {t('dashboard.status')}
              </span>
              <span className="flex items-center gap-2">
                {/* نقطة خضراء نابضة */}
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></span>
                <span className="text-green-600 font-bold">{t('dashboard.online')}</span>
              </span>
            </div>

            {/* إجمالي النسخ */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <span className="text-gray-700 font-medium">{t('dashboard.totalCopies')}</span>
              <span className="font-bold text-blue-600 text-xl">{stats?.totalCopies || 0}</span>
            </div>

            {/* النسخ المتاحة */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <span className="text-gray-700 font-medium">{t('dashboard.availableCopies')}</span>
              <span className="font-bold text-purple-600 text-xl">{stats?.availableCopies || 0}</span>
            </div>

            {/* آخر تحديث */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
              <span className="text-gray-700 font-medium flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('dashboard.lastUpdated')}
              </span>
              <span className="text-sm text-gray-700 font-medium">{new Date().toLocaleTimeString()}</span>
            </div>

          </div>
        </div>
      </div>

      {/* ===== إحصائيات إضافية ===== */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">{t('dashboard.libraryStats')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* إجمالي الكتب */}
          <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats?.totalBooks || 0}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{t('dashboard.totalBooks')}</p>
          </div>
          {/* المتاحة */}
          <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
            <p className="text-xl sm:text-2xl font-bold text-green-600">{stats?.availableBooks || 0}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{t('dashboard.available')}</p>
          </div>
          {/* المُستعارة */}
          <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats?.borrowedBooks || 0}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{t('dashboard.borrowed')}</p>
          </div>
          {/* المتأخرة */}
          <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
            <p className="text-xl sm:text-2xl font-bold text-red-600">{stats?.overdueBooks || 0}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{t('dashboard.overdue')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// تصدير المكون
export default Dashboard;
