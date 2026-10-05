/**
 * Service Worker لتطبيق صدقة جارية
 * يوفر سرعة تحميل فورية ودعم التثبيت كـ PWA
 */

const CACHE_NAME = "sadqah-jaddi-v31";
const QURAN_CACHE_NAME = "sadqah-quran-cache-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./assets/css/style.css",
  "./assets/js/data.js",
  "./assets/js/azkar-data.js",
  "./assets/js/asmaa-allah-data.js",
  "./assets/js/nawawi-data.js",
  "./assets/js/islamic-guide-data.js",
  "./assets/js/daily-message-data.js",
  "./assets/js/radio-stations-data.js",
  "./assets/js/quiz-data.js",
  "./assets/js/islamic-stories-data.js",
  "./assets/js/media-data.js",
  "./assets/js/extended-modules.js",
  "./assets/js/firebase-config.js",
  "./assets/js/app.js",
  "./assets/js/quran.js",
  "./assets/icon.svg",
  "./assets/share-preview.jpg",
  "./manifest.json",
  "https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Tajawal:wght@300;400;500;700;800;900&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
  "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css",
  "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"
];

// مرحلة التثبيت وتخزين الملفات الأساسية
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn("Some static assets failed to cache:", err);
      });
    })
  );
  self.skipWaiting();
});

// مرحلة التفعيل وحذف الكاش القديم (مع الحفاظ الدائم على كاش المصحف الشريف)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== QURAN_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// استراتيجية جلب البيانات (Cache First للمصحف الشريف والتفاسير، Network First لباقي الموقع)
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // تجاهل طلبات الفيربيز والبث المباشر والصوتيات الكبيرة
  if (
    url.includes("firebaseio.com") ||
    url.includes("stream.zeno.fm") ||
    url.includes("qurango.net") ||
    url.includes("mp3quran.net") ||
    url.includes("chrome-extension")
  ) {
    return;
  }

  // استراتيجية مخصصة للمصحف الشريف والتفاسير: Cache-First لضمان العمل 100% بدون نت وبدون استهلاك بيانات
  const isQuranAsset = 
    url.includes("cdn.quran.ws") || 
    url.includes("quran.ksu.edu.sa") || 
    url.includes("raw.githubusercontent.com/quran") ||
    url.includes("api.alquran.cloud");

  if (isQuranAsset && event.request.method === "GET") {
    event.respondWith(
      caches.open(QURAN_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // في حالة انقطاع النت وعدم وجود استجابة
            return new Response("", { status: 408, statusText: "Offline" });
          });
        });
      })
    );
    return;
  }

  // التخزين المؤقت الذكي لملفات الموقع والأدعية والخطوط
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && event.request.method === "GET") {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          if (cachedResponse) return cachedResponse;
          if (event.request.headers.get("accept") && event.request.headers.get("accept").includes("text/html")) {
            return caches.match("./index.html");
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// ==========================================
// استقبال إشعارات الويب ودفع الإشعارات (Push Notifications)
// ==========================================
self.addEventListener("push", (event) => {
  let data = {
    title: "زاد المسلم • رفيق طاعاتك اليومية 🌿",
    body: "تذكير بذكر الله والطاعات والصلوات",
    icon: "./assets/icon.svg",
    badge: "./assets/icon.svg",
    data: { url: "./" }
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "./assets/icon.svg",
    badge: data.badge || "./assets/icon.svg",
    vibrate: [100, 50, 100, 50, 200],
    data: data.data || { url: "./" },
    tag: "zad-broadcast-" + Date.now(),
    renotify: true,
    actions: [
      { action: "open", title: "فتح التطبيق 📖" },
      { action: "close", title: "إغلاق" }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// التفاعل عند نقر المستخدم على الإشعار
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : "./";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("navigate" in client) {
          client.focus();
          return client.navigate(targetUrl);
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

