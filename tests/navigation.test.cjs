const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('legacy app links redirect to canonical pages while preserving notification queries',()=>{
    const html=fs.readFileSync('app.html','utf8');
    const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
    for(const [hash,expected] of [['','index.html?panel=notifications'],['#quran-khatma','services.html?panel=notifications#quran-khatma'],['#tasbeeh','index.html?panel=notifications#smart-dhikr-panel']]){
        let target;
        vm.runInNewContext(script,{location:{hash,search:'?panel=notifications',replace:url=>{target=url;}}});
        assert.equal(target,expected);
    }
    assert.ok(!html.includes('pane-home'));
    assert.ok(!html.includes('src="assets/'));
});

test('canonical home and services link settings and mobile starts on index',()=>{
    for(const file of ['index.html','services.html','settings.html']){
        const html=fs.readFileSync(file,'utf8');
        assert.ok(!/href=["'][^"']*app\.html/.test(html),file);
        if(file!=='settings.html') assert.match(html,/href="settings\.html"/);
    }
    assert.equal(JSON.parse(fs.readFileSync('manifest.json','utf8')).start_url,'./index.html');
    const config=JSON.parse(fs.readFileSync('capacitor.config.json','utf8'));
    assert.equal(config.server?.url,undefined);
    assert.equal(config.server?.appStartPath,undefined);
    assert.ok(!fs.readFileSync('sw.js','utf8').includes('"./app.html"'));
});
