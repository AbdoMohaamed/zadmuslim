require('./scripts/sync-prayer-images.cjs');
require('./scripts/sync-salawat-sounds.cjs');
const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const targetDir = path.join(__dirname, 'www');

// Create www folder
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Copy files
const filesToCopy = ['index.html', 'services.html', 'app.html', 'settings.html', 'admin.html', 'privacy.html', 'manifest.json', 'sw.js', 'radios.json', 'embed.html'];
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
// Function to trim MP3 at MPEG frame boundaries for iOS UNNotificationSound
// (Apple iOS requires UNNotificationSound files to be strictly < 30.0 seconds)
// -------------------------------------------------------------
function trimMp3Buffer(buffer, targetDurationSec = 28.5) {
    let offset = 0;
    if (buffer.length > 10 && buffer.toString('ascii', 0, 3) === 'ID3') {
        const size = (buffer[6] << 21) | (buffer[7] << 14) | (buffer[8] << 7) | buffer[9];
        offset = 10 + size;
    }

    const bitrates = [
        [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448],
        [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384],
        [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
        [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256],
        [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160]
    ];
    const sampleRates = [
        [44100, 48000, 32000],
        [22050, 24000, 16000],
        [11025, 12000, 8000]
    ];

    let currentDuration = 0;
    let cutOffset = buffer.length;

    let scanPos = offset;
    while (scanPos < buffer.length - 4) {
        if (buffer[scanPos] === 0xFF && (buffer[scanPos + 1] & 0xE0) === 0xE0) {
            const b1 = buffer[scanPos + 1];
            const b2 = buffer[scanPos + 2];
            const versionBits = (b1 >> 3) & 0x03;
            const layerBits = (b1 >> 1) & 0x03;
            const bitrateIdx = (b2 >> 4) & 0x0F;
            const sampleRateIdx = (b2 >> 2) & 0x03;
            const padding = (b2 >> 1) & 0x01;

            if (versionBits !== 1 && layerBits !== 0 && bitrateIdx !== 0 && bitrateIdx !== 15 && sampleRateIdx !== 3) {
                const version = versionBits === 3 ? 1 : (versionBits === 2 ? 2 : 2.5);
                const layer = 4 - layerBits;
                let brRow = 0;
                if (version === 1) brRow = layer - 1;
                else brRow = layer === 1 ? 3 : 4;
                const bitrate = bitrates[brRow][bitrateIdx] * 1000;
                const sampleRate = sampleRates[versionBits === 3 ? 0 : (versionBits === 2 ? 1 : 2)][sampleRateIdx];
                const samplesPerFrame = layer === 1 ? 384 : (version === 1 ? 1152 : 576);
                const frameSize = Math.floor((samplesPerFrame * (bitrate / 8)) / sampleRate) + padding;

                const frameDuration = samplesPerFrame / sampleRate;
                if (currentDuration + frameDuration > targetDurationSec) {
                    cutOffset = scanPos;
                    break;
                }
                currentDuration += frameDuration;
                scanPos += frameSize;
                continue;
            }
        }
        scanPos++;
    }

    return buffer.slice(0, cutOffset);
}

// -------------------------------------------------------------
// Sync pre-prayer custom sounds to Android raw & iOS App bundle
// -------------------------------------------------------------
const preAudioSrc = path.join(srcDir, 'assets', 'audio', 'pre');
const adhanAudioSrc = path.join(srcDir, 'assets', 'audio', 'adhan');
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

if (fs.existsSync(adhanAudioSrc)) {
    const adhanFiles = fs.readdirSync(adhanAudioSrc);
    adhanFiles.forEach(f => {
        const destName = f.startsWith('adhan_') ? f : `adhan_${f}`;
        const src = path.join(adhanAudioSrc, f);
        if (fs.existsSync(androidRawDir)) {
            // Android uses full audio length (supports full 4-minute adhan)
            fs.copyFileSync(src, path.join(androidRawDir, destName));
        }
        if (fs.existsSync(iosAppDir)) {
            // iOS UNNotificationSound strictly rejects files >= 30 seconds
            // Trimming to 28.5 seconds keeps full Takbeerat & Shahadah and allows sound on lock screen & app closed
            const buf = fs.readFileSync(src);
            const trimmed = trimMp3Buffer(buf, 28.5);
            fs.writeFileSync(path.join(iosAppDir, destName), trimmed);
        }
    });
}

// Sync salawat.mp3 to native raw / bundle
const salawatSrc = path.join(srcDir, 'assets', 'audio', 'salawat.mp3');
if (fs.existsSync(salawatSrc)) {
    if (fs.existsSync(androidRawDir)) {
        fs.copyFileSync(salawatSrc, path.join(androidRawDir, 'salawat.mp3'));
    }
    if (fs.existsSync(iosAppDir)) {
        fs.copyFileSync(salawatSrc, path.join(iosAppDir, 'salawat.mp3'));
    }
}

// Ensure salawat.mp3 is linked in Xcode project.pbxproj
const pbxPath = path.join(srcDir, 'ios', 'App', 'App.xcodeproj', 'project.pbxproj');
if (fs.existsSync(pbxPath)) {
    let pbxContent = fs.readFileSync(pbxPath, 'utf8');
    if (!pbxContent.includes('salawat.mp3')) {
        pbxContent = pbxContent.replace(
            '95PR000C2DB07C7200EA8C01 /* pre_prayer.mp3 in Resources */ = {isa = PBXBuildFile; fileRef = 95PR000B2DB07C7200EA8C01 /* pre_prayer.mp3 */; };',
            '95PR000C2DB07C7200EA8C01 /* pre_prayer.mp3 in Resources */ = {isa = PBXBuildFile; fileRef = 95PR000B2DB07C7200EA8C01 /* pre_prayer.mp3 */; };\n\t\t95SW00022DB07C7200EA8C01 /* salawat.mp3 in Resources */ = {isa = PBXBuildFile; fileRef = 95SW00012DB07C7200EA8C01 /* salawat.mp3 */; };'
        );
        pbxContent = pbxContent.replace(
            '95PR000B2DB07C7200EA8C01 /* pre_prayer.mp3 */ = {isa = PBXFileReference; lastKnownFileType = audio.mp3; path = pre_prayer.mp3; sourceTree = "<group>"; };',
            '95PR000B2DB07C7200EA8C01 /* pre_prayer.mp3 */ = {isa = PBXFileReference; lastKnownFileType = audio.mp3; path = pre_prayer.mp3; sourceTree = "<group>"; };\n\t\t95SW00012DB07C7200EA8C01 /* salawat.mp3 */ = {isa = PBXFileReference; lastKnownFileType = audio.mp3; path = salawat.mp3; sourceTree = "<group>"; };'
        );
        pbxContent = pbxContent.replace(
            '95PR000B2DB07C7200EA8C01 /* pre_prayer.mp3 */,\n\t\t\t);',
            '95PR000B2DB07C7200EA8C01 /* pre_prayer.mp3 */,\n\t\t\t\t95SW00012DB07C7200EA8C01 /* salawat.mp3 */,\n\t\t\t);'
        );
        pbxContent = pbxContent.replace(
            '95PR000C2DB07C7200EA8C01 /* pre_prayer.mp3 in Resources */,\n\t\t\t);',
            '95PR000C2DB07C7200EA8C01 /* pre_prayer.mp3 in Resources */,\n\t\t\t\t95SW00022DB07C7200EA8C01 /* salawat.mp3 in Resources */,\n\t\t\t);'
        );
        fs.writeFileSync(pbxPath, pbxContent, 'utf8');
        console.log('✅ Registered salawat.mp3 in Xcode project.pbxproj');
    }
}

// Sync prayer images to Android drawable & iOS App bundle
const prayerImagesSrc = path.join(srcDir, 'assets', 'images', 'prayers');
const androidDrawableDir = path.join(srcDir, 'android', 'app', 'src', 'main', 'res', 'drawable');
if (fs.existsSync(prayerImagesSrc)) {
    const pFiles = fs.readdirSync(prayerImagesSrc);
    pFiles.forEach(f => {
        const src = path.join(prayerImagesSrc, f);
        if (f.endsWith('.jpg') && fs.existsSync(androidDrawableDir)) {
            fs.copyFileSync(src, path.join(androidDrawableDir, f));
        }
        if (fs.existsSync(iosAppDir)) {
            fs.copyFileSync(src, path.join(iosAppDir, f));
        }
    });
}

console.log('Mobile assets successfully packaged into ./www directory and native sound resources synced!');
