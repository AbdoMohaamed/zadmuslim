const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('api/ask-zad.js', 'utf8');

function setup(options = {}) {
    const calls = [];
    const env = {
        NODE_ENV: 'production', PUBLIC_SITE_URL: 'https://zad.test', GEMINI_API_KEY: 'server-secret',
        UPSTASH_REDIS_REST_URL: 'https://quota-test.upstash.io', UPSTASH_REDIS_REST_TOKEN: 'quota-secret', ...options.env
    };
    const context = { module: { exports: {} }, process: { env }, require, URL, AbortSignal, Date,
        fetch: async (url, request) => {
            calls.push({ url, headers: request.headers, body: JSON.parse(request.body) });
            if (url.includes('upstash.io')) {
                if (options.cacheThrows && ['GET','SET'].includes(JSON.parse(request.body)[0])) throw Error('cache failure');
                if (JSON.parse(request.body)[0] === 'GET') return {ok:true,json:async()=>({result:options.cachedAnswer ?? null})};
                if (JSON.parse(request.body)[0] === 'SET') return {ok:true,json:async()=>({result:'OK'})};
                if (options.quotaThrows) throw Error('private quota error');
                return { ok: options.quotaOk !== false, json: async () => ({ result: options.quotaResult ?? 1 }) };
            }
            if (options.providerThrows) throw Error('server-secret');
            return { ok: options.providerOk !== false, status: options.providerStatus || 200, json: async () => options.providerData ?? {
                candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'إجابة من الخادم' }] } }]
            } };
        } };
    vm.runInNewContext(source, context);
    return { calls, send: async (overrides = {}) => {
        const req = { method: 'POST', headers: { origin: 'https://zad.test', 'content-type': 'application/json' },
            socket: { remoteAddress: '203.0.113.1' }, body: { query: 'سؤال للاختبار' }, ...overrides };
        const res = { code: 200, headers: {}, setHeader(key, value) { this.headers[key] = value; },
            status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, end() { return this; } };
        await context.module.exports(req, res);
        return res;
    } };
}

test('AI response language is validated, sent to the model and isolated in the public cache',async()=>{
 for(const language of ['en','ur']){
  const h=setup();const response=await h.send({body:{query:'ما معنى الإحسان باختصار؟',language}});
  assert.equal(response.code,200);
  const provider=h.calls.find(call=>!call.url.includes('upstash.io'));
  assert.match(provider.body.systemInstruction.parts[0].text,language==='en'?/Reply in English/:/اردو میں جواب دیں/);
  assert.ok(h.calls.some(call=>call.body[0]==='GET'&&call.body[1].endsWith(':'+language)));
 }
 const invalid=setup();assert.equal((await invalid.send({body:{query:'Hello',language:'xx'}})).code,400);assert.equal(invalid.calls.length,0);
});

test('AI endpoint reserves shared quota and returns only answer text, using server credentials and prompt', async () => {
    const h = setup(); const r = await h.send();
    assert.equal(r.code, 200); assert.deepEqual(Object.keys(r.body), ['answer']);
    assert.equal(r.body.answer, 'إجابة من الخادم');
    assert.equal(h.calls.length, 2); assert.equal(h.calls[0].body[0], 'EVAL');
    assert.equal(h.calls[0].body[2], 3);
    assert.deepEqual(h.calls[0].body.slice(6, 9), [10, 100, 2000]);
    assert.doesNotMatch(JSON.stringify(h.calls[0].body), /203\.0\.113\.1|سؤال/);
    assert.equal(h.calls[1].headers['x-goog-api-key'], 'server-secret');
    assert.equal(h.calls[1].body.contents[0].parts[0].text, 'سؤال للاختبار');
    assert.ok(h.calls[1].body.systemInstruction.parts[0].text);
    assert.equal(h.calls[1].body.generationConfig.maxOutputTokens, 600);
    assert.doesNotMatch(JSON.stringify(r.body), /server-secret|quota-secret/);
    assert.equal(r.headers['Cache-Control'], 'no-store');
});

test('AI endpoint rejects invalid input, caller-supplied model, methods and foreign origins before any paid call', async () => {
    const cases = [
        [{ method: 'GET' }, 405], [{ body: { query: '' } }, 400], [{ body: { query: 'x'.repeat(1001) } }, 400],
        [{ body: { query: 'سؤال', model: 'other' } }, 400], [{ body: { query: ['سؤال'] } }, 400],
        [{ headers: { 'content-type': 'text/plain' } }, 415],
        [{ headers: { origin: 'https://foreign.test', 'content-type': 'application/json' } }, 403]
    ];
    for (const [request, expected] of cases) {
        const h = setup(); assert.equal((await h.send(request)).code, expected); assert.equal(h.calls.length, 0);
    }
});

