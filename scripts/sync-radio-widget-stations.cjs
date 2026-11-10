// Keep the native picker and the in-app station list on the same catalogue.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..'), context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/js/radio-stations-data.js'), 'utf8'), context);
const stations = context.window.RADIO_STATIONS_LIST.map(({ id, name, url, backupUrl }) => ({ id, name, url, backup: backupUrl || '' }));
if (!stations.some(s => s.id === 'cairo')) stations.unshift({ id: 'cairo', name: 'إذاعة القرآن الكريم من القاهرة', url: 'https://stream.radiojar.com/8s5u5tpdtwzuv', backup: 'https://radio.xecod.com/station/quran-cairo' });
const directory = path.join(root, 'android/app/src/main/res/raw');
fs.mkdirSync(directory, { recursive: true });
fs.writeFileSync(path.join(directory, 'radio_widget_stations.json'), JSON.stringify(stations, null, 2) + '\n');
