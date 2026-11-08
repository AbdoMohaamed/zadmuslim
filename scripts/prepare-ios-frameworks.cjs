const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
    console.log('🚀 Preparing iOS SPM dependencies locally to bypass CDN timeouts...');
    const rootDir = path.resolve(__dirname, '..');
    const vendorDir = path.join(rootDir, 'ios', 'App', 'vendor');
    fs.mkdirSync(vendorDir, { recursive: true });

    const onesignalVendor = path.join(vendorDir, 'OneSignal-XCFramework');
    const capacitorVendor = path.join(vendorDir, 'capacitor-swift-pm');

    // 1. Clone OneSignal-XCFramework if not present
    if (!fs.existsSync(onesignalVendor)) {
        console.log('📦 Cloning OneSignal-XCFramework 5.7.0...');
        execSync(`git clone --depth 1 --branch 5.7.0 https://github.com/OneSignal/OneSignal-XCFramework.git "${onesignalVendor}"`, { stdio: 'inherit' });
    }

    // 2. Clone capacitor-swift-pm if not present
    if (!fs.existsSync(capacitorVendor)) {
        console.log('📦 Cloning capacitor-swift-pm 7.6.9...');
        execSync(`git clone --depth 1 --branch 7.6.9 https://github.com/ionic-team/capacitor-swift-pm.git "${capacitorVendor}"`, { stdio: 'inherit' });
    }

    const token = process.env.GITHUB_TOKEN || '';
    const headers = {
        'Accept': 'application/octet-stream',
        'User-Agent': 'ZadMuslim-CI'
    };
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }

    async function downloadAsset(url, destPath) {
        console.log(`⬇️ Downloading ${path.basename(destPath)}...`);
        const res = await fetch(url, { headers });
        if (!res.ok) {
            throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
        }
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(destPath, buf);
    }

    // List of OneSignal assets
    const onesignalAssets = [
        { id: 582326940, name: 'OneSignalCore.xcframework' },
        { id: 582326938, name: 'OneSignalExtension.xcframework' },
        { id: 582326939, name: 'OneSignalFramework.xcframework' },
        { id: 582326943, name: 'OneSignalInAppMessages.xcframework' },
        { id: 582326941, name: 'OneSignalLiveActivities.xcframework' },
        { id: 582326955, name: 'OneSignalLocation.xcframework' },
        { id: 582326962, name: 'OneSignalNotifications.xcframework' },
        { id: 582326959, name: 'OneSignalOSCore.xcframework' },
        { id: 582326966, name: 'OneSignalOutcomes.xcframework' },
        { id: 582326969, name: 'OneSignalUser.xcframework' },
    ];

    for (const item of onesignalAssets) {
        const targetDir = path.join(onesignalVendor, item.name);
        if (!fs.existsSync(targetDir)) {
            const zipPath = path.join(onesignalVendor, `${item.name}.zip`);
            await downloadAsset(`https://api.github.com/repos/OneSignal/OneSignal-iOS-SDK/releases/assets/${item.id}`, zipPath);
            execSync(`unzip -qo "${zipPath}" -d "${onesignalVendor}"`);
            if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
        }
    }

    // List of Capacitor assets
    const capacitorAssets = [
        { id: 538584049, name: 'Capacitor.xcframework' },
        { id: 538584048, name: 'Cordova.xcframework' },
    ];

    for (const item of capacitorAssets) {
        const targetDir = path.join(capacitorVendor, item.name);
        if (!fs.existsSync(targetDir)) {
            const zipPath = path.join(capacitorVendor, `${item.name}.zip`);
            await downloadAsset(`https://api.github.com/repos/ionic-team/capacitor-swift-pm/releases/assets/${item.id}`, zipPath);
            execSync(`unzip -qo "${zipPath}" -d "${capacitorVendor}"`);
            if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
        }
    }

    // 3. Patch OneSignal-XCFramework Package.swift
    const onesignalPkgPath = path.join(onesignalVendor, 'Package.swift');
    let onesignalPkg = fs.readFileSync(onesignalPkgPath, 'utf8');
    onesignalPkg = onesignalPkg.replace(
        'name: "OneSignalXCFramework"',
        'name: "OneSignal-XCFramework"'
    );
    onesignalPkg = onesignalPkg.replace(
        /url:\s*"https:\/\/github\.com\/OneSignal\/OneSignal-iOS-SDK\/releases\/download\/5\.7\.0\/(OneSignal[A-Za-z]+)\.xcframework\.zip",\s*checksum:\s*"[a-f0-9]+"/g,
        'path: "$1.xcframework"'
    );
    fs.writeFileSync(onesignalPkgPath, onesignalPkg, 'utf8');
    console.log('✅ Patched OneSignal-XCFramework Package.swift with local binary paths.');

    // 4. Patch capacitor-swift-pm Package.swift
    const capPkgPath = path.join(capacitorVendor, 'Package.swift');
    let capPkg = fs.readFileSync(capPkgPath, 'utf8');
    capPkg = capPkg.replace(
        /url:\s*"https:\/\/github\.com\/ionic-team\/capacitor-swift-pm\/releases\/download\/7\.6\.9\/(Capacitor|Cordova)\.xcframework\.zip",\s*checksum:\s*"[a-f0-9]+"/g,
        'path: "$1.xcframework"'
    );
    fs.writeFileSync(capPkgPath, capPkg, 'utf8');
    console.log('✅ Patched capacitor-swift-pm Package.swift with local binary paths.');

    // 5. Patch CapApp-SPM/Package.swift
    const capAppPkgPath = path.join(rootDir, 'ios', 'App', 'CapApp-SPM', 'Package.swift');
    if (fs.existsSync(capAppPkgPath)) {
        let capAppPkg = fs.readFileSync(capAppPkgPath, 'utf8');
        capAppPkg = capAppPkg.replace(
            '.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "7.6.9")',
            '.package(name: "capacitor-swift-pm", path: "../vendor/capacitor-swift-pm")'
        );
        fs.writeFileSync(capAppPkgPath, capAppPkg, 'utf8');
        console.log('✅ Patched CapApp-SPM Package.swift with local vendor path.');
    }

    // 6. Patch onesignal-cordova-plugin Package.swift
    const onesignalPluginPkg = path.join(rootDir, 'node_modules', 'onesignal-cordova-plugin', 'Package.swift');
    if (fs.existsSync(onesignalPluginPkg)) {
        let pluginPkg = fs.readFileSync(onesignalPluginPkg, 'utf8');
        pluginPkg = pluginPkg.replace(
            '.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.6.9")',
            '.package(name: "capacitor-swift-pm", path: "../../../ios/App/vendor/capacitor-swift-pm")'
        );
        pluginPkg = pluginPkg.replace(
            '.package(url: "https://github.com/OneSignal/OneSignal-XCFramework.git", exact: "5.7.0")',
            '.package(name: "OneSignal-XCFramework", path: "../../../ios/App/vendor/OneSignal-XCFramework")'
        );
        fs.writeFileSync(onesignalPluginPkg, pluginPkg, 'utf8');
        console.log('✅ Patched onesignal-cordova-plugin Package.swift with local vendor paths.');
    }

    console.log('🎉 iOS local frameworks successfully prepared!');
}

main().catch(err => {
    console.error('❌ Error preparing iOS frameworks:', err);
    process.exit(1);
});
