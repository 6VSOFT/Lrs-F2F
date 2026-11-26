// 全量自动测试：node tests/run.mjs（失败时退出码 1）
import fs from 'node:fs';
import path from 'node:path';
import {here, APP, serve, browser, sleep} from './lib.mjs';
let pass = 0; const fails = [];
const ok = (n, c, d) => { if (c) pass++; else { fails.push(n + (d === undefined ? '' : ' ' + JSON.stringify(d).slice(0, 400))); console.log('✗ ' + fails.at(-1)); } };
const part = async (n, f) => { const t = Date.now(), p0 = pass; try { await f(); } catch (e) { ok(n + ' 异常', false, e.stack); } console.log(`· ${n}：${pass - p0} 项，${((Date.now() - t) / 1000).toFixed(1)}s`); };
const src = f => fs.readFileSync(path.join(here, f), 'utf8');
const wait = async (f, ms = 8000) => { const t = Date.now(); while (Date.now() - t < ms) { try { if (await f()) return true; } catch {} await sleep(150); } return false; };
const ROLES = ['seer,witch,hunter,idiot,villager,villager,villager,villager,wolf,wolf,wolf,wolf'];
const rect = s => `(()=>{const e=${s};e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]})()`;

await part('静态检查', async () => {
  const app = fs.readFileSync(path.join(APP, 'app.js'), 'utf8'), sw = fs.readFileSync(path.join(APP, 'sw.js'), 'utf8');
  const a = app.match(/const VER='(v\d+)'/)?.[1], b = sw.match(/werewolf-judge-(v\d+)/)?.[1];
  ok('app.js 与 sw.js 版本号一致', a && a === b, [a, b]);
  const imgs = fs.readdirSync(path.join(APP, 'img')).map(f => f.replace('.png', '')), list = sw.match(/\.\.\.'([^']+)'/)[1].split(' ');
  ok('离线清单包含全部角色图', imgs.length >= 31 && imgs.every(k => list.includes(k)) && list.length === imgs.length, imgs.filter(k => !list.includes(k)));
  JSON.parse(fs.readFileSync(path.join(APP, 'manifest.webmanifest'), 'utf8')); ok('manifest 可解析', true);
});

