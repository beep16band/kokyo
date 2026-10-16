// Run with node tools/audit_phase1.cjs. Set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH if needed.
// Uses isolated temporary browser contexts, never the player's real browser storage.
const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const results = [];
const errors = [];
async function check(name, fn) {
  try { await fn(); results.push({ name, pass: true }); }
  catch (e) { results.push({ name, pass: false, detail: e.message.slice(0, 300) }); }
}
async function ready(page) {
  await page.waitForFunction(() => typeof cozyCache === 'object');
  await page.evaluate(() => {
    if (setupOpen) chooseLearningLevel('normal');
    tutorial.status = 'skipped'; closeChoices(); busy = false;
    document.getElementById('panel').classList.add('quiet');
  });
}
async function main() {
  const server = http.createServer(async (req, res) => {
    try {
      const file = path.resolve(root, '.' + new URL(req.url, 'http://local').pathname);
      if (!file.startsWith(root + path.sep) && file !== root) throw Error('path');
      const target = (await fs.stat(file)).isDirectory() ? path.join(file, 'index.html') : file;
      const type = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.png': 'image/png', '.woff': 'font/woff' }[path.extname(target)];
      res.writeHead(200, { 'Content-Type': type || 'application/octet-stream' });
      res.end(await fs.readFile(target));
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'],
      ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) });
    const page = await browser.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(origin); await ready(page);
    await check('fresh start: save key and current release', async () => {
      assert(await page.evaluate(() => state.release.startsWith('3.0')));
      assert.equal(await page.evaluate(() => state.coins), 500);
      assert(await page.evaluate(() => !!localStorage.getItem('kotoba_shop_v1')));
    });
    for (const area of ['town', 'market', 'homes', 'forest', 'hill', 'farm', 'river', 'lake', 'ruins']) {
      await check('district loads: ' + area, async () => {
        await page.evaluate(a => changeArea(a, 24, 20, false), area);
        await page.waitForTimeout(100);
        assert(await page.evaluate(() => passable(state.x, state.y)));
      });
    }
    await check('wall and water reject movement', async () => {
      assert(await page.evaluate(() => { changeArea('river', 26, 20, false); return !mapFloorFree('river', 30, 20) && !mapFloorFree('town', 10, 7); }));
    });
    await check('walk and dash duration', async () => {
      const durations = await page.evaluate(() => {
        changeArea('town', 24, 18, false); renderChoices([]); dashHeld = false;
        attemptStep(0, 1); const normal = walkStep.duration; updateWalk(walkStep.start + walkStep.duration);
        dashHeld = true; attemptStep(0, 1); const dash = walkStep.duration;
        updateWalk(walkStep.start + walkStep.duration); dashHeld = false; return [normal, dash];
      }); assert.deepEqual(durations, [155, 95]);
    });
    await check('Phase 2: orthographic 3D and a matching Canvas viewport', async () => {
      assert(await page.evaluate(() => Town3D.ready && !Town3D.failed && Town3D.camera.isOrthographicCamera));
      const bounds = await page.evaluate(() => [c.getBoundingClientRect().height, Town3D.renderer.domElement.getBoundingClientRect().height]);
      assert(Math.abs(bounds[0]-bounds[1])<2);
    });
    await check('Phase 3: avatar choice, WASD and persistent selection', async () => {
      await page.evaluate(() => { selectAvatar('girl'); closeChoices(); changeArea('town',24,18,false); });
      await page.keyboard.press('s'); await page.waitForFunction(() => state.y===19);
      assert.equal(await page.evaluate(() => state.y),19);
      await page.evaluate(() => save(false)); await page.reload(); await ready(page);
      assert.equal(await page.evaluate(() => state.avatar.kind),'girl');
    });
    await check('door: shop entry and national-language question', async () => {
      assert(await page.evaluate(() => {
        changeArea('town', 13, 12, false); attemptStep(0, -1);
        if (state.scene !== 'shop') return false;
        shopTask(orders[state.ordersDone]); choices.firstElementChild.click(); const ok = !!learningTask;
        closeChoices(); busy = false; enter('town'); return ok;
      }));
    });
    await check('legacy minimal v1-shaped state migrates', async () => {
      const p = await browser.newPage(); await p.addInitScript(() => {
        if (!localStorage.getItem('kotoba_shop_v1')) localStorage.setItem('kotoba_shop_v1', JSON.stringify({ x: 8, y: 9, scene: 'town', coins: 789, day: 4, ordersDone: 1, shopInitialized: true, stock: { bread: 7, juice: 8, apple: 9 }, name: 'テスト店主' }));
      });
      p.on('pageerror', e => errors.push(e.message));
      await p.goto(origin); await ready(p);
      assert.deepEqual(await p.evaluate(() => [state.coins, state.day, state.stock.bread, state.name]), [789, 4, 7, 'テスト店主']);
      assert(await p.evaluate(() => !!localStorage.getItem('kotoba_shop_pre_world'))); await p.close();
    });
    await check('populated v2.2 state survives reload', async () => {
      const expected = await page.evaluate(() => {
        changeArea('homes', 24, 20, false); state.coins = 1234; state.reputation = 29;
        state.stock.bread = 12; state.shelfStock.apple = 3; state.customerAffinity['ミミ'] = 8;
        state.explore.found['audit-memory'] = { day: state.day, area: 'homes', name: '監査用', text: '監査用の記録' }; state.settings.reducedMotion = true;
        state.wordNotes.push('audit-note'); save(false);
        return [state.coins, state.reputation, state.stock.bread, state.shelfStock.apple, state.customerAffinity['ミミ'], state.area, state.settings.reducedMotion, state.wordNotes.at(-1), state.explore.found['audit-memory']];
      }); await page.reload(); await ready(page);
      assert.deepEqual(await page.evaluate(() => [state.coins, state.reputation, state.stock.bread, state.shelfStock.apple, state.customerAffinity['ミミ'], state.area, state.settings.reducedMotion, state.wordNotes.at(-1), state.explore.found['audit-memory']]), expected);
    });
    await check('fishing lifecycle and net cleanup', async () => {
      assert(await page.evaluate(() => {
        changeArea('river', 28, 20, false); closeChoices(); busy = false; facing = 'right';
        if (!startFishing()) return false;
        mini.phase = 'bite'; mini.phaseAt = performance.now(); mini.ready = true;
        mini.window = 5000; mini.until = performance.now() + 5000; finishCatch();
        const landed = mini?.phase === 'land'; stopMini();
        changeArea('hill', 24, 20, false); closeChoices(); busy = false;
        swingNet(); const swung = !!netSwing; resolveNet(performance.now() + 1000);
        return landed && swung && !netSwing && !busy;
      }));
    });
    await check('failed import resumes saving and preserves prior save', async () => {
      const data = await page.evaluate(() => { save(false); importSave(); return JSON.stringify({ game: 'kotoba_shop', version: 2, state }); });
      const chooserPromise = page.waitForEvent('filechooser');
      await page.locator('#choices button').first().click();
      await (await chooserPromise).setFiles({ name: 'audit.json', mimeType: 'application/json', buffer: Buffer.from(data) });
      await page.waitForFunction(() => choices.firstElementChild?.dataset.plain === 'このデータで再開');
      const prior = await page.evaluate(() => {
        window.auditSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function(k, v) { if (k === 'kotoba_shop_v1') throw new DOMException('audit quota', 'QuotaExceededError'); return window.auditSetItem.call(this, k, v); };
        return localStorage.getItem('kotoba_shop_v1');
      });
      await page.locator('#choices button').first().click();
      const stateAfter = await page.evaluate(() => {
        Storage.prototype.setItem = window.auditSetItem;
        const result = { suspended: suspendSave, prior: localStorage.getItem('kotoba_shop_v1') };
        state.coins++; save(false); result.savedCoins = JSON.parse(localStorage.getItem('kotoba_shop_v1')).coins;
        result.coins = state.coins; suspendSave = false; return result;
      });
      assert.equal(stateAfter.prior, prior); assert.equal(stateAfter.suspended, false);
      assert.equal(stateAfter.savedCoins, stateAfter.coins);
    });
    await check('failed reset resumes saving and preserves prior save', async () => {
      const prior = await page.evaluate(() => {
        save(false); window.auditRemoveItem = Storage.prototype.removeItem;
        Storage.prototype.removeItem = function(k) { if (k === 'kotoba_shop_v1') throw new DOMException('audit blocked', 'SecurityError'); return window.auditRemoveItem.call(this, k); };
        return localStorage.getItem('kotoba_shop_v1');
      });
      page.once('dialog', d => d.accept());
      await page.evaluate(() => document.getElementById('reset').click());
      const after = await page.evaluate(() => {
        Storage.prototype.removeItem = window.auditRemoveItem;
        const result = [suspendSave, localStorage.getItem('kotoba_shop_v1')]; suspendSave = false; return result;
      }); assert.deepEqual(after, [false, prior]);
    });
    await check('offline entry initializes without HTTP requests', async () => {
      const p = await browser.newPage(); let network = 0;
      p.on('pageerror', e => errors.push(e.message));
      p.on('request', r => { if (/^https?:/.test(r.url())) network++; });
      await p.goto('file://' + path.join(root, 'offline.html')); await ready(p);
      assert.equal(network, 0); await p.close();
    });
    await check('runtime errors', async () => assert.deepEqual(errors, []));
  } finally { if (browser) await browser.close(); await new Promise(r => server.close(r)); }
  const report = { baseline: '38c9c503be7e0bcd5cae135a366df0c3f3365227', results, errors, passed: results.filter(r => r.pass).length, total: results.length };
  console.log(JSON.stringify(report, null, 2));
  if (results.some(r => !r.pass)) process.exitCode = 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
