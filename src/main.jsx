/**
 * نقطة الدخول الرئيسية (Main Entry Point)
 * =======================================
 * هذا هو أول ملف يُنفذ عند تشغيل التطبيق
 *
 * ماذا يفعل؟
 * 1. يستورد React و ReactDOM
 * 2. يستورد المكون الرئيسي (App)
 * 3. يستورد أنماط CSS
 * 4. يُنشئ جذر React ويُركّب التطبيق
 *
 * React.StrictMode:
 * - وضع التطوير الصارم
 * - يُظهر تحذيرات إضافية
 * - يُساعد في اكتشاف المشاكل
 * - لا يؤثر على الإنتاج
 */

// استيراد React
import React from 'react'

// استيراد ReactDOM لربط React بالـ DOM
import ReactDOM from 'react-dom/client'

// استيراد المكون الرئيسي
import App from './App'

// استيراد الأنماط العامة (Tailwind CSS)
import './index.css'

// استيراد وتهيئة i18n للترجمة
import './i18n'

/**
 * إنشاء جذر التطبيق وتركيبه
 * -------------------------
 * document.getElementById('root'):
 *   - يجد العنصر <div id="root"> في index.html
 *
 * createRoot():
 *   - يُنشئ جذر React جديد
 *
 * render():
 *   - يُركّب التطبيق في الـ DOM
 *   - يبدأ React بالعمل
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  // وضع التطوير الصارم
  <React.StrictMode>
    {/* المكون الرئيسي للتطبيق */}
    <App />
  </React.StrictMode>,
)
