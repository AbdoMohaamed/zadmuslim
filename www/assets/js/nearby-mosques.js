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
    }

    function setupSearchButton() {
        const btnLocate = document.getElementById('btn-find-nearby-mosques');
        if (btnLocate) {
            btnLocate.addEventListener('click', () => {
                requestUserLocationAndFind();
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

        // 1. تجربة بلجن الموقع الأصلي للموبايل (Capacitor Geolocation) في بيئة التطبيق
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
                                timeout: 5000
                            });
                        } catch (highErr) {
                            pos = await Geolocation.getCurrentPosition({
                                enableHighAccuracy: false,
                                timeout: 5000
                            });
                        }

                        if (pos && pos.coords && pos.coords.latitude && pos.coords.longitude) {
                            currentLat = pos.coords.latitude;
                            currentLon = pos.coords.longitude;
                            fetchMosquesAround(currentLat, currentLon, 5000);
                            return;
                        }
                    }
                } catch (nativeErr) {
                    console.warn('Native Capacitor Geolocation notice:', nativeErr);
                }
            }
        }

        // 2. تجربة المتصفح عبر Web Geolocation API
        if (navigator.geolocation) {
            try {
                const browserPos = await getBrowserCoordinates();
                if (browserPos) {
                    currentLat = browserPos.latitude;
                    currentLon = browserPos.longitude;
                    fetchMosquesAround(currentLat, currentLon, 5000);
                    return;
                }
            } catch (geoErr) {
                console.warn('Browser geolocation failed or timed out:', geoErr);
            }
        }

        // 3. البديل السريع: استخدام إحداثيات الصلاة المحفوظة مسبقاً إذا توفرت
        try {
            const savedGps = localStorage.getItem('gps_prayer_coords');
            if (savedGps) {
                const parsed = JSON.parse(savedGps);
                if (parsed && parsed.lat && parsed.lng) {
                    currentLat = parsed.lat;
                    currentLon = parsed.lng;
                    updateStatusBox(`
                        <div class="mosques-alert mosques-alert-info">
                            <i class="fa-solid fa-location-dot text-gold"></i>
                            <div>تم اعتماد موقعك المحفوظ لمواقيت الصلاة، جاري جلب المساجد القريبة... 🕌</div>
                        </div>
                    `);
                    fetchMosquesAround(currentLat, currentLon, 5000);
                    return;
                }
            }
        } catch (e) {}

        // 4. البديل الأخير الذكي: التحديد التقريبي عبر شبكة الإنترنت (IP Geolocation)
        try {
            updateStatusBox(`
                <div class="mosques-loading">
                    <i class="fa-solid fa-spinner fa-spin text-gold"></i>
                    <span>جاري تحديد موقعك التقريبي عبر شبكة الإنترنت... 🌐</span>
                </div>
            `);
            const ipRes = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client', {
                signal: AbortSignal.timeout(5000)
            });
            if (ipRes.ok) {
                const ipData = await ipRes.json();
                if (ipData && typeof ipData.latitude === 'number' && typeof ipData.longitude === 'number') {
                    currentLat = ipData.latitude;
                    currentLon = ipData.longitude;
                    fetchMosquesAround(currentLat, currentLon, 6000);
                    return;
                }
            }
        } catch (ipErr) {
            console.warn('IP geocoding fallback error:', ipErr);
        }

        // في حال تعذر جميع الطرق
        handleLocationError('تعذر تحديد موقعك تلقائياً. يرجى التأكد من تشغيل الـ GPS أو استخدام البحث باسم المدينة أدناه.');
    }

    /**
     * الحصول على إحداثيات المتصفح بدقة أولاً ثم بدقة تقريبية عند انتهاء المهلة
     */
    function getBrowserCoordinates() {
        return new Promise((resolve, reject) => {
            // المحاولة الأولى: دقة عالية مع مهلة 4 ثوانٍ
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve(pos.coords),
                (err1) => {
                    // المحاولة الثانية السريعة: دقة تقريبية (coarse) مع كاش أطول
                    navigator.geolocation.getCurrentPosition(
                        (pos2) => resolve(pos2.coords),
                        (err2) => reject(err2 || err1),
                        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
                    );
                },
                { enableHighAccuracy: true, timeout: 4000, maximumAge: 60000 }
            );
        });
    }

    function handleLocationError(msg) {
        updateStatusBox(`
            <div class="mosques-alert mosques-alert-warning">
                <i class="fa-solid fa-location-crosshairs"></i>
                <div>${msg}</div>
            </div>
        `, true);
    }

    /**
     * جلب المساجد القريبة عبر خريطة العالم OpenStreetMap مع دعم مصادر متعددة للمرونة القصوى
     */
    async function fetchMosquesAround(lat, lon, radiusMeters) {
        updateStatusBox(`
            <div class="mosques-loading">
                <i class="fa-solid fa-spinner fa-spin text-gold"></i>
                <span>جاري جلب المساجد القريبة من موقعك عبر خريطة العالم الإسلامية... 🕌</span>
            </div>
        `);

        // المصدر الأول الأسرع والأكثر استقراراً: Komoot Photon OpenStreetMap Engine
        let mosques = await fetchMosquesViaPhoton(lat, lon);

        // المصدر الثاني الاحتياطي: Overpass API مع GET Request و AbortSignal
        if (!mosques || mosques.length === 0) {
            mosques = await fetchMosquesViaOverpass(lat, lon, radiusMeters);
        }

        // المصدر الثالث الاحتياطي: Nominatim Bounding Box
        if (!mosques || mosques.length === 0) {
            mosques = await fetchMosquesViaNominatim(lat, lon, radiusMeters);
        }

        if (mosques && mosques.length > 0) {
            applyMosquesData(mosques, lat, lon);
        } else {
            updateStatusBox(`
                <div class="mosques-alert mosques-alert-warning">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <div>لم يتم العثور على مساجد مسجلة في هذا النطاق، يمكنك البحث باسم المدينة أو الحي أدناه.</div>
                </div>
            `, true);
            renderMosquesList([]);
        }
    }

    /**
     * 1. جلب المساجد عبر Photon OSM (سريع ويدعم CORS بالكامل)
     */
    async function fetchMosquesViaPhoton(lat, lon) {
        try {
            const list = [];
            const seen = new Set();

            // بحث باللغة العربية
            const urlAr = `https://photon.komoot.io/api/?q=%D9%85%D8%B3%D8%AC%D8%AF&lat=${lat}&lon=${lon}&limit=35`;
            const resAr = await fetch(urlAr, { signal: AbortSignal.timeout(6000) });
            if (resAr.ok) {
                const dataAr = await resAr.json();
                if (dataAr && dataAr.features) {
                    parsePhotonFeatures(dataAr.features, lat, lon, list, seen);
                }
            }

            // إذا كانت النتائج قليلة، ابحث بكلمة mosque لإضافة مساجد مسجلة بالإنجليزية
            if (list.length < 8) {
                try {
                    const urlEn = `https://photon.komoot.io/api/?q=mosque&lat=${lat}&lon=${lon}&limit=25`;
                    const resEn = await fetch(urlEn, { signal: AbortSignal.timeout(5000) });
                    if (resEn.ok) {
                        const dataEn = await resEn.json();
                        if (dataEn && dataEn.features) {
                            parsePhotonFeatures(dataEn.features, lat, lon, list, seen);
                        }
                    }
                } catch (eEn) {}
            }

            // تصفية المساجد التي تبعد بمسافة معقولة (في نطاق 20 كم كحد أقصى) وترتيبها
            const filtered = list.filter(m => m.distanceKm <= 20);
            filtered.sort((a, b) => a.distanceKm - b.distanceKm);
            return filtered;
        } catch (err) {
            console.warn('Photon fetch notice:', err);
            return [];
        }
    }

    function parsePhotonFeatures(features, userLat, userLon, list, seen) {
        features.forEach(f => {
            if (!f.geometry || !f.geometry.coordinates) return;
            const lon = f.geometry.coordinates[0];
            const lat = f.geometry.coordinates[1];
            if (!lat || !lon) return;

            const key = f.properties.osm_id || `${lat.toFixed(4)},${lon.toFixed(4)}`;
            if (seen.has(key)) return;
            seen.add(key);

            const props = f.properties || {};
            let name = props.name || '';
            const street = props.street || '';
            const district = props.district || props.locality || props.suburb || '';
            const city = props.city || props.county || props.state || '';

            if (!name || name === 'مسجد') {
                if (street) {
                    name = `مسجد (${street})`;
                } else if (district) {
                    name = `مسجد (${district})`;
                } else {
                    name = 'مسجد (بيت من بيوت الله)';
                }
            }

            const addressParts = [street, district, city].filter(Boolean);
            const address = addressParts.join('، ') || 'الموقع محدد على الخريطة بدقة';
            const distKm = calculateDistanceKm(userLat, userLon, lat, lon);

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
     * 2. جلب المساجد عبر Overpass API كبديل ثانٍ عبر GET
     */
    async function fetchMosquesViaOverpass(lat, lon, radiusMeters) {
        const query = `[out:json][timeout:6];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lon});way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lon}););out center 35;`;

        for (const endpoint of OVERPASS_ENDPOINTS) {
            try {
                const url = `${endpoint}?data=${encodeURIComponent(query)}`;
                const response = await fetch(url, {
                    headers: { 'Accept': 'application/json' },
                    signal: AbortSignal.timeout(6000)
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
            let name = tags.name || tags['name:ar'] || tags['name:en'] || '';
            const street = tags['addr:street'] || tags['addr:suburb'] || tags['addr:district'] || '';
            const city = tags['addr:city'] || '';

            if (!name || name === 'مسجد') {
                name = street ? `مسجد (${street})` : 'مسجد (بيت من بيوت الله)';
            }

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

        list.sort((a, b) => a.distanceKm - b.distanceKm);
        return list;
    }

    /**
     * 3. جلب المساجد عبر Nominatim Bounding Box كبديل ثالث
     */
    async function fetchMosquesViaNominatim(lat, lon, radiusMeters) {
        try {
            const delta = Math.max(0.045, (radiusMeters || 5000) / 111000);
            const viewbox = `${lon - delta},${lat + delta},${lon + delta},${lat - delta}`;
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=%D9%85%D8%B3%D8%AC%D8%AF&bounded=1&viewbox=${viewbox}&limit=30&addressdetails=1`;

            const res = await fetch(url, {
                headers: { 'Accept': 'application/json' },
                signal: AbortSignal.timeout(5000)
            });

            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    const list = [];
                    data.forEach(item => {
                        const itemLat = parseFloat(item.lat);
                        const itemLon = parseFloat(item.lon);
                        if (!itemLat || !itemLon) return;

                        let name = item.name || (item.display_name ? item.display_name.split('،')[0].split(',')[0] : 'مسجد');
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

                    list.sort((a, b) => a.distanceKm - b.distanceKm);
                    return list;
                }
            }
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

    document.addEventListener('DOMContentLoaded', () => {
        initNearbyMosques();
    });
})();
