// 西游杀：独立判定模型 + 规则用例（在页面里执行，返回 JSON）
(() => {
ADV = 0;
const T = []; let pass = 0; const ok = (n, c, d) => { if (c) pass++; else T.push('FAIL ' + n + (d === undefined ? '' : ' ' + JSON.stringify(d))); };
const B = (t, r = document) => [...r.querySelectorAll('button')].find(b => b.textContent.includes(t) && !b.disabled && !(b.closest('#sheet') && !document.querySelector('#bg.show')));
const pkb = n => [...document.querySelectorAll('.pk button')].find(x => x.querySelector('b').textContent == String(n));
const tap = n => { const b = pkb(n); if (!b || b.disabled) throw Error('不能点 ' + n + ' ' + window._pkTitle); b.click(); };
const rowOf = l => { const rs = [...document.querySelectorAll('.side .row')]; return rs.find(x => x.querySelector('span').textContent === l) || rs.find(x => x.querySelector('span').textContent.startsWith(l)); };
const rb = l => { const r = rowOf(l); return r && r.querySelector('button'); };
const none = () => document.querySelector('.pkf .btn').click();
const side = () => document.querySelector('.side').textContent;
const ri = n => Math.floor(Math.random() * n), pick = a => a[ri(a.length)], shuf = a => [...a].sort(() => Math.random() - .5);
const next = () => { const b = B('下一步'); if (!b) throw Error('卡住：' + stepsOf()[S.n.step]); b.click(); };
const W = ['erlang', 'tianbing'], TRN = {wukong: {A: '火眼金睛', B: '定海神针', C: '镇魔圈'}, erlang: {A: '天眼', B: '三尖两刃刀', C: '哮天犬'}};
const base = []; for (const [k, c] of Object.entries(BOARDS.xiyou.cnt)) for (let i = 0; i < c; i++) base.push(k);
const out = {nights: 0, games: 0, wins: {}, hunts: 0, awake: 0, kills: 0, votes: 0};

// ---------- 随机整局（点界面），与独立模型比对 ----------
for (let g = 0; g < 120; g++) {
 try {
  startGame('xiyou'); undo = [];
  const deck = shuf(base), at = k => deck.indexOf(k) + 1, isW = x => W.includes(deck[x - 1]);
  const kind = x => isW(x) ? 'A' : ['wukong', 'zixia', 'guanyin', 'heixiong'].includes(deck[x - 1]) ? 'B' : 'C';
  const alive = new Set(Array.from({length: 12}, (_, i) => i + 1));
  const M = {wukong: {A: 0, B: 0, C: 0, used: false, awake: 0}, erlang: {A: 0, B: 0, C: 0, used: false, awake: 0}, lastZx: 0, bound: 0, gyUsed: false, win: null};
  const dist = (a, b) => { const d = Math.abs(a - b); return Math.min(d, 12 - d); };
  const tang = deck.map((k, i) => k === 'villager' ? i + 1 : 0).filter(Boolean).sort((a, b) => dist(a, at('wukong')) - dist(b, at('wukong')) || b - a)[0];
  const woke = (k, d) => !!M[k].awake && M[k].awake < d, owns = (k, c, d) => !!M[k][c] && M[k][c] < d;
  const up = k => alive.has(at(k));
  for (let d = 1; d <= 7 && !M.win; d++) {
   out.nights++; const n = {wkT: [], elT: []}, A = () => [...alive];
   const boost = k => up('zixia') && n.zx === at(k) && !(k === 'wukong' && n.elC === at('zixia'));
   for (const key of stepsOf()) {
    const id = () => {};
    if (key === 'ids') { for (const k of ['zixia', 'erlang', 'wukong', 'guanyin', 'heixiong']) { if (B('下一步')) throw Error('身份没录完可下一步'); rb(R[k].n).click(); tap(at(k)); } rb('天兵 ').click(); deck.forEach((k, i) => { if (k === 'tianbing') tap(i + 1); }); B('确定').click(); if (!side().includes(`唐僧是 ${tang}号`)) throw Error('唐僧提示'); }
    if (key === 'dawn') break;
    if (key === 'zixia') { id('zixia'); if (up('zixia')) { rb('加持').click(); n.zx = pick(A().filter(x => x !== M.lastZx)); tap(n.zx); } }
    if (key === 'wolf') {
     const pack = A().some(x => deck[x - 1] === 'tianbing') || (up('erlang') && woke('erlang', d));
     rb('刀口').click(); if (!pack || Math.random() < .1) { none(); n.knife = 0; } else { n.knife = pick(A()); tap(n.knife); }
     if (!pack && d > 1) ok('天兵全灭提示', side().includes('二郎神觉醒前不能刀人'));
    }
    for (const k of ['erlang', 'wukong']) if (key === k) {
     id(k); const f = k === 'wukong' ? 'wk' : 'el', me = at(k);
     if (!up(k)) continue;
     const mx = 1 + (boost(k) ? 1 : 0); rb('寻宝').click(); const ts = shuf(A().filter(x => x !== me)).slice(0, mx).sort((a, b) => a - b); ts.forEach(tap); B('确定').click(); n[f + 'T'] = ts;
     for (const x of ts) if (!S.seats[x - 1].role) { if (B('下一步')) throw Error('未录入仍可下一步'); ok('未录入提示', side().includes(x + '号：身份未录入')); S.seats[x - 1].role = deck[x - 1]; settle(); }
     const have = {...M[k]}; const exp = ts.map(x => { const c = kind(x), got = !have[c]; if (got) have[c] = d; return `${x}号：${got ? '得 ' + c : '已有 ' + c}`; });
     const shown = [...document.querySelectorAll('.side .res')].map(e => e.textContent).filter(t => /号：(得|已有)/.test(t)).map(t => t.replace(/ (?:[^ ]+|已有.*)$/, s => s.startsWith(' ') && /得/.test(t) ? '' : s).replace(/(得 [ABC]).*/, '$1').replace(/(已有 [ABC]).*/, '$1'));
     if (shown.join() !== exp.join()) throw Error(`寻宝显示 ${shown} 期望 ${exp}`);
     const wk2 = woke(k, d) || (!M[k].awake && !!(have.A && have.B && have.C)); n[f + 'H'] = have; n[f + 'W'] = wk2;
     if (!!have.C && Math.random() < .6) { rb(TRN[k].C).click(); const c = k === 'wukong' ? 1 + ri(12) : pick(A().filter(x => x !== me && x !== at('wukong'))); if (c) { n[f + 'C'] = c; tap(c); } else none(); }
     else if (!!have.C !== !!rowOf(TRN[k].C)) throw Error('C 行 ' + k);
     if (!!have.B && !M[k].used) { if (Math.random() < .5) { rb(TRN[k].B).click(); n[f + 'B'] = pick(A().filter(x => x !== me)); tap(n[f + 'B']); } }
     else if (rowOf(TRN[k].B)) throw Error('B 行不该有 ' + k);
     if (wk2) { rb('查验身份').click(); const t = pick(A().filter(x => x !== me)); tap(t); const want = R[deck[t - 1]].n; if (![...document.querySelectorAll('.side .res')].some(e => e.textContent.includes('身份：' + want))) throw Error('觉醒查验 ' + want); }
     out.hunts += ts.length;
    }
    if (key === 'guanyin') {
     id('guanyin'); const gy = at('guanyin'), sealed = n.elC === gy;
     if (up('guanyin') && !sealed) {
      const can = !M.gyUsed && n.knife > 0 && n.knife !== gy;
      if (!!B('使用') !== can) throw Error('甘露水按钮 ' + can);
      if (can && Math.random() < .5) { B('使用').click(); n.gyS = true; }
      if (M.bound) { if (rb('收服')) throw Error('收服只能一次'); } else if (Math.random() < .6) { rb('收服').click(); n.gyB = pick(A().filter(x => x !== gy)); tap(n.gyB); }
     } else if (up('guanyin') && sealed && rb('收服') && !rb('收服').disabled) throw Error('观音被封印仍可收服');
    }
    if (key === 'heixiong') {
     id('heixiong'); const h = at('heixiong');
     if (up('heixiong') && n.elC !== h) {
      const near = dir => { for (let i = 1; i < 12; i++) { const x = ((h - 1 + dir * i) % 12 + 12) % 12 + 1; if (alive.has(x) && x !== h) return x; } return 0; };
      const pair = [...new Set([near(-1), near(1)].filter(Boolean))], w = pair.some(isW), t2 = pair.includes(tang), say = t2 ? !w : w;
      const txt = document.querySelector('.side .res').textContent;
      if (txt.includes('咆哮（有狼）') !== say || !txt.includes(pair.join('、'))) throw Error(`黑熊精 ${txt} 期望 ${say} ${pair}`);
     }
    }
    next();
   }
   // 模型结算
   const D = new Set(), wk = at('wukong'), el = at('erlang'), gy = at('guanyin'), inv = n.wkW !== undefined ? n.wkW : woke('wukong', d);
   const kill = x => { if (!x || !alive.has(x)) return; if (inv && x === wk) return; D.add(x); };
   const ring = up('wukong') && n.wkH && n.wkH.C && n.wkC ? [n.wkC === 1 ? 12 : n.wkC - 1, n.wkC, n.wkC === 12 ? 1 : n.wkC + 1].filter(x => x !== wk) : [];
   if (n.knife) { if (ring.includes(n.knife)) ; else if (n.gyS && up('guanyin') && n.knife !== gy) ; else kill(n.knife); }
   if (n.elB && up('erlang')) { if (n.elW) { if (!ring.includes(n.elB)) kill(n.elB); } else if (n.elB === wk) kill(wk); out.kills++; }
   if (n.wkB && up('wukong')) { if (n.wkW) { if (n.wkB !== wk) D.add(n.wkB); } else if (n.wkB === el) D.add(el); out.kills++; }
   if (D.has(gy) && M.bound && alive.has(M.bound)) D.add(M.bound);
   B('确认').click();
   D.forEach(x => alive.delete(x));
   const chk = w => {
    const a = S.seats.filter(s => !s.dead).map(s => s.n).join(), e = [...alive].sort((x, y) => x - y).join();
    if (a !== e) throw Error(`${w} 存活 ${a} 期望 ${e} ${JSON.stringify(n)} ${deck}`);
    const nw = [...alive].filter(isW).length, nv = [...alive].filter(x => deck[x - 1] === 'villager').length, ng = alive.size - nw - nv;
    const wolf = !ng || !nv, good = !nw;
    if (M.win === 'wolf' && !wolf || M.win === 'good' && !good) M.win = null;
    if (!M.win) M.win = wolf ? 'wolf' : good ? 'good' : null;
    if ((S.win ? S.win.side : null) !== M.win) throw Error(`${w} 胜负 ${JSON.stringify(S.win)} 期望 ${M.win}`);
    if (localStorage.getItem(KEY) !== JSON.stringify(S)) throw Error('未存盘');
   };
   chk('天亮');
   if (d === 1) { if (S.xy.tang !== tang) throw Error(`唐僧 ${S.xy.tang} 期望 ${tang}`); if (S.seats.map(s => s.role).join() !== deck.join()) throw Error('身份'); }
   // 模型跨夜
   for (const k of ['erlang', 'wukong']) {
    const f = k === 'wukong' ? 'wk' : 'el';
    if (n[f + 'B']) M[k].used = true;
    for (const x of n[f + 'T']) { const c = kind(x); if (!M[k][c]) M[k][c] = d; }
    if (!M[k].awake && M[k].A && M[k].B && M[k].C) { M[k].awake = d; out.awake++; }
    if (JSON.stringify([S.xy[k].A, S.xy[k].B, S.xy[k].C, S.xy[k].usedB, S.xy[k].awake]) !== JSON.stringify([M[k].A, M[k].B, M[k].C, M[k].used, M[k].awake])) throw Error('宝物状态 ' + k + JSON.stringify([S.xy[k], M[k]]));
   }
   if (n.gyS) M.gyUsed = true; if (n.gyB && !M.bound) M.bound = n.gyB; M.lastZx = n.zx || 0;
   if (M.win) break;
   close_();
   // 白天：记票放逐，核对唐僧 +0.5 与观音跟票
   if (Math.random() < .5) {
    rb('投票明细').click(); const al = [...alive], cs = shuf(al).slice(0, 3), m = {};
    for (const c of cs) { [...document.querySelectorAll('.vc button')].find(b => +b.querySelector('b').textContent === c).click(); for (const v of al) if (!m[v] && Math.random() < .4 && !(v === M.bound && alive.has(gy) && alive.has(v) && v !== gy)) { m[v] = c; [...document.querySelectorAll('.vv button')].find(b => parseInt(b.querySelector('b').textContent) === v).click(); } }
    const bnd = M.bound && alive.has(M.bound) && alive.has(gy) && M.bound !== gy;
    if (bnd) m[M.bound] = m[gy];
    const k = {}; for (const v in m) if (m[v]) k[m[v]] = (k[m[v]] || 0) + (S.seats[v - 1].badge ? 1.5 : 1) + (+v === tang ? .5 : 0);
    const mx = Math.max(0, ...Object.values(k)), top = Object.keys(k).filter(c => k[c] === mx).map(Number);
    const bt = document.querySelector('#sheet .pkf .pri').textContent;
    const exp = !top.length ? '无人投票：无人放逐' : top.length === 1 ? '放逐 ' + top[0] + '号' : '平票 PK';
    if (!bt.startsWith(exp)) throw Error(`记票 ${bt} 期望 ${exp} ${JSON.stringify(m)} 唐僧${tang} 收服${M.bound}`);
    out.votes++; close_(); S.v = null; save(); render();
   }
   rb('放逐').click(); let e = 0; if (Math.random() < .1) none(); else { e = pick([...alive]); tap(e); alive.delete(e); if (e === gy && M.bound && alive.has(M.bound)) alive.delete(M.bound); }
   chk('放逐'); if (M.win) break;
   ok('天庭不能自爆', !rb('狼人自爆'));
   B('天黑了').click();
  }
  out.games++; if (M.win) out.wins[M.win] = (out.wins[M.win] || 0) + 1;
 } catch (e) { T.push('FAIL 第' + g + '局 ' + e.message); if (T.length > 6) break; }
}

// ---------- 规则用例 ----------
const D0 = 'wukong zixia guanyin heixiong villager villager villager villager erlang tianbing tianbing tianbing'.split(' ');
const setup = (deck = D0, o = {}) => { close_(); startGame('xiyou'); deck.forEach((k, i) => S.seats[i].role = k); Object.assign(S.n, o); S.n.step = stepsOf().length - 1; settle(); close_(); };
const dawn = () => { confirmDawn(); close_(); };
const dead = n => !!S.seats[n - 1].dead;
const nightN = (o = {}) => { if (S.night) dawn(); if (!S.d) doExile(0); nextNight(); Object.assign(S.n, o); S.n.step = stepsOf().length - 1; settle(); close_(); };
try {
 // 唐僧：最近的平民，平局取号码大的
 setup('villager zixia guanyin heixiong tianbing wukong tianbing villager villager villager erlang tianbing'.split(' ')); ok('唐僧平局取号码大的', S.xy.tang === 8, S.xy.tang);
 setup('villager villager guanyin heixiong tianbing wukong tianbing zixia villager villager erlang tianbing'.split(' ')); ok('唐僧取最近', S.xy.tang === 9, S.xy.tang);
 setup(); ok('唐僧 5 号', S.xy.tang === 5); ok('唐僧标签', document.querySelectorAll('.seat')[4].textContent.includes('唐僧'));
 ok('唐僧查验仍显示平民', exactName(seat(5)) === '平民');
 // 狼刀与保护
 setup(D0, {knife: 5}); dawn(); ok('狼刀', dead(5));
 setup(D0, {knife: 3}); S.xy.gyUsed = false; S.n.gyS = true; settle(); dawn(); ok('甘露水救人', !dead(3) ? false : true, '观音被刀不能自救');
 setup(D0, {knife: 5, gyS: true}); dawn(); ok('甘露水救他人', !dead(5) && S.xy.gyUsed);
 nightN({knife: 6}); S.n.step = stepsOf().indexOf('guanyin'); render(); ok('甘露水只能用一次', !B('使用')); S.n.step = stepsOf().length - 1; dawn(); ok('第二次刀死', dead(6));
 // 镇魔圈
 setup(); S.xy.wukong.C = 1; nightN({knife: 2, wkC: 1}); dawn(); ok('镇魔圈护左右（12-1-2）', !dead(2));
 setup(); S.xy.wukong.C = 1; nightN({knife: 1, wkC: 12}); dawn(); ok('镇魔圈不护孙悟空自己', dead(1));
 setup(); S.xy.wukong.C = 1; S.seats[5].dead = 'exile'; S.seats[5].at = '第0天'; nightN({knife: 7, wkC: 6}); dawn(); ok('死者也占位', !dead(7));
 setup(); nightN({wkT: [5]}); S.n.step = stepsOf().indexOf('wukong'); render(); ok('当夜寻到即可用', !!rowOf('镇魔圈') && side().indexOf('得 C') < side().indexOf('镇魔圈'));
 setup(); nightN({wkT: [5], wkC: 6, knife: 6}); dawn(); ok('当夜寻到的镇魔圈当夜生效', !dead(6) && S.xy.wukong.C === 2);
 setup(); nightN({wkT: [6], wkC: 6, knife: 6}); nightN({}); S.n.step = stepsOf().indexOf('wukong'); render(); ok('换人寻宝后旧宝物仍在', !!rowOf('镇魔圈'));
 setup(); nightN({wkC: 6, knife: 6}); dawn(); ok('没寻到不能用', dead(6));
 setup(); S.xy.wukong.C = 1; nightN({}); S.n.step = stepsOf().indexOf('wukong'); render(); ok('第 2 夜可用第 1 夜的宝物', !!rowOf('镇魔圈'));
 // 击杀宝物
 setup(); S.xy.erlang.B = 1; nightN({elB: 1}); dawn(); ok('三尖两刃刀点中大圣', dead(1) && !S.win);
 setup(); S.xy.erlang.B = 1; nightN({elB: 5}); dawn(); ok('三尖两刃刀点错无效', !dead(5) && S.xy.erlang.usedB && S.log.some(l => l.x.includes('没有点中')));
 nightN({}); S.n.step = stepsOf().indexOf('erlang'); render(); ok('B 只能用一次', !rowOf('三尖两刃刀'));
 setup(); S.xy.wukong.B = 1; nightN({wkB: 9}); dawn(); ok('定海神针点中二郎神', dead(9) && !S.win);
 setup(); S.xy.wukong.B = 1; nightN({wkB: 10}); dawn(); ok('定海神针点错无效', !dead(10));
 setup(); S.xy.erlang.B = 1; S.xy.wukong.C = 1; nightN({elB: 1, wkC: 2}); dawn(); ok('镇魔圈不挡砍大圣（不护自己）', dead(1));
 // 觉醒
 setup(); Object.assign(S.xy.erlang, {A: 1, B: 1, C: 1, awake: 1}); nightN({elB: 5}); dawn(); ok('觉醒的三尖两刃刀杀任意人', dead(5));
 setup(); Object.assign(S.xy.erlang, {A: 1, B: 1, C: 1, awake: 1}); S.xy.wukong.C = 1; nightN({elB: 5, wkC: 5}); dawn(); ok('觉醒刀仍被镇魔圈挡', !dead(5));
 setup(); Object.assign(S.xy.wukong, {A: 1, B: 1, C: 1, awake: 1}); nightN({knife: 1}); dawn(); ok('觉醒大圣夜里无敌', !dead(1) && S.log.some(l => l.x.includes('无敌')));
 setup(); Object.assign(S.xy.wukong, {A: 1, B: 1, C: 1, awake: 1}); nightN({wkB: 6}); dawn(); ok('觉醒定海神针杀任意人', dead(6));
 setup(); Object.assign(S.xy.erlang, {A: 1, B: 1, C: 1, awake: 1}); nightN({}); ok('觉醒二郎神入狼队', inPack(seat(9)));
 setup(); Object.assign(S.xy.erlang, {A: 1, B: 1, C: 0}); nightN({elT: [5]}); S.n.step = stepsOf().indexOf('erlang'); render(); ok('集齐当夜提示得 C', side().includes('得 C')); S.n.step = stepsOf().length - 1; dawn(); ok('集齐后觉醒', S.xy.erlang.awake === 2 && S.log.some(l => l.x.includes('集齐三件宝物')));
 ok('次夜仍觉醒', (nightN({}), woke('erlang')));
 setup(); Object.assign(S.xy.erlang, {A: 1, B: 1, C: 0}); nightN({elT: [5]}); S.n.step = stepsOf().indexOf('erlang'); render(); ok('集齐当夜觉醒可查验', woke('erlang') && !!rowOf('查验身份') && !inPack(seat(9)));
 setup(); Object.assign(S.xy.erlang, {A: 1, B: 1, C: 0}); S.seats[9].dead = S.seats[10].dead = S.seats[11].dead = 'exile'; nightN({elT: [5]}); S.n.step = stepsOf().indexOf('wolf'); render(); ok('当夜觉醒不加入当夜刀人', side().includes('二郎神觉醒前不能刀人')); dawn(); nightN({}); S.n.step = stepsOf().indexOf('wolf'); render(); ok('下一夜加入刀人', inPack(seat(9)) && side().includes('二郎神已觉醒'));
 setup(); Object.assign(S.xy.erlang, {A: 1, B: 1, C: 0}); nightN({elT: [5], elB: 6}); dawn(); ok('当夜觉醒三尖两刃刀杀任意人', dead(6));
 setup(); Object.assign(S.xy.wukong, {A: 1, B: 1, C: 0}); nightN({wkT: [5], knife: 1}); dawn(); ok('当夜觉醒大圣当夜无敌', !dead(1) && S.xy.wukong.awake === 2);
 setup(); Object.assign(S.xy.wukong, {A: 1, B: 0, C: 1}); nightN({wkT: [3], wkB: 6}); dawn(); ok('当夜寻到定海神针并觉醒即杀任意人', dead(6) && S.xy.wukong.usedB);
 // 寻宝
 setup(); S.xy.wukong.A = 1; nightN({wkT: [10]}); dawn(); ok('同类已有空手', S.xy.wukong.A === 1 && S.log.some(l => l.x.includes('已有 A，空手')));
 setup(D0, {wkT: [5]}); dawn(); ok('点到唐僧得 C', S.xy.wukong.C === 1);
 setup(D0, {elT: [1]}); dawn(); ok('二郎神点到大圣得 B', S.xy.erlang.B === 1);
 // 紫霞
 setup(); nightN({zx: 1}); S.n.step = stepsOf().indexOf('wukong'); render(); ok('紫霞加持大圣多寻宝', side().includes('寻宝 0/2') && side().includes('紫霞仙子加持'));
 setup(); S.xy.erlang.C = 1; nightN({zx: 1, elC: 2}); ok('紫霞被封印不能加持大圣', picks('wukong') === 1);
 setup(); S.xy.erlang.C = 1; nightN({zx: 9, elC: 2}); ok('紫霞加持二郎神不受封印影响', picks('erlang') === 2);
 setup(D0, {zx: 4}); dawn(); nightN({}); S.n.step = stepsOf().indexOf('zixia'); render(); rb('加持').click(); ok('紫霞不能连续点同一人', pkb(4).disabled); close_();
 // 哮天犬
 ok('夜间顺序', stepsOf().join(' ') === 'close zixia erlang wukong wolf guanyin heixiong dawn', stepsOf());
 close_(); startGame('xiyou'); ok('首夜先确认身份', [].concat(BOARDS.xiyou.n1).join(' ') === 'close ids zixia erlang wukong wolf guanyin heixiong sheriff dawn'); S.n.step = 1; render(); ok('身份没录完不能下一步', !B('下一步') && side().includes('天兵 0/3'));
 setup(); S.n.step = stepsOf().indexOf('wukong'); render(); ok('第二轮不再录身份', !rowOf('孙悟空') && !side().includes('请确认你的身份')); S.n.step = stepsOf().indexOf('wolf'); render(); ok('第二轮天兵不再录身份', !rowOf('天兵 ') && side().includes('天兵请睁眼'));
 setup(); S.xy.erlang.C = 1; nightN({elC: 4}); S.n.step = stepsOf().indexOf('heixiong'); render(); ok('哮天犬封印黑熊精', side().includes('被哮天犬封印') && !document.querySelector('.side .res'));
 setup(); S.xy.erlang.C = 1; nightN({elC: 3, gyB: 6}); S.n.step = stepsOf().indexOf('guanyin'); render(); ok('哮天犬封印观音', side().includes('被哮天犬封印') && rb('收服').disabled); S.n.step = stepsOf().length - 1; dawn(); ok('被封印不能收服', !S.xy.bound);
 setup(); S.xy.erlang.C = 1; nightN({}); S.n.step = stepsOf().indexOf('erlang'); render(); rb('哮天犬').click(); ok('哮天犬不能选大圣', pkb(1).disabled); close_();
 // 黑熊精与唐僧反转
 setup('wukong villager heixiong tianbing guanyin zixia villager villager erlang villager tianbing tianbing'.split(' ')); ok('唐僧在黑熊精旁', S.xy.tang === 2);
 S.n.step = stepsOf().indexOf('heixiong'); render(); ok('有狼却报没狼（反转）', side().includes('不咆哮（没狼）') && side().includes('结果已反转'));
 setup('wukong villager villager heixiong guanyin zixia tianbing villager erlang villager tianbing tianbing'.split(' ')); S.n.step = stepsOf().indexOf('heixiong'); render(); ok('两侧没狼、唐僧不在旁', S.xy.tang === 2 && side().includes('不咆哮（没狼）') && !side().includes('反转'));
 setup('wukong villager villager heixiong tianbing zixia guanyin villager erlang villager tianbing tianbing'.split(' ')); S.seats[4].dead = 'exile'; S.seats[4].at = '第0天'; settle(); S.n.step = stepsOf().indexOf('heixiong'); render(); ok('跳过出局者看最近存活', side().includes('3、6号'));
 // 观音收服
 setup(D0, {gyB: 6}); dawn(); ok('收服记录与宣布', S.xy.bound === 6 && side().includes('观音收服了 6号'));
 rb('投票明细').click(); [...document.querySelectorAll('.vc button')].find(b => b.querySelector('b').textContent === '10').click(); [...document.querySelectorAll('.vv button')].find(b => b.querySelector('b').textContent === '3').click();
 ok('被收服者跟观音投票', document.querySelector('.vv button:nth-child(6)').textContent.includes('10') && document.querySelector('#sheet').textContent.includes('2 票'));
 [...document.querySelectorAll('.vv button')].find(b => b.querySelector('b').textContent === '6').click(); ok('被收服者不能自己投', S.v.m[6] === undefined); close_(); S.v = null;
 doExile(3); ok('观音被放逐，收服者殉情', dead(6) && S.seats[5].dead === 'love');
 setup(D0, {gyB: 6}); dawn(); nightN({knife: 3}); dawn(); ok('观音夜里死亡，收服者殉情', dead(3) && dead(6));
 setup(D0, {gyB: 6}); dawn(); nightN({gyB: 7}); S.n.step = stepsOf().indexOf('guanyin'); render(); ok('收服整局一次', !rb('收服') && side().includes('已用（6号') && !S.n.gyB); dawn(); ok('收服对象不变', S.xy.bound === 6);
 setup(D0, {gyB: 6}); dawn(); S.seats[5].dead = 'exile'; S.seats[5].at = '第1天'; nightN({}); S.n.step = stepsOf().indexOf('guanyin'); render(); ok('收服者出局后不能再收', !rb('收服') && side().includes('已出局'));
 // 唐僧投票 +0.5
 setup(); dawn(); rb('投票明细').click(); const vc = c => [...document.querySelectorAll('.vc button')].find(b => b.querySelector('b').textContent === String(c)).click(), vv = v => [...document.querySelectorAll('.vv button')].find(b => parseInt(b.querySelector('b').textContent) === v).click();
 vc(9); vv(5); vc(10); vv(6); ok('唐僧一票算 1.5', document.querySelector('#sheet .pkf .pri').textContent.startsWith('放逐 9号'));
 close_(); S.v = null; doBadge(3); rb('投票明细').click(); vc(9); vv(5); vc(10); vv(4); vv(6); ok('警长 1.5 胜过唐僧 1.5 + 0', document.querySelector('#sheet .pkf .pri').textContent.startsWith('放逐 10号'));
 close_(); S.v = null; doBadge(4); rb('投票明细').click(); vc(9); vv(5); vc(10); vv(6); vv(7); ok('唐僧当警长算 2 票', document.querySelector('#sheet .pkf .pri').textContent.startsWith('平票'));
 close_(); S.v = null;
 // 胜负与自爆
 setup(D0, {knife: 1}); dawn(); ok('孙悟空出局不直接判胜', dead(1) && !S.win);
 setup(); S.seats[1].dead = S.seats[2].dead = S.seats[3].dead = 'exile'; nightN({knife: 1}); dawn(); ok('神职全灭狼胜', S.win && S.win.side === 'wolf' && S.win.why === '神职全体出局');
 setup(); S.seats[4].dead = S.seats[5].dead = S.seats[6].dead = 'exile'; nightN({knife: 8}); dawn(); ok('平民（含唐僧）全灭狼胜', S.win && S.win.side === 'wolf' && S.win.why === '平民全体出局');
 setup(); S.seats[9].dead = S.seats[10].dead = S.seats[11].dead = 'exile'; S.xy.wukong.B = 1; nightN({wkB: 9}); dawn(); ok('狼人（含二郎神）全灭好人胜', S.win && S.win.side === 'good' && S.win.why === '狼人全体出局');
 setup(); dawn(); pickBoom(); ok('天庭不能自爆', [...document.querySelectorAll('.pk button')].every(b => b.disabled)); close_();
 setup(); S.seats[9].dead = S.seats[10].dead = S.seats[11].dead = 'exile'; settle(); ok('天兵全灭未判胜（二郎神在）', !S.win); nightN({}); S.n.step = stepsOf().indexOf('wolf'); render(); ok('天兵全灭提示', side().includes('二郎神觉醒前不能刀人'));
 // 新开一局后西游状态清空、记录换行
 setup(D0, {wkT: [10]}); dawn(); startGame('xiyou'); ok('新局清空宝物', S.xy.wukong.A === 0 && S.xy.tang === 0);
} catch (e) { T.push('ERROR ' + e.stack.slice(0, 600)); }
close_();
return JSON.stringify({pass, fails: T, out});
})()
