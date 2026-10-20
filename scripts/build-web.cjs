const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'www');
fs.mkdirSync(target, { recursive: true });
for (const file of ['index.html','app.html','settings.html','services.html','privacy.html','admin.html','embed.html','manifest.json','sw.js','radios.json']) {
    fs.copyFileSync(path.join(root, file), path.join(target, file));
}
fs.cpSync(path.join(root, 'assets'), path.join(target, 'assets'), { recursive: true });
console.log('Web assets synchronized to www.');
