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

// 1. تصحيح LocalNotificationsPlugin.swift
if (fs.existsSync(pluginSwiftPath)) {
    let content = fs.readFileSync(pluginSwiftPath, 'utf8');
    content = content.replace(/guard let idsArray.*= call\.getArray\("ids".*\) else \{/g, 'guard let idsArray = call.getArray("ids", JSValue.self) else {');
    fs.writeFileSync(pluginSwiftPath, content, 'utf8');
    console.log('✅ Successfully patched LocalNotificationsPlugin.swift (JSValue.self)');
}

// 2. تصحيح LocalNotificationsHandler.swift
if (fs.existsSync(handlerSwiftPath)) {
    let handlerContent = fs.readFileSync(handlerSwiftPath, 'utf8');
    handlerContent = handlerContent.replace(
        'self.plugin?.getConfig().getArray("presentationOptions") as? [String]',
        '(self.plugin?.getConfig().getConfigJSON()["presentationOptions"]) as? [String]'
    );
    fs.writeFileSync(handlerSwiftPath, handlerContent, 'utf8');
    console.log('✅ Successfully patched LocalNotificationsHandler.swift (PluginConfig.getConfigJSON)');
}
