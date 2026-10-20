const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const mime = { '.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg' };
const server = http.createServer((req, res) => {
    let name;
    try { name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
    if (name.startsWith('/api/')) { res.writeHead(503, { 'Content-Type':'application/json' }).end(JSON.stringify({ error:'واجهات الإدارة تحتاج بيئة الخادم. راجع DEPLOYMENT.md.' })); return; }
    if (!/^\/(?:assets\/|(?:index|app|settings|services|privacy|admin|embed)\.html$|(?:sw\.js|manifest\.json|radios\.json)$|$)/.test(name) || name.split('/').includes('..')) { res.writeHead(404).end(); return; }
    const file = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404).end(); return; }
        res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store' }); res.end(data);
    });
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log('Preview: http://127.0.0.1:' + server.address().port));
