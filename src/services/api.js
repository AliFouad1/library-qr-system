/**
 * خدمة API (API Service)
 * =======================
 * هذا الملف يحتوي على جميع الدوال للتواصل مع السيرفر الخلفي (Backend)
 *
 * ما هو API؟
 * - واجهة برمجة التطبيقات (Application Programming Interface)
 * - طريقة للتواصل بين الواجهة الأمامية والخلفية
 * - نُرسل طلبات (Requests) ونستقبل ردود (Responses)
 *
 * المكتبة المستخدمة: Axios
 * - مكتبة شهيرة لإرسال طلبات HTTP
 * - تدعم Promises و async/await
 * - سهلة الاستخدام ومرنة
 */

// استيراد مكتبة Axios للتعامل مع طلبات HTTP
import axios from 'axios';

/**
 * عنوان API الأساسي
 * -----------------
 * يُقرأ من متغيرات البيئة أو يستخدم القيمة الافتراضية
 * VITE_API_URL: متغير بيئة في ملف .env
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * إنشاء نسخة Axios مُعدة مسبقاً
 * ==============================
 * بدلاً من كتابة الإعدادات في كل طلب، نُنشئ نسخة جاهزة
 *
 * baseURL: العنوان الأساسي (يُضاف لكل طلب)
 * headers: الهيدرات الافتراضية
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json' // نوع البيانات: JSON
  }
});

/**
 * مُعترض الطلبات (Request Interceptor)
 * =====================================
 * يُنفذ قبل إرسال كل طلب
 *
 * وظيفته:
 * - إضافة رمز المصادقة (Token) تلقائياً لكل طلب
 * - الرمز مُخزن في localStorage بعد تسجيل الدخول
 *
 * كيف يعمل:
 * 1. يقرأ الرمز من localStorage
 * 2. إذا وُجد، يُضيفه للهيدر Authorization
 * 3. صيغة الهيدر: "Bearer [الرمز]"
 */
