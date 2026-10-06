/**
 * Service Worker لتطبيق زاد المسلم • رفيق طاعاتك اليومية
 * متوافق 100% مع iOS Safari و WebKit وأجهزة Android والحواسيب
 * يمنع أخطاء التوجيه "Response served by service worker has redirections"
 */

const CACHE_NAME = "zad-muslim-v39";
const QURAN_CACHE_NAME = "sadqah-quran-cache-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./admin.html",
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

// دالة حماية Safari على آيفون: تجريد علامة التوجيه (redirected flag) لمنع خطأ Safari iOS
function cleanResponse(response) {
  if (!response || !response.redirected) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}

// جدول مواقيت الصلاة المخزن لتنبيهات الخلفية
let scheduledPrayerAlarms = [];
let activeAlarmTimers = [];

// مرحلة التثبيت وتخزين الملفات الأساسية بأمان
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of ASSETS_TO_CACHE) {
        try {
          const res = await fetch(asset, { redirect: "follow" });
          if (res && (res.status === 200 || res.type === "opaque")) {
            await cache.put(asset, cleanResponse(res));
          }
        } catch (err) {
          console.warn("Asset caching skipped:", asset);
        }
      }
    })
  );
  self.skipWaiting();
});

// مرحلة التفعيل وحذف الكاش القديم
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

// استراتيجية جلب البيانات (معالجة متقدمة لحماية Safari و WebKit)
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

  // 1. طلبات التنقل بين الصفحات (HTML Navigation)
  // حماية آيفون Safari من أخطاء الـ redirection
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request, { redirect: "follow" })
        .then((networkResponse) => {
          const cleaned = cleanResponse(networkResponse);
          if (cleaned && cleaned.status === 200) {
            const cacheCopy = cleaned.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cacheCopy));
          }
          return cleaned;
        })
        .catch(async () => {
          const cached = await caches.match(event.request) || 
                         await caches.match("./index.html") || 
                         await caches.match("./");
          if (cached) {
            return cleanResponse(cached);
          }
          return new Response("Offline", { status: 503, statusText: "Offline" });
        })
    );
    return;
  }

  // 2. المصحف الشريف والتفاسير: Cache-First للسرعة العالية وبدون نت
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
            return cleanResponse(cachedResponse);
          }
          return fetch(event.request, { redirect: "follow" }).then((networkResponse) => {
            const cleaned = cleanResponse(networkResponse);
            if (cleaned && cleaned.status === 200) {
              cache.put(event.request, cleaned.clone());
            }
            return cleaned;
          }).catch(() => {
            return new Response("", { status: 408, statusText: "Offline" });
          });
        });
      })
    );
    return;
  }

  // 3. باقي أصول وموارد الموقع (Cache first مع Network update آمن لـ Safari)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cleanResponse(cachedResponse);
      }

      return fetch(event.request, { redirect: "follow" })
        .then((networkResponse) => {
          const cleaned = cleanResponse(networkResponse);
          if (cleaned && cleaned.status === 200 && event.request.method === "GET") {
            const responseToCache = cleaned.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return cleaned;
        })
        .catch(() => {
          if (event.request.headers.get("accept") && event.request.headers.get("accept").includes("text/html")) {
            return caches.match("./index.html").then((fallback) => cleanResponse(fallback));
          }
          return new Response("", { status: 404 });
        });
    })
  );
});

// ==========================================================================
// إدارة تنبيهات مواقيت الصلاة والأذان في الخلفية (Background Prayer Alarms)
// ==========================================================================
self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "SCHEDULE_PRAYERS") {
    scheduledPrayerAlarms = event.data.schedule || [];
    armBackgroundPrayerAlarms();
  }

  if (event.data.type === "TRIGGER_NOTIFICATION") {
    const { title, body, url, tag } = event.data;
    showDeviceNotification(title, body, url || "./", tag);
  }
});

function armBackgroundPrayerAlarms() {
  activeAlarmTimers.forEach(t => clearTimeout(t));
  activeAlarmTimers = [];

  const now = Date.now();
  scheduledPrayerAlarms.forEach(prayer => {
    if (!prayer || prayer.key === "sunrise") return;

    const targetTime = Number(prayer.timestamp);
    const delay = targetTime - now;

    if (delay > 0 && delay <= 86400000) {
      const timer = setTimeout(() => {
        showPrayerNotification(prayer);
      }, delay);
      activeAlarmTimers.push(timer);
    }
  });
}

function showPrayerNotification(prayer) {
  const options = {
    body: `الله أكبر، الله أكبر.. حان الآن موعد ${prayer.name} حسب توقيتك المحلي. حيّ على الصلاة، حيّ على الفلاح 🕌`,
    icon: "./assets/icon.svg",
    badge: "./assets/icon.svg",
    vibrate: [500, 250, 500, 250, 500, 250, 1000],
    tag: `prayer_${prayer.key}_${new Date().toISOString().slice(0, 10)}`,
    dir: "rtl",
    lang: "ar",
    renotify: true,
    requireInteraction: false,
    data: { url: "./#prayers" },
    actions: [
      { action: "open", title: "📖 فتح الأذكار والمواقيت" },
      { action: "close", title: "إغلاق" }
    ]
  };

  self.registration.showNotification(`🕌 حان الآن موعد ${prayer.name}`, options);
}

function showDeviceNotification(title, body, url, tag) {
  const options = {
    body: body || "تذكير بذكر الله والصلاة على النبي ﷺ 🌿",
    icon: "./assets/icon.svg",
    badge: "./assets/icon.svg",
    vibrate: [200, 100, 200, 100, 400],
    tag: tag || `zad_notif_${Date.now()}`,
    dir: "rtl",
    lang: "ar",
    renotify: true,
    data: { url: url || "./" },
    actions: [
      { action: "open", title: "📖 فتح التطبيق" },
      { action: "close", title: "إغلاق" }
    ]
  };

  self.registration.showNotification(title || "زاد المسلم 🌿", options);
}

// التزامن الدوري للصلوات في الخلفية (Periodic Sync إذا كان مدعوماً)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "check-prayers") {
    event.waitUntil(checkUpcomingPrayersOnWakeup());
  }
});

function checkUpcomingPrayersOnWakeup() {
  const now = Date.now();
  scheduledPrayerAlarms.forEach(prayer => {
    if (prayer.key === "sunrise") return;
    const diff = Math.abs(prayer.timestamp - now);
    if (diff < 60000) {
      showPrayerNotification(prayer);
    }
  });
}

// ==========================================================================
// استقبال إشعارات الويب السحابية (Web Push Protocol / FCM)
// ==========================================================================
self.addEventListener("push", (event) => {
  let data = {
    title: "زاد المسلم - رفيق طاعاتك اليومية 🌿",
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
    vibrate: [300, 150, 300, 150, 450],
    data: data.data || { url: data.url || "./" },
    tag: data.tag || ("zad-broadcast-" + Date.now()),
    dir: "rtl",
    lang: "ar",
    renotify: true,
    requireInteraction: false,
    timestamp: Date.now(),
    actions: [
      { action: "open", title: "📖 فتح وقراءة" },
      { action: "close", title: "تجاهل" }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "زاد المسلم 🌿", options)
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
