'use strict';
async function authorize(req, res) {
    const token = (req.headers.authorization || '').match(/^Bearer ([^\s]+)$/)?.[1];
    if (!token) { res.status(401).json({ error: 'سجّل الدخول بحساب المسؤول أولاً.' }); return null; }
    const allowed = (process.env.ADMIN_UIDS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!process.env.FIREBASE_WEB_API_KEY || !allowed.length) {
        res.status(503).json({ error: 'لم يكتمل إعداد حساب المسؤول على الخادم.' }); return null;
    }
    try {
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(process.env.FIREBASE_WEB_API_KEY)}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: token }), signal: AbortSignal.timeout(10000)
        });
        const user = (await response.json()).users?.[0];
        if (!response.ok || !user || user.disabled) {
            res.status(401).json({ error: 'انتهت الجلسة. سجّل الدخول من جديد.' }); return null;
        }
        if (!allowed.includes(user.localId)) {
            res.status(403).json({ error: 'هذا الحساب لا يملك صلاحية الإدارة.' }); return null;
        }
        return { uid: user.localId, token };
    } catch {
        res.status(503).json({ error: 'تعذّر التحقق من الجلسة. حاول لاحقًا.' }); return null;
    }
}
module.exports = { authorize };
