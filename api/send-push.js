const webpush = require('web-push');

const { authorize } = require('../server/admin-auth');
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:abdelrahman.developer@gmail.com";
const FIREBASE_DB_URL = process.env.FIREBASE_DATABASE_URL;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await authorize(req, res);
  if (!session) return;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !FIREBASE_DB_URL) return res.status(503).json({ error: 'إعدادات الإشعارات غير مكتملة على الخادم.' });
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    const bodyData = { ...(req.body || {}), appId: process.env.ONESIGNAL_APP_ID, restKey: process.env.ONESIGNAL_REST_API_KEY,
      onesignalAppId: process.env.ONESIGNAL_APP_ID, onesignalRestKey: process.env.ONESIGNAL_REST_API_KEY };
    if (bodyData.action !== 'test_onesignal') {
      if (typeof bodyData.title !== 'string' || !bodyData.title.trim() || bodyData.title.length > 120 ||
          typeof bodyData.body !== 'string' || !bodyData.body.trim() || bodyData.body.length > 2000) return res.status(400).json({ error: 'العنوان والنص مطلوبان، بحد أقصى ١٢٠ و٢٠٠٠ حرف.' });
      try {
        const base = process.env.PUBLIC_SITE_URL || 'https://zadmuslim-zeta.vercel.app';
        const target = new URL(bodyData.url || './', base);
        if (target.origin !== new URL(base).origin || !['https:', 'http:'].includes(target.protocol)) throw new Error();
        bodyData.url = target.pathname + target.search + target.hash;
      } catch { return res.status(400).json({ error: 'الرابط يجب أن يكون داخل التطبيق.' }); }
    }

    // -------------------------------------------------------------
    // 1. OneSignal Proxy Action: Test Connection
    // -------------------------------------------------------------
    if (bodyData.action === 'test_onesignal') {
      const { appId, restKey } = bodyData;
      if (!appId || !restKey) {
        return res.status(400).json({ errors: ['OneSignal App ID and REST API Key are required'] });
      }

      const cleanKey = restKey.replace(/^(Key|Basic)\s+/i, '').trim();
      try {
        const osRes = await fetch(`https://api.onesignal.com/apps/${encodeURIComponent(appId)}`, {
          method: 'GET', signal: AbortSignal.timeout(10000),
          headers: {
            'Authorization': `Key ${cleanKey}`
          }
        });
        const osData = await osRes.json();
        return res.status(osRes.status).json(osData);
      } catch (osErr) {
        return res.status(500).json({
          errors: ['فشل الاتصال بخادم OneSignal: ' + osErr.message]
        });
      }
    }

    // -------------------------------------------------------------
    // 2. OneSignal Proxy Action: Dedicated Push
    // -------------------------------------------------------------
    if (bodyData.action === 'send_onesignal') {
      const { appId, restKey, title, body, url } = bodyData;
      if (!appId || !restKey || !title || !body) {
        return res.status(400).json({ errors: ['App ID, REST Key, Title, and Body are required'] });
      }

      const cleanKey = restKey.replace(/^(Key|Basic)\s+/i, '').trim();
      try {
        const osRes = await fetch('https://api.onesignal.com/notifications', {
          method: 'POST', signal: AbortSignal.timeout(10000),
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Key ${cleanKey}`
          },
          body: JSON.stringify({
            app_id: appId,
            included_segments: ['Total Subscriptions'],
            headings: { en: title, ar: title },
            contents: { en: body, ar: body },
            ios_sound: 'adhan_makkah.mp3',
            android_sound: 'adhan_makkah',
            android_channel_id: 'zad_cloud_broadcast_channel',
            data: { url: url || './', type: 'admin_broadcast' }
          })
        });
        const osData = await osRes.json();
        return res.status(osRes.status).json(osData);
      } catch (osErr) {
        return res.status(500).json({
          errors: ['فشل إرسال إشعار OneSignal: ' + osErr.message]
        });
      }
    }

    // -------------------------------------------------------------
    // 3. Full Broadcast (Web Push + OneSignal Cloud Push)
    // -------------------------------------------------------------
    const { title, body, url, icon, badge, onesignalAppId, onesignalRestKey } = bodyData;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    // A. Send to OneSignal (iOS / Android / Closed Mobile devices) if credentials provided
    let onesignalResult = null;
    if (onesignalAppId && onesignalRestKey) {
      try {
        const cleanKey = onesignalRestKey.replace(/^(Key|Basic)\s+/i, '').trim();
        const osRes = await fetch('https://api.onesignal.com/notifications', {
          method: 'POST', signal: AbortSignal.timeout(10000),
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Key ${cleanKey}`
          },
          body: JSON.stringify({
            app_id: onesignalAppId,
            included_segments: ['Total Subscriptions'],
            headings: { en: title, ar: title },
            contents: { en: body, ar: body },
            ios_sound: 'adhan_makkah.mp3',
            android_sound: 'adhan_makkah',
            android_channel_id: 'zad_cloud_broadcast_channel',
            data: { url: url || './', type: 'admin_broadcast' }
          })
        });
        onesignalResult = await osRes.json();
      } catch (osErr) {
        onesignalResult = { errors: [osErr.message] };
      }
    }

    // B. Send to Web Push Subscribers via Firebase Realtime Database
    const payload = JSON.stringify({
      title: title,
      body: body,
      icon: icon || '/assets/icon-192.png',
      badge: badge || '/assets/icon-192.png',
      dir: 'rtl',
      lang: 'ar',
      data: {
        url: url || './',
        timestamp: Date.now()
      }
    });

    const fbResponse = await fetch(`${FIREBASE_DB_URL}/push_subscribers.json?auth=${encodeURIComponent(session.token)}`, { signal: AbortSignal.timeout(10000) });
    if (!fbResponse.ok) return res.status(502).json({ error: 'تعذّر قراءة المشتركين. راجع الصلاحيات.' });
    const subscribersData = await fbResponse.json();

    if (!subscribersData) {
      return res.status(200).json({
        success: Boolean(onesignalResult?.id),
        sentCount: 0,
        onesignal: onesignalResult,
        message: 'No web subscribers registered yet'
      });
    }

    const subscriberEntries = Object.entries(subscribersData);
    let successCount = 0;
    let failureCount = 0;
    const expiredKeys = [];

    const sendSubscriber = async ([key, subObj]) => {
      if (!subObj || !subObj.subscription || !subObj.subscription.endpoint) {
        return;
      }

      const subscription = subObj.subscription;
      let endpoint;
      try { endpoint = new URL(subscription.endpoint); } catch { failureCount++; return; }
      const host = endpoint.hostname;
      if (endpoint.protocol !== 'https:' || endpoint.port ||
          !(host === 'fcm.googleapis.com' || host === 'updates.push.services.mozilla.com' ||
            host.endsWith('.notify.windows.com') || host === 'web.push.apple.com' || host.endsWith('.push.apple.com'))) {
        failureCount++; return;
      }

      try {
        await webpush.sendNotification(subscription, payload, {
          TTL: 86400, // 24 hours retention
          urgency: 'high', timeout: 10000
        });
        successCount++;
      } catch (err) {
        failureCount++;
        if (err.statusCode === 404 || err.statusCode === 410) {
          expiredKeys.push(key);
        }
      }
    };

    for (let i = 0; i < subscriberEntries.length; i += 20) {
      await Promise.all(subscriberEntries.slice(i, i + 20).map(sendSubscriber));
    }

    // Clean up expired subscriptions from Firebase
    if (expiredKeys.length > 0) {
      await Promise.all(expiredKeys.map(async (expiredKey) => {
        try {
          await fetch(`${FIREBASE_DB_URL}/push_subscribers/${encodeURIComponent(expiredKey)}.json?auth=${encodeURIComponent(session.token)}`, {
            method: 'DELETE', signal: AbortSignal.timeout(10000)
          });
        } catch (e) {}
      }));
    }

    return res.status(200).json({
      success: successCount > 0 || Boolean(onesignalResult?.id),
      totalSubscribers: subscriberEntries.length,
      sentCount: successCount,
      failedCount: failureCount,
      cleanedExpired: expiredKeys.length,
      onesignal: onesignalResult,
      message: `Successfully pushed to ${successCount} devices.`
    });

  } catch (error) {
    console.error('Push server error:', error);
    return res.status(500).json({
      error: 'Failed to send web push notifications',
      details: 'راجع إعدادات الخادم والصلاحيات.'
    });
  }
};
