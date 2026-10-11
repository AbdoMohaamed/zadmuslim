/**
 * إعدادات Firebase و Web Push لتخزين ومزامنة الأدعية والإشعارات
 */

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAgp_rzi7QhFrNRHpy3D7TU0OEyrCsWjBg",
    authDomain: "sadqah-jaddi.firebaseapp.com",
    databaseURL: "https://sadqah-jaddi-default-rtdb.firebaseio.com",
    projectId: "sadqah-jaddi",
    storageBucket: "sadqah-jaddi.firebasestorage.app",
    messagingSenderId: "649618994454",
    appId: "1:649618994454:web:ebaa20bcb0722818874c37"
};

// المفتاح العام لتشفير وبث إشعارات الويب للأجهزة المقفلة (Web Push VAPID Public Key)
const ZAD_VAPID_PUBLIC_KEY = "BFCsM3Ryzc4kdbfNgCqtlOJPjIvrolQJTQUdD03b8g1ehKhnxqNeAUJ9T_Yl8WajcZj_dWvJhcCbHN6-pPCSJ4I";

// فحص هل تم تفعيل ووضع الإعدادات
function isFirebaseConfigured() {
    return FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey.trim() !== "" &&
           FIREBASE_CONFIG.databaseURL && FIREBASE_CONFIG.databaseURL.trim() !== "";
}

// دالة تحويل مفتاح VAPID العام إلى Uint8Array لتسجيل PushManager
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// إتاحة الكائنات والدوال صراحة على كائن window لضمان التوافق مع كافة البيئات والمكتبات
if (typeof window !== "undefined") {
    window.FIREBASE_CONFIG = FIREBASE_CONFIG;
    window.ZAD_VAPID_PUBLIC_KEY = ZAD_VAPID_PUBLIC_KEY;
    window.isFirebaseConfigured = isFirebaseConfigured;
}
