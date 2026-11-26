// 假面舞会：舞者共舞、假面询问与面具、舞池免刀、毒药免疫、舞池出局（在页面里执行，返回 JSON）
(() => {
ADV = 0;
const T = []; let pass = 0; const ok = (n, c, d) => { if (c) pass++; else T.push('FAIL ' + n + (d === undefined ? '' : ' ' + JSON.stringify(d))); };
const side = () => document.querySelector('.side').textContent, sh = () => document.querySelector('#sheet').textContent;
const R0 = 'seer witch dancer idiot villager villager villager villager wolf wolf wolf mask'.split(' ');
const titles = () => stepsOf().map(k => STEPS[k]().t).join(' ');
// 第 2 夜：首夜无刀，白天无人放逐
const night2 = () => { startGame('masq'); R0.forEach((k, i) => S.seats[i].role = k); S.n.knife = 0; S.n.step = stepsOf().length - 1; settle(); confirmDawn(); close_(); doExile(0); nextNight(); };
const go = k => { S.n.step = stepsOf().indexOf(k); render(); };
const dawnRes = () => { S.n.step = stepsOf().length - 1; render(); return resolve(); };
try {
 ok('有假面舞会板子', BOARDS.masq && BOARDS.masq.name === '假面舞会' && Object.values(BOARDS.masq.cnt).reduce((a, b) => a + b, 0) === 12);
 ok('身份数', BOARDS.masq.cnt.dancer === 1 && BOARDS.masq.cnt.mask === 1 && BOARDS.masq.cnt.wolf === 3 && BOARDS.masq.cnt.villager === 4 && R.mask.c === 'wolf' && R.dancer.c === 'god');
 startGame('masq'); ok('首夜流程', titles() === '天黑 狼人 女巫 预言家 舞者 假面 白痴 天亮结算', titles());
 ok('首夜狼队只有 3 狼', packWant() === 3);
 go('dancerId'); ok('首夜舞者只确认身份', side().includes('从第 2 夜起') && ![...document.querySelectorAll('.side .row span')].some(e => e.textContent === '共舞'));
 night2(); ok('第 2 夜流程', titles() === '天黑 舞者 狼人 假面 女巫 预言家 天亮结算', titles());
 ok('首夜记录假面和舞者身份', S.log[0].x.includes('假面12号') && S.log[0].x.includes('舞者3号'), S.log[0].x);
 // 共舞
 go('dancer'); ok('舞者要先选 3 人', side().includes('共舞') && !STEPS.dancer().ok);
 pickDance(); ok('选人弹层多选 3 人', sh().includes('舞者与哪三位共舞'));
 [1, 3, 9].forEach(n => pkTap(n)); pkOk(); ok('共舞 3 人', S.n.dance.join() === '1,3,9' && STEPS.dancer().ok);
 ok('少数阵营出局预告', side().includes('好人 2、狼人 1') && side().includes('9号') && side().includes('出局'));
 ok('座位标“舞”', [...document.querySelectorAll('.seat')][8].textContent.includes('舞'));
 S.n.dance = [1, 2, 5]; ok('同阵营无事', danceOut().out === 0); render(); ok('同阵营提示', side().includes('同阵营'));
 S.n.dance = [9, 10, 5]; ok('2 狼 1 好人：好人出局', danceOut().out === 5);
 // 假面
 S.n.dance = [1, 5, 9]; go('mask'); ok('假面先询问再戴面具', side().includes('询问') && side().includes('面具') && !STEPS.mask().ok);
 S.n.mkQ = 5; render(); ok('询问在舞池', side().includes('5号：在舞池'));
 S.n.mkQ = 6; render(); ok('询问不在舞池', side().includes('6号：不在舞池'));
 S.n.mkM = 5; render(); ok('面具反转阵营', danceOut().out === 1 && side().includes('5号戴面具'), danceOut());
 S.n.mkM = 2; ok('面具给舞池外的人无效', danceOut().out === 9);
 S.n.mkM = 12; ok('面具可以给自己', TG.mkM[1](seat(12)));
 S.n.mkM = 9; ok('面具给狼人：变好人阵营', danceOut().out === 0);
 S.n.mkM = 0; ok('可以不戴', STEPS.mask().ok);
 ok('假面不能询问自己', !TG.mkQ[1](seat(12)));
 // 结算
 S.n.dance = [3, 5, 6]; S.n.mkM = 0; S.n.knife = 5; let r = dawnRes();
 ok('舞者在舞池：舞池免疫狼刀', !r.D.includes(5) && r.N.some(x => x.includes('免疫狼刀')), r);
 S.n.dance = [1, 5, 6]; r = dawnRes(); ok('舞者不在舞池：照常被刀', r.D.includes(5), r);
 S.n.dance = []; S.n.knife = 0; S.n.poison = 3; r = dawnRes(); ok('舞者免疫毒药', !r.D.includes(3) && r.N.some(x => x.includes('舞者免疫毒药')));
 S.n.poison = 12; r = dawnRes(); ok('假面免疫毒药', !r.D.includes(12) && r.N.some(x => x.includes('假面免疫毒药')));
 S.n.poison = null; S.n.dance = [1, 5, 9]; S.n.knife = 9; S.n.anti = true; r = dawnRes(); ok('舞池出局解药救不了', r.D.includes(9) && r.N.some(x => x.includes('舞池结算')), r);
 S.n.anti = false; S.n.knife = 2; S.n.mkQ = 1; S.n.mkM = 5; r = dawnRes(); ok('面具改变结算', r.D.join() === '1,2', r);
 confirmDawn(); close_();
 ok('天亮记录共舞与面具', S.log.some(l => l.x === '舞者：共舞 1、5、9号') && S.log.some(l => l.x.startsWith('假面：询问 1号（在舞池）｜面具 5号')), S.log.slice(-8).map(l => l.x));
 ok('记住进过舞池的人', S.danced.join() === '1,5,9' && S.lastMask === 5);
 doExile(0); nextNight(); go('dancer');
 ok('进过舞池的不能再进', !danceable().includes(5) && !danceable().includes(9) && danceable().includes(3));
 ok('面具不能连续两晚同一人', !TG.mkM[1](seat(5)) && TG.mkM[1](seat(6)));
 // 可进舞池不足 3 人
 S.danced = S.seats.map(s => s.n).filter(n => n > 3); render(); ok('不足 3 人技能失效', side().includes('不足 3 人') && STEPS.dancer().ok);
 // 舞者出局：空喊
 night2(); seat(3).dead = 'exile'; seat(3).at = '第1天'; S.n.dance = [1, 5, 9]; settle(); go('dancer'); ok('舞者出局空喊、不共舞', side().includes('已出局') && S.n.dance.length === 0 && STEPS.dancer().ok);
 // 普通狼人全部出局：假面带刀
 night2(); [9, 10, 11].forEach(n => { seat(n).dead = 'exile'; seat(n).at = '第1天'; }); settle(); go('wolf');
 ok('普狼出局后假面带刀', side().includes('假面带刀'), side().slice(0, 300));
 S.n.knife = 4; r = dawnRes(); ok('假面刀人生效', r.D.includes(4));
 // 速查
 ok('速查有舞者、假面说明', roleInfo('dancer', 'masq').includes('共舞') && roleInfo('mask', 'masq').includes('面具'));
 ok('首页有假面舞会', (home = true, render(), [...document.querySelectorAll('.home .bd')].some(b => b.textContent.includes('假面舞会'))));
 home = false; render();
 ok('页面无 undefined', !/undefined|NaN/.test(document.body.textContent));
} catch (e) { T.push('EXC ' + e.message + ' ' + e.stack); }
close_(); ADV = 350;
return JSON.stringify({pass, fails: T});
})()
