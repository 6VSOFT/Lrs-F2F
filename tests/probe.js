(() => {
const T=[],ok=(n,c,d)=>T.push((c?'PASS ':'FAIL ')+n+(c?'':' '+(d===undefined?'':JSON.stringify(d))));
try{ADV=0}catch(e){}
const setup=(b,roles,night=true)=>{startGame(b);roles.split(' ').forEach((k,i)=>S.seats[i].role=k);S.night=night;settle();close_();};
const tap=n=>pkTap(n);
const HY='hybrid wolf wolf wolf wolf seer hunter idiot witch villager villager villager';
const STD='wolf wolf wolf wolf villager villager villager villager seer witch hunter idiot';
const NM='wolf wolf wolf nightmare seer witch hunter dreamer villager villager villager villager';
const KN='wolf wolf wolf beauty seer witch guard knight villager villager villager villager';
const BL='wolf wolf wolf bloodmoon seer witch witchhunter idiot villager villager villager villager';
const ME='medium witch hunter guard villager villager villager villager wolf wolf wolf mechwolf';
setup('hybrid',HY);S.model=5;settle();setRole(0,null);setRole(4,null);setRole(4,'hybrid');ok('榜样不能是混血儿自己',S.model!==5,S.model);
setup('mech',ME,false);S.mech={n:3,role:'hunter',day:1};settle();setRole(2,null);setRole(2,'guard');ok('学习对象更正身份后同步',S.mech.role===S.seats[2].role,S.mech);
setup('nightmare',NM);pickT('fear');tap(1);const k0=S.n.knife;pickT('fear');tap(5);ok('改恐惧后刀口需重选',k0===0&&S.n.knife===null,[k0,S.n.knife]);
setup('blood',BL,false);boom(4,'');doRevive(3);ok('自爆误操作恢复',S.d===null&&S.sealed===0&&!!document.querySelector('#app').textContent.includes('自爆'),[S.d,S.sealed]);
setup('beauty',KN,false);pickDuel();tap(1);doRevive(0);ok('决斗狼误操作恢复',S.d===null&&!S.knightUsed,[S.d,S.knightUsed]);
setup('beauty',KN,false);pickDuel();tap(9);doRevive(7);ok('决斗好人误操作恢复',!S.knightUsed,S.knightUsed);
setup('std',STD,false);doDie(4,'night');ok('白天补记夜间阵亡时间',S.seats[4].at==='第1夜',S.seats[4].at);
setup('std',STD);S.n.knife=0;S.n.step=stepsOf().indexOf('dawn');doDie(4,'night');ok('手动夜间阵亡不显示平安夜',!document.querySelector('.wiz').textContent.includes('平安夜'));confirmDawn();ok('手动夜间阵亡日志',!S.log.some(l=>l.x==='平安夜')&&S.log.some(l=>/昨夜死亡.*5号/.test(l.x)),S.log.map(l=>l.x).slice(-3));
setup('std',STD);doBadge(4);S.n.knife=5;S.n.step=stepsOf().indexOf('dawn');settle();confirmDawn();ok('警长夜死提醒移交',/警徽/.test(document.querySelector('.wiz').textContent));
setup('std',STD,false);doBadge(4);doDie(4,'night');ok('警长被枪提醒移交',/警徽/.test(document.querySelector('.wiz').textContent));
ok('emoji 名字不截断半个',!/[\ud800-\udbff](?![\udc00-\udfff])/.test(cleanName('1234567😀')));
const os=Storage.prototype.setItem;let threw='';Storage.prototype.setItem=()=>{throw new DOMException('q','QuotaExceededError')};try{upd(()=>{S.n.step=0})}catch(e){threw=e.name}Storage.prototype.setItem=os;ok('存储不可用时不崩',!threw,threw);
// IME
let saved=0;openNames();const e1={key:'Enter',isComposing:false,keyCode:229};const inp=document.querySelectorAll('.nms input');inp[0].focus();nameKey(e1,0);ok('Safari 输入法回车不跳格',document.activeElement===inp[0]);close_();
// sheet scroll reset
for(let i=0;i<60;i++)S.log.push({t:'x',x:'行'+i});openLog();const sh=document.querySelector('#sheet');sh.scrollTop=9999;const st=sh.scrollTop;close_();openLog();ok('弹层滚动复位',st>0&&sh.scrollTop===0,[st,sh.scrollTop]);
sh.scrollTop=9999;newGame();ok('弹层切换滚动复位',sh.scrollTop===0,sh.scrollTop);close_();
return JSON.stringify(T);})()
