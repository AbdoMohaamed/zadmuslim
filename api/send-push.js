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
  try {
    const bodyData = { ...(req.body || {}), appId: process.env.ONESIGNAL_APP_ID, restKey: process.env.ONESIGNAL_REST_API_KEY,
      onesignalAppId: process.env.ONESIGNAL_APP_ID, onesignalRestKey: process.env.ONESIGNAL_REST_API_KEY };
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (bodyData.action && !['test_onesignal','send_onesignal','test_device'].includes(bodyData.action)) return res.status(400).json({error:'عملية إرسال غير معروفة.'});
    if (bodyData.requestId && !uuid.test(bodyData.requestId)) return res.status(400).json({error:'معرّف طلب الإرسال غير صالح.'});
    if (bodyData.action === 'test_device' && !uuid.test(bodyData.subscriptionId || '')) return res.status(400).json({error:'أدخل معرّف اشتراك جهاز التجربة (Subscription ID).'});
    if (bodyData.action === 'send_onesignal' || bodyData.action === 'test_device') bodyData.channel='mobile';
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
        return res.status(503).json({ error: 'اضبط ONESIGNAL_APP_ID و ONESIGNAL_REST_API_KEY في إعدادات الاستضافة.' });
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
        if (!osRes.ok) return res.status(502).json({error:'تعذّر الاتصال بـ OneSignal. راجع معرّف التطبيق والمفتاح على الخادم.'});
        return res.status(200).json({success:true,appId:osData.id});
      } catch (osErr) {
        return res.status(500).json({
          error: 'تعذّر الاتصال بخادم OneSignal. حاول لاحقًا.'
        });
      }
    }

    // -------------------------------------------------------------
    // 3. Broadcast (Web Push + OneSignal Mobile Push)
    // -------------------------------------------------------------
    const { title, body, url, icon, badge, onesignalAppId, onesignalRestKey, channel = 'all' } = bodyData;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    if (!['all','web','mobile'].includes(channel)) return res.status(400).json({error:'قناة الإرسال غير صالحة.'});
    const targetChannel = channel;
    const hasOneSignalConfig = Boolean(onesignalAppId && onesignalRestKey);
    const mobileRequested = targetChannel === 'all' || targetChannel === 'mobile';
    const shouldSendMobile = mobileRequested && hasOneSignalConfig;
    const shouldSendWeb = targetChannel === 'all' || targetChannel === 'web';

    if (shouldSendWeb) {
      if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !FIREBASE_DB_URL) return res.status(503).json({error:'إعدادات إشعارات الويب ناقصة. اضبط VAPID وقاعدة البيانات، أو اختر الموبايل فقط.'});
      webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    }

    if (targetChannel === 'mobile' && !hasOneSignalConfig) {
      return res.status(400).json({ error: 'إعدادات OneSignal غير متوفرة على الخادم.' });
    }

    // Step 1: Pre-fetch Web subscribers BEFORE triggering mobile push.
    // If reading database fails, abort now before any notifications are dispatched.
    // This prevents sending to mobile then failing on web, which would cause duplicate mobile pushes on retry.
    let subscribersData = null;
    let webFetchError = null;

    if (shouldSendWeb) {
      try {
        const fbResponse = await fetch(`${FIREBASE_DB_URL}/push_subscribers.json?auth=${encodeURIComponent(session.token)}`, { signal: AbortSignal.timeout(10000) });
        if (!fbResponse.ok) {
          webFetchError = 'تعذّر قراءة المشتركين من قاعدة البيانات. راجع الصلاحيات.';
        } else {
          subscribersData = await fbResponse.json();
        }
      } catch (fetchErr) {
        webFetchError = 'فشل الاتصال بقاعدة البيانات لقراءة المشتركين: ' + fetchErr.message;
      }

      if (webFetchError) {
        return res.status(502).json({
          error: webFetchError,
          preventedSend: true,
          message: 'تم إيقاف الإرسال قبل الوصول لخدمة الموبايل لحماية المستخدمين من التكرار.'
        });
      }
    }

    // Step 2: Send Mobile Push via OneSignal if targeted
    let onesignalResult = null;
    let mobileError = mobileRequested && !hasOneSignalConfig ? 'إعدادات OneSignal ناقصة على الخادم.' : null;
    let mobileSuccess = false;

    if (shouldSendMobile) {
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
            ...(bodyData.action === 'test_device' ? {include_subscription_ids:[bodyData.subscriptionId]} : {included_segments:['All']}),
            ...(bodyData.requestId ? {idempotency_key:bodyData.requestId} : {}),
            headings: { en: title, ar: title },
            contents: { en: body, ar: body },
            ios_sound: 'default',
            existing_android_channel_id: 'zad_cloud_broadcast_channel',
            data: { url: url || './', type: 'admin_broadcast' }
          })
        });
        onesignalResult = await osRes.json();
        if (osRes.ok && onesignalResult && onesignalResult.id && !onesignalResult.errors) {
          mobileSuccess = true;
        } else if (onesignalResult && onesignalResult.errors) {
          mobileError = Array.isArray(onesignalResult.errors) ? onesignalResult.errors.join(', ') : String(onesignalResult.errors);
        } else {
          mobileError = osRes.ok ? 'لا يوجد اشتراك نشط مطابق للإرسال.' : 'رفضت خدمة OneSignal طلب الإرسال.';
        }
      } catch (osErr) {
        mobileError = osErr.message;
        onesignalResult = { errors: [osErr.message] };
      }
    }

    // Step 3: Send Web Push to subscribers if targeted
    let successCount = 0;
    let failureCount = 0;
    const expiredKeys = [];
    const subscriberEntries = subscribersData ? Object.entries(subscribersData) : [];

    if (shouldSendWeb && subscriberEntries.length > 0) {
      const payload = JSON.stringify({
        title: title,
        body: body,
        ...(bodyData.requestId ? {tag:bodyData.requestId} : {}),
        icon: icon || '/assets/icon-192.png',
        badge: badge || '/assets/icon-192.png',
        dir: 'rtl',
        lang: 'ar',
        data: {
          url: url || './',
          timestamp: Date.now()
        }
      });

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
    }

    const webAttempted = shouldSendWeb;
    const webSuccess = successCount > 0;
    const mobileAttempted = shouldSendMobile;

    // Overall success if at least one requested channel succeeded
    const overallSuccess = (webAttempted && webSuccess) || (mobileAttempted && mobileSuccess);
    const partialFailure = overallSuccess && ((shouldSendWeb && (!webSuccess || failureCount > 0)) || (mobileRequested && !mobileSuccess));
    const summary = [];
    if (shouldSendWeb) summary.push(webSuccess ? ('قبلت خدمة الويب الإرسال إلى '+successCount+' اشتراك'+(failureCount?'، وتعذّر '+failureCount:'')) : (subscriberEntries.length?'تعذّر إرسال إشعارات الويب':'لا توجد اشتراكات ويب'));
    if (mobileRequested) summary.push(mobileSuccess ? 'قبلت OneSignal طلب إرسال الموبايل' : (mobileError || 'لم يُقبل إرسال الموبايل'));
    const summaryMessage = summary.join(' • ') + '. قبول الطلب لا يؤكد وصوله للجهاز.';

    return res.status(200).json({
      success: overallSuccess,
      partialFailure: partialFailure,
      channel: targetChannel,
      channels: {
        web: {
          attempted: webAttempted,
          success: webSuccess,
          sentCount: successCount,
          failedCount: failureCount,
          totalSubscribers: subscriberEntries.length,
          error: webAttempted && !webSuccess && subscriberEntries.length > 0 ? 'تعذّر الإرسال لجميع المتصفحات' : null
        },
        mobile: {
          attempted: mobileAttempted,
          success: mobileSuccess,
          recipients: Number.isFinite(onesignalResult?.recipients) ? onesignalResult.recipients : null,
          id: onesignalResult?.id || null,
          error: mobileError
        }
      },
      totalSubscribers: subscriberEntries.length,
      sentCount: successCount,
      failedCount: failureCount,
      cleanedExpired: expiredKeys.length,
      onesignal: onesignalResult,
      message: summaryMessage
    });

  } catch (error) {
    console.error('Push server error:', error);
    return res.status(500).json({
      error: 'Failed to send web push notifications',
      details: 'راجع إعدادات الخادم والصلاحيات.'
    });
  }
};
