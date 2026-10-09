const webpush = require('web-push');

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "BFCsM3Ryzc4kdbfNgCqtlOJPjIvrolQJTQUdD03b8g1ehKhnxqNeAUJ9T_Yl8WajcZj_dWvJhcCbHN6-pPCSJ4I";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "_aoEv2QuF5Zbo14whCStV5jrSVY3a8-tgPOKT0QS0rI";
const VAPID_SUBJECT = "mailto:abdelrahman.developer@gmail.com";
const FIREBASE_DB_URL = "https://sadqah-jaddi-default-rtdb.firebaseio.com";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

module.exports = async function handler(req, res) {
  // Enable CORS for all origins (admin panel, localhost, mobile web)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const bodyData = req.body || {};

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
          method: 'GET',
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
          method: 'POST',
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
          method: 'POST',
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

    const fbResponse = await fetch(`${FIREBASE_DB_URL}/push_subscribers.json`);
    const subscribersData = await fbResponse.json();

    if (!subscribersData) {
      return res.status(200).json({
        success: true,
        sentCount: 0,
        onesignal: onesignalResult,
        message: 'No web subscribers registered yet'
      });
    }

    const subscriberEntries = Object.entries(subscribersData);
    let successCount = 0;
    let failureCount = 0;
    const expiredKeys = [];

    const pushPromises = subscriberEntries.map(async ([key, subObj]) => {
      if (!subObj || !subObj.subscription || !subObj.subscription.endpoint) {
        return;
      }

      const subscription = subObj.subscription;

      try {
        await webpush.sendNotification(subscription, payload, {
          TTL: 86400, // 24 hours retention
          urgency: 'high'
        });
        successCount++;
      } catch (err) {
        failureCount++;
        if (err.statusCode === 404 || err.statusCode === 410) {
          expiredKeys.push(key);
        }
      }
    });

    await Promise.all(pushPromises);

    // Clean up expired subscriptions from Firebase
    if (expiredKeys.length > 0) {
      expiredKeys.forEach(async (expiredKey) => {
        try {
          await fetch(`${FIREBASE_DB_URL}/push_subscribers/${expiredKey}.json`, {
            method: 'DELETE'
          });
        } catch (e) {}
      });
    }

    return res.status(200).json({
      success: true,
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
      details: error.message
    });
  }
};
