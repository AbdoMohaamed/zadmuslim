const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'assets', 'quran-pages');
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const TOTAL_PAGES = 604;
const CONCURRENCY = 15;

async function fetchPage(pageNum, retries = 3) {
    const padded = String(pageNum).padStart(3, '0');
    const filePath = path.join(targetDir, `${padded}.svg`);

    // Skip if already downloaded and valid
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 10000) {
        return { pageNum, status: 'cached' };
    }

    const url = `https://cdn.quran.ws/svg/pages/v1.1.1/hafs-kfqc/${padded}.svg`;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await new Promise((resolve, reject) => {
                const req = https.get(url, (res) => {
                    if (res.statusCode !== 200) {
                        res.resume();
                        return reject(new Error(`Status ${res.statusCode}`));
                    }
                    const stream = fs.createWriteStream(filePath);
                    res.pipe(stream);
                    stream.on('finish', () => {
                        const sz = fs.statSync(filePath).size;
                        if (sz > 1000) resolve();
                        else reject(new Error('File too small'));
                    });
                    stream.on('error', reject);
                });
                req.on('error', reject);
                req.setTimeout(15000, () => {
                    req.destroy();
                    reject(new Error('Timeout'));
                });
            });
            return { pageNum, status: 'downloaded' };
        } catch (err) {
            if (attempt === retries) throw err;
            await new Promise(r => setTimeout(r, 500));
        }
    }
}

async function run() {
    console.log(`Starting download of all ${TOTAL_PAGES} Quran pages to ${targetDir}...`);
    const startTime = Date.now();
    let completed = 0;
    const queue = [];

    for (let i = 1; i <= TOTAL_PAGES; i++) {
        queue.push(i);
    }

    async function worker() {
        while (queue.length > 0) {
            const pageNum = queue.shift();
            try {
                await fetchPage(pageNum);
                completed++;
                if (completed % 50 === 0 || completed === TOTAL_PAGES) {
                    console.log(`Progress: ${completed}/${TOTAL_PAGES} pages completed (${Math.round(completed/TOTAL_PAGES*100)}%)`);
                }
            } catch (err) {
                console.error(`Error page ${pageNum}:`, err.message);
                queue.push(pageNum); // Re-queue
            }
        }
    }

    const workers = [];
    for (let w = 0; w < CONCURRENCY; w++) {
        workers.push(worker());
    }

    await Promise.all(workers);
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log(`\nALL ${TOTAL_PAGES} PAGES BUNDLED SUCCESSFULLY in ${elapsed}s!`);
}

run();
