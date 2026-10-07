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
    const target = 'guard let idsArray = call.getArray("ids") else {';
    const replacement = 'guard let idsArray: JSArray = call.getArray("ids") else {';
    
    if (content.includes(target)) {
        content = content.split(target).join(replacement);
        fs.writeFileSync(pluginSwiftPath, content, 'utf8');
        console.log('✅ Successfully patched LocalNotificationsPlugin.swift for Swift 5.10 / Capacitor 8!');
    } else {
        console.log('ℹ️ LocalNotificationsPlugin.swift is already patched or target string not found.');
    }
} else {
    console.log('ℹ️ Plugin file not found, skipping patch.');
}
