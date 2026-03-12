/**
 * سياق المصادقة (Auth Context)
 * ============================
 * هذا الملف يُدير حالة تسجيل الدخول في التطبيق
 *
 * ما هو Context في React؟
 * - طريقة لمشاركة البيانات بين المكونات بدون تمريرها كـ props
 * - مثل "متغير عام" يمكن الوصول إليه من أي مكان
 * - مفيد للبيانات المُستخدمة في كل مكان (مثل: المستخدم الحالي)
 *
 * ماذا يوفر هذا السياق؟
 * - user: بيانات المستخدم الحالي
 * - loading: هل يتم تحميل البيانات؟
 * - login: دالة تسجيل الدخول
 * - logout: دالة تسجيل الخروج
 * - isAuthenticated: هل المستخدم مسجل دخوله؟
 */

// استيراد React والأدوات المطلوبة
import React, { createContext, useState, useContext, useEffect } from 'react';

// استيراد واجهة API للمصادقة
import { authAPI } from '../services/api';

// ==================== إنشاء السياق ====================

/**
 * إنشاء سياق المصادقة
 * القيمة الابتدائية: null
 */
const AuthContext = createContext(null);

// ==================== مزود السياق ====================

/**
 * مزود المصادقة (Auth Provider)
 * =============================
 * مكون يُغلف التطبيق ويوفر بيانات المصادقة لجميع المكونات الفرعية
 *
 * @param {ReactNode} children - المكونات الفرعية
 *
 * كيف يعمل:
 * 1. عند تحميل التطبيق، يتحقق من وجود رمز (token)
 * 2. إذا وُجد الرمز، يجلب بيانات المستخدم من السيرفر
 * 3. يوفر الدوال للمكونات الفرعية (login, logout)
 */
export const AuthProvider = ({ children }) => {
  // ===== حالات المكون (State) =====

  /**
   * بيانات المستخدم الحالي
   * null: غير مسجل دخوله
   * {id, email, fullName, role}: مسجل دخوله
   */
  const [user, setUser] = useState(null);

  /**
   * حالة التحميل
   * true: جاري التحقق من الجلسة
   * false: اكتمل التحقق
   */
  const [loading, setLoading] = useState(true);

  /**
   * رمز المصادقة (JWT Token)
   * يُقرأ من localStorage عند بدء التطبيق
   */
  const [token, setToken] = useState(localStorage.getItem('token'));

  // ===== التأثيرات (Effects) =====

  /**
   * تأثير التحقق من الجلسة
   * يُنفذ عند:
   * - تحميل التطبيق
   * - تغيير الرمز (token)
   */
  useEffect(() => {
    if (token) {
      // إذا وُجد رمز، نجلب بيانات المستخدم
      fetchCurrentUser();
    } else {
      // إذا لم يوجد رمز، ننهي التحميل
      setLoading(false);
    }
  }, [token]);

  // ===== الدوال =====

  /**
   * جلب بيانات المستخدم الحالي من السيرفر
   * ------------------------------------
   * تُستدعى عند وجود رمز للتحقق من صلاحيته
   */
  const fetchCurrentUser = async () => {
    try {
      // إرسال طلب للسيرفر
      const response = await authAPI.getCurrentUser();

      // حفظ بيانات المستخدم
      setUser(response.data.data);
    } catch (error) {
      // إذا فشل الطلب (رمز غير صالح)، نُسجل الخروج
      console.error('فشل في جلب بيانات المستخدم:', error);
      logout();
    } finally {
      // في جميع الحالات، ننهي التحميل
      setLoading(false);
    }
  };

  /**
   * تسجيل الدخول
   * ------------
   * @param {string} email - البريد الإلكتروني
   * @param {string} password - كلمة المرور
   * @returns {Object} - نتيجة العملية {success, error?}
   */
  const login = async (email, password) => {
    try {
      // إرسال طلب تسجيل الدخول
      const response = await authAPI.login(email, password);

      // استخراج البيانات من الرد
      const { token, user } = response.data.data;

      // حفظ الرمز في التخزين المحلي
      localStorage.setItem('token', token);

      // تحديث الحالة
      setToken(token);
      setUser(user);

      return { success: true };
    } catch (error) {
      // إرجاع رسالة الخطأ
      return {
        success: false,
        error: error.response?.data?.error?.message || 'فشل تسجيل الدخول'
      };
    }
  };

  /**
   * تسجيل الخروج
   * ------------
   * يحذف الرمز ويُعيد تعيين الحالة
   */
  const logout = () => {
    // حذف الرمز من التخزين
    localStorage.removeItem('token');

    // إعادة تعيين الحالة
    setToken(null);
    setUser(null);
  };

  // ===== القيمة المُقدمة للمكونات الفرعية =====

  /**
   * الكائن الذي سيكون متاحاً لجميع المكونات
   */
  const value = {
    user,           // بيانات المستخدم
    loading,        // حالة التحميل
    login,          // دالة تسجيل الدخول
    logout,         // دالة تسجيل الخروج
    isAuthenticated: !!user  // هل مسجل دخوله؟ (true/false)
  };

  // ===== إرجاع المكون =====

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ==================== Hook مخصص ====================

/**
 * useAuth Hook
 * ============
 * طريقة سهلة للوصول لسياق المصادقة من أي مكون
 *
 * طريقة الاستخدام:
 * const { user, login, logout } = useAuth();
 *
 * @returns {Object} - قيم سياق المصادقة
 * @throws {Error} - إذا استُخدم خارج AuthProvider
 */
export const useAuth = () => {
  // الحصول على قيمة السياق
  const context = useContext(AuthContext);

  // التحقق من وجود السياق
  if (!context) {
    throw new Error('يجب استخدام useAuth داخل AuthProvider');
  }

  return context;
};
