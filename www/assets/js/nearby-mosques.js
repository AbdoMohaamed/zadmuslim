/**
 * ZadMuslim V4 — Nearby Mosques Engine (مساجد قريبة منك)
 * تعتمد بالكامل على بيانات حقيقية 100% من خريطة العالم OpenStreetMap (Overpass API)
 * وتعمل بخصوصية كاملة في الذاكرة دون أي تتبع، مع دعم الاتجاهات بالخرائط وخريطة Leaflet
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
        'https://z.overpass-api.de/api/interpreter'
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

    /**
     * طلب إذن الموقع فقط عند النقر
     */
    function requestUserLocationAndFind() {
        const statusBox = document.getElementById('mosques-status-box');
        if (statusBox) {
            statusBox.style.display = 'flex';
            statusBox.innerHTML = `
                <div class="mosques-loading">
                    <i class="fa-solid fa-spinner fa-spin text-gold"></i>
                    <span>جاري تحديد موقعك الجغرافي بدقة...</span>
                </div>
            `;
        }

        if (!navigator.geolocation) {
            handleLocationError('المتصفح لا يدعم تحديد الموقع الجغرافي. يرجى استخدام البحث بالمدينة.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                currentLat = pos.coords.latitude;
                currentLon = pos.coords.longitude;
                fetchMosquesAround(currentLat, currentLon, 5000); // نطاق 5 كم
            },
            (err) => {
                let msg = 'تعذر الوصول إلى موقعك الحالي.';
                if (err.code === 1) { // PERMISSION_DENIED
                    msg = 'تم رفض إذن تحديد الموقع. يمكنك تفعيله من إعدادات المتصفح أو البحث بالمدينة أدناه.';
                } else if (err.code === 2) {
                    msg = 'إشارة تحديد الموقع غير متوفرة حالياً.';
                } else if (err.code === 3) {
                    msg = 'انتهت مهلة تحديد الموقع. يرجى المحاولة ثانية.';
                }
                handleLocationError(msg);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    }

    function handleLocationError(msg) {
        const statusBox = document.getElementById('mosques-status-box');
        const fallbackBox = document.getElementById('mosques-manual-fallback');
        if (statusBox) {
            statusBox.innerHTML = `
                <div class="mosques-alert mosques-alert-warning">
                    <i class="fa-solid fa-location-crosshairs"></i>
                    <div>${msg}</div>
                </div>
            `;
        }
        if (fallbackBox) {
            fallbackBox.style.display = 'block';
        }
    }

    /**
     * استعلام Overpass API الحقيقي
     */
    async function fetchMosquesAround(lat, lon, radiusMeters) {
        const statusBox = document.getElementById('mosques-status-box');
        if (statusBox) {
            statusBox.innerHTML = `
                <div class="mosques-loading">
                    <i class="fa-solid fa-spinner fa-spin text-gold"></i>
                    <span>جاري جلب المساجد القريبة عبر خريطة العالم الإسلامية...</span>
                </div>
            `;
        }

        const query = `
            [out:json][timeout:25];
            (
              node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lon});
              way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lon});
              relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lon});
            );
            out center 40;
        `;

        let success = false;
        for (const endpoint of OVERPASS_ENDPOINTS) {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `data=${encodeURIComponent(query)}`
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.elements) {
                        processMosquesData(data.elements, lat, lon);
                        success = true;
                        break;
                    }
                }
            } catch (err) {
                console.warn(`Overpass endpoint ${endpoint} failed, trying next...`, err);
            }
        }

        if (!success) {
            if (statusBox) {
                statusBox.innerHTML = `
                    <div class="mosques-alert mosques-alert-warning">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <div>تعذر الاتصال بخوادم الخرائط حالياً. يرجى تجربة البحث باسم المدينة أو الحي أدناه.</div>
                    </div>
                `;
            }
            const fallbackBox = document.getElementById('mosques-manual-fallback');
            if (fallbackBox) fallbackBox.style.display = 'block';
        }
    }

    /**
     * حساب المسافة بالهافرساين (Haversine Formula) بالكيلومتر
     */
    function calculateDistanceKm(lat1, lon1, lat2, lon2) {
        const R = 6371; // نصف قطر الأرض
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function processMosquesData(elements, userLat, userLon) {
        mosquesList = [];

        elements.forEach(el => {
            const lat = el.lat || (el.center ? el.center.lat : null);
            const lon = el.lon || (el.center ? el.center.lon : null);
            if (!lat || !lon) return;

            const tags = el.tags || {};
            const name = tags.name || tags['name:ar'] || tags['name:en'] || 'مسجد (بيت من بيوت الله)';
            const street = tags['addr:street'] || tags['addr:suburb'] || tags['addr:district'] || '';
            const city = tags['addr:city'] || '';
            const address = [street, city].filter(Boolean).join('، ') || 'الموقع محدد على الخريطة';

            const distKm = calculateDistanceKm(userLat, userLon, lat, lon);

            mosquesList.push({
                id: el.id,
                name: name,
                lat: lat,
                lon: lon,
                distanceKm: distKm,
                address: address,
                tags: tags
            });
        });

        // ترتيب المساجد من الأقرب إلى الأبعد
        mosquesList.sort((a, b) => a.distanceKm - b.distanceKm);

        renderMosquesList();
        renderMapMarkers();

        const statusBox = document.getElementById('mosques-status-box');
        if (statusBox) {
            statusBox.innerHTML = `
                <div class="mosques-alert mosques-alert-success">
                    <i class="fa-solid fa-mosque"></i>
                    <div>تم العثور على <strong>${mosquesList.length}</strong> مسجداً قريباً منك بنجاح 🕌</div>
                </div>
            `;
        }
    }

    function renderMosquesList() {
        const container = document.getElementById('mosques-results-list');
        if (!container) return;

        if (mosquesList.length === 0) {
            container.innerHTML = `
                <div class="mosques-empty-state">
                    <i class="fa-solid fa-location-dot"></i>
                    <h4>لم يتم العثور على مساجد في نطاق 5 كم</h4>
                    <p>يمكنك تجربة البحث بالمدينة أو التكبير على الخريطة.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = mosquesList.map((m, idx) => {
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
     * تشغيل اتجاهات الخرائط
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
     * البحث الاحتياطي باسم المدينة بواسطة Nominatim
     */
    async function searchMosquesByCityName(cityName) {
        const statusBox = document.getElementById('mosques-status-box');
        if (statusBox) {
            statusBox.style.display = 'flex';
            statusBox.innerHTML = `
                <div class="mosques-loading">
                    <i class="fa-solid fa-spinner fa-spin text-gold"></i>
                    <span>جاري البحث عن موقع "${escapeHtml(cityName)}"...</span>
                </div>
            `;
        }

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`);
            const data = await res.json();
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                currentLat = lat;
                currentLon = lon;
                fetchMosquesAround(lat, lon, 7000); // نطاق 7 كم في البحث بالمدينة
            } else {
                handleLocationError(`لم نتمكن من العثور على المدينة "${cityName}". تأكد من صحة الاسم.`);
            }
        } catch (e) {
            handleLocationError('حدث خطأ أثناء البحث، يرجى إعادة المحاولة.');
        }
    }

    /**
     * إعداد خريطة Leaflet
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
                html: '<div style="background:#10b981; width:16px; height:16px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(0,0,0,0.5);"></div>',
                iconSize: [16, 16]
            });
            L.marker([currentLat, currentLon], { icon: userIcon })
                .bindPopup('<b>موقعك الحالي 📍</b>')
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
                <div style="font-family:'Tajawal',sans-serif; text-align:right; direction:rtl;">
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
