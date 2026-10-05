const webpush = require('web-push');

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "BFCsM3Ryzc4kdbfNgCqtlOJPjIvrolQJTQUdD03b8g1ehKhnxqNeAUJ9T_Yl8WajcZj_dWvJhcCbHN6-pPCSJ4I";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "_aoEv2QuF5Zbo14whCStV5jrSVY3a8-tgPOKT0QS0rI";
const VAPID_SUBJECT = "mailto:abdelrahman.developer@gmail.com";
const FIREBASE_DB_URL = "https://sadqah-jaddi-default-rtdb.firebaseio.com";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

module.exports = async function handler(req, res) {
  // Enable CORS
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
    const { title, body, url, icon, badge } = req.body || {};

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    const payload = JSON.stringify({
      title: title,
      body: body,
      icon: icon || '/assets/icon.svg',
      badge: badge || '/assets/icon.svg',
      dir: 'rtl',
      lang: 'ar',
      data: {
        url: url || './',
        timestamp: Date.now()
      }
    });

    // 1. Fetch all subscribers from Firebase Realtime Database
    const fbResponse = await fetch(`${FIREBASE_DB_URL}/push_subscribers.json`);
    const subscribersData = await fbResponse.json();

    if (!subscribersData) {
      return res.status(200).json({
        success: true,
        sentCount: 0,
        message: 'No subscribers registered yet'
      });
    }

    const subscriberEntries = Object.entries(subscribersData);
    let successCount = 0;
    let failureCount = 0;
    const expiredKeys = [];

    // 2. Send push to all subscribers concurrently
    const pushPromises = subscriberEntries.map(async ([key, subObj]) => {
      // Validate subscription format
      if (!subObj || !subObj.subscription || !subObj.subscription.endpoint) {
        return;
      }

      const subscription = subObj.subscription;

      try {
        await webpush.sendNotification(subscription, payload, {
          TTL: 86400, // 24 hours retention on push servers
          urgency: 'high'
        });
        successCount++;
      } catch (err) {
        failureCount++;
        // If subscription is expired or unsubscribed, mark for cleanup
        if (err.statusCode === 404 || err.statusCode === 410) {
          expiredKeys.push(key);
        }
      }
    });

    await Promise.all(pushPromises);

    // 3. Clean up expired subscriptions from Firebase
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
