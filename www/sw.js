/**
 * Service Worker لتطبيق زاد المسلم • رفيق طاعاتك اليومية
 * متوافق 100% مع iOS Safari و WebKit وأجهزة Android والحواسيب
 * يمنع أخطاء التوجيه "Response served by service worker has redirections"
 */

const CACHE_NAME = "zad-muslim-v57";
const QURAN_CACHE_NAME = "sadqah-quran-cache-v1";
const ASSETS_TO_CACHE = [
  "./assets/css/style.css?v=96",
  "./assets/js/theme-controller.js",
  "./assets/css/user-tools.css?v=3",
  "./assets/js/data.js",
  "./assets/js/azkar-data.js?v=10",
  "./assets/js/asmaa-allah-data.js?v=1",
  "./assets/js/islamic-guide-data.js?v=1",
  "./assets/js/daily-message-data.js?v=2",
  "./assets/js/radio-stations-data.js?v=4",
  "./assets/js/quiz-data.js?v=2",
  "./assets/js/islamic-stories-data.js?v=3",
  "./assets/js/media-data.js?v=2",
  "./assets/js/firebase-config.js",
  "./assets/js/native-adhan-service.js?v=5",
  "./assets/js/onesignal-service.js?v=1",
  "./assets/js/app.js?v=18",
  "./assets/js/quran.js?v=26",
  "./assets/js/extended-modules.js?v=28",
  "./assets/js/smart-khatma.js?v=1",
  "./assets/js/share-card-generator.js?v=1",
  "./assets/js/mood-compass.js?v=1",
  "./assets/js/smart-tasbih.js?v=1",
  "./assets/js/prayer-guide.js?v=1",
  "./assets/js/user-tools.js?v=3",
  "./assets/js/zakat-calculator.js?v=1",
  "./assets/js/nearby-mosques.js?v=7",
  "./assets/js/wall-of-duas.js?v=1",
  "./",
  "./index.html",
  "./services.html",
  "./app.html",
  "./settings.html",
  "./assets/js/prayer-cities.js?v=1",
  "./privacy.html",
  "./assets/js/user-tools.js?v=3",
  "./assets/css/user-tools.css?v=3",
  "./assets/css/style.css",
  "./assets/images/logo.png",
  "./assets/js/theme-controller.js",
  "./assets/js/data.js",
  "./assets/js/azkar-data.js",
  "./assets/js/asmaa-allah-data.js",
  "./assets/js/islamic-guide-data.js",
  "./assets/js/daily-message-data.js",
  "./assets/js/radio-stations-data.js",
  "./assets/js/quiz-data.js",
  "./assets/js/islamic-stories-data.js",
  "./assets/js/media-data.js",
  "./assets/js/mood-compass.js",
  "./assets/js/smart-khatma.js",
  "./assets/js/smart-tasbih.js",
  "./assets/js/wall-of-duas.js",
  "./assets/js/prayer-guide.js",
  "./assets/js/share-card-generator.js",
  "./assets/js/onesignal-service.js",
  "./assets/js/extended-modules.js",
  "./assets/js/firebase-config.js",
  "./assets/js/native-adhan-service.js",
  "./assets/js/app.js",
  "./assets/js/quran.js",
  "./assets/js/zakat-calculator.js",
  "./assets/js/nearby-mosques.js",
  "./assets/icon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/audio/salawat.mp3",
  "./assets/audio/pre/pre_fajr.mp3",
  "./assets/audio/pre/pre_dhuhr.mp3",
  "./assets/audio/pre/pre_asr.mp3",
  "./assets/audio/pre/pre_maghrib.mp3",
  "./assets/audio/pre/pre_isha.mp3",
  "./assets/audio/pre/pre_prayer.mp3",
  "./assets/audio/adhan/qatami.mp3",
  "./assets/audio/adhan/abdulbasit.mp3",
  "./assets/audio/adhan/refaat.mp3",
  "./assets/audio/adhan/fajr.mp3",
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

// جدول مواقيت الصلاة والمؤذن المختار لتنبيهات الخلفية
let scheduledPrayerAlarms = [];
let activeAlarmTimers = [];
let selectedMuazzinPreference = "qatami";

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
          if (key !== CACHE_NAME && key !== QURAN_CACHE_NAME && key !== "zad-downloads-v1") {
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
  // Private APIs and live prayer data must never be returned from an old cache.
  const parsedUrl = new URL(url);
  if (event.request.method !== 'GET' || parsedUrl.pathname.startsWith('/api/') || url.includes('api.aladhan.com') || parsedUrl.pathname.endsWith('/admin.html') || url.includes('identitytoolkit.googleapis.com') || url.includes('securetoken.googleapis.com')) return;
  const managed = url.includes('/assets/quran-pages/') || url.includes('api.alquran.cloud/v1/page/') || url.includes('server8.mp3quran.net/afs/');
  if (managed) {
    event.respondWith((async () => {
      const saved = await (await caches.open('zad-downloads-v1')).match(event.request.url);
      if (saved) {
        const range = event.request.headers.get('range');
        if (range) {
          const bytes = await saved.arrayBuffer();
          const match = /^bytes=(\d+)-(\d*)$/.exec(range);
          if (!match) return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + bytes.byteLength } });
          const start = Number(match[1]), end = Math.min(match[2] ? Number(match[2]) : bytes.byteLength - 1, bytes.byteLength - 1);
          if (start > end || start >= bytes.byteLength) return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + bytes.byteLength } });
          return new Response(bytes.slice(start, end + 1), { status: 206, headers: { 'Content-Type': saved.headers.get('content-type') || 'audio/mpeg', 'Accept-Ranges': 'bytes', 'Content-Range': 'bytes ' + start + '-' + end + '/' + bytes.byteLength, 'Content-Length': String(end - start + 1) } });
        }
        return saved;
      }
      try { return await fetch(event.request); }
      catch { return await caches.match(event.request) || new Response('', { status: 503 }); }
    })());
    return;
  }

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
  // إعادة توجيه أي طلب خارجي لصفحات المصحف (cdn.quran.ws) إلى ملفات الـ SVG المحلية بدون إنترنت وبدون أخطاء CORS
  if (url.includes("cdn.quran.ws")) {
    const pageMatch = url.match(/(\d+)\.svg/);
    if (pageMatch) {
      const paddedPage = pageMatch[1].padStart(3, "0");
      const localSvgUrl = `./assets/quran-pages/${paddedPage}.svg`;
      event.respondWith(
        caches.match(localSvgUrl).then((cached) => {
          if (cached) return cleanResponse(cached);
          return fetch(localSvgUrl).then(resp => cleanResponse(resp)).catch(() => new Response("", { status: 404 }));
        })
      );
      return;
    }
  }

  const isQuranAsset = 
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
    if (event.data.muazzin) {
      selectedMuazzinPreference = event.data.muazzin;
    }
    armBackgroundPrayerAlarms();
  }

  if (event.data.type === "SET_MUAZZIN") {
    if (event.data.muazzin) {
      selectedMuazzinPreference = event.data.muazzin;
    }
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

    // 1. تنبيه اقتراب موعد الصلاة قبل 5 دقائق
    const preAlertDelay = delay - (5 * 60 * 1000);
    if (preAlertDelay > 0 && preAlertDelay <= 86400000) {
      const preTimer = setTimeout(() => {
        showDeviceNotification(
          `⏳ اقتربت ${prayer.name}`,
          `بقي 5 دقائق على دخول وقت ${prayer.name}. تَهَيّأْ للوضوء والصلاة وأَقْبِلْ على الله بقلب خاشع 🌿`,
          `./#prayer-times`,
          `pre_prayer_${prayer.key}_${new Date().toISOString().slice(0, 10)}`
        );
      }, preAlertDelay);
      activeAlarmTimers.push(preTimer);
    }

    // 2. إشعار دخول وقت الصلاة وسماع الأذان
    if (delay > 0 && delay <= 86400000) {
      const timer = setTimeout(() => {
        showPrayerNotification(prayer);
      }, delay);
      activeAlarmTimers.push(timer);
    }
  });
}

