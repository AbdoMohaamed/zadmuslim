const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const targetDir = path.join(__dirname, 'www');

// Create www folder
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Copy files
const filesToCopy = ['index.html', 'admin.html', 'manifest.json', 'sw.js', 'radios.json'];
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

console.log('Mobile assets successfully packaged into ./www directory!');
