/**
 * ZadMuslim V4 — Nearby Mosques Engine (مساجد قريبة منك)
 * نظام متكامل وموثوق لجلب المساجد الحقيقية القريبة من موقع المستخدم بدقة وسرعة
 * يعتمد على خريطة العالم OpenStreetMap عبر محركات Photon و Overpass و Nominatim
 * مع دعم بلجن الموبايل الأصلي (Capacitor) والموقع التقريبي وحفظ الخصوصية 100%
 */

(function () {
    'use strict';

    let currentLat = null;
    let currentLon = null;
    let mosquesList = [];
    let leafletMapInstance = null;
    let markersGroup = null;
    let activeViewMode = 'list'; // 'list' or 'map'

    const OVERPASS_ENDPOINTS = [
        'https://overpass-api.de/api/interpreter',
        'https://lz4.overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter'
    ];

    function initNearbyMosques() {
        const section = document.getElementById('nearby-mosques-section');
        if (!section) return;

        setupSearchButton();
        setupViewSwitchers();
        setupManualCitySearch();
        setupRadiusFilter();
    }

    function setupSearchButton() {
        const btnLocate = document.getElementById('btn-find-nearby-mosques');
        if (btnLocate) {
            btnLocate.addEventListener('click', async () => {
                const originalHtml = btnLocate.innerHTML;
                btnLocate.disabled = true;
                btnLocate.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-gold"></i> <span>جاري البحث وتحديد أقرب المساجد...</span>';
                try {
                    await requestUserLocationAndFind();
                } finally {
                    btnLocate.disabled = false;
                    btnLocate.innerHTML = originalHtml;
                }
            });
        }
    }

    function setupViewSwitchers() {
        const btnList = document.getElementById('btn-mosques-view-list');
        const btnMap = document.getElementById('btn-mosques-view-map');
        const listContainer = document.getElementById('mosques-list-container');
        const mapContainer = document.getElementById('mosques-map-container');

        if (btnList && btnMap) {
            btnList.addEventListener('click', () => {
                activeViewMode = 'list';
                btnList.classList.add('active');
                btnMap.classList.remove('active');
                if (listContainer) listContainer.style.display = 'block';
                if (mapContainer) mapContainer.style.display = 'none';
            });

            btnMap.addEventListener('click', () => {
                activeViewMode = 'map';
                btnMap.classList.add('active');
                btnList.classList.remove('active');
                if (listContainer) listContainer.style.display = 'none';
                if (mapContainer) {
                    mapContainer.style.display = 'block';
                    setTimeout(() => {
                        ensureLeafletMapLoaded();
                    }, 100);
                }
            });
        }
    }

    function setupManualCitySearch() {
        const input = document.getElementById('input-mosques-city-search');
        const btnSearch = document.getElementById('btn-mosques-city-search');

        const doSearch = () => {
            const query = input ? input.value.trim() : '';
            if (!query) return;
            searchMosquesByCityName(query);
        };

        if (btnSearch) {
            btnSearch.addEventListener('click', doSearch);
        }
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') doSearch();
            });
        }
    }

    function updateStatusBox(html, isWarning = false) {
        const statusBox = document.getElementById('mosques-status-box');
        if (statusBox) {
            statusBox.style.display = 'flex';
            statusBox.innerHTML = html;
        }
        const fallbackBox = document.getElementById('mosques-manual-fallback');
        if (fallbackBox && isWarning) {
            fallbackBox.style.display = 'block';
        }
    }

    /**
     * طلب إذن وتحديد الموقع الجغرافي بعدة طبقات أمان لضمان النجاح دائماً
     */
    async function requestUserLocationAndFind() {
        updateStatusBox(`
            <div class="mosques-loading">
                <i class="fa-solid fa-spinner fa-spin text-gold"></i>
                <span>جاري تحديد موقعك الجغرافي بدقة... 📍</span>
            </div>
        `);

        // 1. أولاً: فحص الإحداثيات المحفوظة في التطبيق مسبقاً (سريعة جداً)
        let hasSavedLocation = false;
        try {
            const savedGps = localStorage.getItem('gps_prayer_coords');
            if (savedGps) {
                const parsed = JSON.parse(savedGps);
                if (parsed && (parsed.lat || parsed.latitude) && (parsed.lng || parsed.longitude)) {
                    currentLat = Number(parsed.lat || parsed.latitude);
                    currentLon = Number(parsed.lng || parsed.longitude);
                    if (!isNaN(currentLat) && !isNaN(currentLon) && currentLat !== 0) {
                        hasSavedLocation = true;
                    }
                }
            }
        } catch (e) {}

        // 2. تجربة بلجن الموقع الأصلي للموبايل (Capacitor Geolocation)
        if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
            const Geolocation = window.Capacitor.Plugins ? window.Capacitor.Plugins.Geolocation : null;
            if (Geolocation) {
                try {
                    let perm = await Geolocation.checkPermissions();
                    if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
                        perm = await Geolocation.requestPermissions();
                    }

                    if (perm.location === 'granted' || perm.coarseLocation === 'granted') {
                        let pos = null;
                        try {
                            pos = await Geolocation.getCurrentPosition({
                                enableHighAccuracy: true,
                                timeout: 10000,
                                maximumAge: 300000
                            });
                        } catch (highErr) {
                            pos = await Geolocation.getCurrentPosition({
                                enableHighAccuracy: false,
                                timeout: 8000,
                                maximumAge: 600000
                            });
                        }

                        if (pos && pos.coords && pos.coords.latitude && pos.coords.longitude) {
                            currentLat = pos.coords.latitude;
                            currentLon = pos.coords.longitude;
                            try {
                                localStorage.setItem('gps_prayer_coords', JSON.stringify({ lat: currentLat, lng: currentLon }));
                            } catch(e) {}
                            fetchMosquesAround(currentLat, currentLon, currentRadius);
                            return;
                        }
                    }
                } catch (nativeErr) {
                    console.warn('Native Capacitor Geolocation notice:', nativeErr);
                }
            }
        }

        // 3. تجربة المتصفح عبر Web Geolocation API
        if (navigator.geolocation) {
            try {
                const browserPos = await getBrowserCoordinates();
                if (browserPos) {
                    currentLat = browserPos.latitude;
                    currentLon = browserPos.longitude;
                    try {
                        localStorage.setItem('gps_prayer_coords', JSON.stringify({ lat: currentLat, lng: currentLon }));
                    } catch(e) {}
                    fetchMosquesAround(currentLat, currentLon, currentRadius);
                    return;
                }
            } catch (geoErr) {
                console.warn('Browser geolocation notice:', geoErr);
            }
        }

        // 4. إذا كانت هناك إحداثيات صلاة محفوظة مسبقاً، نعتمدها
        if (hasSavedLocation && currentLat && currentLon) {
            updateStatusBox(`
                <div class="mosques-alert mosques-alert-info">
                    <i class="fa-solid fa-location-dot text-gold"></i>
                    <div>تم اعتماد موقعك الجغرافي المحفوظ بنجاح، جاري جلب أقرب المساجد... 🕌</div>
                </div>
            `);
            fetchMosquesAround(currentLat, currentLon, currentRadius);
            return;
        }

        // 5. البديل الذكي: التحديد التقريبي عبر شبكة الإنترنت (IP Geolocation)
        try {
            updateStatusBox(`
                <div class="mosques-loading">
                    <i class="fa-solid fa-spinner fa-spin text-gold"></i>
                    <span>جاري تحديد موقعك التقريبي عبر شبكة الإنترنت... 🌐</span>
                </div>
            `);
            const ipData = await getIpLocation();
            if (ipData && ipData.lat && ipData.lon) {
                currentLat = ipData.lat;
                currentLon = ipData.lon;
                fetchMosquesAround(currentLat, currentLon, currentRadius);
                return;
            }
        } catch (ipErr) {
            console.warn('IP geocoding fallback error:', ipErr);
        }

        // 6. في حال تعذر جميع الطرق: استخدام مدينة افتراضية معروفة مع حقل البحث
        const defaultCity = detectDefaultCityCoords();
        currentLat = defaultCity.lat;
        currentLon = defaultCity.lon;
        fetchMosquesAround(currentLat, currentLon, currentRadius);
        handleLocationError(`تعذر تحديد موقع GPS بدقة. تم عرض مساجد (${defaultCity.name})، ويمكنك كتابة اسم مدينتك أو حيك في الحقل أدناه.`);
    }

    function getBrowserCoordinates() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve(pos.coords),
                (err1) => {
                    navigator.geolocation.getCurrentPosition(
                        (pos2) => resolve(pos2.coords),
                        (err2) => reject(err2 || err1),
                        { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
                    );
                },
                { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
            );
        });
    }

    async function getIpLocation() {
        try {
            const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client', { signal: AbortSignal.timeout(4000) });
            if (res.ok) {
                const data = await res.json();
                if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
                    return { lat: data.latitude, lon: data.longitude };
                }
            }
        } catch(e) {}

        try {
            const res2 = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(4000) });
            if (res2.ok) {
                const data2 = await res2.json();
                if (data2 && data2.success && data2.latitude && data2.longitude) {
                    return { lat: data2.latitude, lon: data2.longitude };
                }
            }
        } catch(e) {}

        return null;
    }

    function detectDefaultCityCoords() {
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
            if (tz.includes("Riyadh") || tz.includes("Saudi") || tz.includes("Qatar") || tz.includes("Kuwait")) {
                return { name: "الرياض", lat: 24.7136, lon: 46.6753 };
            }
            if (tz.includes("Dubai") || tz.includes("Muscat")) {
                return { name: "دبي", lat: 25.2048, lon: 55.2708 };
            }
            if (tz.includes("Amman") || tz.includes("Jerusalem") || tz.includes("Damascus") || tz.includes("Beirut")) {
                return { name: "القدس الشريف", lat: 31.7683, lon: 35.2137 };
            }
            if (tz.includes("Baghdad")) {
                return { name: "بغداد", lat: 33.3152, lon: 44.3661 };
            }
        } catch(e) {}
        return { name: "القاهرة", lat: 30.0444, lon: 31.2357 };
    }

    function handleLocationError(msg) {
        updateStatusBox(`
            <div class="mosques-alert mosques-alert-warning">
                <i class="fa-solid fa-location-crosshairs"></i>
                <div>${msg}</div>
            </div>
        `, true);
    }

    let currentRadius = 5000; // 5km default

    function setupRadiusFilter() {
        const radiusBtns = document.querySelectorAll('.mosques-radius-pill');
        radiusBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                radiusBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const rad = parseInt(btn.getAttribute('data-radius'), 10);
                if (rad && rad > 0) {
                    currentRadius = rad;
                    if (currentLat && currentLon) {
                        fetchMosquesAround(currentLat, currentLon, currentRadius);
                    }
                }
            });
        });
    }

    /**
     * جلب المساجد القريبة عبر خريطة العالم OpenStreetMap مع دمج متزامن لأدق المحركات (Photon + Nominatim)
     */
    async function fetchMosquesAround(lat, lon, radiusMeters) {
        const rad = radiusMeters || currentRadius || 5000;
        const radKm = (rad / 1000).toFixed(0);

        updateStatusBox(`
            <div class="mosques-loading">
                <i class="fa-solid fa-spinner fa-spin text-gold"></i>
                <span>جاري البحث الشامل عن جميع المساجد والجوامع القريبة (نطاق ${radKm} كم)... 🕌</span>
            </div>
        `);

        // محرك Photon الفوري فائق السرعة والموثوقية + Nominatim بالتوازي
        const [photonRes, nominatimRes] = await Promise.allSettled([
            fetchMosquesViaPhoton(lat, lon, rad),
            fetchMosquesViaNominatim(lat, lon, rad)
        ]);

        let combined = [];
        if (photonRes.status === 'fulfilled' && Array.isArray(photonRes.value)) {
            combined = combined.concat(photonRes.value);
        }
        if (nominatimRes.status === 'fulfilled' && Array.isArray(nominatimRes.value)) {
            combined = combined.concat(nominatimRes.value);
        }

        // دمج النتائج وحذف التكرار الجغرافي والفرز الأقرب فالأقرب
        const deduplicated = deduplicateAndCleanMosques(combined, lat, lon, rad);

        if (deduplicated && deduplicated.length > 0) {
            applyMosquesData(deduplicated, lat, lon);
        } else {
            // محاولة توسيع النطاق تلقائياً إن لم نجد مساجد في نطاق ضيق
            if (rad < 15000) {
                updateStatusBox(`
                    <div class="mosques-loading">
                        <i class="fa-solid fa-spinner fa-spin text-gold"></i>
                        <span>لم نجد مساجد مسجلة في نطاق ${radKm} كم، جاري توسيع نطاق البحث إلى 15 كم تلقائياً... 🔍</span>
                    </div>
                `);
                fetchMosquesAround(lat, lon, 15000);
                return;
            }

            updateStatusBox(`
                <div class="mosques-alert mosques-alert-warning">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <div>لم يتم العثور على مساجد مسجلة في هذا النطاق، يمكنك توسيع نطاق البحث إلى 10 كم أو 20 كم أو البحث باسم المدينة أو الحي أدناه.</div>
                </div>
            `, true);
            renderMosquesList([]);
        }
    }

    /**
     * تنسيق وتحويل أسماء المساجد إلى العربية الفصحى الواضحة وإثراء الأسماء العامة باسم الشارع أو الحي
     */
    function formatArabicMosqueName(name, street, district, tags) {
        tags = tags || {};
        let n = (name || '').trim();
        const arabicRegex = /[\u0600-\u06FF]/;

        // فحص هل يتوفر اسم عربي أصيل في الوسوم
        if (tags['name:ar'] && tags['name:ar'].trim()) {
            n = tags['name:ar'].trim();
        }

        // استبدال الصياغات الإنجليزية الشائعة بالمصطلح العربي
        if (!arabicRegex.test(n) && n) {
            n = n.replace(/^The\s+/i, '');
            n = n.replace(/\bMosque\s+of\s+/i, 'مسجد ');
            n = n.replace(/\bMasjid\s+of\s+/i, 'مسجد ');
            n = n.replace(/\s+Mosque\b/i, '');
            n = n.replace(/\s+Masjid\b/i, '');
            n = n.replace(/\bMosque\b/i, 'مسجد');
            n = n.replace(/\bMasjid\b/i, 'مسجد');
            if (!arabicRegex.test(n) && !n.startsWith('مسجد')) {
                n = 'مسجد ' + n;
            }
        }

        // إذا كان الاسم فارغاً أو مبهماً أو عاماً (مثل: مسجد فقط)
        if (!n || n === 'مسجد' || n === 'جامع' || n === 'مصلى' || n === 'مسجد (بيت من بيوت الله)') {
            const st = tags['addr:street'] || tags.street || street;
            const dt = tags['addr:district'] || tags.district || district;
            if (st) {
                n = `مسجد (${st})`;
            } else if (dt) {
                n = `مسجد (حي ${dt})`;
            } else {
                n = 'مسجد (بيت من بيوت الله)';
            }
        } else {
            // إضافة بادئة مسجد إن كان اسماً مفرداً كـ (النور، الفتح، التوحيد)
            if (!/^(مسجد|جامع|مصلى|مجمع|زاوية|دار|مركز|تكية)/.test(n)) {
                n = 'مسجد ' + n;
            }
        }

        return n;
    }

    /**
     * دمج وحذف التكرار الجغرافي للمساجد والترتيب بدقة متناهية
     */
    function deduplicateAndCleanMosques(list, userLat, userLon, maxRadiusMeters) {
        const unique = [];
        const maxKm = (maxRadiusMeters ? maxRadiusMeters / 1000 : 25) * 1.25;

        list.forEach(item => {
            if (!item || typeof item.lat !== 'number' || typeof item.lon !== 'number') return;
            const dist = calculateDistanceKm(userLat, userLon, item.lat, item.lon);
            if (dist > maxKm) return; // خارج النطاق

            // استبعاد أي دور عبادة غير إسلامية
            const forbiddenNames = ['كنيسة', 'دير', 'مطرانية', 'كاتدرائية', 'إيبارشية', 'معبد', 'church', 'cathedral', 'monastery', 'synagogue', 'temple'];
            const nLower = ((item.name || '') + ' ' + (item.address || '')).toLowerCase();
            if (forbiddenNames.some(w => nLower.includes(w))) return;

            // استبعاد المباني والمؤسسات غير دور العبادة إن تشابهت الكلمات (مثل جامعة الدول العربية أو كليات أو بنوك)
            const nonMosquePrefixes = ['جامعة', 'كلية', 'معهد', 'أكاديمية', 'سفارة', 'قنصلية', 'مستشفى', 'عيادة', 'صيدلية', 'مدرسة', 'حضانة', 'بنك', 'شركة', 'وزارة', 'قسم شرطة', 'نادي', 'حديقة'];
            const nTrim = (item.name || '').trim();
            if (nonMosquePrefixes.some(w => nTrim.startsWith(w))) {
                const isWorship = item.tags && (item.tags.amenity === 'place_of_worship' || item.tags.building === 'mosque');
                if (!isWorship) return;
            }

            if (item.tags) {
                const rel = item.tags.religion;
                if (rel && rel !== 'muslim' && rel !== 'islam') return;
            }

            // فحص هل يوجد مسجد مسجل مسبقاً في مسافة أقل من 45 متراً (نفس المسجد)
            const exists = unique.find(u => {
                const d = calculateDistanceKm(u.lat, u.lon, item.lat, item.lon);
                return d < 0.045; // 45 meters
            });

            if (!exists) {
                item.distanceKm = dist;
                unique.push(item);
            } else {
                // إعطاء الأولوية للاسم المسجل بالعربية الفصحى أولاً
                const existsIsAr = /[\u0600-\u06FF]/.test(exists.name || '');
                const itemIsAr = /[\u0600-\u06FF]/.test(item.name || '');

                if (!existsIsAr && itemIsAr) {
                    exists.name = item.name;
                } else if ((!exists.name || exists.name.includes('بيت من بيوت الله')) && item.name && !item.name.includes('بيت من بيوت الله')) {
                    exists.name = item.name;
                }

                if ((!exists.address || exists.address.includes('محدد على الخريطة')) && item.address) {
                    exists.address = item.address;
                }
            }
        });

        // ترتيب المساجد: الأقرب فالمسافة الأدنى أولاً بدون استثناء
        unique.sort((a, b) => a.distanceKm - b.distanceKm);
        return unique;
    }

    /**
     * 1. جلب المساجد عبر Photon OSM بكلمات بحث متعددة بالتوازي
     */
    async function fetchMosquesViaPhoton(lat, lon, radiusMeters) {
        try {
            const list = [];
            const seen = new Set();
            const radiusKm = radiusMeters ? radiusMeters / 1000 : 10;

            const urls = [
                `https://photon.komoot.io/api/?q=%D9%85%D8%B3%D8%AC%D8%AF&lat=${lat}&lon=${lon}&limit=100`,
                `https://photon.komoot.io/api/?q=%D8%AC%D8%A7%D9%85%D8%B9&lat=${lat}&lon=${lon}&limit=100`,
                `https://photon.komoot.io/api/?q=mosque&lat=${lat}&lon=${lon}&limit=100`,
                `https://photon.komoot.io/api/?q=%D9%85%D8%B5%D9%84%D9%89&lat=${lat}&lon=${lon}&limit=50`,
                `https://photon.komoot.io/api/?q=%D8%B2%D8%A7%D9%88%D9%8A%D8%A9&lat=${lat}&lon=${lon}&limit=50`,
                `https://photon.komoot.io/api/?q=masjid&lat=${lat}&lon=${lon}&limit=50`
            ];

            const fetchPromises = urls.map(url =>
                fetch(url, { signal: AbortSignal.timeout(6500) })
                    .then(r => r.ok ? r.json() : null)
                    .catch(() => null)
            );

            const results = await Promise.all(fetchPromises);
            results.forEach(data => {
                if (data && data.features) {
                    parsePhotonFeatures(data.features, lat, lon, list, seen, radiusKm);
                }
            });

            return list;
        } catch (err) {
            console.warn('Photon fetch notice:', err);
            return [];
        }
    }

    function parsePhotonFeatures(features, userLat, userLon, list, seen, maxRadiusKm) {
        features.forEach(f => {
            if (!f.geometry || !f.geometry.coordinates) return;
            const lon = f.geometry.coordinates[0];
            const lat = f.geometry.coordinates[1];
            if (!lat || !lon) return;

            const distKm = calculateDistanceKm(userLat, userLon, lat, lon);
            if (maxRadiusKm && distKm > maxRadiusKm * 1.3) return;

            const props = f.properties || {};
            const key = props.osm_id || `${lat.toFixed(4)},${lon.toFixed(4)}`;
            if (seen.has(key)) return;
            seen.add(key);

            const street = props.street || '';
            const district = props.district || props.locality || props.suburb || '';
            const city = props.city || props.county || props.state || '';
            const rawName = props.name || '';

            const name = formatArabicMosqueName(rawName, street, district, props);

            const addressParts = [street, district, city].filter(Boolean);
            const address = addressParts.join('، ') || 'الموقع محدد على الخريطة بدقة';

            list.push({
                id: props.osm_id || Math.random().toString(36).substring(2),
                name: name,
                lat: lat,
                lon: lon,
                distanceKm: distKm,
                address: address,
                tags: props
            });
        });
    }

    /**
     * 2. جلب المساجد عبر Overpass API الفضائي الجغرافي بأشمل الكويريز
     */
    async function fetchMosquesViaOverpass(lat, lon, radiusMeters) {
        const rad = Math.min(radiusMeters || 5000, 20000);
        const query = `[out:json][timeout:8];(
  node["amenity"="place_of_worship"]["religion"="muslim"](around:${rad},${lat},${lon});
  way["amenity"="place_of_worship"]["religion"="muslim"](around:${rad},${lat},${lon});
  relation["amenity"="place_of_worship"]["religion"="muslim"](around:${rad},${lat},${lon});
  node["building"="mosque"](around:${rad},${lat},${lon});
  way["building"="mosque"](around:${rad},${lat},${lon});
  node["amenity"="place_of_worship"]["name"~"مسجد|جامع|مصلى|زاوية"](around:${rad},${lat},${lon});
  way["amenity"="place_of_worship"]["name"~"مسجد|جامع|مصلى|زاوية"](around:${rad},${lat},${lon});
);
out center 65;`;

        for (const endpoint of OVERPASS_ENDPOINTS) {
            try {
                const url = `${endpoint}?data=${encodeURIComponent(query)}`;
                const response = await fetch(url, {
                    headers: { 'Accept': 'application/json' },
                    signal: AbortSignal.timeout(7500)
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.elements && data.elements.length > 0) {
                        return parseOverpassElements(data.elements, lat, lon);
                    }
                }
            } catch (err) {
                console.warn(`Overpass endpoint ${endpoint} failed:`, err);
            }
        }
        return [];
    }

    function parseOverpassElements(elements, userLat, userLon) {
        const list = [];
        elements.forEach(el => {
            const lat = el.lat || (el.center ? el.center.lat : null);
            const lon = el.lon || (el.center ? el.center.lon : null);
            if (!lat || !lon) return;

            const tags = el.tags || {};
            // استبعاد غير المسلمين إن وجد
            if (tags.religion && tags.religion !== 'muslim' && tags.religion !== 'islam') return;

            let rawName = tags.name || tags['name:ar'] || tags['name:en'] || '';
            const street = tags['addr:street'] || tags['addr:suburb'] || '';
            const district = tags['addr:district'] || tags['addr:suburb'] || '';
            const city = tags['addr:city'] || '';

            const name = formatArabicMosqueName(rawName, street, district, tags);

            const address = [street, city].filter(Boolean).join('، ') || 'الموقع محدد على الخريطة';
            const distKm = calculateDistanceKm(userLat, userLon, lat, lon);

            list.push({
                id: el.id,
                name: name,
                lat: lat,
                lon: lon,
                distanceKm: distKm,
                address: address,
                tags: tags
            });
        });

        return list;
    }

    /**
     * 3. جلب المساجد عبر Nominatim Bounding Box باللغة العربية كبديل ومصدر إضافي
     */
    async function fetchMosquesViaNominatim(lat, lon, radiusMeters) {
        try {
            const delta = Math.max(0.045, (radiusMeters || 5000) / 111000);
            const viewbox = `${lon - delta},${lat + delta},${lon + delta},${lat - delta}`;
            const urls = [
                `https://nominatim.openstreetmap.org/search?format=json&q=%D9%85%D8%B3%D8%AC%D8%AF&bounded=1&viewbox=${viewbox}&limit=50&addressdetails=1&accept-language=ar`,
                `https://nominatim.openstreetmap.org/search?format=json&q=%D8%AC%D8%A7%D9%85%D8%B9&bounded=1&viewbox=${viewbox}&limit=50&addressdetails=1&accept-language=ar`
            ];

            const fetchPromises = urls.map(url =>
                fetch(url, {
                    headers: { 'Accept': 'application/json' },
                    signal: AbortSignal.timeout(6000)
                }).then(r => r.ok ? r.json() : []).catch(() => [])
            );

            const allResults = await Promise.all(fetchPromises);
            const list = [];
            const seen = new Set();

            allResults.flat().forEach(item => {
                const itemLat = parseFloat(item.lat);
                const itemLon = parseFloat(item.lon);
                if (!itemLat || !itemLon) return;

                const key = item.osm_id || `${itemLat.toFixed(4)},${itemLon.toFixed(4)}`;
                if (seen.has(key)) return;
                seen.add(key);

                const rawName = item.name || (item.display_name ? item.display_name.split('،')[0].split(',')[0] : '');
                const addr = item.address || {};
                const street = addr.road || addr.street || '';
                const district = addr.suburb || addr.neighbourhood || addr.city_district || '';
                const name = formatArabicMosqueName(rawName, street, district, item);

                const address = item.display_name || 'الموقع محدد على الخريطة';
                const distKm = calculateDistanceKm(lat, lon, itemLat, itemLon);

                list.push({
                    id: item.osm_id || item.place_id,
                    name: name,
                    lat: itemLat,
                    lon: itemLon,
                    distanceKm: distKm,
                    address: address,
                    tags: item
                });
            });

            return list;
        } catch (e) {
            console.warn('Nominatim fallback notice:', e);
        }
        return [];
    }

    /**
     * حساب المسافة بالهافرساين (Haversine Formula) بالكيلومتر
     */
    function calculateDistanceKm(lat1, lon1, lat2, lon2) {
        const R = 6371; // نصف قطر الأرض بالكيلومتر
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * تطبيق قائمة المساجد وتحديث الواجهة والخريطة
     */
    function applyMosquesData(list, userLat, userLon) {
        mosquesList = list;
        renderMosquesList(mosquesList);
        renderMapMarkers();

        updateStatusBox(`
            <div class="mosques-alert mosques-alert-success">
                <i class="fa-solid fa-mosque"></i>
                <div>تم العثور على <strong>${mosquesList.length}</strong> مسجداً قريباً منك بنجاح 🕌</div>
            </div>
        `);
    }

    function renderMosquesList(list) {
        const container = document.getElementById('mosques-results-list');
        if (!container) return;

        if (!list || list.length === 0) {
            container.innerHTML = `
                <div class="mosques-empty-state">
                    <i class="fa-solid fa-location-dot"></i>
                    <h4>لم يتم العثور على مساجد في هذا النطاق</h4>
                    <p>يمكنك تجربة البحث باسم المدينة أو الحي في الحقل أعلاه.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = list.map((m) => {
            const distFormatted = m.distanceKm < 1
                ? `${Math.round(m.distanceKm * 1000)} متر`
                : `${m.distanceKm.toFixed(1)} كم`;

            return `
                <div class="mosque-card">
                    <div class="mosque-card-main">
                        <div class="mosque-icon-box">
                            <i class="fa-solid fa-mosque"></i>
                        </div>
                        <div class="mosque-details">
                            <h4 class="mosque-name">${escapeHtml(m.name)}</h4>
                            <div class="mosque-address">
                                <i class="fa-solid fa-map-pin text-gold"></i>
                                <span>${escapeHtml(m.address)}</span>
                            </div>
                            <div class="mosque-meta-tags">
                                <span class="mosque-dist-badge"><i class="fa-solid fa-route"></i> ${distFormatted}</span>
                            </div>
                        </div>
                    </div>
                    <div class="mosque-actions">
                        <button type="button" class="btn btn-sm btn-gold btn-directions" onclick="openMosqueDirections(${m.lat}, ${m.lon}, '${escapeSingleQuote(m.name)}')">
                            <i class="fa-solid fa-diamond-turn-right"></i>
                            <span>الاتجاهات</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function escapeHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function escapeSingleQuote(str) {
        return String(str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
    }

    /**
     * تشغيل اتجاهات الخرائط (Apple Maps على iOS، Google Maps على Android و Web)
     */
    window.openMosqueDirections = function (lat, lon, name) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isAndroid = /Android/.test(navigator.userAgent);

        let url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`;
        if (isIOS) {
            url = `maps://maps.apple.com/?daddr=${lat},${lon}&dirflg=d`;
        } else if (isAndroid) {
            url = `geo:${lat},${lon}?q=${lat},${lon}(${encodeURIComponent(name)})`;
        }

        window.open(url, '_blank');
    };

    /**
     * البحث الاحتياطي باسم المدينة
     */
    async function searchMosquesByCityName(cityName) {
        updateStatusBox(`
            <div class="mosques-loading">
                <i class="fa-solid fa-spinner fa-spin text-gold"></i>
                <span>جاري البحث عن موقع "${escapeHtml(cityName)}"...</span>
            </div>
        `);

        try {
            // محاولة Photon أولاً
            let foundLat = null;
            let foundLon = null;

            try {
                const photonRes = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(cityName)}&limit=1`, {
                    signal: AbortSignal.timeout(5000)
                });
                if (photonRes.ok) {
                    const data = await photonRes.json();
                    if (data && data.features && data.features.length > 0) {
                        foundLon = data.features[0].geometry.coordinates[0];
                        foundLat = data.features[0].geometry.coordinates[1];
                    }
                }
            } catch (e1) {}

            // محاولة Nominatim ثانياً
            if (!foundLat || !foundLon) {
                try {
                    const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`, {
                        headers: { 'Accept': 'application/json' },
                        signal: AbortSignal.timeout(5000)
                    });
                    if (nomRes.ok) {
                        const data = await nomRes.json();
                        if (data && data.length > 0) {
                            foundLat = parseFloat(data[0].lat);
                            foundLon = parseFloat(data[0].lon);
                        }
                    }
                } catch (e2) {}
            }

            if (foundLat && foundLon) {
                currentLat = foundLat;
                currentLon = foundLon;
                fetchMosquesAround(foundLat, foundLon, 7000);
            } else {
                handleLocationError(`لم نتمكن من العثور على موقع "${cityName}". يرجى كتابة اسم مدينة معروف مثل: القاهرة، مكة، الرياض.`);
            }
        } catch (e) {
            handleLocationError('حدث خطأ أثناء البحث، يرجى إعادة المحاولة.');
        }
    }

    /**
     * إعداد خريطة Leaflet وعرض العلامات التفاعلية
     */
    function ensureLeafletMapLoaded() {
        const mapDiv = document.getElementById('mosques-leaflet-map');
        if (!mapDiv || typeof L === 'undefined') return;

        const defaultLat = currentLat || 21.4225; // مكة المكرمة كافتراضي
        const defaultLon = currentLon || 39.8262;

        if (!leafletMapInstance) {
            leafletMapInstance = L.map('mosques-leaflet-map').setView([defaultLat, defaultLon], 14);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(leafletMapInstance);

            markersGroup = L.layerGroup().addTo(leafletMapInstance);
        } else {
            leafletMapInstance.invalidateSize();
            if (currentLat && currentLon) {
                leafletMapInstance.setView([currentLat, currentLon], 14);
            }
        }

        renderMapMarkers();
    }

    function renderMapMarkers() {
        if (!leafletMapInstance || !markersGroup) return;

        markersGroup.clearLayers();

        // علامة موقع المستخدم
        if (currentLat && currentLon) {
            const userIcon = L.divIcon({
                className: 'user-location-marker',
                html: '<div style="background:#10b981; width:18px; height:18px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(0,0,0,0.5);"></div>',
                iconSize: [18, 18]
            });
            L.marker([currentLat, currentLon], { icon: userIcon })
                .bindPopup('<b style="font-family:Tajawal,sans-serif;">موقعك الحالي 📍</b>')
                .addTo(markersGroup);
        }

        // علامات المساجد
        mosquesList.forEach(m => {
            const mosqueIcon = L.divIcon({
                className: 'mosque-map-pin',
                html: '<div style="background:var(--primary, #064034); color:#d4af37; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #d4af37; box-shadow:0 2px 6px rgba(0,0,0,0.4);"><i class="fa-solid fa-mosque" style="font-size:13px;"></i></div>',
                iconSize: [28, 28]
            });

            const marker = L.marker([m.lat, m.lon], { icon: mosqueIcon });
            marker.bindPopup(`
                <div style="font-family:'Tajawal',sans-serif; text-align:right; direction:rtl; min-width:180px;">
                    <strong style="color:#064034; font-size:14px;">${escapeHtml(m.name)}</strong>
                    <div style="font-size:12px; color:#666; margin:4px 0;">${escapeHtml(m.address)}</div>
                    <div style="font-size:12px; font-weight:bold; color:#d4af37;">المسافة: ${(m.distanceKm < 1 ? Math.round(m.distanceKm * 1000) + ' متر' : m.distanceKm.toFixed(1) + ' كم')}</div>
                    <div style="margin-top:8px;">
                        <button onclick="openMosqueDirections(${m.lat}, ${m.lon}, '${escapeSingleQuote(m.name)}')" style="background:#064034; color:white; border:none; padding:4px 10px; border-radius:6px; font-size:12px; cursor:pointer;">
                            الاتجاهات ↗
                        </button>
                    </div>
                </div>
            `);
            marker.addTo(markersGroup);
        });

        if (mosquesList.length > 0 && currentLat && currentLon) {
            leafletMapInstance.setView([currentLat, currentLon], 14);
        }
    }

    window.initNearbyMosques = initNearbyMosques;
    window.requestUserLocationAndFindMosques = requestUserLocationAndFind;

    document.addEventListener('DOMContentLoaded', () => {
        initNearbyMosques();
    });
})();
