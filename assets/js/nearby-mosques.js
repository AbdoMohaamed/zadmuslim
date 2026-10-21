/**
 * ZadMuslim V4 — Nearby Mosques Engine (مساجد قريبة منك)
 * نظام متكامل وموثوق لجلب المساجد الحقيقية القريبة من موقع المستخدم بدقة وسرعة
 * يعتمد على خريطة العالم OpenStreetMap عبر محركات Photon و Overpass و Nominatim
 * الموقع يُطلب عند استخدام الزر فقط، والنتائج تُحفظ على الجهاز.
 */

(function () {
    'use strict';

    let currentLat = null;
    let currentLon = null;
    let mosquesList = [];
    let leafletMapInstance = null;
    let markersGroup = null;
    let busy = false;
    const CACHE_KEY = 'zad_mosques_cache_v1';
    const valid = (lat, lon) => window.ZadLocation.valid(lat, lon);
    let activeViewMode = 'list'; // 'list' or 'map'

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
        const controls = document.querySelectorAll('#nearby-mosques-section button, #nearby-mosques-section input');
        controls.forEach(el => el.disabled = true);
        try { return await task(); }
        catch (error) { handleLocationError(error.message || 'تعذّر البحث. حاول مجددًا.'); }
        finally { busy = false; controls.forEach(el => el.disabled = false); }
    }
    function setupSearchButton() {
        const btn = document.getElementById('btn-find-nearby-mosques');
        if (!btn || btn.dataset.bound) return;
        btn.dataset.bound = 'true';
        btn.removeAttribute('onclick');
        btn.onclick = () => runTask(() => requestUserLocationAndFind());
        const refresh = document.createElement('button');
        refresh.type = 'button'; refresh.className = 'btn outline'; refresh.id = 'btn-refresh-mosques-location';
        refresh.textContent = 'تحديث موقعي';
        refresh.onclick = () => runTask(() => requestUserLocationAndFind(true));
        const reload = document.createElement('button');
        reload.type = 'button'; reload.className = 'btn outline'; reload.id = 'btn-refresh-mosques-results';
        reload.textContent = 'تحديث المساجد بالإنترنت';
        reload.onclick = () => runTask(async () => {
            if (!valid(currentLat, currentLon)) return requestUserLocationAndFind(false, true);
            return fetchMosquesAround(currentLat, currentLon, currentRadius, true);
        });
        btn.after(refresh, reload);
        const saved = readCache().at(-1);
        if (saved && valid(saved.lat, saved.lon)) {
            currentLat = saved.lat; currentLon = saved.lon; currentRadius = saved.radius;
            applyMosquesData(saved.list, currentLat, currentLon);
            cachedStatus(saved);
            document.querySelectorAll('.mosques-radius-pill').forEach(b => b.classList.toggle('active', Number(b.dataset.radius) === currentRadius));
        }
    }
    function readCache() {
        try { const list = JSON.parse(localStorage.getItem(CACHE_KEY)); return Array.isArray(list) ? list.filter(e => valid(e.lat,e.lon) && Array.isArray(e.list) && e.list.every(m => valid(m.lat,m.lon) && Number.isFinite(m.distanceKm))) : []; }
        catch { return []; }
    }
    function cachedStatus(entry) {
        updateStatusBox('<div>نتائج محفوظة للموقع المعروض بتاريخ ' + escapeHtml(new Date(entry.time).toLocaleDateString('ar')) + '. معروضة من تخزين الجهاز. استخدم زر التحديث عند الحاجة.</div>');
    }
    async function fetchJSON(url, timeout = 12000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(url, { cache: 'no-store', signal: controller.signal, headers: { Accept: 'application/json' } });
            if (!response.ok) throw Error('الخدمة غير متاحة حاليًا.');
            return await response.json();
        } finally { clearTimeout(timer); }
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
    async function requestUserLocationAndFind(refresh = false, force = false) {
        updateStatusBox('<div>جاري استخدام الموقع المحفوظ أو تحديد موقعك عند الحاجة...</div>');
        try {
            const coords = await window.ZadLocation.get({ refresh });
            currentLat = coords.lat; currentLon = coords.lng;
        } catch (error) {
            handleLocationError(window.ZadLocation.errorMessage(error));
            return;
        }
        return fetchMosquesAround(currentLat, currentLon, currentRadius, force || refresh);
    }

    function handleLocationError(msg) {
        updateStatusBox(`
            <div class="mosques-alert mosques-alert-warning">
                <i class="fa-solid fa-location-crosshairs"></i>
                <div>${escapeHtml(msg)}</div>
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
                    if (valid(currentLat, currentLon)) {
                        runTask(() => fetchMosquesAround(currentLat, currentLon, currentRadius));
                    }
                }
            });
        });
    }

    /**
     * جلب المساجد القريبة عبر خريطة العالم OpenStreetMap مع دمج متزامن لأدق المحركات (Photon + Nominatim)
     */
    async function fetchMosquesAround(lat, lon, radiusMeters, force = false) {
        const rad = radiusMeters || currentRadius;
        const key = lat.toFixed(4) + ',' + lon.toFixed(4) + ',' + rad;
        const saved = readCache().find(e => e.key === key);
        if (saved && !force) { applyMosquesData(saved.list, lat, lon); cachedStatus(saved); return; }
        if (navigator.onLine === false) {
            if (saved) { applyMosquesData(saved.list, lat, lon); cachedStatus(saved); }
            else { mosquesList = []; renderMosquesList([]); renderMapMarkers(); handleLocationError('لا توجد نتائج محفوظة لهذا الموقع والنطاق. اتصل بالإنترنت مرة واحدة لتحميل المساجد.'); }
            return;
        }
        updateStatusBox('<div>جاري البحث عن المساجد في نطاق ' + rad / 1000 + ' كم...</div>');
        try {
            const data = await fetchMosquesViaOverpass(lat, lon, rad);
            const list = deduplicateAndCleanMosques(data, lat, lon, rad);
            applyMosquesData(list, lat, lon);
            const entry = { key, lat, lon, radius: rad, time: Date.now(), list };
            try { localStorage.setItem(CACHE_KEY, JSON.stringify([...readCache().filter(e => e.key !== key), entry].slice(-5))); } catch {}
            if (!list.length) handleLocationError('لا توجد مساجد مسجلة في هذا النطاق. اختر نطاقًا أوسع أو ابحث باسم المدينة.');
        } catch (error) {
            if (saved) { applyMosquesData(saved.list, lat, lon); cachedStatus(saved); }
            else { mosquesList = []; renderMosquesList([]); renderMapMarkers(); handleLocationError('تعذّر الاتصال بخدمة المساجد. تحقق من الإنترنت وحاول مجددًا؛ لا يعني ذلك عدم وجود مساجد.'); }
        }
    }

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
        const maxKm = (maxRadiusMeters ? maxRadiusMeters / 1000 : 25);

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
    async function fetchMosquesViaOverpass(lat, lon, radiusMeters) {
        const rad = Math.min(radiusMeters || 5000, 20000);
        const query = `[out:json][timeout:15];(
  node["amenity"="place_of_worship"]["religion"="muslim"](around:${rad},${lat},${lon});
  way["amenity"="place_of_worship"]["religion"="muslim"](around:${rad},${lat},${lon});
  relation["amenity"="place_of_worship"]["religion"="muslim"](around:${rad},${lat},${lon});
  node["building"="mosque"](around:${rad},${lat},${lon});
  way["building"="mosque"](around:${rad},${lat},${lon});
  node["amenity"="place_of_worship"]["name"~"مسجد|جامع|مصلى|زاوية"](around:${rad},${lat},${lon});
  way["amenity"="place_of_worship"]["name"~"مسجد|جامع|مصلى|زاوية"](around:${rad},${lat},${lon});
);
out center 65;`;

        for (const endpoint of OVERPASS_ENDPOINTS.slice(0, 1)) {
            try {
                const data = await fetchJSON(endpoint + '?data=' + encodeURIComponent(query), 12000);
                if (!Array.isArray(data.elements) || data.remark) throw Error('Incomplete result');
                return parseOverpassElements(data.elements, lat, lon);
            } catch (error) { /* Try the second endpoint once. */ }
        }
        const data = await fetchJSON('https://photon.komoot.io/api/?q=' + encodeURIComponent('مسجد') + '&lat=' + lat + '&lon=' + lon + '&limit=50', 10000);
        if (!Array.isArray(data.features)) throw Error('تعذّر الاتصال بخدمة المساجد.');
        return data.features.flatMap(feature => {
            const [lng, latitude] = feature.geometry?.coordinates || [];
            const tags = feature.properties || {};
            if (!valid(latitude, lng) || !['place_of_worship','mosque'].includes(tags.osm_value)) return [];
            const name = formatArabicMosqueName(tags.name, tags.street, tags.district, tags);
            return [{ id: tags.osm_id, lat: latitude, lon: lng, name, tags,
                address: [tags.street, tags.city, tags.country].filter(Boolean).join('، '),
                distanceKm: calculateDistanceKm(lat, lon, latitude, lng) }];
        });
    }

    function parseOverpassElements(elements, userLat, userLon) {
        const list = [];
        elements.forEach(el => {
            const lat = el.lat ?? el.center?.lat;
            const lon = el.lon ?? el.center?.lon;
            if (!valid(lat, lon)) return;

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
                        <button type="button" class="btn btn-sm btn-gold btn-directions" onclick="openMosqueDirections(${m.lat}, ${m.lon}, '')">
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
        if (navigator.onLine === false) return handleLocationError('البحث عن مدينة جديدة يحتاج الإنترنت. يمكنك عرض النتائج المحفوظة.');
        updateStatusBox('<div>جاري البحث عن ' + escapeHtml(cityName) + '...</div>');
        try {
            let lat, lon;
            try {
                const data = await fetchJSON('https://photon.komoot.io/api/?q=' + encodeURIComponent(cityName) + '&limit=1');
                [lon, lat] = data.features?.[0]?.geometry?.coordinates || [];
            } catch {}
            if (!valid(lat, lon)) {
                const data = await fetchJSON('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(cityName) + '&limit=1&accept-language=ar');
                lat = Number(data[0]?.lat); lon = Number(data[0]?.lon);
            }
            if (!valid(lat, lon)) return handleLocationError('لم نعثر على المدينة. اكتب اسم المدينة والدولة.');
            currentLat = lat; currentLon = lon;
            return await fetchMosquesAround(lat, lon, currentRadius);
        } catch { handleLocationError('تعذّر البحث عن المدينة. تحقق من الإنترنت وحاول مجددًا.'); }
    }

    function ensureLeafletMapLoaded() {
        const mapDiv = document.getElementById('mosques-leaflet-map');
        if (!mapDiv) return;
        if (typeof L === 'undefined' || navigator.onLine === false) { mapDiv.textContent = 'عرض الخريطة يحتاج الإنترنت. يمكنك استخدام قائمة المساجد المحفوظة.'; return; }

        const defaultLat = currentLat ?? 21.4225; // مكة المكرمة كافتراضي
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

        // علامة موقع المستخدم
        if (valid(currentLat, currentLon)) {
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
                        <button onclick="openMosqueDirections(${m.lat}, ${m.lon}, '')" style="background:#064034; color:white; border:none; padding:4px 10px; border-radius:6px; font-size:12px; cursor:pointer;">
                            الاتجاهات ↗
                        </button>
                    </div>
                </div>
            `);
            marker.addTo(markersGroup);
        });

        if (mosquesList.length > 0 && valid(currentLat, currentLon)) {
            leafletMapInstance.setView([currentLat, currentLon], 14);
        }
    }

    window.initNearbyMosques = initNearbyMosques;
    window.requestUserLocationAndFindMosques = () => runTask(() => requestUserLocationAndFind());

    document.addEventListener('DOMContentLoaded', () => {
        initNearbyMosques();
    });
})();