const srv = await serve(), B = await browser(); const {ev, size, reload, cdp} = B;
await size(375, 812); await B.go(srv.url, 3500);
await part('首页选板子', async () => {
  ok('首次打开是选板子', await ev("home&&document.querySelectorAll('.home .bd').length===Object.keys(BOARDS).length&&!document.querySelector('.seat')&&!document.querySelector('.stats')"));
  ok('首页不调暗', !await ev("document.documentElement.classList.contains('dim')"));
  for (const [w, h] of [[320, 568], [375, 812], [768, 1024], [1280, 800], [1920, 1080]]) { await size(w, h); await sleep(120); ok('首页宽度 ' + w, await ev("document.documentElement.scrollWidth<=innerWidth&&[...document.querySelectorAll('.home button')].every(b=>b.scrollWidth<=b.clientWidth+1&&b.offsetHeight>=44)")); }
  await size(375, 812); const tapB = async n => { const [x, y] = await ev(rect(`[...document.querySelectorAll('.home .bd')].find(b=>b.firstChild.textContent==='${n}')`)); await B.mouse('mousePressed', x, y); await B.mouse('mouseReleased', x, y); await sleep(200); };
  await ev("openNames();document.querySelectorAll('.nms input')[0].value='小明';saveNames()"); ok('首页录名字后仍在首页', await ev("home&&document.querySelector('.home').textContent.includes('已录 1/12')"));
  await tapB('恶魔守卫'); ok('点板子进入第 1 夜', await ev("!home&&S.board==='demon'&&S.day===1&&S.night&&S.names[0]==='小明'&&document.querySelectorAll('.seat').length===12"));
  await reload(); ok('没录东西再打开仍是首页', await ev('home')); await tapB('狼王守卫'); await ev('advAt=-1e4'); await ev("document.querySelector('.wf .pri').click()"); await reload(); ok('走过一步再打开留在对局', await ev("!home&&S.board==='wkguard'&&S.n.step===1")); await ev('newGame()'); await ev("startGame('std')"); await ev("setRole(0,'seer')"); await reload(); ok('有进行中的对局直接回对局', await ev("!home&&S.board==='std'&&S.seats[0].role==='seer'"));
  await ev("openMenu();newGame();close_()"); ok('换板子取消不影响对局', await ev("!home&&S.seats[0].role==='seer'")); await ev("startGame('mech');doUndo()"); ok('撤销换板子回到对局', await ev("!home&&S.board==='std'&&S.seats[0].role==='seer'"));
  await ev("S.names=Array(12).fill('');startGame('hybrid');close_()");
});
await part('安装与缓存', async () => {
  ok('SW 已启用', await ev("Promise.race([navigator.serviceWorker.ready.then(r=>r.active.state),new Promise(r=>setTimeout(()=>r('timeout'),5000))])") === 'activated');
  ok('缓存全部文件', (await ev("caches.keys().then(async k=>(await (await caches.open(k[0])).keys()).length)")) === 6 + fs.readdirSync(path.join(APP, 'img')).length);
  const e = (await cdp('Page.getInstallabilityErrors')).result?.installabilityErrors; ok('可安装', e && e.length === 0, e);
});
await part('12 板模拟与场景', async () => {
  const r = JSON.parse(await ev(src('sim.js'))); pass += r.pass || 0; r.fails.forEach(f => ok(f, false));
  for (const [k, v] of Object.entries(r.out)) if (k !== '_w') ok('模拟 ' + k + ' ' + v, / nights ok$/.test(v));
  ok('12 个板子都跑到', Object.keys(r.out).filter(k => k !== '_w').length === 12); ok('场景数不少于 200', r.pass >= 200, r.pass);
});
await reload();
await part('西游杀', async () => { const r = JSON.parse(await ev(src('xiyou.js'))); pass += r.pass; r.fails.forEach(f => ok(f, false)); ok('西游杀整局数 ' + r.out.games, r.out.games >= 100, r.out); ok('西游杀覆盖觉醒、击杀、记票', r.out.awake > 0 && r.out.kills > 0 && r.out.votes > 0, r.out); });
await reload();
await part('专项探测', async () => { const r = JSON.parse(await ev(src('probe.js'))); r.forEach(x => ok(x, x.startsWith('PASS'))); ok('探测数', r.length >= 16, r.length); });
await reload();
await part('随机乱点', async () => { const r = JSON.parse(await ev(src('monkey.js'))); ok('乱点不变量', !Object.keys(r.bad).length, r.bad); ok('乱点次数 ' + r.clicks, r.clicks > 20000, r.clicks); });
await ev("['lrs-timer','lrs-dim','lrs-wake'].forEach(k=>localStorage.removeItem(k))"); await reload(); // 乱点会改设置