test('mobile preflight is supported and CORS never reflects arbitrary origins', async () => {
    const h = setup();
    const r = await h.send({ method: 'OPTIONS', headers: { origin: 'capacitor://localhost' } });
    assert.equal(r.code, 204); assert.equal(r.headers['Access-Control-Allow-Origin'], 'capacitor://localhost');
    assert.equal(h.calls.length, 0);
});

test('missing configuration, exhausted quotas and unavailable shared storage cannot call Gemini', async () => {
    for (const options of [{ env: { GEMINI_API_KEY: '' } }, { env: { UPSTASH_REDIS_REST_TOKEN: '' } },
        { env: { UPSTASH_REDIS_REST_URL: 'http://unsafe.test' } }, { env: { GEMINI_DAILY_REQUEST_LIMIT: '-1' } },
        { quotaResult: -1 }, { quotaThrows: true }, { quotaOk: false }, { quotaResult: 'invalid' }]) {
        const h = setup(options); const r = await h.send();
        assert.equal(r.code, options.quotaResult === -1 ? 429 : 503);
        assert.equal(h.calls.filter(call => call.url.includes('googleapis')).length, 0);
        assert.doesNotMatch(JSON.stringify(r.body), /secret|private quota error/);
    }
});

test('daily cap and hashed quota identities come from the server and trusted network address', async () => {
    const h = setup({ env: { GEMINI_DAILY_REQUEST_LIMIT: '0' } });
    await h.send();
    await h.send({ headers: { 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.9' } });
    assert.equal(h.calls[0].body[8], 0);
    assert.equal(h.calls[0].body[3], h.calls[2].body[3]);
    const vercel = setup({ env: { VERCEL: '1' } });
    await vercel.send({ headers: { 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.9' } });
    assert.notEqual(vercel.calls[0].body[3], h.calls[0].body[3]);
});

test('provider failures and incomplete or blocked answers expose neither provider data nor partial answers', async () => {
    for (const options of [{ providerThrows: true }, { providerOk: false },
        { providerData: { candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [{ text: 'partial' }] } }] } },
        { providerData: { candidates: [{ finishReason: 'SAFETY' }] } },
        { providerData: { candidates: [] } }]) {
        const h = setup(options); const r = await h.send();
        assert.equal(r.code, 503); assert.equal(r.body.code, 'unavailable');
        assert.doesNotMatch(JSON.stringify(r.body), /secret|partial/);
    }
});

test('quota denial reports UTC reset and waiting time', async () => {
 for (const result of [-1,-2,-3]) {
 const h=setup({quotaResult:result});const r=await h.send();
 assert.equal(r.code,429);assert.equal(r.body.scope,result===-1?'minute':'day');
 assert.ok(r.body.retryAfterSeconds>0);assert.ok(r.body.retryAfterSeconds<=(result===-1?60:86400));
 assert.equal(r.body.resetAt % (result===-1?60000:86400000),0);
 assert.equal(r.headers['Retry-After'],String(r.body.retryAfterSeconds));assert.equal(h.calls.length,1);
 }
});

test('only exact public questions use bounded shared answer cache', async () => {
 const h=setup({cachedAnswer:'إجابة عامة محفوظة'});
 const hit=await h.send({body:{query:'ما معنى الإحسان باختصار؟'}});
 assert.equal(hit.body.answer,'إجابة عامة محفوظة');assert.equal(h.calls.length,1);
 assert.equal(h.calls[0].body[0],'GET');
 const miss=setup();await miss.send({body:{query:'ما معنى الإحسان باختصار؟'}});
 assert.deepEqual(miss.calls.map(c=>c.url.includes('googleapis')?'AI':c.body[0]),['GET','EVAL','AI','SET']);
 assert.equal(miss.calls[3].body.at(-1),86400);
 for (const query of ['ما معنى الإحسان باختصار؟ اسمي أحمد','كيف أراجع حفظ القرآن وأنا مريض','سؤالي الشخصي']) {
 const personal=setup();await personal.send({body:{query}});
 assert.equal(personal.calls.length,2);assert.equal(personal.calls[0].body[0],'EVAL');
 }
});
test('provider quota is distinct from local daily reset and never cached', async()=>{
 const h=setup({providerOk:false,providerStatus:429});const r=await h.send({body:{query:'ما معنى الإحسان باختصار؟'}});
 assert.equal(r.code,429);assert.equal(r.body.scope,'provider');assert.equal(r.body.resetAt,undefined);
 assert.ok(!h.calls.some(c=>c.body[0]==='SET'));
});

test('optional cache failure preserves a complete answer while quota still applies',async()=>{
 const h=setup({cacheThrows:true});const r=await h.send({body:{query:'ما معنى الإحسان باختصار؟'}});
 assert.equal(r.code,200);assert.equal(r.body.answer,'إجابة من الخادم');
 const blocked=setup({cacheThrows:true,quotaThrows:true});assert.equal((await blocked.send({body:{query:'ما معنى الإحسان باختصار؟'}})).code,503);
 assert.ok(!blocked.calls.some(c=>c.url.includes('googleapis')));
});