function showPrayerNotification(prayer) {
  const isFajr = prayer.key === "fajr";
  const muazzinAudioFile = isFajr ? "fajr.mp3" : `${selectedMuazzinPreference || "qatami"}.mp3`;
  const soundUrl = `./assets/audio/adhan/${muazzinAudioFile}`;
  const playUrl = `./#prayer-times?playAdhan=1&prayer=${prayer.key}&muazzin=${selectedMuazzinPreference || "qatami"}&t=${Date.now()}`;

  const options = {
    body: `الله أكبر، الله أكبر.. حان الآن موعد ${prayer.name} حسب توقيتك المحلي. حيّ على الصلاة، حيّ على الفلاح 🕌`,
    icon: "./assets/icon-192.png",
    badge: "./assets/icon-192.png",
    vibrate: [500, 200, 500, 200, 500, 200, 800, 400, 800, 400, 1200],
    tag: `prayer_${prayer.key}_${new Date().toISOString().slice(0, 10)}`,
    dir: "rtl",
    lang: "ar",
    renotify: true,
    requireInteraction: true,
    sound: soundUrl,
    data: {
      url: playUrl,
      prayerKey: prayer.key,
      muazzin: selectedMuazzinPreference,
      defaultActionUrl: playUrl
    },
    actions: [
      { action: "play_adhan", title: "🔊 سماع الأذان كاملاً" },
      { action: "open", title: "🕌 مواقيت الصلاة" }
    ]
  };

  self.registration.showNotification(`🕌 حان الآن موعد ${prayer.name}`, options);
}

function showDeviceNotification(title, body, url, tag) {
  const options = {
    body: body || "تذكير بذكر الله والصلاة على النبي ﷺ 🌿",
    icon: "./assets/icon-192.png",
    badge: "./assets/icon-192.png",
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

  let targetUrl = "./";
  const notifData = event.notification.data || {};

  if (event.action === "open") {
    targetUrl = notifData.url ? notifData.url.replace("playAdhan=1&", "") : "./#prayer-times";
  } else {
    // الضغط على الإشعار الرئيسي أو زر "play_adhan"
    targetUrl = notifData.url || "./";
  }

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
