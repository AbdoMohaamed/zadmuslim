const { authorize } = require('../server/admin-auth');
module.exports = async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const session = await authorize(req, res);
    if (session) res.status(200).json({ uid: session.uid });
};
