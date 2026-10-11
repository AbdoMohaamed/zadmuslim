const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const targetDir = path.join(__dirname, 'www');

// Create www folder
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Copy files
const filesToCopy = ['index.html', 'services.html', 'app.html', 'admin.html', 'privacy.html', 'manifest.json', 'sw.js', 'radios.json'];
filesToCopy.forEach(file => {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(targetDir, file);
    if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, destFile);
    }
});

// Copy assets folder recursively
function copyDirRecursive(source, destination) {
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }
    const entries = fs.readdirSync(source, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(source, entry.name);
        const destPath = path.join(destination, entry.name);
        if (entry.isDirectory()) {
            copyDirRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

const assetsSrc = path.join(srcDir, 'assets');
const assetsDest = path.join(targetDir, 'assets');
if (fs.existsSync(assetsSrc)) {
    copyDirRecursive(assetsSrc, assetsDest);
}

// -------------------------------------------------------------
// Sync pre-prayer custom sounds to Android raw & iOS App bundle
// -------------------------------------------------------------
const preAudioSrc = path.join(srcDir, 'assets', 'audio', 'pre');
const androidRawDir = path.join(srcDir, 'android', 'app', 'src', 'main', 'res', 'raw');
const iosAppDir = path.join(srcDir, 'ios', 'App', 'App');

if (fs.existsSync(preAudioSrc)) {
    const preFiles = fs.readdirSync(preAudioSrc);
    preFiles.forEach(f => {
        const src = path.join(preAudioSrc, f);
        if (fs.existsSync(androidRawDir)) {
            fs.copyFileSync(src, path.join(androidRawDir, f));
        }
        if (fs.existsSync(iosAppDir)) {
            fs.copyFileSync(src, path.join(iosAppDir, f));
        }
    });
}

console.log('Mobile assets successfully packaged into ./www directory and native sound resources synced!');
