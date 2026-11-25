// 无依赖的测试底座：静态服务器 + 无头浏览器（CDP）
import {spawn} from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const here = path.dirname(fileURLToPath(import.meta.url)), APP = path.join(here, '..', 'app'), OUT = path.join(here, 'out');
fs.mkdirSync(OUT, {recursive: true});
export const sleep = ms => new Promise(r => setTimeout(r, ms));
const BIN = [process.env.CHROME, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p => p && fs.existsSync(p));
const TYPE = {'.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.webmanifest': 'application/manifest+json'};
// hook(file, buffer) 可在测试里替换文件内容
export async function serve(hook) {
  const s = http.createServer((q, r) => {
    const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(APP, u === '/' ? 'index.html' : u);
    if (!f.startsWith(APP) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    let d = fs.readFileSync(f); if (hook) d = hook(f, d) || d;
    r.writeHead(200, {'content-type': TYPE[path.extname(f)] || 'application/octet-stream'}); r.end(d);
  });
  await new Promise(r => s.listen(0, '127.0.0.1', r));
  return {url: `http://127.0.0.1:${s.address().port}/`, stop: async () => { s.closeAllConnections(); await new Promise(r => s.close(r)); }};
}
export async function browser(args = []) {
  if (!BIN) throw Error('找不到 Edge / Chrome，可用环境变量 CHROME 指定');
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'lrs-'));
  const p = spawn(BIN, ['--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + prof, '--no-first-run', '--disable-gpu', ...(process.env.CI ? ['--no-sandbox'] : []), ...args, 'about:blank'], {stdio: 'ignore'});
  const pf = path.join(prof, 'DevToolsActivePort');
  let port; for (let i = 0; i < 120 && !port; i++) { try { port = fs.readFileSync(pf, 'utf8').split('\n')[0].trim(); } catch {} if (!port) await sleep(250); }
  let t; for (let i = 0; i < 60 && !t; i++) { try { t = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(x => x.type === 'page'); } catch {} if (!t) await sleep(250); }
  if (!t) throw Error('浏览器启动失败');
  const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pend = {}, errs = [];
  ws.onmessage = m => {
    const d = JSON.parse(m.data);
    if (d.id) { pend[d.id]?.(d); delete pend[d.id]; }
    else if (d.method === 'Runtime.exceptionThrown') errs.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text);
    else if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') errs.push('console ' + JSON.stringify(d.params.args).slice(0, 200));
  };
  const cdp = (method, params = {}) => new Promise(r => { pend[++id] = r; ws.send(JSON.stringify({id, method, params})); });
  const ev = async x => {
    const r = await cdp('Runtime.evaluate', {expression: x, awaitPromise: true, returnByValue: true});
    if (r.error) throw Error(r.error.message);
    if (r.result.exceptionDetails) throw Error((r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text) + ' :: ' + x.slice(0, 120));
    return r.result.result.value;
  };
  await cdp('Page.enable'); await cdp('Runtime.enable');
  return {cdp, ev, errs,
    size: (w, h) => cdp('Emulation.setDeviceMetricsOverride', {width: w, height: h, deviceScaleFactor: 1, mobile: w < 700}),
    go: async (url, ms = 2500) => { await cdp('Page.navigate', {url}); await sleep(ms); },
    // 打上记号再刷新，等到新页面就绪
    reload: async (ms = 600) => {
      await ev('window.__old=1'); await cdp('Page.reload');
      for (let i = 0; i < 150; i++) { try { if (await ev("!window.__old&&typeof S==='object'&&typeof settle==='function'&&!!document.querySelector('#app header')")) break; } catch {} await sleep(100); }
      await sleep(ms);
    },
    shot: async n => { const r = await cdp('Page.captureScreenshot', {format: 'png'}); fs.writeFileSync(path.join(OUT, n), Buffer.from(r.result.data, 'base64')); },
    mouse: async (type, x, y) => cdp('Input.dispatchMouseEvent', {type, x, y, button: 'left', clickCount: 1}),
    close: async () => { await Promise.race([cdp('Browser.close'), sleep(1500)]); await sleep(300); p.kill(); await sleep(200); try { fs.rmSync(prof, {recursive: true, force: true}); } catch {} }};
}
