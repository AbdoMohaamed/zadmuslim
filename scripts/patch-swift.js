const fs = require('fs');
const path = require('path');

const pluginSwiftPath = path.join(
    __dirname,
    '..',
    'node_modules',
    '@capacitor',
    'local-notifications',
    'ios',
    'Sources',
    'LocalNotificationsPlugin',
    'LocalNotificationsPlugin.swift'
);

if (fs.existsSync(pluginSwiftPath)) {
    let content = fs.readFileSync(pluginSwiftPath, 'utf8');
    
    // تصحيح سطر getArray("ids") ليمرر النوع الصريح JSValue.self لمنع خطأ غموض الدوال في Swift
    content = content.replace(/guard let idsArray.*= call\.getArray\("ids".*\) else \{/g, 'guard let idsArray = call.getArray("ids", JSValue.self) else {');
    
    fs.writeFileSync(pluginSwiftPath, content, 'utf8');
    console.log('✅ Successfully patched LocalNotificationsPlugin.swift: guard let idsArray = call.getArray("ids", JSValue.self)');
} else {
    console.log('ℹ️ Plugin file not found, skipping patch.');
}
