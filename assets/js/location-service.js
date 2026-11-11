(function (root) {
    'use strict';
    let pending;
    const valid = (lat, lng) => typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
    function saved() {
        try {
            const p = JSON.parse(localStorage.getItem('gps_prayer_coords'));
            const lat = p?.lat ?? p?.latitude, lng = p?.lng ?? p?.longitude;
            return valid(lat, lng) ? { ...p, lat, lng } : null;
        } catch { return null; }
    }
    function errorMessage(error) {
        if (error?.code === 1 || /denied|permission|OS-PLUG-GLOC-0003/i.test(error?.message || '')) return 'إذن الموقع مرفوض. اسمح بالموقع من إعدادات الهاتف أو اختر المدينة يدويًا.';
        return 'تعذّر تحديد الموقع. فعّل خدمة الموقع في الهاتف وحاول في مكان مفتوح، أو ابحث باسم المدينة.';
    }
    async function locate() {
        let pos;
        if (root.Capacitor?.isNativePlatform?.()) {
            const geo = root.Capacitor.Plugins?.Geolocation;
            if (!geo) throw Error('خدمة الموقع غير متاحة في هذه النسخة.');
            let permission = await geo.checkPermissions();
            const granted = () => permission.location === 'granted' || permission.coarseLocation === 'granted';
            if (!granted()) permission = await geo.requestPermissions();
            if (!granted()) throw Object.assign(Error('Permission denied'), { code: 1 });
            try {
                pos = await geo.getCurrentPosition({ enableHighAccuracy: permission.location === 'granted', timeout: 8000, maximumAge: 60000 });
            } catch (e) {
                if (e?.code === 1) throw e;
                pos = await geo.getCurrentPosition({ enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 });
            }
        } else {
            if (!navigator.geolocation) throw Error('خدمة الموقع غير متاحة في المتصفح.');
            try {
                pos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }));
            } catch (e) {
                if (e?.code === 1) throw e;
                pos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }));
            }
        }
        const lat = pos?.coords?.latitude, lng = pos?.coords?.longitude;
        if (!valid(lat, lng)) throw Error('إحداثيات الموقع غير صالحة.');
        const result = { lat, lng, accuracy: pos.coords.accuracy, timestamp: Date.now(), name: 'موقعي المحفوظ (GPS)' };
        return result;
    }
    function current() {
        if (pending) return pending;
        pending = locate().finally(() => { pending = null; });
        return pending;
    }
    async function hasPermission() {
        if (root.Capacitor?.isNativePlatform?.()) {
            const permission = await root.Capacitor.Plugins?.Geolocation?.checkPermissions();
            return permission?.location === 'granted' || permission?.coarseLocation === 'granted';
        }
        if (!navigator.permissions?.query) return null;
        try { return (await navigator.permissions.query({name:'geolocation'})).state === 'granted'; }
        catch { return null; }
    }
    async function get({ refresh = false } = {}) {
        const previous = saved();
        if (!refresh && previous) return previous;
        const result = await current();
        try { localStorage.setItem('gps_prayer_coords', JSON.stringify(result)); } catch {}
        return result;
    }
    async function syncTravel(prompt = false) {
        if (!root.Capacitor?.isPluginAvailable?.('PrayerTravel')) return;
        const enabled = localStorage.getItem('selected_prayer_city') === 'gps' && localStorage.getItem('zad_travel_updates') === '1';
        return root.Capacitor.Plugins.PrayerTravel.configure({enabled, prompt, method:localStorage.getItem('zad_prayer_method') || '', school:localStorage.getItem('zad_prayer_school') || '0'});
    }
    root.ZadLocation = { get, current, saved, valid, errorMessage, hasPermission, syncTravel };
})(window);
