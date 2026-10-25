/**
 * ZadMuslim V4 — Nearby Mosques Engine (مساجد قريبة منك)
 * نظام متكامل وموثوق لجلب المساجد الحقيقية القريبة من موقع المستخدم بدقة وسرعة
 * يعتمد على خريطة العالم OpenStreetMap عبر محركات Overpass و Photon و Nominatim
 * الموقع يُطلب عند استخدام الزر فقط، والنتائج تُحفظ على الجهاز.
 */

(function () {
    'use strict';

    let currentLat = null;
    let currentLon = null;
    let mosquesList = [];
    let leafletMapInstance = null;
    let markersGroup = null;
    let markersMap = new Map();
    let busy = false;
    let lastNominatimTimestamp = 0;
    const CACHE_KEY = 'zad_mosques_cache_v1';
    const valid = (lat, lon) => window.ZadLocation && window.ZadLocation.valid ? window.ZadLocation.valid(lat, lon) : (typeof lat === 'number' && typeof lon === 'number' && Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180);
    let activeViewMode = 'list'; // 'list' or 'map'
    let currentRadius = 5000; // 5km default

    const OVERPASS_ENDPOINTS = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.private.coffee/api/interpreter'
    ];

    function initNearbyMosques() {
        const section = document.getElementById('nearby-mosques-section');
        if (!section || section.dataset.mosquesInitialized) return;
        section.dataset.mosquesInitialized = 'true';

        setupSearchButton();
        setupViewSwitchers();
        setupManualCitySearch();
        setupRadiusFilter();
    }

    async function runTask(task) {
        if (busy) return;
        busy = true;
        document.getElementById("nearby-mosques-section")?.setAttribute("aria-busy", "true");
        const controls = document.querySelectorAll('#nearby-mosques-section button, #nearby-mosques-section input');
        controls.forEach(el => el.disabled = true);
        try {
            return await task();
        } catch (error) {
            handleLocationError(error.message || 'تعذّر البحث. حاول مجددًا.');
        } finally {
            busy = false;
            document.getElementById("nearby-mosques-section")?.setAttribute("aria-busy", "false");
            controls.forEach(el => el.disabled = false);
        }
    }

    function setupSearchButton() {
        const btn = document.getElementById('btn-find-nearby-mosques');
        if (!btn || btn.dataset.bound) return;
        btn.dataset.bound = 'true';
        btn.removeAttribute('onclick');
        btn.onclick = () => runTask(() => requestUserLocationAndFind(true, true));

        const refresh = document.createElement('button');
        refresh.type = 'button';
        refresh.className = 'btn outline';
        refresh.id = 'btn-refresh-mosques-location';
        refresh.style.cssText = 'font-size: 0.8rem; padding: 6px 12px;';
        refresh.innerHTML = '<i class="fa-solid fa-arrows-rotate text-gold"></i> <span>تحديث موقعي</span>';
        refresh.onclick = () => runTask(() => requestUserLocationAndFind(true, true));

        const reload = document.createElement('button');
        reload.type = 'button';
        reload.className = 'btn outline';
        reload.id = 'btn-refresh-mosques-results';
        reload.style.cssText = 'font-size: 0.8rem; padding: 6px 12px;';
        reload.innerHTML = '<i class="fa-solid fa-cloud-arrow-down text-gold"></i> <span>تحديث المساجد</span>';
        reload.onclick = () => runTask(async () => {
            if (!valid(currentLat, currentLon)) return requestUserLocationAndFind(false, true);
            return fetchMosquesAround(currentLat, currentLon, currentRadius, true);
        });

        btn.after(refresh, reload);

        const saved = readCache().at(-1);
        if (saved && valid(saved.lat, saved.lon)) {
            currentLat = saved.lat;
            currentLon = saved.lon;
            currentRadius = saved.radius;
            applyMosquesData(saved.list, currentLat, currentLon);
            cachedStatus(saved);
            document.querySelectorAll('.mosques-radius-pill').forEach(b => b.classList.toggle('active', Number(b.dataset.radius) === currentRadius));
        }
    }

    function readCache() {
        try {
            const list = JSON.parse(localStorage.getItem(CACHE_KEY));
            return Array.isArray(list) ? list.filter(e => valid(e.lat, e.lon) && Array.isArray(e.list) && e.list.every(m => valid(m.lat, m.lon) && Number.isFinite(m.distanceKm))) : [];
        } catch {
            return [];
        }
    }

    function cachedStatus(entry) {
        updateStatusBox('<div>نتائج محفوظة للموقع المعروض بتاريخ ' + escapeHtml(new Date(entry.time).toLocaleDateString('ar')) + '. معروضة من تخزين الجهاز.' + (entry.partial ? ' نتائج بديلة محدودة.' : '') + ' استخدم زر التحديث عند الحاجة.</div>');
    }

    async function fetchJSON(url, timeout = 12000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(url, {
                cache: 'no-store',
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) throw Error('الخدمة غير متاحة حاليًا.');
            return await response.json();
        } finally {
            clearTimeout(timer);
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
            runTask(() => searchMosquesByCityName(query));
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
            statusBox.setAttribute('role','status');statusBox.setAttribute('aria-live','polite');
            statusBox.style.display = 'flex';
            statusBox.innerHTML = html;
        }
        const fallbackBox = document.getElementById('mosques-manual-fallback');
        if (fallbackBox && isWarning) {
            fallbackBox.style.display = 'block';
        }
    }

    /**
     * طلب إذن وتحديد الموقع الجغرافي بعدة طبقات أمان
     */
    async function requestUserLocationAndFind(refresh = false, force = false) {
        updateStatusBox('<div style="display:flex;align-items:center;gap:10px;"><i class="fa-solid fa-spinner fa-spin text-gold"></i><span>' + (refresh ? 'جاري تحديد موقعك الجغرافي الدقيق عبر GPS...' : 'جاري استخدام الموقع المحفوظ أو تحديد موقعك عند الحاجة...') + '</span></div>');
        try {
            let coords;
            if (refresh) {
                try {
                    coords = await window.ZadLocation.get({ refresh: true });
                } catch (gpsErr) {
                    const saved = window.ZadLocation.saved ? window.ZadLocation.saved() : null;
                    if (saved && valid(saved.lat, saved.lng)) {
                        coords = saved;
                    } else {
                        throw gpsErr;
                    }
                }
            } else {
                coords = await window.ZadLocation.get({ refresh: false });
            }
            currentLat = coords.lat;
            currentLon = coords.lng;
        } catch (error) {
            handleLocationError(window.ZadLocation.errorMessage(error));
            return;
        }
        return fetchMosquesAround(currentLat, currentLon, currentRadius, force || refresh);
    }

    function handleLocationError(msg) {
        updateStatusBox(`
            <div class="mosques-alert mosques-alert-warning" style="display: flex; gap: 10px; align-items: flex-start; background: rgba(234, 88, 12, 0.1); border: 1px solid rgba(234, 88, 12, 0.3); border-radius: 10px; padding: 12px 14px; margin-bottom: 12px; width: 100%;">
                <i class="fa-solid fa-location-crosshairs" style="color: #f97316; font-size: 1.2rem; margin-top: 3px;"></i>
                <div style="flex: 1; font-size: 0.88rem; line-height: 1.5;">
                    <div>${escapeHtml(msg)}</div>
                    <div style="margin-top: 8px;">
                        <button type="button" class="btn btn-sm outline" onclick="requestUserLocationAndFindMosques()"><i class="fa-solid fa-rotate-right"></i> إعادة المحاولة</button>
                    </div>
                </div>
            </div>
        `, true);
    }

    function handleServiceError(msg) {
        updateStatusBox(`
            <div class="mosques-alert mosques-alert-danger" style="display: flex; gap: 10px; align-items: flex-start; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; padding: 12px 14px; margin-bottom: 12px; width: 100%;">
                <i class="fa-solid fa-triangle-exclamation" style="color: #ef4444; font-size: 1.2rem; margin-top: 3px;"></i>
                <div style="flex: 1; font-size: 0.88rem; line-height: 1.5;">
                    <div>${escapeHtml(msg)}</div>
                    <div style="margin-top: 8px;">
                        <button type="button" class="btn btn-sm outline" onclick="requestUserLocationAndFindMosques()"><i class="fa-solid fa-rotate-right"></i> إعادة المحاولة</button>
                    </div>
                </div>
            </div>
        `, true);
    }

    function renderEmptyMosquesState(radiusMeters) {
        updateStatusBox(`
            <div class="mosques-alert mosques-alert-info" style="display: flex; gap: 10px; align-items: flex-start; background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 10px; padding: 12px 14px; margin-bottom: 12px; width: 100%;">
                <i class="fa-solid fa-info-circle text-gold" style="font-size: 1.2rem; margin-top: 3px;"></i>
                <div style="flex: 1; font-size: 0.88rem; line-height: 1.5;">
                    لا توجد مساجد مسجلة في نطاق ${radiusMeters / 1000} كم. يمكنك اختيار نطاق أوسع أو البحث باسم المدينة أو الحي أدناه.
                </div>
            </div>
        `, true);
    }

    function setupRadiusFilter() {
        const radiusBtns = document.querySelectorAll('.mosques-radius-pill');
        radiusBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                radiusBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const rad = parseInt(btn.getAttribute('data-radius'), 10);
                if (rad && rad > 0) {
                    currentRadius = rad;
                    if (valid(currentLat, currentLon)) {
                        runTask(() => fetchMosquesAround(currentLat, currentLon, currentRadius));
                    }
                }
            });
        });
    }

    /**
     * جلب المساجد القريبة عبر خريطة العالم OpenStreetMap مع دعم التوسيع التلقائي
     */
    async function fetchMosquesAround(lat, lon, radiusMeters, force = false) {
        const rad = radiusMeters || currentRadius;
        const key = lat.toFixed(4) + ',' + lon.toFixed(4) + ',' + rad;

        const saved = readCache().find(e => e.key === key);
        if (saved && !force) {
            applyMosquesData(saved.list, lat, lon);
            cachedStatus(saved);
            return;
        }

        if (navigator.onLine === false) {
            if (saved) {
                applyMosquesData(saved.list, lat, lon);
                cachedStatus(saved);
            } else {
                mosquesList = [];
                renderMosquesList([]);
                renderMapMarkers();
                handleLocationError('لا توجد نتائج محفوظة لهذا الموقع والنطاق. اتصل بالإنترنت مرة واحدة لتحميل المساجد.');
            }
            return;
        }

        updateStatusBox('<div style="display:flex;align-items:center;gap:10px;"><i class="fa-solid fa-spinner fa-spin text-gold"></i><span>جاري البحث عن المساجد في نطاق ' + (rad / 1000) + ' كم...</span></div>');

        try {
            const data = await fetchMosquesViaOverpass(lat, lon, rad);
            let list = deduplicateAndCleanMosques(data, lat, lon, rad);

            currentRadius = rad;
            applyMosquesData(list, lat, lon);
            if (data.partial) updateStatusBox('<div>نتائج بديلة محدودة: ' + list.length + ' مسجد وجامع داخل ' + (rad/1000) + ' كم. تعذّر البحث الشامل؛ جرّب تحديث المساجد لاحقًا.</div>');
            const entryKey = lat.toFixed(4) + ',' + lon.toFixed(4) + ',' + currentRadius;
            const entry = { key: entryKey, lat, lon, radius: currentRadius, time: Date.now(), list, partial: !!data.partial };
            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify([...readCache().filter(e => e.key !== entryKey), entry].slice(-5)));
            } catch (_) {}

            if (!list.length && !data.partial) {
                renderEmptyMosquesState(rad);
            }
        } catch (error) {
            if (saved) {
                applyMosquesData(saved.list, lat, lon);
                cachedStatus(saved);
            } else {
                mosquesList = [];
                renderMosquesList([]);
                renderMapMarkers();
                handleServiceError('تعذّر الاتصال بخدمة المساجد. تحقق من الإنترنت وحاول مجددًا؛ لا يعني ذلك عدم وجود مساجد.');
            }
        }
    }

    function formatArabicMosqueName(name, street, district, tags) {
        tags = tags || {};
        let n = (name || '').trim();
        const arabicRegex = /[\u0600-\u06FF]/;

        if (tags['name:ar'] && tags['name:ar'].trim()) {
            n = tags['name:ar'].trim();
        }

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
            if (!/^(مسجد|جامع|مصلى|مجمع|زاوية|دار|مركز|تكية)/.test(n)) {
                n = 'مسجد ' + n;
            }
        }

        return n;
    }

    /**
     * دمج وحذف التكرار الجغرافي للمساجد والترتيب بمعادلة Haversine
     */
    function deduplicateAndCleanMosques(list, userLat, userLon, maxRadiusMeters) {
        const unique = [];
        const maxKm = (maxRadiusMeters ? maxRadiusMeters / 1000 : 25);

        list.forEach(item => {
            if (!item || !valid(item.lat, item.lon)) return;
            const dist = calculateDistanceKm(userLat, userLon, item.lat, item.lon);
            if (dist > maxKm) return;

            const forbiddenNames = ['كنيسة', 'دير', 'مطرانية', 'كاتدرائية', 'إيبارشية', 'معبد', 'church', 'cathedral', 'monastery', 'synagogue', 'temple'];
            const nLower = (item.name || '').toLowerCase();
            if (forbiddenNames.some(w => nLower.includes(w))) return;

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

            const exists = unique.find(u => {
                const d = calculateDistanceKm(u.lat, u.lon, item.lat, item.lon);
                const sameId = item.id != null && u.id === item.id;
                const named = item.name && !item.name.includes('بيت من بيوت الله');
                return sameId || (d < 0.045 && named && item.name === u.name);
            });

            if (!exists) {
                item.distanceKm = dist;
                unique.push(item);
            } else {
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

        unique.sort((a, b) => a.distanceKm - b.distanceKm);
        return unique;
    }

    /**
     * استعلام Overpass السريع مع الفولباك لمحرك Photon
     */
    async function fetchMosquesViaOverpass(lat, lon, radiusMeters) {
        const rad = Math.min(radiusMeters || 5000, 20000);
        const query = `[out:json][timeout:25];(
  nwr["amenity"="place_of_worship"]["religion"~"^(muslim|islam)$"](around:${rad},${lat},${lon});
  nwr["building"="mosque"](around:${rad},${lat},${lon});
  nwr["amenity"="mosque"](around:${rad},${lat},${lon});
  nwr["amenity"="place_of_worship"]["name"~"مسجد|جامع|مصلى|mosque|masjid|jami",i](around:${rad},${lat},${lon});
  nwr["amenity"="place_of_worship"]["name:ar"~"مسجد|جامع|مصلى"](around:${rad},${lat},${lon});
);
out body center;`;

        for (const endpoint of OVERPASS_ENDPOINTS) {
            try {
                const data = await fetchJSON(endpoint + '?data=' + encodeURIComponent(query), 28000);
                if (data && Array.isArray(data.elements) && !data.remark) {
                    const list = parseOverpassElements(data.elements, lat, lon);
                    return list;
                }
            } catch (error) {
                /* Fallback to Photon */
            }
        }

        // A text-search fallback cannot promise complete geographic coverage.
        const terms = ['مسجد', 'جامع', 'مصلى', 'mosque', 'masjid'];
        const responses = await Promise.allSettled(terms.map(q =>
            fetchJSON('https://photon.komoot.io/api/?q=' + encodeURIComponent(q) + '&lat=' + lat + '&lon=' + lon + '&limit=50', 8000)
        ));
        const successful = responses.filter(r=>r.status==='fulfilled' && Array.isArray(r.value?.features));
        if (!successful.length) throw Error('تعذّر الاتصال بخدمة المساجد.');
        const allFeatures = successful.flatMap(r=>r.value.features);
        const fallback = allFeatures.flatMap(feature => {
            const [lng, latitude] = feature.geometry?.coordinates || [];
            const tags = feature.properties || {};
            if (!valid(latitude, lng) || !['place_of_worship', 'mosque'].includes(tags.osm_value)) return [];

            const name = formatArabicMosqueName(tags.name, tags.street, tags.district, tags);
            return [{
                id: (tags.osm_type || 'photon') + '/' + (tags.osm_id ?? (latitude + ',' + lng)),
                lat: latitude,
                lon: lng,
                name: name,
                tags: tags,
                address: [tags.street, tags.district, tags.city, tags.country].filter(Boolean).join('، ') || 'الموقع محدد على الخريطة',
                distanceKm: calculateDistanceKm(lat, lon, latitude, lng)
            }];
        });
        fallback.partial = true;
        return fallback;
    }

    function parseOverpassElements(elements, userLat, userLon) {
        const list = [];
        elements.forEach(el => {
            const lat = el.lat ?? el.center?.lat;
            const lon = el.lon ?? el.center?.lon;
            if (!valid(lat, lon)) return;

            const tags = el.tags || {};
            if (tags.religion && tags.religion !== 'muslim' && tags.religion !== 'islam') return;

            let rawName = tags['name:ar'] || tags.name || tags['name:en'] || '';
            const street = tags['addr:street'] || tags['addr:suburb'] || '';
            const district = tags['addr:district'] || tags['addr:suburb'] || '';
            const city = tags['addr:city'] || '';

            const name = formatArabicMosqueName(rawName, street, district, tags);
            const address = [street, district, city].filter(Boolean).join('، ') || 'الموقع محدد على الخريطة';
            const distKm = calculateDistanceKm(userLat, userLon, lat, lon);

            list.push({
                id: (el.type || 'node') + '/' + el.id,
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
     * حساب المسافة الدقيقة بين نقطتين بمعادلة Haversine
     */
    function calculateDistanceKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
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
    function applyMosquesData(list, userLat, userLon, expandedFrom = null) {
        mosquesList = list;
        renderMosquesList(mosquesList);
        renderMapMarkers();

        if (expandedFrom) {
            updateStatusBox(`
                <div class="mosques-alert mosques-alert-info" style="display: flex; gap: 10px; align-items: flex-start; background: rgba(212, 175, 55, 0.12); border: 1px solid rgba(212, 175, 55, 0.35); border-radius: 10px; padding: 10px 14px; margin-bottom: 12px; width: 100%;">
                    <i class="fa-solid fa-expand text-gold" style="font-size: 1.15rem; margin-top: 2px;"></i>
                    <div style="font-size: 0.88rem; line-height: 1.5;">
                        لم نجد مساجد في نطاق <strong>${expandedFrom / 1000} كم</strong>، وقمنا بتوسيع البحث تلقائياً لعرض أقرب <strong>${list.length}</strong> مساجد في نطاق <strong>${currentRadius / 1000} كم</strong> 📍
                    </div>
                </div>
            `);
        } else {
            updateStatusBox(`
                <div class="mosques-alert mosques-alert-success" style="display: flex; gap: 10px; align-items: center; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 10px; padding: 10px 14px; margin-bottom: 12px; width: 100%;">
                    <i class="fa-solid fa-mosque" style="color: #10b981; font-size: 1.2rem;"></i>
                    <div style="font-size: 0.88rem;">تم العثور على <strong>${mosquesList.length}</strong> مسجد وجامع داخل نطاق ${currentRadius / 1000} كم 🕌<br><small>مرتبة من الأقرب. قد توجد مساجد غير مسجّلة في الخرائط.</small></div>
                </div>
            `);
        }
    }

    function renderMosquesList(list) {
        const container = document.getElementById('mosques-results-list');
        if (!container) return;

        if (!list || list.length === 0) {
            const gmapsFallback = valid(currentLat, currentLon)
                ? `<div style="margin-top: 14px;">
                    <a href="https://www.google.com/maps/search/%D9%85%D8%B3%D8%AC%D8%AF/@${currentLat},${currentLon},15z" target="_blank" rel="noopener" class="btn btn-sm btn-gold" style="display:inline-flex; align-items:center; gap:6px; text-decoration:none;">
                        <i class="fa-solid fa-map-location-dot"></i>
                        <span>البحث في خرائط Google مباشرة 🗺️</span>
                    </a>
                   </div>`
                : '';
            container.innerHTML = `
                <div class="mosques-empty-state">
                    <i class="fa-solid fa-location-dot"></i>
                    <h4>لم يتم العثور على مساجد في هذا النطاق</h4>
                    <p>يمكنك اختيار نطاق أوسع (مثل 10 أو 20 كم) أو البحث باسم المدينة/الحي أعلاه.</p>
                    ${gmapsFallback}
                </div>
            `;
            return;
        }

        const cardsHtml = list.map((m, index) => {
            const distFormatted = m.distanceKm < 1
                ? `${Math.round(m.distanceKm * 1000)} متر`
                : `${m.distanceKm.toFixed(1)} كم`;

            return `
                <div class="mosque-card">
                    <div class="mosque-card-main" onclick="focusMosqueOnMap(${index});" style="cursor: pointer;" title="انقر لعرض وتكبير المسجد على الخريطة">
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
                        <button type="button" class="btn btn-sm outline" onclick="focusMosqueOnMap(${index})" title="عرض وتكبير المسجد على الخريطة">
                            <i class="fa-solid fa-map-location-dot text-gold"></i>
                            <span>الخريطة</span>
                        </button>
                        <button type="button" class="btn btn-sm btn-gold btn-directions" onclick="openMosqueDirections(${m.lat}, ${m.lon}, '${escapeSingleQuote(m.name)}')">
                            <i class="fa-solid fa-diamond-turn-right"></i>
                            <span>الاتجاهات</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        const gmapsExplore = valid(currentLat, currentLon)
            ? `<div class="mosques-explore-more" style="text-align: center; margin-top: 16px; padding: 14px; background: rgba(212,175,55,0.08); border: 1px dashed rgba(212,175,55,0.3); border-radius: 12px;">
                <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0 0 10px;">هل تبحث عن مصلى، زاوية أو مسجد محدد يظهر في Google Maps فقط؟</p>
                <a href="https://www.google.com/maps/search/%D9%85%D8%B3%D8%AC%D8%AF+%D8%A3%D9%88+%D8%AC%D8%A7%D9%85%D8%B9/@${currentLat},${currentLon},15z" target="_blank" rel="noopener" class="btn btn-sm outline" style="display: inline-flex; align-items: center; gap: 6px; text-decoration: none; font-size: 0.82rem;">
                    <i class="fa-solid fa-map-location-dot text-gold"></i>
                    <span>استعراض كافة المساجد والزوايا في خرائط Google 🗺️</span>
                </a>
               </div>`
            : '';

        container.innerHTML = cardsHtml + gmapsExplore;
    }

    window.openCurrentInGoogleMaps = function () {
        const lat = valid(currentLat, currentLon) ? currentLat : 30.0444;
        const lon = valid(currentLat, currentLon) ? currentLon : 31.2357;
        const url = `https://www.google.com/maps/search/%D9%85%D8%B3%D8%AC%D8%AF+%D8%A3%D9%88+%D8%AC%D8%A7%D9%85%D8%B9/@${lat},${lon},15z`;
        window.open(url, '_blank');
    };

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
        let url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
        if (name) {
            url += `&destination_place_id=&query=${encodeURIComponent(name)}`;
        }
        if (isIOS) {
            url = `https://maps.apple.com/?daddr=${lat},${lon}&dirflg=d`;
        }
        window.open(url, '_blank');
    };

    /**
     * التركيز والتكبير على المسجد المختار في الخريطة وفتح الـ Popup
     */
    window.focusMosqueOnMap = async function (index) {
        const m = mosquesList[index];
        if (!m) return;

        const btnMap = document.getElementById('btn-mosques-view-map');
        if (btnMap && !btnMap.classList.contains('active')) {
            btnMap.click();
        }

        await ensureLeafletMapLoaded();
        if (leafletMapInstance && activeViewMode==='map') {
            leafletMapInstance.setView([m.lat,m.lon],16,{animate:true});
            markersMap.get(m.id || index)?.openPopup();
        }
    };

    /**
     * البحث اليدوي باسم المدينة أو الحي (Nominatim مع Geocoding Fallback ومعدل طلب 1/ثانية)
     */
    async function searchMosquesByCityName(cityName) {
        if (!cityName || !cityName.trim()) return;
        cityName = cityName.trim();

        if (navigator.onLine === false) return handleLocationError('البحث عن مدينة جديدة يحتاج الإنترنت. يمكنك عرض النتائج المحفوظة.');

        updateStatusBox('<div style="display:flex;align-items:center;gap:10px;"><i class="fa-solid fa-spinner fa-spin text-gold"></i><span>جاري البحث عن موقع "' + escapeHtml(cityName) + '"...</span></div>');

        // Throttling: 1 request per second
        const now = Date.now();
        const diff = now - lastNominatimTimestamp;
        if (diff < 1000) {
            await new Promise(r => setTimeout(r, 1000 - diff));
        }
        lastNominatimTimestamp = Date.now();

        try {
            let lat = null, lon = null;

            // 1. Try Nominatim with accept-language ar,en
            try {
                const nominatimUrl = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(cityName) + '&limit=1&accept-language=ar,en';
                const data = await fetchJSON(nominatimUrl, 8000);
                if (Array.isArray(data) && data.length > 0) {
                    lat = Number(data[0].lat);
                    lon = Number(data[0].lon);
                }
            } catch (_) {}

            // 2. Fallback to Photon geocoding if Nominatim failed
            if (!valid(lat, lon)) {
                try {
                    const photonGeoUrl = 'https://photon.komoot.io/api/?q=' + encodeURIComponent(cityName) + '&limit=1';
                    const pData = await fetchJSON(photonGeoUrl, 8000);
                    const coords = pData.features?.[0]?.geometry?.coordinates;
                    if (Array.isArray(coords) && coords.length >= 2) {
                        lon = Number(coords[0]);
                        lat = Number(coords[1]);
                    }
                } catch (_) {}
            }

            if (!valid(lat, lon)) {
                handleLocationError('لم نعثر على "' + escapeHtml(cityName) + '". يرجى كتابة اسم المدينة والدولة بدقة (مثال: المنصورة مصر، أو الرياض).');
                return;
            }

            currentLat = lat;
            currentLon = lon;
            return await fetchMosquesAround(lat, lon, currentRadius);
        } catch (_) {
            handleLocationError('تعذّر البحث عن المدينة. تحقق من الإنترنت وحاول مجددًا.');
        }
    }

    let leafletAssetsPromise;
    function loadLeafletAssets() {
        if (leafletAssetsPromise) return leafletAssetsPromise;
        const resource=(tag,url,integrity)=>new Promise((resolve,reject)=>{
            const existing=document.querySelector('[data-map-resource="'+tag+'"]');
            if(existing?.dataset.loaded==='true'){resolve();return;}
            const el=document.createElement(tag);el.dataset.mapResource=tag;el.integrity=integrity;el.crossOrigin='';
            if(tag==='link'){el.rel='stylesheet';el.href=url;}else{el.src=url;el.async=true;}
            const timer=setTimeout(()=>finish(false),15000);
            function finish(ok){clearTimeout(timer);el.onload=el.onerror=null;if(ok){el.dataset.loaded='true';resolve();}else{el.remove();reject(Error('Map unavailable'));}}
            el.onload=()=>finish(true);el.onerror=()=>finish(false);document.head.append(el);
        });
        leafletAssetsPromise=Promise.allSettled([
            resource('link','https://unpkg.com/leaflet@1.9.4/dist/leaflet.css','sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='),
            typeof L!=='undefined'?Promise.resolve():resource('script','https://unpkg.com/leaflet@1.9.4/dist/leaflet.js','sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=')
        ]).then(results=>{if(results.some(result=>result.status==='rejected'))throw Error('Map unavailable');}).catch(error=>{leafletAssetsPromise=null;throw error;});
        return leafletAssetsPromise;
    }
    async function ensureLeafletMapLoaded() {
        const mapDiv = document.getElementById('mosques-leaflet-map');
        if (!mapDiv) return;
        if (navigator.onLine === false) {
            mapDiv.textContent = 'عرض الخريطة يحتاج الإنترنت. يمكنك استخدام قائمة المساجد المحفوظة.';
            return;
        }

        if (!leafletMapInstance) {
            mapDiv.textContent='جاري تحميل الخريطة…';mapDiv.setAttribute('aria-busy','true');
            try { await loadLeafletAssets(); }
            catch { mapDiv.textContent='تعذّر تحميل الخريطة. اضغط «الخريطة» للمحاولة مجددًا، أو استخدم قائمة المساجد.';return; }
            finally { mapDiv.setAttribute('aria-busy','false'); }
            if(activeViewMode!=='map')return;
            if(!leafletMapInstance)mapDiv.replaceChildren();
        }
        const defaultLat = currentLat ?? 21.4225;
        const defaultLon = currentLon ?? 39.8262;

        if (!leafletMapInstance) {
            leafletMapInstance = L.map('mosques-leaflet-map').setView([defaultLat, defaultLon], 14);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(leafletMapInstance);

            markersGroup = L.layerGroup().addTo(leafletMapInstance);
        } else {
            leafletMapInstance.invalidateSize();
            if (valid(currentLat, currentLon)) {
                leafletMapInstance.setView([currentLat, currentLon], 14);
            }
        }

        renderMapMarkers();
    }

    function renderMapMarkers() {
        if (!leafletMapInstance || !markersGroup) return;

        markersGroup.clearLayers();
        markersMap.clear();

        const layersForBounds = [];

        // 1. علامة موقع المستخدم
        if (valid(currentLat, currentLon)) {
            const userIcon = L.divIcon({
                className: 'user-location-marker',
                html: '<div style="background:#10b981; width:20px; height:20px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 12px rgba(16,185,129,0.8);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            const userMarker = L.marker([currentLat, currentLon], { icon: userIcon })
                .bindPopup('<div style="font-family:Tajawal,sans-serif; text-align:center; font-weight:700; color:#064034;">موقعك الحالي 📍</div>');
            userMarker.addTo(markersGroup);
            layersForBounds.push(userMarker);
        }

        // 2. علامات المساجد
        mosquesList.forEach((m, idx) => {
            const mosqueIcon = L.divIcon({
                className: 'mosque-map-pin',
                html: `<div style="background:var(--primary, #064034); color:#d4af37; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #d4af37; box-shadow:0 3px 8px rgba(0,0,0,0.45); cursor:pointer;">
                          <i class="fa-solid fa-mosque" style="font-size:14px;"></i>
                       </div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            const marker = L.marker([m.lat, m.lon], { icon: mosqueIcon });
            const distFormatted = m.distanceKm < 1 ? `${Math.round(m.distanceKm * 1000)} متر` : `${m.distanceKm.toFixed(1)} كم`;
            marker.bindPopup(`
                <div style="font-family:'Tajawal',sans-serif; text-align:right; direction:rtl; min-width:190px; padding:4px;">
                    <strong style="color:#064034; font-size:14px; display:block; margin-bottom:4px;">${escapeHtml(m.name)}</strong>
                    <div style="font-size:12px; color:#555; margin-bottom:6px;"><i class="fa-solid fa-location-dot text-gold"></i> ${escapeHtml(m.address)}</div>
                    <div style="font-size:12px; font-weight:700; color:#d4af37; margin-bottom:8px;"><i class="fa-solid fa-route"></i> المسافة: ${distFormatted}</div>
                    <div style="display:flex; gap:6px;">
                        <button type="button" onclick="openMosqueDirections(${m.lat}, ${m.lon}, '${escapeSingleQuote(m.name)}')" style="background:#064034; color:#fff; border:1px solid #d4af37; padding:5px 12px; border-radius:6px; font-size:12px; cursor:pointer; font-weight:700; display:inline-flex; align-items:center; gap:5px;">
                            <i class="fa-solid fa-diamond-turn-right text-gold"></i> الاتجاهات ↗
                        </button>
                    </div>
                </div>
            `);
            marker.addTo(markersGroup);
            layersForBounds.push(marker);
            markersMap.set(m.id || idx, marker);
        });

        // 3. تكبير تلقائي يشمل النتائج (fitBounds)
        if (layersForBounds.length > 1) {
            const group = L.featureGroup(layersForBounds);
            leafletMapInstance.fitBounds(group.getBounds().pad(0.12), { maxZoom: 16 });
        } else if (layersForBounds.length === 1 && valid(currentLat, currentLon)) {
            leafletMapInstance.setView([currentLat, currentLon], 14);
        }
    }

    window.initNearbyMosques = initNearbyMosques;
    window.requestUserLocationAndFindMosques = (refresh = false, force = false) => runTask(() => requestUserLocationAndFind(refresh, force));

    document.addEventListener('DOMContentLoaded', () => {
        initNearbyMosques();
    });
})();
