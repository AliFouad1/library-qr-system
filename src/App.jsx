/**
 * المكون الرئيسي للتطبيق (App Component)
 * ======================================
 * هذا هو المكون الجذر للتطبيق
 *
 * ماذا يفعل؟
 * 1. يُهيئ نظام التوجيه (Routing)
 * 2. يُغلف التطبيق بمزود المصادقة
 * 3. يُحدد المسارات العامة والخاصة
 *
 * المسارات العامة (Public):
 * - /login: صفحة تسجيل الدخول
 * - /book/:bookId: صفحة تفاصيل الكتاب العامة (لمسح QR)
 *
 * المسارات الخاصة (Private):
 * - /: لوحة التحكم (Dashboard)
 * - /books: صفحة الكتب
 * - /borrow: صفحة الاستعارة
 */

// استيراد React
import React from 'react';

// استيراد مكونات التوجيه من react-router-dom
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// استيراد سياق المصادقة
import { AuthProvider, useAuth } from './context/AuthContext';

// استيراد الصفحات
import Login from './pages/Login';           // صفحة تسجيل الدخول
import Dashboard from './pages/Dashboard';   // لوحة التحكم
import Books from './pages/Books';           // صفحة الكتب
import BorrowBook from './pages/BorrowBook'; // صفحة الاستعارة
import PublicBookDetail from './pages/PublicBookDetail'; // تفاصيل الكتاب العامة

// استيراد مكون التخطيط
import Layout from './components/Layout';    // الهيكل العام للصفحات

// ==================== مكون المسار الخاص ====================

/**
 * مكون المسار الخاص (Private Route)
 * ==================================
 * يحمي المسارات التي تتطلب تسجيل دخول
 *
 * كيف يعمل:
 * 1. يتحقق من حالة المصادقة
 * 2. إذا جاري التحميل: يعرض "Loading..."
 * 3. إذا مُصادق عليه: يعرض المحتوى
 * 4. إذا غير مُصادق: يُعيد التوجيه لصفحة الدخول
 *
 * @param {ReactNode} children - المكونات الفرعية (الصفحة المحمية)
 */
const PrivateRoute = ({ children }) => {
  // الحصول على حالة المصادقة
  const { isAuthenticated, loading } = useAuth();

  // إذا جاري التحميل، نعرض مؤشر التحميل
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        جاري التحميل...
      </div>
    );
  }

  // إذا مُصادق عليه: نعرض المحتوى
  // إذا لا: نُعيد التوجيه لصفحة الدخول
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// ==================== المكون الرئيسي ====================

/**
 * مكون التطبيق الرئيسي
 * ====================
 * يُجمع كل شيء معاً:
 * - AuthProvider: يوفر سياق المصادقة
 * - BrowserRouter: يُفعّل نظام التوجيه
 * - Routes: يُحدد المسارات
 */
function App() {
  return (
    // مزود المصادقة (يُغلف كل شيء)
    <AuthProvider>
      {/* موجه المتصفح */}
      <BrowserRouter>
        {/* تعريف المسارات */}
        <Routes>

          {/* ===== المسارات العامة ===== */}
          {/* لا تتطلب تسجيل دخول */}

          {/* صفحة تسجيل الدخول */}
          <Route path="/login" element={<Login />} />

          {/* صفحة تفاصيل الكتاب العامة (للوصول عبر QR) */}
          <Route path="/book/:bookId" element={<PublicBookDetail />} />

          {/* ===== المسارات الخاصة ===== */}
          {/* تتطلب تسجيل دخول */}

          {/* المسار الجذر (/) مع التخطيط العام */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                {/* التخطيط يحتوي على: الشريط الجانبي + المحتوى */}
                <Layout />
              </PrivateRoute>
            }
          >
            {/* الصفحات الفرعية (تُعرض داخل Layout) */}

            {/* لوحة التحكم - الصفحة الرئيسية */}
            <Route index element={<Dashboard />} />

            {/* صفحة إدارة الكتب */}
            <Route path="books" element={<Books />} />

            {/* صفحة الاستعارة والإرجاع */}
            <Route path="borrow" element={<BorrowBook />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// تصدير المكون
export default App;
