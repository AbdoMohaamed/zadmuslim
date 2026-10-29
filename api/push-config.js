// Only the public App ID is shared. REST credentials never leave the server.
module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({error:'Method Not Allowed'});
  const appId = process.env.ONESIGNAL_APP_ID;
  if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(appId || '') || appId === '00000000-0000-0000-0000-000000000000') return res.status(503).json({error:'Mobile push is not configured'});
  return res.status(200).json({appId});
};