api.interceptors.request.use(
  (config) => {
    // قراءة الرمز من التخزين المحلي
    const token = localStorage.getItem('token');

    // إذا وُجد الرمز، أضفه للهيدر
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * مُعترض الردود (Response Interceptor)
 * =====================================
 * يُنفذ بعد استلام كل رد
 *
 * وظيفته:
 * - معالجة الأخطاء العامة
 * - إعادة التوجيه لصفحة الدخول عند انتهاء الجلسة
 *
 * خطأ 401:
 * - يعني أن الرمز غير صالح أو منتهي الصلاحية
 * - نحذف الرمز ونُعيد التوجيه لصفحة الدخول
 */
api.interceptors.response.use(
  // في حالة النجاح: نُرجع الرد كما هو
  (response) => response,

  // في حالة الخطأ
  (error) => {
    // إذا كان الخطأ 401 (غير مُصرح)
    if (error.response?.status === 401) {
      // حذف الرمز من التخزين
      localStorage.removeItem('token');
      // إعادة التوجيه لصفحة الدخول
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== واجهات API ====================

/**
 * واجهة المصادقة (Auth API)
 * -------------------------
 * الدوال المتعلقة بتسجيل الدخول وإدارة الجلسة
 */
export const authAPI = {
  /**
   * تسجيل الدخول
   * @param {string} email - البريد الإلكتروني
   * @param {string} password - كلمة المرور
   * @returns {Promise} - بيانات المستخدم + الرمز
   */
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  /**
   * جلب بيانات المستخدم الحالي
   * @returns {Promise} - بيانات المستخدم المسجل
   */
  getCurrentUser: () =>
    api.get('/auth/me')
};

/**
 * واجهة الكتب (Books API)
 * -----------------------
 * الدوال المتعلقة بإدارة الكتب
 */
export const booksAPI = {
  /**
   * جلب جميع الكتب
   * @param {Object} params - معاملات الفلترة والترقيم
   * @returns {Promise} - قائمة الكتب
   */
  getAll: (params) =>
    api.get('/books', { params }),

  /**
   * جلب كتاب بالمعرف
   * @param {string} id - معرف الكتاب
   * @returns {Promise} - بيانات الكتاب
   */
  getById: (id) =>
    api.get(`/books/${id}`),

  /**
   * إضافة كتاب جديد
   * @param {Object} data - بيانات الكتاب
   * @returns {Promise} - الكتاب المُضاف
   */
  create: (data) =>
    api.post('/books', data),

  /**
   * تعديل كتاب
   * @param {string} id - معرف الكتاب
   * @param {Object} data - البيانات الجديدة
   * @returns {Promise} - الكتاب المُحدث
   */
  update: (id, data) =>
    api.put(`/books/${id}`, data),

  /**
   * حذف كتاب
   * @param {string} id - معرف الكتاب
   * @returns {Promise}
   */
  delete: (id) =>
    api.delete(`/books/${id}`),

  /**
   * جلب إحصائيات الكتب
   * @returns {Promise} - الإحصائيات
   */
  getStats: () =>
    api.get('/books/stats'),

  /**
   * رفع صورة غلاف الكتاب
   * @param {string} id - معرف الكتاب
   * @param {File} file - ملف الصورة
   * @returns {Promise} - الكتاب المُحدث
   */
  uploadCover: (id, file) => {
    const formData = new FormData();
    formData.append('coverImage', file);
    return api.post(`/books/${id}/cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

/**
 * واجهة رمز QR (QR API)
 * ---------------------
 * الدوال المتعلقة بمسح رموز QR
 */
export const qrAPI = {
  /**
   * مسح رمز QR لكتاب
   * @param {Object} data - بيانات QR
   * @returns {Promise} - تفاصيل الكتاب
   */
  scanBook: (data) =>
    api.post('/qr/scan/book', data),

  /**
   * مسح رمز QR لرف
   * @param {Object} data - بيانات QR
   * @returns {Promise} - تفاصيل الرف والكتب
   */
  scanShelf: (data) =>
    api.post('/qr/scan/shelf', data)
};

/**
 * واجهة الاستعارة (Borrowing API)
 * ------------------------------
 * الدوال المتعلقة بعمليات الاستعارة والإرجاع
 */
export const borrowingAPI = {
  /**
   * استعارة كتاب
   * @param {Object} data - بيانات الاستعارة (userId, bookId)
   * @returns {Promise} - سجل الاستعارة
   */
  borrow: (data) =>
    api.post('/borrowing/borrow', data),

  /**
   * إرجاع كتاب
   * @param {string} borrowingId - معرف الاستعارة
   * @returns {Promise}
   */
  return: (borrowingId) =>
    api.post(`/borrowing/return/${borrowingId}`),

  /**
   * جلب جميع الاستعارات
   * @param {Object} params - معاملات الفلترة
   * @returns {Promise} - قائمة الاستعارات
   */
  getAll: (params) =>
    api.get('/borrowing', { params }),

  /**
   * تمديد فترة الاستعارة
   * @param {string} borrowingId - معرف الاستعارة
   * @param {number} additionalDays - عدد الأيام الإضافية
   * @returns {Promise}
   */
  extend: (borrowingId, additionalDays) =>
    api.put(`/borrowing/${borrowingId}/extend`, { additionalDays }),

  /**
   * جلب إحصائيات الاستعارة
   * @returns {Promise} - الإحصائيات
   */
  getStats: () =>
    api.get('/borrowing/stats')
};

/**
 * واجهة التصنيفات (Categories API)
 * --------------------------------
 * الدوال المتعلقة بتصنيفات الكتب
 */
export const categoriesAPI = {
  /**
   * جلب جميع التصنيفات
   * @returns {Promise} - قائمة التصنيفات
   */
  getAll: () =>
    api.get('/categories')
};

/**
 * واجهة الرفوف (Shelves API)
 * --------------------------
 * الدوال المتعلقة برفوف المكتبة
 */
export const shelvesAPI = {
  /**
   * جلب جميع الرفوف
   * @returns {Promise} - قائمة الرفوف
   */
  getAll: () =>
    api.get('/shelves')
};

/**
 * واجهة التقارير (Reports API)
 * ----------------------------
 * الدوال المتعلقة بالإحصائيات والتقارير
 */
export const reportsAPI = {
  /**
   * جلب إحصائيات لوحة التحكم
   * @returns {Promise} - الإحصائيات العامة
   */
  getDashboard: () =>
    api.get('/reports/dashboard')
};

/**
 * واجهة المستخدمين (Users API)
 * ----------------------------
 * الدوال المتعلقة بإدارة المستخدمين
 */
export const usersAPI = {
  /**
   * جلب جميع المستخدمين
   * @returns {Promise} - قائمة المستخدمين
   */
  getAll: () =>
    api.get('/users')
};

// تصدير النسخة الأساسية (للاستخدام المباشر إذا لزم الأمر)
export default api;
