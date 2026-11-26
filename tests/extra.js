// 备份与恢复、口令语音播报、西游状态面板（在页面里执行，返回 JSON）
(() => {
ADV = 0;
const T = []; let pass = 0; const ok = (n, c, d) => { if (c) pass++; else T.push('FAIL ' + n + (d === undefined ? '' : ' ' + JSON.stringify(d))); };
const sh = () => document.querySelector('#sheet').textContent;
const SB = t => [...document.querySelectorAll('#sheet button')].find(b => b.textContent.includes(t) && !b.disabled);
try {
 // ---------- 备份 ----------
 localStorage.removeItem('lrs-backup-at'); localStorage.removeItem('lrs-history');
 startGame('std'); 'seer witch hunter idiot villager villager villager villager wolf wolf wolf wolf'.split(' ').forEach((k, i) => S.seats[i].role = k);
 S.names[0] = '小明'; S.n.knife = 5; S.n.step = stepsOf().length - 1; settle(); confirmDawn(); close_();
 const A = S.id, d = bkData();
 ok('备份内容', d.app === 'lrs-werewolf' && d.game.id === A && Array.isArray(d.history) && d.ver === VER && typeof d.settings === 'object');
 openMenu(); ok('菜单有备份入口', sh().includes('备份与恢复') && sh().includes('从未导出'));
 openBackup(); ok('备份页说明只存本机', sh().includes('不会上传') && sh().includes('从未导出'));
 let dl = null; const oc = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { dl = this.download; };
 exportBackup(); HTMLAnchorElement.prototype.click = oc;
 ok('电脑上直接下载', /^狼人杀备份-\d{8}-\d{4}\.json$/.test(dl || ''), dl);
 ok('记下导出时间', bkAt() > 0 && sh().includes('上次导出'));
 const text = JSON.stringify(d);
 startGame('mech'); const B = S.id; S.log.push({t: '第1夜', x: '测试'}); save();
 askImport('{"x":1}'); ok('不是备份文件不能导入', sh().includes('无法导入'));
 askImport('不是 JSON'); ok('坏文件不能导入', sh().includes('无法导入'));
 localStorage.setItem('lrs-dim', '1'); dimOn = true;
 const d2 = JSON.parse(text); d2.settings['lrs-dim'] = '0';
 askImport(JSON.stringify(d2)); ok('导入前确认', sh().includes('导入这份备份') && sh().includes('标准版'));
 SB('确认导入').click();
 ok('导入后换成备份里的对局', S.id === A && S.board === 'std' && S.names[0] === '小明' && S.day === 1 && !S.night);
 ok('原对局存入历史', loadHist().some(g => g.id === B));
 ok('设置一起导入', localStorage.getItem('lrs-dim') === '0' && dimOn === false);
 ok('已存盘', JSON.parse(localStorage.getItem(KEY)).id === A);
 doUndo(); ok('撤销回到导入前', S.id === B && !loadHist().some(g => g.id === B));
 localStorage.setItem('lrs-dim', '1'); dimOn = true;
 // 历史合并：去重、按时间、最多 20 局
 const H = Array.from({length: 18}, (_, i) => ({id: 'h' + i, end: 1e12 + i, board: 'std', day: 2, win: null, names: Array(12).fill(''), seats: d.game.seats, log: [{t: '第1夜', x: 'x'}]}));
 saveHist(H.slice(0, 10)); const d3 = JSON.parse(text); d3.history = H.slice(5);
 askImport(JSON.stringify(d3)); SB('确认导入').click();
 const hs = loadHist(); ok('历史按局合并、最多 20 局', hs.length === 19 && new Set(hs.map(g => g.id)).size === 19 && hs[0].end >= hs[1].end, hs.length);
 // 提醒
 localStorage.removeItem('lrs-backup-at'); saveHist(H.slice(0, 16)); openHistory(); ok('15 局以上没备份时提醒', sh().includes('没有导出备份') && !!SB('去备份'));
 localStorage.setItem('lrs-backup-at', String(Date.now())); openHistory(); ok('刚备份过不提醒', !sh().includes('没有导出备份'));
 localStorage.setItem('lrs-backup-at', String(Date.now() - 8 * 864e5)); openHistory(); ok('超过 7 天再提醒', sh().includes('超过 7 天'));
 close_(); saveHist([]);

 // ---------- 语音播报 ----------
 const said = []; const ss = window.speechSynthesis;
 ok('浏览器支持语音', TTS === !!ss);
 if (ss) {
  ss.speak = u => said.push(u.text); ss.cancel = () => {};
  startGame('std'); 'seer witch hunter idiot villager villager villager villager wolf wolf wolf wolf'.split(' ').forEach((k, i) => S.seats[i].role = k); S.n.knife = 5;
  S.n.step = stepsOf().indexOf('witch'); settle(); close_();
  ok('口令下有朗读按钮', !!document.querySelector('.spk button'));
  document.querySelector('.spk button').click();
  const t = said.at(-1) || '';
  ok('朗读女巫口令', t.includes('女巫请睁眼') && t.includes('女巫请闭眼'), t);
  ok('刀口号码不念', !/5|【|】/.test(t) && t.includes('这名玩家'), t);
  ok('括号里的法官提示不念', !t.includes('（') && !t.includes('使用请比'), t);
  voiceOn = false; said.length = 0; S.n.step = stepsOf().indexOf('hunter'); render(); ok('关闭时换步不自动念', said.length === 0);
  openMenu(); SB('口令语音播报').click(); ok('菜单开启播报', voiceOn && localStorage.getItem('lrs-voice') === '1' && sh().includes('已开启'));
  close_(); said.length = 0; document.querySelector('.wf .pri').click(); ok('开启后换步自动念', said.length === 1 && said[0].includes('白痴'), said);
  render(); render(); ok('同一步不重复念', said.length === 1);
  document.querySelector('.wf .btn').click(); ok('上一步也念', said.length === 2 && said[1].includes('猎人'), said);
  openMenu(); SB('播报语速').click(); ok('语速可调', voiceRate === 1.2 && localStorage.getItem('lrs-voice-rate') === '1.2'); SB('播报语速').click(); SB('播报语速').click(); ok('语速循环', voiceRate === .8); SB('播报语速').click();
  SB('口令语音播报').click(); ok('菜单关闭播报', !voiceOn && localStorage.getItem('lrs-voice') === '0'); close_();
  startGame('std'); S.night = false; render(); ok('白天没有朗读按钮', !document.querySelector('.spk'));
 }

 // ---------- 西游状态面板 ----------
 const D0 = 'wukong zixia guanyin heixiong villager villager villager villager erlang tianbing tianbing tianbing'.split(' ');
 startGame('std'); render(); ok('其他板子没有西游面板', !document.querySelector('.xyp'));
 startGame('xiyou'); D0.forEach((k, i) => S.seats[i].role = k); settle(); close_();
 const P = () => document.querySelector('.xyp').textContent;
 ok('西游面板', !!document.querySelector('.xyp') && P().includes('孙悟空') && P().includes('二郎神') && P().includes('唐僧5号'));
 S.n.wkT = [5]; S.n.step = stepsOf().indexOf('wukong'); settle(); ok('今晚寻到显示', P().includes('镇魔圈今晚得'), P());
 S.n.step = stepsOf().length - 1; settle(); confirmDawn(); close_(); ok('天亮后显示第几夜得', P().includes('镇魔圈第1夜得'), P());
 Object.assign(S.xy.erlang, {A: 1, B: 1, C: 1, usedB: true, awake: 1}); S.xy.gyUsed = true; S.xy.bound = 6; S.xy.lastZx = 4; render();
 ok('觉醒、B 已用、观音、紫霞', P().includes('觉醒第1夜') && P().includes('三尖两刃刀已用') && P().includes('甘露水已用') && P().includes('收服6号') && P().includes('紫霞上次4号'), P());
 S.seats[5].dead = 'exile'; render(); ok('收服者出局', P().includes('6号 已出局'));
 S.hide = true; render(); ok('隐藏模式遮住面板', document.querySelector('.xyp').classList.contains('mask') && getComputedStyle(document.querySelector('.xyp small')).color === 'rgba(0, 0, 0, 0)');
 S.hide = false; render();
} catch (e) { T.push('ERROR ' + e.stack.slice(0, 600)); }
close_();
return JSON.stringify({pass, fails: T});
})()