await part('隐藏模式', async () => {
  await size(390, 844);
  await ev(`(()=>{startGame('std');'${ROLES[0]}'.split(',').forEach((k,i)=>S.seats[i].role=k);S.n.knife=5;S.n.check=9;S.n.step=3;S.hide=true;settle()})()`); await sleep(300);
  const seen = `(()=>{const vis=e=>getComputedStyle(e).color!=='rgba(0, 0, 0, 0)';return {b:[...document.querySelectorAll('.side .row b')].some(vis),res:[...document.querySelectorAll('.side .res')].some(vis),note:[...document.querySelectorAll('.side .note')].some(vis),i:[...document.querySelectorAll('.side .row b *')].some(vis),img:[...document.querySelectorAll('.seat img')].some(e=>getComputedStyle(e).visibility!=='hidden'),rn:[...document.querySelectorAll('.seat .rn span')].some(e=>getComputedStyle(e).display!=='none')}})()`;
  const all = o => Object.entries(o).filter(([k, v]) => v && k !== 'x').map(([k]) => k).join();
  ok('夜间面板全部遮住', all(await ev(seen)) === '', await ev(seen));
  const [x, y] = await ev(rect("document.querySelector('header [data-peek]')"));
  await B.mouse('mousePressed', x, y); await sleep(120); const on = await ev(seen); ok('按住时显示', on.b && on.res && on.img && on.rn, on);
  await B.mouse('mouseReleased', x, y); await sleep(120); ok('松手立即遮住', all(await ev(seen)) === '');
  await B.mouse('mousePressed', x, y); await sleep(80); await ev("window.dispatchEvent(new Event('blur'))"); ok('切走立即遮住', !await ev("document.documentElement.classList.contains('peek')")); await B.mouse('mouseReleased', x, y);
  await cdp('Emulation.setTouchEmulationEnabled', {enabled: true});
  await cdp('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]}); await sleep(700); ok('触控长按持续显示', await ev("document.documentElement.classList.contains('peek')"));
  await cdp('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x - 20, y: y + 60}]}); await sleep(100); ok('手指滑动不中断', await ev("document.documentElement.classList.contains('peek')"));
  await cdp('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await sleep(100); ok('触控松手遮住', all(await ev(seen)) === ''); await cdp('Emulation.setTouchEmulationEnabled', {enabled: false});
  await ev('S.n.step=2;render()'); ok('说明文字遮住', await ev("document.querySelectorAll('.side .note').length>0") && all(await ev(seen)) === ''); ok('女巫口令遮住刀口号', await ev("getComputedStyle(document.querySelector('.say .k')).color") === 'rgba(0, 0, 0, 0)');
  await ev("pickT('check')"); ok('选座不露预言家', await ev("![...document.querySelectorAll('.pk button')].some(b=>b.disabled)")); await ev('pkTap(1)'); ok('选不合法座位被拒', await ev('S.n.check===9&&document.querySelector("#toast").textContent.includes("不能选")')); await ev('close_()');
  await ev("L('测试');openLog()"); ok('日志过程遮住', await ev("[...document.querySelectorAll('#sheet .log span')].every(e=>getComputedStyle(e).color==='rgba(0, 0, 0, 0)')"));
  const [lx, ly] = await ev(rect("document.querySelector('#sheet [data-peek]')")); await B.mouse('mousePressed', lx, ly); await sleep(80); ok('日志按住显示', await ev("[...document.querySelectorAll('#sheet .log span')].every(e=>getComputedStyle(e).color!=='rgba(0, 0, 0, 0)')")); await B.mouse('mouseReleased', lx, ly);
  await ev('close_();S.hide=false;render()'); ok('关闭隐藏后正常', all(await ev(seen)) !== '' && !await ev("!!document.querySelector('header [data-peek]')")); await ev("openLog()"); ok('普通日志不遮', await ev("getComputedStyle(document.querySelector('#sheet .log span')).color!=='rgba(0, 0, 0, 0)'")); await ev('close_()');
});
await part('防连点', async () => {
  const r = await ev("(()=>{startGame('std');const o=Date.now;const k=ADV;ADV=350;const nx=()=>[...document.querySelectorAll('.wf .pri')][0].click();advAt=0;nx();const a=S.n.step;nx();const b=S.n.step;const t=o();Date.now=()=>t-60000;const s=performance.now();while(performance.now()-s<400);S.n.knife=0;'wolf,wolf,wolf,wolf,villager,villager,villager,villager,seer,witch,hunter,idiot'.split(',').forEach((x,i)=>S.seats[i].role=x);settle();nx();const c=S.n.step;Date.now=o;ADV=k;return [a,b,c]})()");
  ok('连点只算一次、系统时间回拨不卡按钮', r.join() === '1,1,2', r);
});
await part('发言计时', async () => {
  await ev(`(()=>{startGame('std');'${ROLES[0]}'.split(',').forEach((k,i)=>S.seats[i].role=k);S.n.knife=0;settle()})()`); ok('夜里没有计时器', !await ev("!!document.querySelector('#tm0')"));
  await ev('confirmDawn();close_()'); const v = () => ev("document.querySelector('#tm0 b').textContent"), tap = async t => { const [x, y] = await ev(rect(`[...document.querySelectorAll('#tm0 button')].find(b=>b.textContent==='${t}')`)); await B.mouse('mousePressed', x, y); await B.mouse('mouseReleased', x, y); await sleep(150); };
  ok('默认 2 分钟', await v() === '2:00'); await tap('120秒'); ok('切换 180 秒', await v() === '3:00'); await tap('180秒'); await tap('300秒'); ok('循环到 60 秒', await v() === '1:00');
  await tap('开始'); await sleep(2100); const a = await v(); ok('在走', /^0:5[678]$/.test(a), a); await ev('render()'); ok('重绘不重置', /^0:5[5678]$/.test(await v()));
  await reload(); const b = await v(); await sleep(1300); ok('刷新后继续走', await v() < b, [b, await v()]);
  await tap('暂停'); const c = await v(); await sleep(1300); ok('暂停不动', await v() === c, [c, await v()]); await tap('开始'); await sleep(1200); ok('继续', await v() < c); await tap('重置'); ok('重置', await v() === '1:00');
  await ev("window._vib=0;navigator.vibrate=x=>{window._vib=1;return true};tms[0].left=11500;tmDraw();void 0"); await tap('开始'); await sleep(2200); ok('最后 10 秒变色', await ev("document.querySelector('#tm0').classList.contains('low')")); await ev('tms[0].end=Date.now()+400;void 0'); await sleep(1000);
  ok('到点提示', await v() === '时间到' && await ev("document.querySelector('#tm0').classList.contains('over')&&window._vib===1&&!!audio"));
  await tap('下一位'); ok('下一位重新计时', /^(1:00|0:59)$/.test(await v())); await ev("doExile(0);nextNight()"); ok('天黑停止并重置', await ev("tms.every(t=>!t.end&&t.left===t.dur*1e3)&&tms[0].dur===60")); await ev('tms[0].dur=120;tmReset()');
  // 第二个计时器
  await ev(`(()=>{startGame('std');'${ROLES[0]}'.split(',').forEach((k,i)=>S.seats[i].role=k);S.n.knife=0;settle();confirmDawn();close_()})()`);
  const v1 = () => ev("document.querySelector('#tm1 b').textContent"), tap1 = async t => { const [x, y] = await ev(rect(`[...document.querySelectorAll('#tm1 button')].find(b=>b.textContent==='${t}')`)); await B.mouse('mousePressed', x, y); await B.mouse('mouseReleased', x, y); await sleep(150); };
  ok('两个计时 2:00 与 1:30', await v() === '2:00' && await v1() === '1:30' && await ev("document.querySelectorAll('.tm').length") === 2);
  await tap('开始'); await sleep(1300); const p0 = await v(); await tap1('开始'); await sleep(1300);
  ok('开始一个会暂停另一个', await v() === p0 && /^1:2[789]$/.test(await v1()) && await ev("document.querySelector('#tm0').textContent.includes('开始')&&document.querySelector('#tm1').textContent.includes('暂停')"), [p0, await v(), await v1()]);
  await reload(); const q1 = await v1(); await sleep(1300); ok('刷新后第二个继续、第一个不动', await v1() < q1 && await v() === p0, [q1, await v1(), p0, await v()]);
  await ev("window._vib=0;navigator.vibrate=x=>{window._vib=1;return true};tms[1].end=Date.now()+400;void 0"); await sleep(1000); ok('第二个到点只提示自己', await v1() === '时间到' && await v() === p0 && await ev("window._vib===1&&document.querySelector('#tm1').classList.contains('over')&&!document.querySelector('#tm0').classList.contains('over')"));
  await tap1('下一位'); ok('第二个下一位', /^1:(30|29)$/.test(await v1())); await tap1('重置'); ok('只重置自己', await v1() === '1:30' && await v() === p0); await tap1('90秒'); ok('各自换时长', await v1() === '2:00' && await v() === p0);
  await ev("tms[1].dur=90;tmReset();tmDraw()"); await tap1('开始'); await sleep(2200); const z = await v1(); await tap1('重置后开始'); const z2 = await v1(); await sleep(1300);
  ok('重置后开始：立刻从头走', z < '1:29' && /^1:(30|29)$/.test(z2) && /^1:2[89]$/.test(await v1()) && await ev("document.querySelector('#tm1').textContent.includes('暂停')"), [z, z2, await v1()]);
  await tap1('暂停'); await tap1('重置后开始'); ok('暂停后也可重置后开始', /^1:(30|29)$/.test(await v1()) && await ev('!!tms[1].end')); await tap('重置后开始'); ok('重置后开始会暂停另一个', await ev('!tms[1].end&&!!tms[0].end'));
  await ev("tms[1].dur=90;tmReset();localStorage.setItem('lrs-timer',JSON.stringify({dur:180,left:100000,end:0}))"); await reload(); ok('v24 旧存档', await v() === '1:40' && await v1() === '1:30');
  await ev("localStorage.setItem('lrs-timer','bad')"); await reload(); ok('坏存档不崩', await ev("tms[0].dur===120&&tms[1].dur===90&&!!document.querySelector('#app header')"));
});
await part('夜间调暗大字', async () => {
  await ev("startGame('std')"); const dim = () => ev("document.documentElement.classList.contains('dim')");
  ok('夜里默认调暗', await dim() && await ev("getComputedStyle(document.querySelector('.say')).fontSize") === '18px' && await ev("getComputedStyle(document.documentElement,'::after').pointerEvents") === 'none');
  await ev(`'${ROLES[0]}'.split(',').forEach((k,i)=>S.seats[i].role=k);S.n.knife=0;settle();confirmDawn();close_()`); ok('白天恢复', !await dim()); await ev('doExile(0);nextNight()'); ok('天黑再调暗', await dim());
  await ev('togDim()'); ok('可关闭', !await dim() && await ev("document.querySelector('#sheet').textContent.includes('口令大字已关闭')")); await reload(); ok('设置记住', !await dim()); await ev('togDim();close_()'); ok('可重新打开', await dim());
});
await part('屏幕常亮', async () => {
  const held = () => ev('!!wake&&!wake.released'); await cdp('Browser.grantPermissions', {origin: srv.url.slice(0, -1), permissions: ['wakeLockScreen', 'clipboardReadWrite', 'clipboardSanitizedWrite']}); await reload(1500);
  if (await ev("navigator.wakeLock.request('screen').then(w=>{w.release();return true},()=>false)")) {
    ok('打开即常亮', await wait(held, 3000)); await ev('togWake()'); await sleep(200); ok('关闭', !await held()); await reload(); ok('关闭被记住', !await held() && await ev('!wakeOn')); await ev('togWake()'); ok('重新打开', await wait(held, 2000)); await ev('close_()');
  } else { console.log('  （本环境不允许常亮，跳过）'); }
});
await part('复制', async () => {
  await ev("L('身份：甲1号｜乙2号｜丙3号')"); await ev('openLog()'); ok('记录遇｜换行', await ev("(()=>{const e=[...document.querySelectorAll('#sheet .log span')].at(-1);return e.querySelectorAll('br').length===2&&!e.textContent.includes('｜')})()")); const [x, y] = await ev(rect("[...document.querySelectorAll('#sheet button')].find(b=>b.textContent.includes('复制'))")); await B.mouse('mousePressed', x, y); await B.mouse('mouseReleased', x, y); await sleep(400);
  ok('剪贴板', (await ev("navigator.clipboard.readText().catch(e=>'ERR')")).startsWith('【狼人杀法官记录】')); const ct = (await ev('navigator.clipboard.readText()')).replace(/\r/g, ''); ok('复制遇｜换行', ct.includes('身份：甲1号\n　　　　乙2号\n　　　　丙3号') && !ct.includes('｜'), ct.slice(-80)); await ev('close_()');
});
await part('界面宽度', async () => {
  const views = {elect: "S.police=[1,3];S.night=false;S.day=1;S.badgeDone=S.badgeLost=false;S.d=null;render()", vote: "openVote('exile')", menu: 'openMenu()', hist: 'openHistory()', upd: 'close_();newSW={};render()', hide: "newSW=null;S.hide=true;S.night=true;S.n.step=2;render()", hidelog: 'openLog()', unhide: 'close_();S.hide=false;render()'};
  for (const [w, h] of [[320, 568], [375, 812], [430, 932], [768, 1024], [844, 390], [1024, 768], [1280, 800], [1920, 1080]]) {
    await size(w, h); await sleep(120);
    const r = await ev(`(()=>{const bad=[];const keep=JSON.stringify(S);S.names=['小明','阿强','Amy李','美玲','老王老王老王老王','Ken','张三丰','大飞','阿珍','小白','Leo','陈大文'];
     const chk=n=>{if(document.documentElement.scrollWidth>innerWidth)bad.push(n+' 横向溢出');const s=document.querySelector('#sheet');if(document.querySelector('#bg').classList.contains('show')&&s.scrollWidth>s.clientWidth)bad.push(n+' 弹层溢出');for(const b of document.querySelectorAll('button'))if(b.offsetHeight&&(b.offsetHeight<32||b.scrollWidth>b.clientWidth+1))bad.push(n+' 按钮 '+b.textContent.trim().slice(0,12)+b.offsetHeight);};
     for(const bb of Object.keys(BOARDS))for(const d of [1,2]){S.board=bb;S.day=d;S.night=true;for(let i=0;i<stepsOf().length;i++){S.n.step=i;render();chk(bb+d+stepsOf()[i]);}}
     S.board='std';S.night=false;S.d=null;render();chk('day');S.d={n:10,flip:true};render();chk('dayDone');
     S.win={side:'wolf',why:'神职、平民全体出局'};render();chk('winbar');showWin();chk('win');openNames();chk('names');openLog();chk('log');newGame();chk('newgame');tapSeat(0);chk('seat');pickRole(0);chk('role');S.night=true;pickT('knife');chk('picker');close_();
     ${Object.entries(views).map(([k, js]) => `${js};chk('${k}');`).join('')}
     S=JSON.parse(keep);newSW=null;render();scrollTo(0,99999);const last=document.querySelectorAll('.seat')[11].getBoundingClientRect();if(last.bottom>document.querySelector('.stats').getBoundingClientRect().top+1)bad.push('末座被遮');scrollTo(0,0);return [...new Set(bad)].slice(0,6);})()`);
    ok(`${w}x${h}`, !r.length, r);
  }
});
await part('旧存档与断网', async () => {
  await size(375, 812);
  await ev(`(()=>{const o=JSON.parse(localStorage.getItem(KEY));for(const k of ['id','out','v','elLater','board','police','names','lastGuard','lucky','mech','mechUsed','awakeDay','sealed','d','badgeDone','badgeLost'])delete o[k];o.n={step:5,knife:1,anti:false,poison:null,check:null};o.model=2;o.log=[];'hybrid,wolf,wolf,wolf,wolf,seer,hunter,idiot,witch,villager,villager,villager'.split(',').forEach((k,i)=>{o.seats[i].role=k;o.seats[i].dead=null;});o.day=2;o.night=false;o.seats[0].dead=o.seats[5].dead='night';addEventListener('beforeunload',()=>localStorage.setItem(KEY,JSON.stringify(o)));})()`);
  await reload(); ok('旧存档可读', await ev("S.board==='hybrid'&&S.day===2&&S.seats[0].role==='hybrid'&&[...document.querySelectorAll('.st b')].map(e=>e.textContent).join()==='4,3,3,10'"));
  await ev('doExile(2);close_()'); await srv.stop(); await reload(2500);
  ok('断网可打开', await ev("S.seats[1].dead==='exile'&&document.querySelectorAll('.seat').length===12")); ok('断网全部角色图', await ev("Promise.all([...ROLES.map(r=>r.k),'villager-xy'].map(k=>fetch('img/'+k+'.png').then(x=>x.ok,()=>false))).then(a=>a.filter(Boolean).length)") === 31);
  await ev('nextNight()'); ok('断网可继续', await ev('S.day===3&&S.night'));
});
ok('无脚本错误', !B.errs.length, B.errs); await B.close();

await part('新版升级', async () => {
  let bump = 0; const s = await serve((f, d) => bump && /(sw|app)\.js$/.test(f) ? Buffer.from(d.toString().replace(/(const VER='|werewolf-judge-)v\d+/g, '$1v999')) : d), b = await browser();
  await b.size(390, 844); await b.go(s.url, 3500); const bar = () => b.ev("!!document.querySelector('.upd')"), ver = await b.ev('VER');
  ok('首次无提示', !await bar()); await b.reload(); ok('刷新无提示', !await bar()); await b.ev("startGame('demon');setRole(0,'seer');void 0"); const before = await b.ev('JSON.stringify(S)');
  bump = 1; await b.ev('navigator.serviceWorker.getRegistration().then(r=>r.update()).then(()=>1)'); ok('出现提示', await wait(bar)); ok('未点前不变', await b.ev('VER') === ver); await b.reload(); ok('刷新仍旧版并提示', await b.ev('VER') === ver && await wait(bar));
  const [x, y] = await b.ev(rect("document.querySelector('.upd')")); await b.mouse('mousePressed', x, y); await b.mouse('mouseReleased', x, y); ok('点击后更新', await wait(async () => (await b.ev('VER')) === 'v999')); await sleep(1200);
  ok('对局与撤销保留', await b.ev('JSON.stringify(S)') === before && await b.ev('undo.length>0')); ok('旧缓存已清', await b.ev('caches.keys().then(k=>k.join())') === 'werewolf-judge-v999' && !await bar()); ok('升级无错误', !b.errs.length, b.errs); await b.close(); await s.stop();
});
console.log(`\n${fails.length ? '失败' : '通过'}：${pass} 项通过，${fails.length} 项失败`); fails.forEach(f => console.log('  ✗ ' + f));
process.exit(fails.length ? 1 : 0);
