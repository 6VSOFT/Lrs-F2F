// 发言顺序、身份速查、对局统计、复盘长图、大屏公开模式（在页面里执行，返回 JSON）
(async () => {
ADV = 0;
const T = []; let pass = 0; const ok = (n, c, d) => { if (c) pass++; else T.push('FAIL ' + n + (d === undefined ? '' : ' ' + JSON.stringify(d))); };
const sh = () => document.querySelector('#sheet').textContent, app = () => document.querySelector('#app').innerText;
const SB = t => [...document.querySelectorAll('#sheet button')].find(b => b.textContent.includes(t) && !b.disabled);
const AB = t => [...document.querySelectorAll('#app button')].find(b => b.textContent.includes(t));
const STD = 'seer witch hunter idiot villager villager villager villager wolf wolf wolf wolf'.split(' ');
const day1 = (police = [1, 3, 5, 9], knife = 5) => { startGame('std'); STD.forEach((k, i) => S.seats[i].role = k); S.names = Array(12).fill(''); S.names[0] = '小明'; S.names[4] = '阿强'; S.police = police; S.n.knife = knife; S.n.step = stepsOf().length - 1; settle(); confirmDawn(); close_(); };
try {
 // ---------- 发言顺序 ----------
 day1();
 ok('白天面板有发言顺序', app().includes('发言顺序') && !!AB('安排'));
 openTalk(); ok('竞选中默认警上发言', window._tk.k === 'police' && sh().includes('警上发言') && sh().includes('全体发言'));
 ok('警上只排上警玩家（含昨夜死亡）', talkOrder(window._tk).join() === '1,3,5,9', talkOrder(window._tk));
 talkSet('st', 5); talkSet('dir', -1); ok('起点和方向', talkOrder(window._tk).join() === '5,3,1,9');
 const r0 = Math.random; Math.random = () => .99; talkRand(); Math.random = r0; ok('随机起点', window._tk.st === 9);
 talkSet('st', 5); SB('开始发言').click();
 ok('开始发言', talkCur() === 5 && talkNext() === 3 && S.talk.day === 1 && !document.querySelector('#bg').classList.contains('show'));
 ok('警上发言用玩家 90 秒计时', !!tms[1].end && !tms[0].end && app().includes('玩家发言 90 秒'));
 ok('已存盘', JSON.parse(localStorage.getItem(KEY)).talk.i === 0);
 ok('座位标出发言人', [...document.querySelectorAll('.seat')][4].querySelector('.tag.spk2') !== null);
 ok('面板显示当前与下一位', app().includes('5号 阿强 发言') && app().includes('下一位 3号'));
 AB('下一位并计时').click(); ok('下一位', talkCur() === 3 && !!tms[1].end);
 AB('上一位').click(); ok('上一位', talkCur() === 5); talkStep(1);
 tms[1].end = Date.now() - 1; tmTick(); ok('时间到显示下一位', document.querySelector('#tm1').textContent.includes('下一位'));
 tmGo(1); ok('计时“下一位”换发言人', talkCur() === 1 && !!tms[1].end);
 talkStep(1); talkStep(1); ok('最后一位后结束', talkCur() === 0 && app().includes('发言结束') && tms.every(t => !t.end));
 sheriff_(3); settle(); ok('选出警长后清掉旧顺序', !talkOn()); openTalk();
 ok('选出警长后默认全体发言', window._tk.k === 'day' && sh().includes('警长 3号 最后发言') && !sh().includes('随机起点'));
 ok('警长 3 号：号码递增从 4 号开始，警长最后', talkOrder(window._tk).join() === '4,6,7,8,9,10,11,12,1,2,3', talkOrder(window._tk));
 talkSet('dir', -1); ok('号码递减从 2 号开始，警长最后', talkOrder(window._tk).join() === '2,1,12,11,10,9,8,7,6,4,3', talkOrder(window._tk));
 talkSet('dir', 1);
 ok('白天不排已出局玩家', !talkOrder(window._tk).includes(5));
 SB('开始发言').click(); ok('玩家用 90 秒', !!tms[1].end && !tms[0].end && tms[1].dur === 90);
 const tl = S.talk.o.length; S.talk.i = tl - 2; talkStep(1); ok('轮到警长用 120 秒', talkCur() === 3 && !!tms[0].end && !tms[1].end && tms[0].dur === 120 && app().includes('警长发言 120 秒'));
 ok('计时器标明警长、玩家，玩家在上', document.querySelectorAll('.tm')[0].id === 'tm1' && document.querySelector('#tm1').textContent.includes('玩家发言') && document.querySelector('#tm0').textContent.includes('警长发言'));
 S.talk.i = 0; save(); talkStep(1);
 const nx = talkNext(); seat(nx).dead = 'shot'; seat(nx).at = label(); save(); render();
 talkStep(1); ok('跳过发言中途出局的玩家', talkCur() !== nx && !seat(talkCur()).dead);
 ok('出局的划掉', [...document.querySelectorAll('.tko span.dd')].some(e => e.textContent === String(nx)));
 seat(nx).dead = null; seat(nx).at = ''; save();
 doExile(0); nextNight(); ok('天黑清掉发言顺序', S.talk === null && !talkOn());
 S.n.knife = 0; S.n.step = stepsOf().length - 1; confirmDawn(); close_(); ok('新的一天要重新安排', !talkOn() && !!AB('安排'));
 openTalk(); ok('无人上警时只有全体发言', !sh().includes('警上发言')); close_();
 doUndo(); doUndo(); ok('撤销后发言顺序恢复', S.day === 1 && talkOn());
 // ---------- 身份速查 ----------
 const miss = []; for (const [b, x] of Object.entries(BOARDS)) for (const k of Object.keys(x.cnt)) if (!roleInfo(k, b) || roleInfo(k, b).length < 10) miss.push(b + ':' + k);
 ok('每个板子每个身份都有说明', !miss.length, miss);
 ok('西游平民说明唐僧', roleInfo('villager', 'xiyou').includes('唐僧') && !roleInfo('villager', 'std').includes('唐僧'));
 openMenu(); ok('菜单有四个新入口', ['身份速查', '对局统计', '复盘长图', '大屏公开模式'].every(t => sh().includes(t)));
 SB('身份速查').click(); ok('速查打开当前板子', sh().includes('标准版 预女猎白') && document.querySelectorAll('#sheet .rg>div').length === 6);
 SB('西游杀').click(); ok('速查可换板子', document.querySelectorAll('#sheet .rg>div').length === 7 && sh().includes('二郎神') && sh().includes('天庭获胜'));
 S.hide = false; tapSeat(0); ok('座位弹层有技能说明', sh().includes(RI.seer));
 S.hide = true; tapSeat(0); ok('隐藏模式座位弹层不说明', !sh().includes(RI.seer)); S.hide = false; close_();
 home = true; render(); ok('首页有身份速查和统计', !!AB('身份速查') && !!AB('对局统计')); home = false; render();
 // ---------- 对局统计 ----------
 const sd = STD.map((k, i) => ({n: i + 1, role: k, dead: null, at: '', badge: false, flip: false}));
 const nm = ['小明', '阿强', '', '', '', '', '', '', '老王', '', '', '<b>x'];
 saveHist([['std', 'good', 3], ['std', 'wolf', 5], ['std', null, 2], ['xiyou', 'wolf', 4]].map(([b, w, d], i) => ({id: 's' + i, end: Date.now() - i * 1e6, board: b, day: d, win: w ? {side: w, why: 'x'} : null, names: nm, seats: sd, log: [{t: '第1夜', x: 'x'}]})));
 const t = statsOf(loadHist());
 ok('统计局数与胜负', t.gs.length === 4 && t.fin.length === 3 && t.good === 1 && t.wolf === 2);
 ok('各板子分组', t.by.std.length === 3 && t.by.xiyou.length === 1);
 ok('玩家胜率', t.P['小明'].n === 3 && t.P['小明'].w === 1 && t.P['老王'].w === 2 && t.P['老王'].wolf === 3, t.P);
 ok('玩家分阵营胜率', t.P['小明'].ww === 0 && t.P['老王'].ww === 2, t.P);
 ok('名字去掉危险字符', !!t.P['bx'] && !Object.keys(t.P).some(k => /[<>]/.test(k)));
 // 玩家表现：1 预言家小明、2 女巫阿强为神民，9 狼人老王
 const lg = [{t: '第1夜', x: '狼刀：1号'}, {t: '第1天', x: '警长投票：3号 2票（1、2）｜9号 1票（4）'}, {t: '第1天', x: '警长投票（PK）：3号 1票（1）｜9号 1票（2）'},
  {t: '第1天', x: '放逐投票：9号 1票（1）｜5号 1票（2）'}, {t: '第1天', x: '投票放逐：6号·平民'}, {t: '第1天', x: '更正：取消 6号 的放逐'}, {t: '第1天', x: '投票放逐：5号·平民'},
  {t: '第2夜', x: '狼刀：5号'}, {t: '第2天', x: '投票放逐：10号·狼人'}];
 const P2 = {}; ['小明', '阿强', '老王'].forEach(n => P2[n] = {n: 1, w: 0, wolf: 0, ww: 0, sv: 0, sg: 0, ev: 0, ew: 0, kn: 0, kg: 0, xn: 0, xg: 0});
 skillOf({names: nm, seats: sd, log: lg}, P2);
 ok('警徽票正确率', P2['小明'].sv === 2 && P2['小明'].sg === 2 && P2['阿强'].sv === 2 && P2['阿强'].sg === 1, [P2['小明'], P2['阿强']]);
 ok('投狼正确率', P2['小明'].ev === 1 && P2['小明'].ew === 1 && P2['阿强'].ev === 1 && P2['阿强'].ew === 0);
 ok('屠神率', P2['老王'].kn === 2 && P2['老王'].kg === 1, P2['老王']);
 ok('抗推率（更正的放逐不算）', P2['老王'].xn === 2 && P2['老王'].xg === 1, P2['老王']);
 ok('狼人不算警徽票', P2['老王'].sv === 0 && P2['老王'].ev === 0);
 const sd2 = sd.map(s => ({...s})); sd2[8].dead = 'exile'; sd2[8].at = '第1天'; const P3 = {老王: {...P2['老王'], kn: 0, kg: 0, xn: 0, xg: 0}};
 skillOf({names: nm, seats: sd2, log: lg}, P3); ok('出局后的夜刀、放逐不算', P3['老王'].kn === 1 && P3['老王'].xn === 1, P3['老王']);
 saveHist([{id: 'k1', end: Date.now(), board: 'std', day: 2, win: {side: 'good', why: 'x'}, names: nm, seats: sd, log: lg}]);
 openStats(); ok('统计页显示神民、狼人表现', sh().includes('警徽票正确率') && sh().includes('投狼正确率') && sh().includes('屠神率') && sh().includes('抗推率') && [...document.querySelectorAll('#sheet .pl')].find(e => e.textContent.includes('老王')).textContent.includes('50%'));
 ok('神民只显示神民表现', ![...document.querySelectorAll('#sheet .pl')].find(e => e.textContent.includes('小明')).textContent.includes('屠神率'));
 saveHist([['std', 'good', 3], ['std', 'wolf', 5], ['std', null, 2], ['xiyou', 'wolf', 4]].map(([b, w, d], i) => ({id: 's' + i, end: Date.now() - i * 1e6, board: b, day: d, win: w ? {side: w, why: 'x'} : null, names: nm, seats: sd, log: [{t: '第1夜', x: 'x'}]})));
 openStats(); ok('玩家显示总胜率、神民胜率、狼人胜率', sh().includes('总胜率') && sh().includes('神民胜率') && sh().includes('狼人胜率') && [...document.querySelectorAll('#sheet .pl')].find(e => e.textContent.includes('老王')).textContent.includes('67%'));
 ok('统计页内容', sh().includes('对局统计') && sh().includes('好人胜') && sh().includes('标准版') && sh().includes('西游杀') && sh().includes('小明') && sh().includes('不上传'));
 ok('统计含当前对局', statGames().length === 5 && statGames()[0].id === S.id);
 ok('统计页可回历史', !!SB('历史对局')); SB('历史对局').click(); ok('历史页有统计入口', !!SB('对局统计'));
 saveHist([]); S.log = []; openStats(); ok('没有对局时提示', sh().includes('还没有对局')); close_();
 // ---------- 复盘长图 ----------
 day1(); S.names[11] = '陈大文陈大文陈大文'; for (let i = 0; i < 30; i++) L('测试记录很长很长的一行，看看能不能自动换行显示，第' + i + '条｜第二行');
 const cv = await drawReview(S); ok('长图尺寸', cv.width === 1080 && cv.height > 2000, [cv.width, cv.height]);
 const px = cv.getContext('2d').getImageData(10, 10, 1, 1).data; ok('长图背景', px[0] === 0x2b && px[1] === 0x22 && px[2] === 0x16, [...px]);
 ok('换行', wrapText(cv.getContext('2d'), '一'.repeat(200), 300).length > 3);
 await makeImage(); ok('长图预览', !!document.querySelector('#sheet img.lp') && lastImg && /^狼人杀复盘-\d{8}-\d{4}\.png$/.test(lastImg.name) && lastImg.blob.type === 'image/png', lastImg && lastImg.name);
 let dl = null; const oc = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { dl = this.download; };
 await saveImage(); HTMLAnchorElement.prototype.click = oc; ok('电脑上下载图片', dl === lastImg.name);
 S.hide = true; S.win = null; askImage(); ok('隐藏模式先确认', sh().includes('显示全部玩家的身份') && !document.querySelector('#sheet img.lp')); S.hide = false;
 openLog(); ok('记录页有长图按钮', !!SB('生成复盘长图'));
 archive(); const hid = S.id; openHist(hid); ok('历史详情有长图按钮', !!SB('长图'));
 await makeImage(hid); ok('历史对局生成长图', !!document.querySelector('#sheet img.lp') && sh().includes('返回'));
 // ---------- 大屏公开模式 ----------
 day1([1, 3], 5);
 openPub(); ok('大屏说明', sh().includes('不显示任何身份') && !!SB('本机全屏显示') && !!SB('新窗口打开'));
 SB('本机全屏显示').click(); const pt = app();
 ok('大屏不显示身份', !/预言家|女巫|猎人|白痴|狼人|平民/.test(pt) && !document.querySelector('#app img,#app .seat'), pt.slice(0, 200));
 ok('大屏显示名字和阶段', pt.includes('小明') && pt.includes('第1天') && pt.includes('警长竞选'));
 ok('竞选时不公布昨夜死讯', !document.querySelector('.ps.out') && pt.includes('上警'));
 sheriff_(3); settle(); ok('公布后显示出局', document.querySelectorAll('.ps.out').length === 1 && app().includes('警长') && !app().includes('上警'));
 window._tk = {k: 'day', dir: 1, st: 1, last: false}; talkGo(); ok('大屏显示发言人和计时', app().includes('1号 小明 发言中') && document.querySelector('.ps.now') && /\d:\d\d/.test(document.querySelector('#ptm').textContent));
 doExile(9); ok('放逐公开', app().includes('放逐') && document.querySelectorAll('.ps.out').length === 2);
 S.hide = true; render(); ok('隐藏模式下大屏照常', app().includes('小明') && !/预言家|狼人/.test(app())); S.hide = false;
 nextNight(); ok('夜里显示天黑', app().includes('天黑请闭眼') && document.documentElement.classList.contains('pubm') && !document.documentElement.classList.contains('dim'));
 doDie(5, 'night'); ok('夜里手动标的死亡不显示', document.querySelectorAll('.ps.out').length === 2);
 AB('返回法官界面').click(); ok('返回法官界面', !pubOn && !!document.querySelector('.seat') && !document.documentElement.classList.contains('pubm'));
 pubOn = true; render(); document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'})); ok('Esc 退出大屏', !pubOn);
 ok('数据已存盘', localStorage.getItem(KEY) === JSON.stringify(S));
 ok('页面无 undefined', !/undefined|NaN/.test(app()));
 // ---------- 记录显示、撕毁警徽 ----------
 day1(); sheriff_(3); settle(); openLog();
 ok('记录按夜/天分段', [...document.querySelectorAll('#sheet .lgh')].map(e => e.textContent.trim()).join() === '第1夜,第1天', [...document.querySelectorAll('#sheet .lgh')].map(e => e.textContent));
 ok('天亮天黑分隔行不再单列', !sh().includes('—— 天亮 ——'));
 ok('号码加粗、身份上色', !!document.querySelector('#sheet .log em.no') && !!document.querySelector('#sheet .log em.r.wolf') && !!document.querySelector('#sheet .log em.r.god'));
 ok('死亡标色、警长标色', !!document.querySelector('#sheet .log li.dead') && !!document.querySelector('#sheet .log li.badge'));
 ok('标签单列', [...document.querySelectorAll('#sheet .log .lk')].some(e => e.textContent === '狼刀'));
 tapSeat(2); ok('警长座位有移交 / 撕毁', !!SB('移交 / 撕毁警徽')); SB('移交 / 撕毁警徽').click();
 ok('打开移交弹层', sh().includes('撕毁警徽')); SB('撕毁警徽').click();
 ok('撕毁后没有警长、警徽流失', !S.seats.some(s => s.badge) && S.badgeLost && S.log.at(-1).x.includes('撕毁警徽'));
 ok('首夜没有上警步骤', Object.values(BOARDS).every(b => !b.n1.includes('sheriff')));
 day1([], 0); ok('白天竞选先举手上警', document.querySelector('.side .say').textContent.includes('要竞选警长的玩家请举手') && !S.log.some(l => l.x.startsWith('上警')));
 S.police = [1, 3, 5]; save(); openVote('sheriff'); S.v.m = {2: 1, 4: 1, 6: 3, 7: 5}; voteOk(); openLog();
 ok('警长投票显示计票表', !!document.querySelector('#sheet li.vote.badge') && document.querySelectorAll('#sheet li.vote .vr:not(.vn)').length === 3 && sh().includes('2 票') && sh().includes('2、4'), sh().slice(-300));
 ok('票多的标出', document.querySelector('#sheet li.vote .vr.top em').textContent === '1号');
 close_(); openVote('exile'); S.v.m = {2: 9, 4: 9, 6: 10, 7: 10}; voteOk(); openLog();
 ok('平票 PK 分轮显示', document.querySelectorAll('#sheet li.vote').length === 2 && !document.querySelectorAll('#sheet li.vote')[1].querySelector('.top') && sh().includes('平票 PK'));
 close_(); S.v.m = {1: 9, 2: 9, 3: 10}; voteOk(); openLog(); ok('PK 轮标出 PK', [...document.querySelectorAll('#sheet li.vote .lk small')].some(e => e.textContent === 'PK') && sh().includes('弃票') && sh().includes('2.5 票'), sh().slice(-300));
 close_(); day1(); sheriff_(3); settle(); tapSeat(2); SB('移交 / 撕毁警徽').click(); SB('撕毁警徽').click();
 tapSeat(2); ok('撕毁后不再显示', !SB('移交 / 撕毁警徽')); close_(); doUndo(); ok('撕毁可撤销', seat(3).badge && !S.badgeLost);
} catch (e) { T.push('EXC ' + e.message + ' ' + e.stack); }
pubOn = false; close_(); render(); ADV = 350;
return JSON.stringify({pass, fails: T});
})()
