const fs = require('fs');
const path = require('path');

const basePluginDir = path.join(
    __dirname,
    '..',
    'node_modules',
    '@capacitor',
    'local-notifications',
    'ios',
    'Sources',
    'LocalNotificationsPlugin'
);

const pluginSwiftPath = path.join(basePluginDir, 'LocalNotificationsPlugin.swift');
const handlerSwiftPath = path.join(basePluginDir, 'LocalNotificationsHandler.swift');

if (fs.existsSync(pluginSwiftPath)) {
    let content = fs.readFileSync(pluginSwiftPath, 'utf8');
    if (content.includes('call.getArray("ids")')) {
        content = content.replace(/guard let idsArray.*= call\.getArray\("ids".*\) else \{/g, 'guard let idsArray = call.getArray("ids", JSValue.self) else {');
        fs.writeFileSync(pluginSwiftPath, content, 'utf8');
        console.log('✅ Patched LocalNotificationsPlugin.swift');
    } else {
        console.log('ℹ️ LocalNotificationsPlugin.swift is compatible.');
    }
}

if (fs.existsSync(handlerSwiftPath)) {
    let handlerContent = fs.readFileSync(handlerSwiftPath, 'utf8');
    if (handlerContent.includes('self.plugin?.getConfig().getArray("presentationOptions")')) {
        handlerContent = handlerContent.replace(
            'self.plugin?.getConfig().getArray("presentationOptions") as? [String]',
            '(self.plugin?.getConfig().getConfigJSON()["presentationOptions"]) as? [String]'
        );
        fs.writeFileSync(handlerSwiftPath, handlerContent, 'utf8');
        console.log('✅ Patched LocalNotificationsHandler.swift');
    } else {
        console.log('ℹ️ LocalNotificationsHandler.swift is compatible.');
    }
}
