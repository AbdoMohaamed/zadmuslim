const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  await page.goto('http://localhost:64542');
  
  const result = await page.evaluate(async () => {
    const lat = 30.0444, lon = 31.2357, radius = 3000;
    const endpoints = [
      { name: 'Overpass de GET', url: 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(`[out:json][timeout:5];node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});out center 5;`) },
      { name: 'Overpass kumi GET', url: 'https://overpass.kumi.systems/api/interpreter?data=' + encodeURIComponent(`[out:json][timeout:5];node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});out center 5;`) },
      { name: 'Overpass mail.ru GET', url: 'https://maps.mail.ru/osm/tools/overpass/api/interpreter?data=' + encodeURIComponent(`[out:json][timeout:5];node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});out center 5;`) },
      { name: 'Nominatim amenity', url: `https://nominatim.openstreetmap.org/search?format=json&amenity=place_of_worship&religion=muslim&lat=${lat}&lon=${lon}&addressdetails=1&limit=5` },
      { name: 'Nominatim q=مسجد', url: `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent('مسجد')}&lat=${lat}&lon=${lon}&bounded=1&viewbox=${lon-0.05},${lat+0.05},${lon+0.05},${lat-0.05}&limit=5` }
    ];
    
    for (const ep of endpoints) {
      console.log('Testing ' + ep.name);
      try {
        const start = Date.now();
        const res = await fetch(ep.url, { signal: AbortSignal.timeout(4000) });
        const txt = await res.text();
        console.log(ep.name + ' -> status: ' + res.status + ' time: ' + (Date.now() - start) + 'ms len: ' + txt.length);
      } catch (e) {
        console.log(ep.name + ' -> error: ' + e.message);
      }
    }
  });
  
  await browser.close();
})();
