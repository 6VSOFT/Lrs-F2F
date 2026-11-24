const VER='v23'; // 与 sw.js 的版本号一致
let newSW=null,applying=false; // 已下载、等待启用的新版
/* ---------- 身份与板子 ---------- */
// c：阵营 god 神职 / villager 平民（含混血儿） / wolf 狼人
const ROLES=[
 ['seer','预言家','god'],['medium','通灵师','god'],['witch','女巫','god'],['hunter','猎人','god'],['idiot','白痴','god'],['guard','守卫','god'],
 ['knight','骑士','god'],['magician','魔术师','god'],['merchant','黑市商人','god'],['dreamer','摄梦人','god'],['grave','守墓人','god'],['witchhunter','猎魔人','god'],
 ['hybrid','混血儿','villager'],['villager','平民','villager'],
 ['wolf','狼人','wolf'],['wolfking','狼王','wolf'],['demon','恶魔','wolf'],['beauty','狼美人','wolf'],['elder','狼兄','wolf'],['younger','狼弟','wolf'],
 ['gargoyle','石像鬼','wolf'],['mechwolf','机械狼','wolf'],['nightmare','噩梦之影','wolf'],['bloodmoon','血月使徒','wolf']].map(([k,n,c])=>({k,n,c}));
const R=Object.fromEntries(ROLES.map(r=>[r.k,r]));
// cnt：各身份张数（合计 12）；pack：首夜一起睁眼的狼；mark：在狼人环节里单独确认的特殊狼
// n1 / n2：首夜 / 第 2 夜起的流程
const B4={seer:1,witch:1,hunter:1,villager:4,wolf:3};
const BOARDS={
 hybrid:{name:'预女猎白混',desc:'预女猎白混 + 3民 + 4狼',cnt:{seer:1,witch:1,hunter:1,idiot:1,hybrid:1,villager:3,wolf:4},pack:['wolf'],
  n1:'close hybrid wolf witch seer hunter idiot sheriff dawn',n2:'close wolf witch seer hunter dawn'},
 std:{name:'标准版 预女猎白',desc:'预女猎白 + 4民 + 4狼',cnt:{...B4,idiot:1,wolf:4},pack:['wolf'],
  n1:'close wolf witch seer hunter idiot sheriff dawn',n2:'close wolf witch seer hunter dawn'},
 wkguard:{name:'狼王守卫',desc:'预女猎守 + 4民 + 3狼 + 狼王',cnt:{...B4,guard:1,wolfking:1},pack:['wolf','wolfking'],mark:'wolfking',
  n1:'close guard wolf witch seer hunter sheriff dawn',n2:'close guard wolf witch seer hunter dawn'},
 demon:{name:'恶魔守卫',desc:'预女猎守 + 4民 + 3狼 + 恶魔',cnt:{...B4,guard:1,demon:1},pack:['wolf','demon'],
  n1:'close guard wolf witch seer hunter demon sheriff dawn',n2:'close guard wolf witch seer hunter demon dawn'},
 beauty:{name:'狼美人骑士',desc:'预女守骑 + 4民 + 3狼 + 狼美人',cnt:{seer:1,witch:1,guard:1,knight:1,villager:4,wolf:3,beauty:1},pack:['wolf','beauty'],
  n1:'close guard wolf beauty witch seer knight sheriff dawn',n2:'close guard wolf beauty witch seer dawn'},
 magician:{name:'狼王魔术师',desc:'预女猎魔术 + 4民 + 3狼 + 狼王',cnt:{...B4,magician:1,wolfking:1},pack:['wolf','wolfking'],mark:'wolfking',
  n1:'close magician wolf witch seer hunter wolfking sheriff dawn',n2:'close magician wolf witch seer hunter wolfking dawn'},
 bros:{name:'狼兄狼弟黑市商人',desc:'预女商守 + 4民 + 2狼 + 狼兄弟',cnt:{seer:1,witch:1,merchant:1,guard:1,villager:4,wolf:2,elder:1,younger:1},pack:['wolf','elder'],
  n1:'close merchant guard bros wolf witch seer lucky sheriff dawn',n2:'close merchant guard younger wolf witch seer lucky dawn'},
 wkdream:{name:'狼王摄梦人',desc:'预女猎摄 + 4民 + 3狼 + 狼王',cnt:{...B4,dreamer:1,wolfking:1},pack:['wolf','wolfking'],mark:'wolfking',
  n1:'close dreamer wolf witch seer hunter sheriff dawn',n2:'close dreamer wolf witch seer hunter dawn'},
 gargoyle:{name:'石像鬼守墓人',desc:'预女猎墓 + 4民 + 3狼 + 石像鬼',cnt:{...B4,grave:1,gargoyle:1},pack:['wolf'],
  n1:'close wolf witch gargoyleId seer hunter grave gargoyle sheriff dawn',n2:'close gargoyle wolf witch seer hunter grave dawn'},
 mech:{name:'机械狼通灵师',desc:'通女猎守 + 4民 + 3狼 + 机械狼',cnt:{medium:1,witch:1,hunter:1,guard:1,villager:4,wolf:3,mechwolf:1},pack:['wolf'],
  n1:'close guard wolf witch hunter mediumId mech medium sheriff dawn',n2:'close guard mech wolf witch medium hunter mechgun dawn'},
 nightmare:{name:'噩梦之影摄梦人',desc:'预女猎摄 + 4民 + 3狼 + 噩梦之影',cnt:{...B4,dreamer:1,nightmare:1},pack:['wolf'],
  n1:'close nightmare dreamer wolf witch seer hunter sheriff dawn',n2:'close nightmare dreamer wolf witch seer hunter dawn'},
 blood:{name:'血月使徒猎魔人',desc:'预女猎魔白 + 4民 + 3狼 + 血月',cnt:{seer:1,witch:1,witchhunter:1,idiot:1,villager:4,wolf:3,bloodmoon:1},pack:['wolf','bloodmoon'],mark:'bloodmoon',
  n1:'close wolf witch seer witchhunter idiot sheriff dawn',n2:'close wolf witch seer witchhunter dawn'}};
for(const b of Object.values(BOARDS)){b.n1=b.n1.split(' ');b.n2=b.n2.split(' ');}
const CAUSE={exile:'放逐出局',night:'夜间阵亡',shot:'枪杀出局',duel:'决斗出局',boom:'自爆出局',love:'殉情出局'};
const SKILL={check:'查验',poison:'毒药',gun:'猎枪'};

/* ---------- 状态 ---------- */
const KEY='lrs-werewolf-v2';
const freshNight=()=>({step:0,guard:null,dream:null,fear:null,swap:null,knife:null,anti:false,poison:null,check:null,gcheck:null,dcheck:null,
 charm:null,hunt:null,bknife:null,trade:null,lcheck:null,lpoison:null,learn:null,mcheck:null,mpoison:null,mguard:null,mknife:null});
const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
// police 上警；out 退水；elLater 竞选延到第 2 天；v 记票草稿 {kind,round,c:PK 候选,m:{投票人:被投}}
const fresh=(board='hybrid')=>({id:newId(),board,out:[],elLater:false,v:null,names:Array(12).fill(''),police:[],day:1,night:true,hide:false,model:null,used:{anti:false,poison:false},
 lastGuard:0,lastDream:0,lastCharm:0,charmed:0,lastExile:0,swapped:[],traded:null,lucky:null,mech:null,mechUsed:{poison:false,guard:false},awakeDay:null,sealed:0,knightUsed:false,badgeDone:false,badgeLost:false,
 n:freshNight(),d:null,win:null,seats:Array.from({length:12},(_,i)=>({n:i+1,role:null,dead:null,at:'',badge:false,flip:false})),log:[]});
// 补齐旧存档、旧撤销记录缺少的字段
function norm(s){
  const o=Object.assign(fresh(),s);o.n=Object.assign(freshNight(),s.n);
  if(!BOARDS[o.board])o.board='hybrid'; // 旧存档默认原板子
  o.seats.forEach(x=>{if(x.flip&&!x.dead)x.dead='exile';}); // 旧存档：已翻牌的白痴补记为出局
  return o;
}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));return s&&s.seats?norm(s):fresh();}catch(e){return fresh();}}
// 撤销记录：内存留 200 步，存盘留最近 50 步（环形 50 格，每步只写一格），刷新后仍可撤销
const UK='lrs-undo',UN=50;
let uTop=0,uCnt=0,undoDirty='';
const uMeta=()=>localStorage.setItem(UK,JSON.stringify({t:uTop,c:uCnt}));
function loadUndo(){
 try{
  const m=JSON.parse(localStorage.getItem(UK))||{},a=[];uTop=m.t>0?m.t:0;uCnt=m.c>0?Math.min(m.c,UN):0;
  for(let k=uCnt-1;k>=0;k--){const x=localStorage.getItem('lrs-u'+(uTop-k)%UN);if(x&&JSON.parse(x).seats)a.push(x);else{a.length=0;}}
  uCnt=a.length;return a;
 }catch(e){uCnt=0;return [];}
}
function clearUndo(){try{for(let k=0;k<UN;k++)localStorage.removeItem('lrs-u'+k);uCnt=0;uMeta();}catch(e){}}
function saveUndo(){
 const d=undoDirty;undoDirty='';
 try{
  if(d==='push'){uTop++;uCnt=Math.min(UN,uCnt+1);localStorage.setItem('lrs-u'+uTop%UN,undo[undo.length-1]);}
  else{uTop--;uCnt=Math.max(0,uCnt-1);}
  uMeta();
 }catch(e){clearUndo();}
}
let S=load(), undo=loadUndo();
const BD=()=>BOARDS[S.board];
const cntOf=k=>BD().cnt[k]||0;
const $=s=>document.querySelector(s);
let saveOk=true;
function save(){
 const put=()=>localStorage.setItem(KEY,JSON.stringify(S));
 try{
  try{put();}catch(e){clearUndo();put();} // 空间不足时先让出撤销记录
  saveOk=true;
 }catch(e){if(saveOk)toast('无法存档：刷新后记录会丢失');saveOk=false;return;}
 if(undoDirty)saveUndo();
}
const label=()=>`第${S.day}${S.night?'夜':'天'}`;
const L=x=>S.log.push({t:label(),x});
const seatsOf=k=>S.seats.filter(s=>s.role===k);
const one=k=>seatsOf(k)[0];
const seat=n=>S.seats[n-1];
const isWolf=s=>!!(s&&s.role&&R[s.role].c==='wolf');
const inPack=s=>isWolf(s)&&(BD().pack.includes(s.role)||(s.role==='nightmare'&&S.day>1)||(s.role==='younger'&&S.awakeDay!==null&&S.awakeDay<S.day));
const packWant=()=>BD().pack.reduce((a,k)=>a+cntOf(k),0);
const nm=n=>S.names[n-1]?' '+S.names[n-1]:'';
const lab=n=>`${n}号${nm(n)}`;
const sn=n=>`${lab(n)}${seat(n).role?'·'+R[seat(n).role].n:''}`;
const snv=n=>S.hide?lab(n):sn(n); // 界面显示用：隐藏模式下不带身份
const used=k=>seatsOf(k).length;
const left=k=>cntOf(k)-used(k);
const snap=()=>{undo.push(JSON.stringify(S));if(undo.length>200)undo.shift();undoDirty='push';};
// 每次改动后：补平民、清掉失效录入、判胜负，再存盘和刷新界面
function settle(){autoVillagers();sync();enforce();const w=checkWin();save();render();if(w)showWin();}
function commit(text,fn){snap();fn();if(text)L(text);settle();}
function upd(fn){snap();fn();settle();}
function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(t._t);t._t=setTimeout(()=>t.style.display='none',1400);}
// 弹层新打开时回到顶部；已打开时（如多选重绘）保持位置
function sheet(h,keep){const e=$('#sheet');e.innerHTML=h;$('#bg').classList.add('show');if(!keep)e.scrollTop=0;}
// 防连点：避免双击“下一步”时把下一个环节也跳过
let ADV=350,advAt=0;
function adv(fn){const t=Date.now();if(t-advAt<ADV)return;advAt=t;fn();}
function close_(){$('#bg').classList.remove('show');}
$('#bg').addEventListener('click',e=>{if(e.target.id==='bg')close_();});
const pristine=()=>S.day===1&&S.night&&!S.log.length&&!S.seats.some(s=>s.role||s.dead||s.badge);

/* ---------- 胜负：屠边 ---------- */
// 神职全部出局或平民（含混血儿）全部出局 → 狼人胜；狼人全部出局 → 好人胜。同时达成按狼刀在先
function judge(){
 if(S.seats.some(s=>!s.role))return null;
 const c=k=>S.seats.filter(s=>!s.dead&&R[s.role].c===k).length,g=c('god'),v=c('villager'),w=c('wolf');
 const wolf=!g||!v?{side:'wolf',why:!g&&!v?'神职、平民全体出局':!g?'神职全体出局':'平民全体出局'}:null,good=!w?{side:'good',why:'狼人全体出局'}:null;
 if(S.win){const keep=S.win.side==='wolf'?wolf:good;if(keep)return S.win;} // 先达成的结果不变
 return wolf||good;
}
// 返回 true 表示刚刚分出胜负
function checkWin(){
 const o=S.win,j=judge();S.win=j;
 if(j&&(!o||o.side!==j.side)){L(`🏆 ${winText()}`);return true;}
 if(o&&!j)L('更正：胜负结果取消');
 return false;
}
const winText=(w=S.win)=>w.side==='wolf'?`狼人屠边获胜（${w.why}）`:`好人阵营获胜（${w.why}）`;
function showWin(){
 const w=S.win.side==='wolf';
 const gun=gunners().filter(s=>s.dead&&!s.shot&&!noGun(s)); // 刚出局、还没决定是否开枪的玩家
 sheet(`<div class="wn ${S.win.side}"><div class="wi">${w?'🐺':'🛡'}</div><h3>${w?'狼人屠边获胜':'好人阵营获胜'}</h3><p>${S.win.why}</p></div>${gun.length?note('刚有可开枪的玩家出局，请先处理开枪再宣布结果。'):''}
  <div class="opts">${gun.map(s=>`<button class="btn danger" style="grid-column:span 2" onclick="pickShot(${s.n})">🔫 ${lab(s.n)} 开枪</button>`).join('')}<button class="btn pri" style="grid-column:span 2" onclick="openLog()">📜 查看记录</button><button class="btn" onclick="close_()">继续对局</button><button class="btn" onclick="newGame()">🔄 新开一局</button></div>`);
}
const winBar=()=>S.win?`<div class="winbar ${S.win.side}" onclick="showWin()">🏆 ${winText()}</div>`:'';

/* ---------- 夜间判定 ---------- */
// 技能是否被挡：dead 出局 / fear 被恐惧 / seal 被血月封印
function blocked(k){
 const s=one(k);if(!s)return '';
 if(s.dead)return 'dead';
 if(S.n.fear===s.n&&k!=='nightmare')return 'fear';
 if(S.sealed===S.day&&R[k].c==='god')return 'seal';
 return '';
}
const BLK={dead:'已出局：照常念口令，空喊流程。',fear:'今夜被噩梦之影恐惧，不能使用技能，口令照念。',seal:'今夜被血月封印，不能使用技能，口令照念。'};
const blkNote=k=>blocked(k)?note(R[k].n+BLK[blocked(k)]):'';
// 魔术师交换后的实际号码
const mg=x=>{const w=S.n.swap;return x&&w&&w.length===2?(x===w[0]?w[1]:x===w[1]?w[0]:x):x;};
const awakeTonight=()=>{const e=one('elder'),y=one('younger');return !!(e&&e.dead&&y&&!y.dead&&S.awakeDay===null);};
// 查验结果：狼弟觉醒前验出好人
const seerWolf=s=>isWolf(s)&&!(s.role==='younger'&&S.awakeDay===null&&!awakeTonight());
const learned=()=>S.mech||(S.n.learn?{n:S.n.learn,role:seat(S.n.learn).role,day:S.day}:null);
const exactName=s=>!s.role?'未录入':R[s.role==='mechwolf'&&learned()&&learned().role?learned().role:s.role].n;
const packFeared=()=>{const f=S.n.fear&&seat(S.n.fear);return !!(f&&inPack(f));};
function resolve(){
 const n=S.n,C={},N=[];
 const die=(x,c)=>{
  if(!x||seat(x).dead||C[x])return;
  if(seat(x).role==='demon'){if(!N.includes('恶魔夜间免死。'))N.push('恶魔夜间免死。');return;} // 刀、毒等夜间伤害都无效
  C[x]=c;
 };
 const safe=x=>n.dream===x||n.mguard===x;
 const K=mg(n.knife||0),P=mg(n.poison||0),bk=n.bknife||0;
 [P,n.lpoison].forEach(x=>{if(!x||safe(x))return;if(seat(x).role==='witchhunter')N.push('猎魔人免疫毒药。');else die(x,'poison');});
 if(n.mpoison&&n.dream!==n.mpoison)die(n.mpoison,'poison'); // 机械狼的毒穿盾
 if(K&&bk===K){if(!safe(K))die(K,'knife');N.push(`${K}号 同时被狼队和狼弟袭击，解药与守护无效。`);}
 else{
  if(K&&!safe(K)){const g=n.guard===K;if(g===!!n.anti)die(K,'knife');if(g&&n.anti)N.push(`${K}号 同守同救，死亡。`);}
  if(bk&&!safe(bk)&&n.guard!==bk)die(bk,'knife');
 }
 if(n.mknife&&!safe(n.mknife)&&n.guard!==n.mknife)die(n.mknife,'knife');
 if(n.hunt){const h=one('witchhunter');if(isWolf(seat(n.hunt)))die(n.hunt,'hunt');else{die(h&&h.n,'hunt');N.push('猎魔人狩猎到好人，猎魔人死亡。');}}
 if(n.trade&&isWolf(seat(n.trade.n))){const m=one('merchant');die(m&&m.n,'trade');N.push('黑市商人与狼人交易，黑市商人死亡。');}
 if(n.dream&&n.dream===S.lastDream){die(n.dream,'dream');N.push(`${n.dream}号 连续两夜被摄梦，死亡。`);}
 for(let i=0;i<2;i++){
  const d=one('dreamer'),b=one('beauty');
  if(d&&C[d.n]&&n.dream&&!C[n.dream]&&!seat(n.dream).dead){die(n.dream,'dream');N.push(`摄梦人死亡，梦游者 ${n.dream}号 一同死亡。`);}
  if(b&&C[b.n]&&n.charm&&!C[n.charm]&&!seat(n.charm).dead){die(n.charm,'love');N.push(`狼美人死亡，被魅惑的 ${n.charm}号 殉情。`);}
 }
 return {C,N,D:Object.keys(C).map(Number).sort((a,b)=>a-b)};
}
// 昨夜死亡名单：结算结果 + 法官当夜手动标记的夜间阵亡
const nightDead=r=>[...r.D,...S.seats.filter(s=>s.dead==='night'&&s.at===label()).map(s=>s.n)].sort((a,b)=>a-b);
// 持枪身份：猎人 / 狼王 / 学到猎人的机械狼 / 拿到猎枪的幸运儿
const luckyGun=s=>!!S.lucky&&S.lucky.skill==='gun'&&S.lucky.n===s.n;
const isGun=s=>s.role==='hunter'||s.role==='wolfking'||(s.role==='mechwolf'&&!!S.mech&&S.mech.role==='hunter')||luckyGun(s);
const gunName=s=>luckyGun(s)?'幸运儿':R[s.role].n;
// 开枪窗口：当天出局（含昨夜死亡）的持枪玩家，天黑后仍可补记；幸运儿白天存活时也可开枪
const gunDay=()=>S.night?S.day-1:S.day;
const gunSpent=s=>luckyGun(s)&&S.lucky.used&&!(s.shot&&s.shot.day===gunDay()); // 幸运儿的枪在之前已用掉
const gunners=()=>S.seats.filter(s=>isGun(s)&&!gunSpent(s)&&(s.dead?[`第${gunDay()}天`,`第${gunDay()}夜`].includes(s.at):!S.night&&luckyGun(s)));
const gunTonight=s=>isGun(s)&&!(luckyGun(s)&&S.lucky.used);
// 不能开枪的原因
const noGun=s=>s.dead==='boom'?'自爆':s.dead==='love'?'殉情':s.ng||'';
// 今夜能否开枪（猎人 / 狼王 / 学到猎人的机械狼）
function noShoot(x){
 const c=resolve().C[x];
 if(c==='poison')return '被毒杀';if(c==='dream')return '死于梦中';if(c==='love')return '殉情';
 if(S.n.fear===x)return '被恐惧';if(S.sealed===S.day&&R[seat(x).role].c==='god')return '被血月封印';
 return '';
}

/* ---------- 夜间流程 ---------- */
const stepsOf=()=>S.day===1?BD().n1:BD().n2;
const row=(a,b,btn,fn,dis)=>`<div class="row"><span>${a}</span><b>${b}</b>${btn?`<button class="btn" ${dis?'disabled':''} onclick="${fn}">${btn}</button>`:''}</div>`;
const say=t=>`<div class="say">${t}</div>`;
const note=t=>`<div class="note">${t}</div>`;
const val=(n,none)=>n?lab(n):n===0?(none||'不使用'):'<i>未选</i>';
const res=(good,t)=>`<div class="res ${good?'good':'bad'}">${t}</div>`;
const eye=k=>`“${R[k].n}请睁眼。`, shut=k=>`<br>“${R[k].n}请闭眼。”`;
// 首夜录入身份的一行
const idRow=k=>S.day===1?row(R[k].n,val(one(k)&&one(k).n),'选择',`pickOne('${k}')`):'';
const has=k=>S.day>1||!!one(k);
// 选目标的一行：field 为 S.n 里的字段
const tgt=(label,field,o={})=>row(label,val(S.n[field],o.none),'选择',`pickT('${field}')`,o.dis);
const gun=(k,x)=>{const s=x||one(k);if(!s)return '';if(s.dead)return `<div class="res">${R[k].n}已出局 · 空喊约 5 秒</div>`;const w=noShoot(s.n);return w?res(0,`☠ 今晚${w} · 不可开枪（倒拇指/摇手）`):res(1,'✅ 可以开枪（大拇指）');};
const STEPS={
 close:()=>({t:'天黑',say:'“天黑请闭眼。”',body:note('确认所有玩家已闭眼。'+(S.day>1?'即使神职已出局，后续每个环节也要照常念完口令（空喊），防止场外信息泄露。':''))+
  (S.sealed===S.day?note('🌑 血月之夜：所有神职技能今夜被封印。'):'')+
  (pristine()?row('板子',BD().name,'换板子','newGame()')+row('玩家',S.names.some(x=>x)?`已录 ${S.names.filter(x=>x).length}/12`:'<i>未录名字</i>','录名字','openNames()'):'')}),
 hybrid:()=>({t:'混血儿',say:'“混血儿请睁眼。请指定你的榜样（1-12号）。”<br>（用手势确认榜样号码）<br>“混血儿请闭眼。”',
  body:idRow('hybrid')+row('榜样',val(S.model),'选择','pickModel()',!one('hybrid'))+note('混血儿属平民阵营，被预言家查验永远是好人。'),ok:!!(one('hybrid')&&S.model)}),
 guard:()=>{const b=blocked('guard');return {t:'守卫',say:eye('guard')+'今晚你要守护谁？”<br>（比划号码；空守请摇手）'+shut('guard'),
  body:idRow('guard')+blkNote('guard')+tgt('守护','guard',{none:'空守',dis:b})+note(`可以守自己，不能连续两夜守同一人${S.lastGuard?`（昨夜守 ${S.lastGuard}号）`:''}。守护挡不住毒药。`),ok:has('guard')&&(!!b||S.n.guard!==null)};},
 dreamer:()=>{const b=blocked('dreamer'),c=S.n.dream&&S.n.dream===S.lastDream;return {t:'摄梦人',say:eye('dreamer')+'今晚你要摄梦谁？”<br>（比划号码，每晚必须选择）'+shut('dreamer'),
  body:idRow('dreamer')+blkNote('dreamer')+tgt('摄梦','dream',{dis:b})+(c?res(0,`连续两夜摄梦 ${S.n.dream}号，将死于梦中`):'')+note(`梦游者当夜免疫狼刀和毒药；连续两夜摄同一人则该玩家死亡${S.lastDream?`（昨夜摄 ${S.lastDream}号）`:''}；摄梦人夜间死亡，梦游者一同死亡。`),ok:has('dreamer')&&(!!b||!!S.n.dream)};},
 nightmare:()=>{const b=blocked('nightmare');return {t:'噩梦之影',say:eye('nightmare')+'今晚你要恐惧谁？”<br>（比划号码）'+shut('nightmare'),
  body:idRow('nightmare')+blkNote('nightmare')+tgt('恐惧','fear',{none:'不恐惧',dis:b})+note('被恐惧的玩家当夜不能使用技能；恐惧到狼人，狼队当夜不能刀人。首夜不与狼队相认。'),ok:has('nightmare')&&(!!b||S.n.fear!==null)};},
 magician:()=>{const b=blocked('magician'),w=S.n.swap;return {t:'魔术师',say:eye('magician')+'今晚你要交换哪两位玩家的号码？”<br>（比划两个号码；不交换请摇手）'+shut('magician'),
  body:idRow('magician')+blkNote('magician')+row('交换',w===null?'<i>未选</i>':w.length?w.join(' ⇄ ')+'号':'不交换','选择','pickSwap()',b)+note(`只在今夜有效，每个号码整局只能被交换一次，可以换自己${S.swapped.length?`（已换过：${S.swapped.join('、')}号）`:''}。狼刀、毒药、查验会作用到交换后的玩家。`),ok:has('magician')&&(!!b||w!==null)};},
 merchant:()=>{const b=blocked('merchant'),t=S.n.trade,done=S.traded;return {t:'黑市商人',say:eye('merchant')+'今晚是否交易？请比划玩家号码和技能。”<br>（1 查验 / 2 毒药 / 3 猎枪；不交易请摇手）'+shut('merchant'),
  body:idRow('merchant')+blkNote('merchant')+(done?note(`已在第${done.day}夜与 ${done.n}号 交易（${SKILL[done.skill]}），整局只能交易一次。`):
   row('交易',t?`${lab(t.n)} · ${SKILL[t.skill]}`:'不交易','选择','pickTrade()',b)+note('整局一次，不能给自己。交给好人则成为幸运儿；交给狼人（含狼弟）则黑市商人死亡，狼人不知情。')),ok:has('merchant')};},
 bros:()=>({t:'狼兄狼弟',say:'“狼兄、狼弟请睁眼，请互相确认身份。”<br>“狼弟请闭眼。狼兄请闭眼。”',body:idRow('elder')+idRow('younger')+note('狼弟首夜不入狼窝，不参与狼刀；狼兄出局前，狼弟被查验是好人。'),ok:!!(one('elder')&&one('younger'))}),
 younger:()=>{const b=blocked('younger'),aw=awakeTonight();return {t:'狼弟',say:eye('younger')+(aw?'今晚你要袭击谁？”<br>（必须选择一名玩家）':'”')+shut('younger'),
  body:blkNote('younger')+(b?'':aw?res(0,'狼兄已出局：狼弟今夜觉醒，单独刀一人')+tgt('狼弟刀','bknife')+note('不可空刀；女巫看不到这一刀。与狼队刀同一人时，解药和守护都救不了。'):S.awakeDay!==null?note('狼弟已觉醒，之后与狼队一起行动。'):note('狼兄存活，狼弟没有行动。')),ok:!!b||!aw||!!S.n.bknife};},
 wolf:()=>{
  const ws=S.seats.filter(s=>isWolf(s)&&BD().pack.includes(s.role)).map(s=>s.n),wt=packWant(),mk=BD().mark,m=mk&&one(mk),pf=packFeared();
  const alive=S.seats.some(s=>inPack(s)&&!s.dead),solo=S.seats.filter(s=>isWolf(s)&&!inPack(s)&&!s.dead&&s.role!=='younger');
  return {t:'狼人',say:(S.day===1?'“狼人请睁眼，请确认彼此身份。'+(mk?R[mk].n+'请举手示意。':'')+'今晚你们要袭击谁？请统一意见。”<br>（狼人比划号码，法官确认落刀目标）':'“狼人请睁眼。今晚袭击谁？”')+'<br>“狼人请闭眼。”',
   body:(S.day===1?row(`狼人 ${ws.length}/${wt}`,ws.length?ws.join('、')+'号':'<i>未录入</i>','选择','pickWolves()')+(mk?row(R[mk].n,val(m&&m.n),'选择',`pickOne('${mk}')`,ws.length!==wt):''):'')+
    (S.day>1&&!alive?note(solo.length?`狼队已全部出局，${solo.map(s=>R[s.role].n).join('、')}带刀（比划手势告知）。`:'狼队已全部出局，选“空刀”。'):'')+
    (pf?note('狼队有人被恐惧，今夜不能刀人。'):'')+tgt('刀口','knife',{none:'空刀',dis:pf}),
   ok:S.n.knife!==null&&(S.day>1||(ws.length===wt&&(!mk||!!m)))};},
 beauty:()=>{const b=blocked('beauty');return {t:'狼美人',say:eye('beauty')+'今晚你要魅惑谁？”<br>（比划号码）'+shut('beauty'),
  body:idRow('beauty')+blkNote('beauty')+tgt('魅惑','charm',{none:'不魅惑',dis:b})+note(`狼美人出局时，被魅惑者一同殉情且不能发动技能；被骑士决斗出局则不触发。不能连续两夜魅惑同一人${S.lastCharm?`（昨夜魅惑 ${S.lastCharm}号）`:''}，不能自刀、自爆。`),ok:has('beauty')&&(!!b||S.n.charm!==null)};},
 witch:()=>{
  const n=S.n,w=one('witch'),b=blocked('witch'),self=w&&n.knife===w.n;
  const antiOk=(S.day>1||w)&&!S.used.anti&&!b&&n.knife>0&&!n.poison&&!self,poiOk=!S.used.poison&&!b&&!n.anti;
  return {t:'女巫',say:(n.knife>0?`“女巫请睁眼。昨晚【${n.knife}】号玩家被袭击，你有一瓶解药，是否使用？（使用请比大拇指，不使用请摇手）”`:'“女巫请睁眼。昨晚无人被袭击。”')+'<br>“你有一瓶毒药，是否使用？（使用请比毒杀号码，不使用请摇手）”<br>“女巫请闭眼。”',
   body:idRow('witch')+blkNote('witch')+
    `<div class="row"><span>解药</span><b>${S.used.anti?'已用':n.anti?'救 '+n.knife+'号':'可用'}</b><button class="btn ${n.anti?'act':''}" ${antiOk||n.anti?'':'disabled'} onclick="upd(()=>S.n.anti=!S.n.anti)">${n.anti?'取消使用':'使用解药'}</button></div>`+
    (self?note('女巫全程不可自救。'):'')+row('毒药',S.used.poison?'已用':n.poison?'毒 '+lab(n.poison):'不使用','选择',"pickT('poison')",!poiOk)+note('同一夜女巫不能同时使用解药和毒药。'),ok:has('witch')};},
 seer:()=>{const b=blocked('seer'),c=S.n.check,t=c&&seat(mg(c));return {t:'预言家',say:eye('seer')+'今晚你要查验谁的身份？”<br>（大拇指=好人；摇手/倒拇指=狼人）'+shut('seer'),
  body:idRow('seer')+blkNote('seer')+tgt('查验','check',{dis:b})+(t?(mg(c)!==c?note(`魔术师交换：实际查验 ${mg(c)}号。`):'')+(seerWolf(t)?res(0,'🐺 狼人 · 倒拇指/摇手'):res(1,'✅ 好人 · 大拇指'+(t.role==='hybrid'?'（混血儿永远是好人）':''))):''),ok:has('seer')&&(!!b||!!t)};},
 mediumId:()=>({t:'通灵师',say:'“通灵师请睁眼，请确认你的身份。”<br>“通灵师请闭眼。”',body:idRow('medium')+note('查验放在机械狼学习之后。'),ok:!!one('medium')}),
 medium:()=>{const b=blocked('medium'),t=S.n.check&&seat(S.n.check);return {t:'通灵师查验',say:eye('medium')+'今晚你要查验谁的具体身份？”<br>（告知具体身份）'+shut('medium'),
  body:blkNote('medium')+tgt('查验','check',{dis:b})+(t?res(!isWolf(t)||exactName(t)!==(t.role&&R[t.role].n),`身份：${exactName(t)}`):'')+note('查验已学习的机械狼，显示它学到的身份。'),ok:!!b||!!t};},
 hunter:()=>({t:'猎人',say:'“猎人请睁眼，请确认你的开枪状态。”<br>（大拇指=今晚可以开枪；倒拇指/摇手=不可开枪）<br>“猎人请闭眼。”',body:idRow('hunter')+(one('hunter')?gun('hunter'):''),ok:has('hunter')}),
 wolfking:()=>({t:'狼王',say:'“狼王请睁眼，请确认你的开枪状态。”<br>（大拇指=可以开枪；倒拇指/摇手=不可开枪）<br>“狼王请闭眼。”',body:gun('wolfking')}),
 idiot:()=>({t:'白痴',say:'“白痴请睁眼，请确认你的身份。”<br>“白痴请闭眼。”',body:idRow('idiot')+note('白痴从第 2 夜起不再睁眼。'),ok:!!one('idiot')}),
 knight:()=>({t:'骑士',say:'“骑士请睁眼，请确认你的身份。”<br>“骑士请闭眼。”',body:idRow('knight')+note('白天可翻牌决斗一名玩家，整局一次（在白天面板操作）。'),ok:!!one('knight')}),
 demon:()=>{const b=blocked('demon'),t=S.n.dcheck&&seat(S.n.dcheck);return {t:'恶魔',say:eye('demon')+'今晚你要查验谁？”<br>（大拇指=神职；摇手=不是神职）'+shut('demon'),
  body:idRow('demon')+blkNote('demon')+tgt('查验','dcheck',{dis:b})+(t?(t.role&&R[t.role].c==='god'?res(0,'✨ 是神职 · 大拇指'):res(1,'不是神职 · 摇手')):'')+note('恶魔夜间免死：狼刀、毒药对其无效。'),ok:has('demon')&&(!!b||!!t)};},
 gargoyleId:()=>({t:'石像鬼',say:'“石像鬼请睁眼，请确认你的身份。”<br>“石像鬼请闭眼。”',body:idRow('gargoyle')+note('石像鬼不与狼队相认；查验放在其他身份录完之后。'),ok:!!one('gargoyle')}),
 gargoyle:()=>{const b=blocked('gargoyle'),t=S.n.gcheck&&seat(S.n.gcheck);return {t:'石像鬼查验',say:eye('gargoyle')+'今晚你要查验谁的具体身份？”<br>（告知具体身份）'+shut('gargoyle'),
  body:blkNote('gargoyle')+tgt('查验','gcheck',{dis:b})+(t?res(!isWolf(t),`身份：${exactName(t)}`):'')+(S.day>1&&!b?note(S.seats.some(s=>inPack(s)&&!s.dead)?'其他狼人仍在场：未带刀。':'其他狼人已全部出局：石像鬼带刀，在狼人环节录刀口。'):''),ok:!!b||!!t};},
 grave:()=>{const e=S.lastExile&&seat(S.lastExile),b=blocked('grave');return {t:'守墓人',say:eye('grave')+(S.day>1?'昨天被放逐的玩家是——”<br>（大拇指=好人；倒拇指=狼人；无人放逐则摇手）':'请确认你的身份。”')+shut('grave'),
  body:idRow('grave')+blkNote('grave')+(S.day===1?note('首夜没有技能。'):b?'':!e?`<div class="res">昨天无人被放逐 · 摇手</div>`:isWolf(e)?res(0,`${lab(e.n)}：🐺 狼人 · 倒拇指`):res(1,`${lab(e.n)}：✅ 好人 · 大拇指`)),ok:has('grave')};},
 witchhunter:()=>{const b=blocked('witchhunter'),t=S.n.hunt&&seat(S.n.hunt);return {t:'猎魔人',say:eye('witchhunter')+(S.day>1?'今晚你要狩猎谁？”<br>（比划号码；不狩猎请摇手）':'请确认你的身份。”')+shut('witchhunter'),
  body:idRow('witchhunter')+blkNote('witchhunter')+(S.day===1?note('首夜不能狩猎。'):tgt('狩猎','hunt',{none:'不狩猎',dis:b})+(t?(isWolf(t)?res(1,`${lab(t.n)} 是狼人，天亮死亡`):res(0,`${lab(t.n)} 是好人，猎魔人天亮死亡`)):''))+note('猎魔人免疫女巫毒药。'),ok:has('witchhunter')};},
 mech:()=>{
  const b=blocked('mechwolf'),lr=S.mech,packDead=!S.seats.some(s=>inPack(s)&&!s.dead),t=S.n.mcheck&&seat(S.n.mcheck);let x='';
  if(!lr)x=tgt('学习','learn',{none:'不学习',dis:b})+(S.n.learn&&seat(S.n.learn).role?note(`学到：${R[seat(S.n.learn).role].n}（下一夜起可用）`):'');
  else{
   x=note(`已学习 ${lab(lr.n)}：${lr.role?R[lr.role].n:'未录入'}`);
   if(!b)x+=lr.role==='medium'?tgt('查验','mcheck')+(t?res(!isWolf(t),`身份：${exactName(t)}`):''):
    lr.role==='witch'?(S.mechUsed.poison?note('毒药已用。'):tgt('毒药','mpoison',{none:'不使用'})+note('机械狼的毒可穿守护。')):
    lr.role==='guard'?(S.mechUsed.guard?note('守护已用。'):tgt('守护','mguard',{none:'不使用'})+note('整局一次，当夜免疫一切伤害。')):
    R[lr.role||'villager'].c==='wolf'?(packDead?tgt('多刀','mknife',{none:'不使用'}):note('继承狼刀后可多刀一人。')):
    lr.role==='hunter'?note('猎人技能：在“机械狼开枪状态”环节确认。'):note('没有可用技能。');
  }
  return {t:'机械狼',say:eye('mechwolf')+(lr?'请使用你的技能。”':'今晚你要学习谁？”<br>（比划号码）')+shut('mechwolf'),body:idRow('mechwolf')+blkNote('mechwolf')+x+(S.day===1?note('机械狼不入狼窝，整局只能学习一次。'):packDead&&!b?note('其他狼人已全部出局：机械狼带刀，在狼人环节录刀口。'):''),ok:has('mechwolf')&&(S.day>1||S.n.learn!==null)};},
 mechgun:()=>({t:'机械狼状态',say:'“机械狼请睁眼，请确认你的开枪状态。”<br>“机械狼请闭眼。”',body:S.mech&&S.mech.role==='hunter'?gun('mechwolf'):note('未学到猎人：空喊流程。')}),
 lucky:()=>{
  const lu=S.lucky,tr=S.n.trade,ls=lu&&seat(lu.n),ok2=lu&&!lu.used&&!ls.dead&&lu.day<S.day,t=S.n.lcheck&&seat(S.n.lcheck);
  let x=tr?(isWolf(seat(tr.n))?res(0,`今夜交易给狼人 ${lab(tr.n)}：不拍，黑市商人死亡`):res(1,`今夜交易成功：轻拍幸运儿 ${lab(tr.n)}（${SKILL[tr.skill]}）`)):'';
  if(lu){x+=note(`幸运儿 ${lab(lu.n)}：${SKILL[lu.skill]}${lu.used?'（已用）':ls.dead?'（已出局）':''}`);
   if(ok2&&lu.skill==='check')x+=tgt('查验','lcheck',{none:'不使用'})+(t?(seerWolf(t)?res(0,'🐺 狼人'):res(1,'✅ 好人')):'');
   if(ok2&&lu.skill==='poison')x+=tgt('毒药','lpoison',{none:'不使用'});
   if(ok2&&lu.skill==='gun')x+=note('猎枪在白天使用：天亮后在白天面板点“开枪”。');}
  return {t:'幸运儿',say:S.day===1?'“被拍到的玩家是幸运儿。”<br>（绕场一圈，交易成功则轻拍幸运儿）':'“幸运儿请睁眼，是否使用技能？”<br>“幸运儿请闭眼。”',body:x||note('没有幸运儿：空喊流程。')};},
 sheriff:()=>({t:'警长',say:'“要竞选警长的玩家请举手。”<br>（记录上警号码）<br>“请放下。”',body:row('上警',S.police.length?S.police.join('、')+'号':'<i>未录入</i>','选择','pickPolice()')+note('可不录入，天亮后在白天面板继续：退水、投票、当选。')}),
 dawn:()=>{
  const r=resolve(),nd=nightDead(r),unk=S.seats.filter(s=>!s.role).length,guns=r.D.filter(d=>gunTonight(seat(d)));
  return {t:'天亮结算',say:'“天亮了，请睁眼。”<br>（若有警长竞选，先进行上警环节，再公布死讯）',
   body:res(!nd.length,nd.length?'昨夜死亡：'+nd.map(snv).join('、'):'平安夜')+r.N.map(note).join('')+
    guns.map(d=>note(`${S.hide?lab(d):gunName(seat(d))}${noShoot(d)?noShoot(d)+'，不可开枪。':'夜间死亡，可以开枪。'}`)).join('')+
    (r.D.some(d=>seat(d).role==='idiot')?note('白痴夜间死亡，直接出局，不能翻牌。'):'')+(unk?note(`⚠ 还有 ${unk} 个座位未录入身份。`):'')};}
};
function wizard(){
 const st=stepsOf(),total=st.length;if(S.n.step>=total)S.n.step=total-1;
 const key=st[S.n.step],x=STEPS[key](),ok=x.ok===undefined||x.ok;
 const dots=st.map((k,i)=>`<i class="${i<S.n.step?'d':i===S.n.step?'c':''}"></i>`).join('');
 return `<div class="wiz"><div class="wh"><span class="lbl">NIGHT ${String(S.day).padStart(2,'0')} · ${S.n.step+1}/${total} · ${x.t}</span><div class="dots">${dots}</div></div>
  ${say(x.say)}${x.body}
  <div class="wf"><button class="btn" ${S.n.step?'':'disabled'} onclick="upd(()=>S.n.step--)">← 上一步</button>
  ${key==='dawn'?`<button class="btn pri" style="flex:2" onclick="adv(confirmDawn)">确认 · 天亮 ☀</button>`:`<button class="btn pri" style="flex:2" ${ok?'':'disabled'} onclick="adv(()=>upd(()=>S.n.step++))">下一步 →</button>`}</div></div>`;
}

/* ---------- 选座 ---------- */
function seatPicker(title,o){window._pk={cur:new Set(o.sel||[]),o};drawPk(title);}
function drawPk(title){
 const {cur,o}=window._pk;window._pkTitle=title||window._pkTitle;
 sheet(`<h2>${window._pkTitle}</h2><div class="pk ${S.hide?'hide':''}">${S.seats.map(s=>{const r=s.role&&R[s.role];
  return `<button class="${cur.has(s.n)?'cur':''} ${s.dead?'dd':''}" ${(o.ok?o.ok(s):true)?'':'disabled'} onclick="pkTap(${s.n})">${r&&!S.hide?`<img src="img/${r.k}.png">`:''}<b>${s.n}</b><small>${S.names[s.n-1]||(r&&!S.hide?r.n:'')}</small></button>`;}).join('')}</div>
  <div class="pkf">${o.none?`<button class="btn" onclick="pkNone()">${o.none.label}</button>`:''}${o.multi?`<button class="btn pri" ${o.min&&cur.size<o.min?'disabled':''} onclick="pkOk()">确定（${cur.size}${o.max?'/'+o.max:''}）</button>`:''}</div>`,!title);
}
function pkTap(n){const {cur,o}=window._pk;
 if(o.multi){if(cur.has(n))cur.delete(n);else{if(o.max&&cur.size>=o.max)return toast(`最多 ${o.max} 个`);cur.add(n);}drawPk();}
 else{advAt=Date.now();close_();o.done(n);}}
function pkOk(){const {cur,o}=window._pk;advAt=Date.now();close_();o.done([...cur].sort((a,b)=>a-b));}
function pkNone(){const {o}=window._pk;advAt=Date.now();close_();o.done(o.none.value);}
const alive=s=>!s.dead, notMe=(s,k)=>!one(k)||s.n!==one(k).n;
// 夜间目标：标题、可选范围、不选的文案
const TG={
 guard:['守护谁？',s=>alive(s)&&s.n!==S.lastGuard,'空守'],dream:['摄梦谁？',s=>alive(s)&&notMe(s,'dreamer')],fear:['恐惧谁？',s=>alive(s)&&notMe(s,'nightmare'),'不恐惧'],
 knife:['刀口（狼人袭击谁）',s=>alive(s)&&s.role!=='beauty','空刀'],charm:['魅惑谁？',s=>alive(s)&&notMe(s,'beauty')&&s.n!==S.lastCharm,'不魅惑'],
 poison:['女巫毒谁？',alive,'不使用毒药'],check:[()=>`${cntOf('medium')?'通灵师':'预言家'}查验谁？`,s=>alive(s)&&notMe(s,cntOf('medium')?'medium':'seer')],
 dcheck:['恶魔查验谁？',s=>alive(s)&&notMe(s,'demon')],gcheck:['石像鬼查验谁？',s=>alive(s)&&notMe(s,'gargoyle')],hunt:['猎魔人狩猎谁？',s=>alive(s)&&notMe(s,'witchhunter'),'不狩猎'],
 bknife:['狼弟袭击谁？',alive],learn:['机械狼学习谁？',s=>alive(s)&&notMe(s,'mechwolf'),'不学习'],mcheck:['机械狼查验谁？',s=>alive(s)&&notMe(s,'mechwolf')],
 mpoison:['机械狼毒谁？',alive,'不使用'],mguard:['机械狼守护谁？',alive,'不使用'],mknife:['机械狼多刀谁？',alive,'不使用'],
 lcheck:['幸运儿查验谁？',s=>alive(s)&&s.n!==S.lucky.n,'不使用'],lpoison:['幸运儿毒谁？',alive,'不使用']};
function pickT(f){
 const [t,ok,none]=TG[f];
 seatPicker(typeof t==='function'?t():t,{ok,none:none?{label:none,value:f==='poison'?null:0}:null,done:v=>upd(()=>{const pf=packFeared();S.n[f]=v;if(f==='knife')S.n.anti=false;if(pf&&!packFeared())S.n.knife=null;})});
}
// 平民是自动补的，重选特殊身份时允许改选平民座位
const free=(s,k)=>!s.role||s.role===k||s.role==='villager';
function pickOne(k){
 const inner=BD().pack.includes(k)&&k!=='elder'; // 狼队里的特殊狼：从已录的狼人中指认
 seatPicker(`${R[k].n}是几号？`,{ok:s=>inner?s.role==='wolf'||s.role===k:free(s,k),done:n=>upd(()=>{
  S.seats.forEach(s=>{if(s.role===k)s.role=inner?'wolf':null;});seat(n).role=k;if(S.model===n&&k==='hybrid')S.model=null;})});
}
function pickModel(){seatPicker('榜样是几号？',{ok:s=>notMe(s,'hybrid'),done:n=>upd(()=>S.model=n)});}
function pickWolves(){
 const pk=BD().pack,mine=s=>!!s.role&&pk.includes(s.role),extra=pk.filter(k=>k!=='wolf').map(k=>R[k].n).join('、');
 seatPicker(`选出 ${packWant()} 名狼人${extra?`（含${extra}）`:''}`,{multi:true,max:packWant(),sel:S.seats.filter(mine).map(s=>s.n),ok:s=>free(s,'wolf')||mine(s),
  done:l=>upd(()=>S.seats.forEach(s=>{if(l.includes(s.n)){if(!mine(s))s.role='wolf';}else if(mine(s))s.role=null;}))});
}
function pickSwap(){seatPicker('交换哪两位？',{multi:true,max:2,min:2,sel:S.n.swap||[],ok:s=>alive(s)&&!S.swapped.includes(s.n),none:{label:'不交换',value:[]},done:l=>upd(()=>S.n.swap=l)});}
function pickPolice(){seatPicker('哪些玩家上警？',{multi:true,sel:S.police,done:l=>upd(()=>{S.police=l;S.out=S.out.filter(x=>l.includes(x));if(S.v&&S.v.kind==='sheriff')S.v=null;})});}
function pickOut(){seatPicker('哪些玩家退水？',{multi:true,sel:S.out,ok:s=>S.police.includes(s.n),done:l=>upd(()=>{S.out=l;if(S.v&&S.v.kind==='sheriff')S.v=null;})});}
function pickTrade(){
 seatPicker('与谁交易？',{ok:s=>alive(s)&&notMe(s,'merchant'),none:{label:'不交易',value:0},done:n=>{
  if(!n)return upd(()=>S.n.trade=null);
  sheet(`<h2>交给 ${lab(n)} 的技能</h2><div class="opts">${Object.entries(SKILL).map(([k,t])=>`<button class="btn" onclick="close_();upd(()=>S.n.trade={n:${n},skill:'${k}'})">${t}</button>`).join('')}</div>`);
 }});
}

/* ---------- 天亮结算 ---------- */
function confirmDawn(){
 commit('',()=>{
  const n=S.n,r=resolve(),who=k=>one(k)&&!one(k).dead,idn=k=>seatsOf(k).map(s=>s.n).join('、')||'—';
  if(S.day===1){
   L('身份：'+['hybrid','magician','merchant','dreamer','guard','nightmare','wolf','wolfking','demon','beauty','elder','younger','gargoyle','mechwolf','bloodmoon','witch','seer','medium','hunter','witchhunter','idiot','knight','grave']
    .filter(cntOf).map(k=>`${R[k].n}${idn(k)}号${k==='hybrid'?`（榜样${S.model||'—'}号）`:''}`).join('｜'));
   if(S.police.length)L(`上警：${S.police.join('、')}号`);
  }
  const say2=(k,f,verb,none)=>{if(who(k))L(`${R[k].n}：${blocked(k)?'技能被封':n[f]>0?`${verb} ${n[f]}号`:none}`);};
  if(who('nightmare'))L(`噩梦之影：${n.fear>0?'恐惧 '+n.fear+'号':'不恐惧'}`);
  if(who('magician'))L(`魔术师：${n.swap&&n.swap.length?`交换 ${n.swap.join('、')}号`:'不交换'}`);
  if(n.trade)L(`黑市商人：与 ${n.trade.n}号 交易（${SKILL[n.trade.skill]}）`);
  say2('dreamer','dream','摄梦','未摄梦');say2('guard','guard','守','空守');
  if(n.learn>0)L(`机械狼：学习 ${n.learn}号（${seat(n.learn).role?R[seat(n.learn).role].n:'未录入'}）`);
  if(n.mcheck)L(`机械狼查验：${n.mcheck}号 → ${exactName(seat(n.mcheck))}`);
  if(n.mpoison)L(`机械狼：毒 ${n.mpoison}号`);if(n.mguard)L(`机械狼：守 ${n.mguard}号`);if(n.mknife)L(`机械狼：多刀 ${n.mknife}号`);
  if(n.bknife)L(`狼弟觉醒：刀 ${n.bknife}号`);
  L(`狼刀：${n.knife>0?n.knife+'号':'空刀'}`);
  if(who('beauty'))L(`狼美人：${n.charm>0?'魅惑 '+n.charm+'号':'不魅惑'}`);
  if(who('witch'))L(`女巫：${n.anti?'解药救 '+n.knife+'号':'未用解药'}｜${n.poison?'毒 '+n.poison+'号':'未用毒药'}`);
  if(n.check)L(cntOf('medium')?`通灵师查验：${n.check}号 → ${exactName(seat(n.check))}`:`预言家查验：${n.check}号 → ${seerWolf(seat(mg(n.check)))?'狼人':'好人'}`);
  if(n.gcheck)L(`石像鬼查验：${n.gcheck}号 → ${exactName(seat(n.gcheck))}`);
  if(n.dcheck){const t=seat(n.dcheck);L(`恶魔查验：${n.dcheck}号 → ${t.role&&R[t.role].c==='god'?'神职':'非神职'}`);}
  if(n.hunt)L(`猎魔人：狩猎 ${n.hunt}号`);
  if(n.lcheck)L(`幸运儿查验：${n.lcheck}号 → ${seerWolf(seat(n.lcheck))?'狼人':'好人'}`);if(n.lpoison)L(`幸运儿：毒 ${n.lpoison}号`);
  r.N.forEach(x=>L(x.replace(/。$/,'')));
  r.D.filter(d=>gunTonight(seat(d))).forEach(d=>{const g=seat(d).ng=noShoot(d);if(g)L(`${gunName(seat(d))}${g}，不可开枪`);}); // ng：不可开枪的原因
  if(n.learn>0&&!S.mech&&seat(n.learn).role==='hunter'&&r.D.includes(one('mechwolf').n)){one('mechwolf').ng='当夜刚学习';L('机械狼当夜刚学习，不可开枪');}
  if(n.trade&&n.trade.skill==='gun'&&!isWolf(seat(n.trade.n))&&r.D.includes(n.trade.n)){seat(n.trade.n).ng='当夜刚获得猎枪';L('幸运儿当夜刚获得猎枪，不可开枪');}
  // 记录跨夜状态（须在标记死亡之前）
  if(awakeTonight())S.awakeDay=S.day;
  S.lastGuard=n.guard>0?n.guard:0;S.lastDream=n.dream||0;S.lastCharm=n.charm||0;S.charmed=n.charm||0;
  if(n.swap)S.swapped.push(...n.swap);
  if(n.trade){S.traded={...n.trade,day:S.day};if(!isWolf(seat(n.trade.n)))S.lucky={...n.trade,day:S.day,used:false};}
  if(S.lucky&&(n.lcheck||n.lpoison))S.lucky.used=true;
  if(n.learn>0&&!S.mech)S.mech={n:n.learn,role:seat(n.learn).role,day:S.day};
  if(n.mpoison)S.mechUsed.poison=true;if(n.mguard)S.mechUsed.guard=true;
  if(n.anti)S.used.anti=true;if(n.poison)S.used.poison=true;
  const nd=nightDead(r);
  r.D.forEach(d=>{seat(d).dead='night';seat(d).at=label();});
  L(nd.length?`昨夜死亡：${nd.map(sn).join('、')}`:'平安夜');
  S.night=false;S.d=null;L('—— 天亮 ——');
 });
}
function nextNight(){
 if(!S.d)return toast('请先完成今天的投票放逐');
 commit('',()=>{S.lastExile=S.d.n||0;S.v=null;S.day++;S.night=true;S.n=freshNight();S.d=null;L('—— 天黑 ——');});
}

/* ---------- 白天流程：每天放逐 1 人 ---------- */
// S.d：今天的结果 {n:放逐座位(0=无人), flip:白痴翻牌, also:[连带殉情], skip:'duel'|'boom' 直接入夜, duel/boom:对应座位, lost:自爆吞掉警徽}；null=尚未投票
function dayPanel(){
 const d=S.d,s=d&&d.n?seat(d.n):null,kn=one('knight'),bm=one('bloodmoon');
 let body='';
 if(!d&&electing())body+=electPanel();
 if(!d){
  body+=say('“请投票。”<br>（统计票数，选出今天被放逐的玩家）')+row('放逐','<i>未选</i>','选择','pickExile()')+row('投票明细',voteState('exile'),'记票',"openVote('exile')");
  if(kn&&!kn.dead&&!S.knightUsed)body+=row('骑士决斗','未使用','决斗','pickDuel()');
  if(bm&&!bm.dead)body+=row('血月使徒','存活','自爆',`askBoom(${bm.n})`);
  if(S.hide||S.seats.some(x=>!x.dead&&canBoom(x)))body+=row('狼人自爆','未发生','自爆','pickBoom()');
 }else{
  body=`<div class="res ${s||d.skip?'bad':'good'}"><span>${d.skip==='duel'?`骑士决斗成功，${snv(d.duel)} 出局，直接入夜`:d.skip==='boom'?`${d.boom?snv(d.boom):'血月使徒'} 自爆，直接入夜`:!s?'今天无人放逐':d.flip?`${snv(d.n)} 翻牌，视为出局`:`${snv(d.n)} 被放逐出局`}</span>${d.skip?'':'<button class="btn" onclick="revokeExile()">更正</button>'}</div>`;
  if(d.skip)body+=note('误操作可在菜单里“撤销上一步”，或点该座位“恢复存活”。');
  if(d.skip==='boom'&&S.sealed===S.day+1)body+=note('今夜所有神职技能被封印。');
  if(s&&d.flip)body+=note('白痴失去投票权，可继续发言；狼人无需追刀。');
  if(s&&s.role==='bloodmoon'&&!S.seats.some(x=>isWolf(x)&&!x.dead))body+=note('血月使徒作为最后一狼被放逐：可暂活入夜并多刀一人，按局规处理。');
  (d.also||[]).forEach(x=>body+=note(`${lab(x)} 被魅惑，一同殉情，不能发动技能。`));
 }
 // 持枪玩家：能开枪的给按钮，不能开枪的说明原因
 gunners().forEach(x=>{
  const w=S.hide?lab(x.n):`${lab(x.n)} ${gunName(x)}`,no=noGun(x),h=x.shot;
  if(no){body+=note(`☠ ${w}${no}，不可开枪。`);return;}
  if(!h||!h.t)body+=note(!x.dead?`🔫 ${w} 有猎枪，白天可以开枪。`:x.dead!=='night'?`🔫 ${w} ${x.dead==='exile'?'被放逐':'出局'}，可以开枪。`:x.ng===''?`🔫 ${w} 昨夜死亡，可以开枪。`:`${w} 昨夜死亡，可以开枪；被毒杀则不可开枪。`);
  body+=row('开枪',`${lab(x.n)}：${!h?'<i>未选</i>':h.t?'带走 '+lab(h.t):'不开枪'}`,h&&h.t?'更正':'开枪',h&&h.t?`revokeShot(${x.n})`:`pickShot(${x.n})`);
 });
 if(S.badgeLost)body+=note('🎖 警徽已流失，本局没有警长。');
 const ex=S.seats.find(x=>x.badge&&x.dead);
 if(ex)body+=note('🎖 警长已出局，请移交或撕毁警徽。')+row('警徽',lab(ex.n),'处理','passBadge()');
 return `<div class="wiz"><div class="wh"><span class="lbl">DAY ${String(S.day).padStart(2,'0')} · 投票放逐</span></div>
  <div class="phase" style="border:0;padding:0;background:none"><div class="big day">${label()}</div></div>${body}
  <div class="wf"><button class="btn pri" ${d?'':'disabled'} onclick="adv(nextNight)">天黑了 →</button></div></div>`;
}
// 狼美人白天出局：带走被魅惑者（决斗除外）
function follow(x){
 const t=seat(x).role==='beauty'&&S.charmed&&seat(S.charmed);
 if(!t||t.dead)return [];
 t.dead='love';t.at=label();L(`${sn(t.n)} 殉情出局`);return [t.n];
}
function pickExile(){seatPicker('今天放逐谁？',{ok:s=>!s.dead&&!s.flip,none:{label:'无人放逐',value:0},done:n=>doExile(n)});}
function doExile(n){
 close_();
 if(S.night)return toast('夜间不能放逐');
 if(S.d)return toast('今天已完成放逐，需先更正');
 commit('',()=>exile_(n));
}
function exile_(n){
 const s=n?seat(n):null,flip=!!(s&&s.role==='idiot'&&!s.flip);
 L(!s?'今天无人放逐':`投票放逐：${sn(n)}${flip?' → 翻牌，视为出局':''}`);
 S.d={n,flip};S.v=null;
 if(s){s.dead='exile';s.at=label();s.flip=s.flip||flip;S.d.also=follow(n);} // 白痴翻牌同样视为出局，狼人无需追刀
}
function revokeExile(){
 const d=S.d;if(!d)return;
 commit(d.n?`更正：取消 ${d.n}号 的放逐`:'更正：取消“无人放逐”',()=>{
  if(d.n)[d.n,...(d.also||[])].forEach(x=>revive(seat(x)));
  S.d=null;
 });
}
function pickDuel(){const k=one('knight');seatPicker('骑士与谁决斗？',{ok:s=>alive(s)&&s.n!==k.n,done:n=>commit('',()=>{
 S.knightUsed=true;const t=seat(n);
 if(isWolf(t)){t.dead='duel';t.at=label();S.d={n:0,skip:'duel',duel:n};S.v=null;L(`骑士决斗：${sn(n)} 是狼人，出局，直接入夜`);}
 else{k.dead='duel';k.at=label();L(`骑士决斗：${sn(n)} 是好人，骑士 ${lab(k.n)} 出局`);}
})});}

/* ---------- 警长竞选 ---------- */
// 第 1 天竞选；竞选中自爆且延期时，第 2 天再选
const electing=()=>!S.night&&!S.badgeDone&&!S.badgeLost&&(S.day===1||(S.day===2&&S.elLater));
// 竞选在公布死讯之前，昨夜死亡的玩家仍可参加
const present=s=>!s.dead||(s.dead==='night'&&s.at===`第${S.day}夜`);
const runners=()=>S.seats.filter(s=>present(s)&&S.police.includes(s.n)&&!S.out.includes(s.n)).map(s=>s.n);
const nums=a=>a.length?a.join('、')+'号':'<i>未录入</i>';
function electPanel(){
 return say('“警长竞选。”<br>（发言、退水、警下投票；选出警长后再公布死讯）')+row('上警',nums(S.police),'选择','pickPolice()')+row('退水',S.out.length?nums(S.out):'无','选择','pickOut()',!S.police.length)+
  row('警长投票',voteState('sheriff'),'记票',"openVote('sheriff')",!runners().length)+row('警长','<i>未选</i>','选择','pickSheriff()');
}
function pickSheriff(){seatPicker('谁当选警长？',{ok:s=>S.police.length?runners().includes(s.n):present(s),none:{label:'警徽流失',value:0},done:n=>commit('',()=>sheriff_(n))});}
function sheriff_(n){
 L(`警长竞选：上警 ${S.police.length?S.police.join('、')+'号':'—'}${S.out.length?`，退水 ${S.out.join('、')}号`:''} → ${n?lab(n)+' 当选警长':'警徽流失'}`);
 S.seats.forEach(s=>s.badge=s.n===n);S.v=null;S.elLater=false;
 if(n)S.badgeDone=true;else S.badgeLost=true;
}
// 警长出局：移交或撕毁
function passBadge(){
 const o=S.seats.find(s=>s.badge);if(!o)return;
 seatPicker(`${lab(o.n)} 的警徽交给谁？`,{ok:s=>alive(s)&&s.n!==o.n,none:{label:'撕毁警徽',value:0},done:n=>commit(n?`警徽移交：${lab(o.n)} → ${lab(n)}`:`${lab(o.n)} 撕毁警徽`,()=>{o.badge=false;if(n)seat(n).badge=true;else S.badgeLost=true;})});
}

/* ---------- 记票（可选） ---------- */
const VN={exile:'放逐投票',sheriff:'警长投票'};
const voteState=k=>S.v&&S.v.kind===k?`${S.v.round>1?'PK ':''}已记 ${tally().cast}/${voters().length} 票`:'<i>未记录</i>';
const cands=()=>S.v.c?S.v.c.filter(n=>S.v.kind==='sheriff'?present(seat(n)):!seat(n).dead):S.v.kind==='sheriff'?runners():S.seats.filter(s=>!s.dead).map(s=>s.n);
// 放逐：存活玩家投票，PK 台上的人不投；警长：警下投票
function voters(){
 if(S.v.kind==='sheriff')return S.seats.filter(s=>present(s)&&!S.police.includes(s.n)).map(s=>s.n);
 const a=S.seats.filter(s=>!s.dead).map(s=>s.n),b=S.v.c?a.filter(n=>!S.v.c.includes(n)):a;
 return b.length?b:a;
}
// 警长放逐投票算 1.5 票
const weight=n=>S.v.kind==='exile'&&seat(n).badge?1.5:1;
function tally(){
 const c=cands(),vs=voters(),by={};let cast=0;
 vs.forEach(n=>{const t=S.v.m[n];if(c.includes(t)){cast++;(by[t]=by[t]||[]).push(n);}});
 const t=c.filter(n=>by[n]).map(n=>({n,who:by[n],k:by[n].reduce((a,x)=>a+weight(x),0)})).sort((a,b)=>b.k-a.k||a.n-b.n);
 return {t,cast,top:t.filter(x=>x.k===t[0].k).map(x=>x.n),none:vs.filter(n=>!c.includes(S.v.m[n]))};
}
function openVote(kind){
 if(kind==='exile'?S.d:!electing())return;
 if(!S.v||S.v.kind!==kind)S.v={kind,round:1,c:null,m:{}};
 window._vc=0;save();drawVote();
}
function voteResult(){
 const r=tally(),ex=S.v.kind==='exile',fail=ex?'无人放逐':'警徽流失';
 if(!r.t.length)return {n:0,t:'无人投票：'+fail};
 if(r.top.length===1)return {n:r.top[0],t:(ex?'放逐 ':'当选 ')+lab(r.top[0])};
 return S.v.round===1?{pk:r.top,t:`平票 PK：${r.top.join('、')}号`}:{n:0,t:'再次平票：'+fail};
}
function drawVote(keep){
 const r=tally(),c=cands(),vs=voters(),of=n=>r.t.find(x=>x.n===n),res=voteResult();
 if(!c.includes(window._vc))window._vc=0;
 sheet(`<h2>🗳 ${VN[S.v.kind]}${S.v.round>1?' · PK':''}</h2>${note('先点被投的玩家，再点投给他的人；不点算弃票。'+(S.v.kind==='exile'&&S.seats.some(s=>s.badge&&!s.dead)?'警长 🎖 算 1.5 票。':''))}
  <div class="lbl" style="margin-top:12px">被投的玩家</div><div class="pk vc">${c.map(n=>`<button class="${n===window._vc?'cur':''}" onclick="voteFor(${n})"><b>${n}</b><small>${S.names[n-1]||''}</small><small class="vk">${of(n)?of(n).k+' 票':'0'}</small></button>`).join('')}</div>
  <div class="lbl" style="margin-top:12px">投票的玩家</div><div class="pk vv">${vs.map(n=>{const t=S.v.m[n],o=c.includes(t);return `<button class="${o&&t===window._vc?'cur':''}" onclick="voteBy(${n})"><b>${n}${seat(n).badge?'🎖':''}</b><small>${S.names[n-1]||''}</small><small class="vk">${o?'→ '+t+'号':'弃票'}</small></button>`;}).join('')}</div>
  <div class="pkf"><button class="btn" onclick="voteClear()">清空</button><button class="btn pri" style="flex:2" onclick="adv(voteOk)">${res.t}</button></div>`,keep);
}
function voteFor(n){window._vc=n;drawVote(true);}
function voteBy(n){
 if(!window._vc)return toast('先点被投的玩家');
 if(S.v.m[n]===window._vc)delete S.v.m[n];else S.v.m[n]=window._vc;
 save();render();drawVote(true);
}
function voteClear(){S.v.m={};save();render();drawVote(true);}
function voteOk(){
 const v=S.v,r=tally(),res=voteResult(),
  line=`${VN[v.kind]}${v.round>1?'（PK）':''}：${r.t.map(x=>`${x.n}号 ${x.k}票（${x.who.map(n=>n+(v.kind==='exile'&&seat(n).badge?'🎖':'')).join('、')}）`).join('｜')||'无人投票'}${r.none.length&&r.t.length?`｜弃票 ${r.none.join('、')}号`:''}`;
 close_();
 if(res.pk)return commit('',()=>{L(line);L(`平票 PK：${res.pk.join('、')}号`);S.v={kind:v.kind,round:2,c:res.pk,m:{}};}),openVote(v.kind);
 commit('',()=>{L(line);v.kind==='exile'?exile_(res.n):sheriff_(res.n);});
}

/* ---------- 狼人自爆 ---------- */
const canBoom=s=>isWolf(s)&&!['beauty','gargoyle','mechwolf'].includes(s.role); // 狼美人、石像鬼、机械狼不能自爆
function pickBoom(){seatPicker('哪位狼人自爆？',{ok:s=>alive(s)&&(S.hide||canBoom(s)),done:n=>canBoom(seat(n))?askBoom(n):toast('该玩家不能自爆')});}
// 警长还没选出的竞选日，问清是否在竞选中自爆
function askBoom(n){
 if(S.d)return toast('今天已有结果，需先更正');
 if(!electing())return boom(n,'');
 sheet(`<h2>💥 ${lab(n)} 自爆</h2>${note('自爆后直接入夜。是否发生在警长竞选阶段？')}<div class="opts" style="margin-top:12px">
  <button class="btn pri" style="grid-column:span 2" onclick="boom(${n},'')">不是竞选阶段</button>
  <button class="btn" onclick="boom(${n},'lost')">竞选中自爆<small>警徽流失</small></button><button class="btn" ${S.day>1?'disabled':''} onclick="boom(${n},'later')">竞选中自爆<small>${S.day>1?'已延过一次':'竞选延到明天'}</small></button></div>`);
}
function boom(n,badge){close_();const s=seat(n);commit('',()=>{
 s.dead='boom';s.at=label();S.d={n:0,skip:'boom',boom:n,lost:badge==='lost',later:badge==='later'};S.v=null;
 L(`狼人自爆：${sn(n)}，直接入夜`);
 if(s.role==='bloodmoon'){S.sealed=S.day+1;L('血月使徒自爆，今夜神职技能被封印');}
 if(badge==='lost'){S.badgeLost=true;L('警长竞选中自爆：警徽流失');}
 if(badge==='later'){S.elLater=true;L('警长竞选中自爆：竞选延到明天');}
});}

/* ---------- 开枪 ---------- */
// 座位的 shot：{t:带走的座位(0=不开枪), d:开枪时已出局, day:哪一天}
const shooters=t=>gunners().filter(s=>!noGun(s)&&!(s.shot&&s.shot.t)&&s.n!==t);
function pickShot(x){
 const s=seat(x);if(noGun(s))return toast(noGun(s)+'，不可开枪');
 seatPicker(`${lab(x)} 开枪带走谁？`,{ok:v=>alive(v)&&v.n!==x,none:s.dead?{label:'不开枪',value:0}:null,done:t=>shoot(x,t)});
}
function shoot(x,t){close_();const s=seat(x);commit('',()=>{
 unshoot(s);s.shot={t,d:!!s.dead,day:gunDay()};
 if(!t)return L(`${gunName(s)} ${lab(x)} 不开枪`);
 const v=seat(t);v.dead='shot';v.at=`第${gunDay()}天`;if(luckyGun(s))S.lucky.used=true;
 L(`${gunName(s)} ${lab(x)} 开枪带走 ${sn(t)}`);follow(t);
});}
// 从被带走的座位录入：自动对应开枪的人，多人可开枪时再问
function shotAt(t){
 const g=shooters(t);if(!g.length)return;
 if(g.length===1)return shoot(g[0].n,t);
 sheet(`<h2>🔫 谁带走 ${lab(t)}？</h2><div class="opts">${g.map(s=>`<button class="btn" onclick="shoot(${s.n},${t})">${S.hide?lab(s.n):lab(s.n)+' '+gunName(s)}</button>`).join('')}</div>`);
}
function revokeShot(x){const s=seat(x);commit(`更正：取消 ${lab(x)} 的开枪`,()=>unshoot(s));}
function unshoot(s){
 const h=s.shot;delete s.shot;if(!h)return;
 if(luckyGun(s)&&h.t)S.lucky.used=false;
 if(h.t&&seat(h.t).dead==='shot')revive(seat(h.t));
}
// 恢复存活：连同死后开的枪、带走自己的那一枪一起撤销
function revive(s){
 if(s.shot&&s.shot.d)unshoot(s);
 s.dead=null;s.at='';s.flip=false;delete s.ng;
 const by=S.seats.find(x=>x.shot&&x.shot.t===s.n);if(by){if(luckyGun(by))S.lucky.used=false;delete by.shot;}
}

/* ---------- 渲染 ---------- */
function autoVillagers(){
 if(ROLES.some(r=>r.k!=='villager'&&left(r.k)>0))return;
 S.seats.forEach(s=>{if(!s.role)s.role='villager';});
}
// 更正身份后，同步跨夜记录
function sync(){
 const h=one('hybrid');if(h&&S.model===h.n)S.model=null;
 if(S.mech&&seat(S.mech.n).role)S.mech.role=seat(S.mech.n).role;
}
// 改选身份后，清掉因此变得不合规则的夜间录入
const ACT={seer:['check'],medium:['check'],witch:['anti','poison'],guard:['guard'],dreamer:['dream'],magician:['swap'],merchant:['trade'],beauty:['charm'],demon:['dcheck'],gargoyle:['gcheck'],
 witchhunter:['hunt'],younger:['bknife'],mechwolf:['learn','mcheck','mpoison','mguard','mknife'],nightmare:['fear']};
function enforce(){
 if(!S.night)return;
 const n=S.n,w=one('witch'),F=freshNight();
 for(const k in ACT)if(cntOf(k)&&blocked(k))ACT[k].forEach(f=>{n[f]=F[f];});
 // 目标已被标记出局的录入作废（刀口按空刀）
 for(const f of Object.keys(TG))if(n[f]>0&&seat(n[f]).dead)n[f]=f==='knife'?0:F[f];
 if(n.swap&&n.swap.some(x=>seat(x).dead))n.swap=F.swap;
 if(n.trade&&seat(n.trade.n).dead)n.trade=null;
 if(packFeared())n.knife=0;
 if(n.anti&&(!(n.knife>0)||n.poison||(w&&w.n===n.knife)))n.anti=false;
 for(const [k,f] of [['seer','check'],['medium','check'],['dreamer','dream'],['demon','dcheck'],['gargoyle','gcheck'],['mechwolf','learn'],['beauty','charm'],['nightmare','fear'],['witchhunter','hunt']])if(n[f]&&one(k)&&n[f]===one(k).n)n[f]=null;
 if(n.trade&&one('merchant')&&n.trade.n===one('merchant').n)n.trade=null;
}
function render(){
 let h=`<header><h1>狼人杀<em>·</em>法官记录<small>// ${BD().name} · ${BD().desc}</small></h1>
  <button class="ib ${S.hide?'on':''}" onclick="togHide()" title="隐藏身份">${S.hide?'🙈':'👁'}</button>
  <button class="ib" onclick="openMenu()">⋯</button></header>`;
 h+=`<main class="lay"><section class="side">${updBar()}${winBar()}${S.night?wizard():dayPanel()}</section><section class="seatsec"><div class="lbl">SEATS · 点座位标记状态</div><div class="grid ${S.hide?'hide':''}">${S.seats.map(seatHTML).join('')}</div></section></main>`;
 const al=S.seats.filter(s=>!s.dead),c=k=>S.hide?'?':al.filter(s=>s.role&&R[s.role].c===k).length;
 h+=`<div class="stats"><div class="in"><div class="st w"><b>${c('wolf')}</b>狼人</div><div class="st g"><b>${c('god')}</b>神职</div><div class="st v"><b>${c('villager')}</b>平民</div><div class="st"><b>${al.length}</b>存活</div><button class="btn" onclick="openLog()">记录</button></div></div>`;
 $('#app').innerHTML=h;
}
function seatHTML(s){
 const r=s.role&&R[s.role],tags=[],n=S.n,nt=(c,t)=>tags.push(`<span class="tag nt ${c}">${t}</span>`);
 if(s.badge)tags.push(`<span class="tag badge ${s.dead?'off':''}">🎖警徽</span>`);
 if(s.flip)tags.push(`<span class="tag flip">已翻牌</span>`);
 if(s.role==='hybrid'&&S.model)tags.push(`<span class="tag mdl">榜样→${S.model}</span>`);
 if(s.role==='mechwolf'&&S.mech)tags.push(`<span class="tag mdl">学→${S.mech.n}</span>`);
 if(S.lucky&&S.lucky.n===s.n)tags.push(`<span class="tag mdl">幸运儿·${SKILL[S.lucky.skill]}</span>`);
 if((S.day===1||electing())&&S.police.includes(s.n))tags.push(`<span class="tag pol">${S.out.includes(s.n)?'退水':'上警'}</span>`);
 if(!S.night&&S.charmed===s.n&&one('beauty')&&!one('beauty').dead&&!s.dead)tags.push('<span class="tag mdl">被魅惑</span>');
 if(S.night){
  if(n.swap&&n.swap.includes(s.n))nt('p','换');if(n.fear===s.n)nt('p','惧');if(n.dream===s.n)nt('g','梦');if(n.guard===s.n||n.mguard===s.n)nt('g','守');
  if(n.knife===s.n)nt('k',n.anti?'刀·救':'刀口');if(n.bknife===s.n||n.mknife===s.n)nt('k','刀');if(n.charm===s.n)nt('p','魅');
  if([n.poison,n.lpoison,n.mpoison].includes(s.n))nt('p','毒');if(n.hunt===s.n)nt('k','猎');if([n.check,n.gcheck,n.dcheck,n.lcheck,n.mcheck].includes(s.n))nt('c','验');
 }
 return `<div class="seat ${r?r.c:''} ${s.dead?'dead':''}" onclick="tapSeat(${s.n-1})">
  <span class="no">${s.n}</span><div class="tags">${tags.join('')}</div>
  ${r?`<img src="img/${r.k}.png"><div class="rn"><span>${r.n}</span></div>`:`<div class="empty">?</div><div class="rn" style="color:var(--dim)"><span>未录入</span></div>`}
  ${S.names[s.n-1]?`<div class="nm">${S.names[s.n-1]}</div>`:''}
  ${s.dead?`<div class="stamp ${s.dead}">${CAUSE[s.dead]}</div>`:''}</div>`;
}
function tapSeat(i){
 const s=S.seats[i],r=s.role&&R[s.role];
 let o=`<h2>${r&&!S.hide?`<img src="img/${r.k}.png">`:''}${lab(s.n)}${S.hide?'':` · ${r?r.n:'未录入'}`}</h2><div class="opts">`;
 o+=`<button class="btn ${s.badge?'act':''}" onclick="doBadge(${i})">🎖 ${s.badge?'撤销警徽':'警徽'}<small>${s.badge?'当前持有':S.badgeLost?'警徽已流失':'授予/移交'}</small></button>`;
 if(!s.dead){
  o+=`<button class="btn danger" ${S.night||S.d?'disabled':''} onclick="doExile(${s.n})">🗳 放逐出局<small>${S.night?'仅白天':S.d?'今天已放逐':!S.hide&&s.role==='idiot'&&!s.flip?'白痴翻牌，视为出局':'白天投票'}</small></button>`;
  o+=`<button class="btn danger" onclick="doDie(${i},'night')">🌙 夜间阵亡<small>被刀/毒等</small></button>`;
  const g=shooters(s.n);
  o+=`<button class="btn danger" ${g.length?'':'disabled'} onclick="shotAt(${s.n})">🔫 被枪带走<small>${g.length?g.map(x=>x.n+'号').join('、')+'开枪':'现在无人可开枪'}</small></button>`;
 }else o+=`<button class="btn" onclick="doRevive(${i})">♻️ 恢复存活<small>误操作更正</small></button>`;
 if(gunners().includes(s)){const no=noGun(s),h=s.shot&&s.shot.t;o+=`<button class="btn danger" ${no||h?'disabled':''} onclick="pickShot(${s.n})">🔫 开枪<small>${no?no+'，不可开枪':h?'已带走 '+h+'号':'带走一名玩家'}</small></button>`;}
 o+=`<button class="btn" onclick="pickRole(${i})">✏️ ${r?'修改身份':'录入身份'}<small>底牌</small></button><button class="btn" onclick="openNames(${i})">🏷 玩家名字<small>${S.names[i]||'未录入'}</small></button></div>`;
 sheet(o);
}
function pickRole(i){
 const s=S.seats[i];
 sheet(`<h2>${lab(s.n)} · 身份底牌</h2><div class="rp">${ROLES.filter(r=>cntOf(r.k)).map(r=>`<button class="${s.role===r.k?'cur':''}" ${left(r.k)<=0&&s.role!==r.k?'disabled':''} onclick="setRole(${i},'${r.k}')"><img src="img/${r.k}.png">${r.n}<div class="c">剩 ${Math.max(0,left(r.k))}</div></button>`).join('')}</div>${s.role?`<button class="btn" style="width:100%;margin-top:10px" onclick="setRole(${i},null)">清除身份</button>`:''}`);
}
function setRole(i,k){close_();commit(`${i+1}号 身份记为 ${k?R[k].n:'空'}`,()=>{S.seats[i].role=k;});}
function doBadge(i){close_();const had=S.seats[i].badge;commit(had?`${lab(i+1)} 警徽撤销`:`警徽授予 ${lab(i+1)}`,()=>{S.seats.forEach(s=>s.badge=false);S.seats[i].badge=!had;if(!had){S.badgeDone=true;S.badgeLost=false;}});}
function doDie(i,t){close_();commit('',()=>{const s=S.seats[i];s.dead=t;s.at=t==='night'?`第${S.day}夜`:label();L(`${sn(i+1)} ${CAUSE[t]}`);if(!S.night)follow(i+1);});}
function doRevive(i){close_();if(S.d&&S.d.n===i+1)return revokeExile();commit(`${lab(i+1)} 恢复存活（更正）`,()=>{const s=S.seats[i],d=S.d;
 // 自爆、决斗的误操作：连同直接入夜和已用技能一起恢复
 if(!S.night&&d&&d.skip==='boom'&&s.dead==='boom'){S.d=null;S.sealed=0;if(d.lost)S.badgeLost=false;if(d.later)S.elLater=false;}
 if(!S.night&&d&&d.skip==='duel'&&d.duel===s.n){S.d=null;S.knightUsed=false;}
 if(s.dead==='duel'&&s.role==='knight')S.knightUsed=false;
 revive(s);});}
function togHide(){S.hide=!S.hide;save();render();toast(S.hide?'身份已隐藏':'身份已显示');}

/* ---------- 玩家名字 ---------- */
// 名字会直接拼进界面，只保留安全字符
const cleanName=v=>[...v.replace(/[<>&"'`\\]/g,'').trim()].slice(0,8).join('');
function openNames(i){
 sheet(`<h2 class="lh"><span>🏷 玩家名字</span><button class="btn pri" onclick="saveNames()">保存</button></h2><div class="nms">${S.names.map((v,k)=>`<label><b>${k+1}</b><input maxlength="8" value="${v}" placeholder="${k+1}号玩家" enterkeyhint="next" onkeydown="nameKey(event,${k})"></label>`).join('')}</div>
  <button class="btn" style="width:100%;margin-top:10px" onclick="document.querySelectorAll('.nms input').forEach(x=>x.value='')">清空全部</button>`);
 if(i!==undefined){const e=document.querySelectorAll('.nms input')[i];e.focus();e.select();}
}
function nameKey(e,k){if(e.key!=='Enter'||e.isComposing||e.keyCode===229)return;const x=document.querySelectorAll('.nms input')[k+1];if(x)x.focus();else saveNames();}
function saveNames(){const v=[...document.querySelectorAll('.nms input')].map(x=>cleanName(x.value));S.names=v;save();close_();render();toast('名字已保存');}

/* ---------- 历史对局 ---------- */
// 新开一局时自动存入，保留最近 20 局
const HK='lrs-history',HMAX=20;
function loadHist(){try{const a=JSON.parse(localStorage.getItem(HK));return Array.isArray(a)?a.filter(g=>g&&g.id&&g.seats&&g.log&&g.names):[];}catch(e){return [];}}
function saveHist(a){for(let k=Math.min(a.length,HMAX);k>=0;k--)try{return localStorage.setItem(HK,JSON.stringify(a.slice(0,k)));}catch(e){}}
const hist=id=>loadHist().find(g=>g.id===id);
const bdName=g=>BOARDS[g.board]?BOARDS[g.board].name:g.board;
const when=g=>{const d=new Date(g.end),p=x=>String(x).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;};
function archive(){
 if(!S.log.length)return;
 const {id,board,day,win,names,seats,log}=S;
 saveHist([{id,end:Date.now(),board,day,win,names,seats,log},...loadHist().filter(g=>g.id!==id)]);
}
function openHistory(){
 const a=loadHist();
 sheet(`<h2>🗂 历史对局</h2>${a.length?`<div class="hs">${a.map(g=>`<button class="btn" onclick="openHist('${g.id}')"><b>${bdName(g)}</b><small>${when(g)} · ${g.day} 天</small><small class="${g.win?g.win.side:''}">${g.win?winText(g.win):'未分胜负'}</small></button>`).join('')}</div>`:note('还没有历史对局。新开一局时，上一局会自动存到这里。')}${note(`最多保留最近 ${HMAX} 局，只存在本机。`)}`);
}
function openHist(id){
 const g=hist(id);if(!g)return openHistory();
 sheet(`<h2 class="lh"><span>🗂 ${bdName(g)}</span><button class="btn pri" onclick="copyLog('${id}')">📋 复制</button></h2>${note(when(g))}${g.win?`<div class="winbar ${g.win.side}" style="margin-top:8px;cursor:default">🏆 ${winText(g.win)}</div>`:''}${rosterHTML(g,false)}${logHTML(g)}
  <div class="pkf"><button class="btn" onclick="openHistory()">← 返回</button><button class="btn danger" onclick="askDelHist('${id}')">删除这一局</button></div>`);
}
function askDelHist(id){const g=hist(id);if(!g)return;sheet(`<h2>删除这一局？</h2>${note(`${bdName(g)} · ${when(g)}，删除后无法恢复。`)}<div class="pkf"><button class="btn" onclick="openHist('${id}')">取消</button><button class="btn danger" onclick="delHist('${id}')">确认删除</button></div>`);}
function delHist(id){saveHist(loadHist().filter(g=>g.id!==id));openHistory();toast('已删除');}

/* ---------- 菜单 ---------- */
// 记录顶部：12 位玩家的身份与状态（隐藏模式下不显示身份）
function rosterHTML(g=S,hide=S.hide){return `<div class="ros">${g.seats.map(s=>{const r=s.role&&R[s.role];
 return `<div class="${s.dead?'out ':''}${r&&!hide?r.c:''}"><b>${s.n}</b>${r&&!hide?`<img src="img/${r.k}.png">`:''}<span>${hide?'???':r?r.n:'未录入'}${s.badge?' 🎖':''}${g.names[s.n-1]?`<em>${g.names[s.n-1]}</em>`:''}${s.dead?`<small class="${s.dead}">${s.at}${CAUSE[s.dead]}</small>`:''}</span></div>`;}).join('')}</div>`;}
function openLog(){sheet(`<h2 class="lh"><span>📜 对局记录</span><button class="btn pri" onclick="copyLog()">📋 复制</button></h2>${winBar()}${rosterHTML()}${logHTML()}`);}
function logHTML(g=S){return `<ul class="log">${g.log.length?g.log.map(l=>`<li><i>${l.t}</i><span>${l.x}</span></li>`).join(''):'<li>暂无记录</li>'}</ul>`;}
function openMenu(){
 sheet(`<h2>菜单</h2><div class="opts">
  <button class="btn" ${undo.length?'':'disabled'} onclick="doUndo()">↩️ 撤销上一步<small>含夜间录入</small></button>
  <button class="btn" onclick="openLog()">📜 对局记录</button>
  <button class="btn" onclick="openNames()">🏷 玩家名字<small>已录 ${S.names.filter(x=>x).length}/12</small></button>
  <button class="btn" onclick="copyLog()">📋 复制复盘文本</button>
  <button class="btn" onclick="openHistory()">🗂 历史对局<small>${loadHist().length} 局</small></button>
  <button class="btn" ${navigator.wakeLock?'':'disabled'} onclick="togWake()">🔆 屏幕常亮<small>${!navigator.wakeLock?'此浏览器不支持':!wakeOn?'已关闭':wake?'已开启':'未生效，请关省电模式'}</small></button>
  <button class="btn danger" onclick="newGame()" style="grid-column:span 2">🔄 新开一局 / 换板子</button></div>${note('版本 '+VER)}`);
}
function doUndo(){if(!undo.length)return;const {hide,names,id}=S;S=norm(JSON.parse(undo.pop()));undoDirty='pop';S.hide=hide;S.names=names;
 if(S.id!==id)saveHist(loadHist().filter(g=>g.id!==S.id)); // 撤销“新开一局”：这一局又在进行，从历史移出
 save();close_();render();toast('已撤销');}
function newGame(){sheet(`<h2>🔄 选择板子</h2>${pristine()?'':note(S.log.length?'当前对局会存入历史对局。':'当前录入将清空。')}<div class="bds">${Object.entries(BOARDS).map(([k,b])=>`<button class="btn bd ${S.board===k?'act':''}" onclick="startGame('${k}')">${b.name}<small>${b.desc}</small></button>`).join('')}</div>`);}
// 误点可从菜单“撤销上一步”找回
function startGame(k){const {hide,names}=S;close_();archive();snap();S=Object.assign(fresh(k),{hide,names});save();render();toast('已开新局：'+BD().name);}
function copyLog(id){
 const g=id?hist(id):S;if(!g)return;
 const t=[`【狼人杀法官记录】${bdName(g)}${id?' '+when(g):''}`,...(g.win?['结果：'+winText(g.win)]:[]),...g.seats.map(s=>`${s.n}号${g.names[s.n-1]?' '+g.names[s.n-1]:''} ${s.role?R[s.role].n:'-'}${s.badge?' 🎖':''}${s.dead?`（${s.at}${CAUSE[s.dead]}）`:''}`),'','过程：',...g.log.map(l=>`[${l.t}] ${l.x}`)].join('\n');
 const done=r=>toast(r?'已复制到剪贴板':'复制失败');
 // 局域网 http 下没有 navigator.clipboard，退回 execCommand
 if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(t).then(()=>done(true),()=>done(copyFallback(t)));
 else done(copyFallback(t));
}
function copyFallback(t){
 const a=document.createElement('textarea');a.value=t;a.readOnly=true;a.style.cssText='position:fixed;top:0;left:0;opacity:0;font-size:16px';
 document.body.appendChild(a);a.focus();a.select();a.setSelectionRange(0,t.length);
 let r=false;try{r=document.execCommand('copy');}catch(e){}
 a.remove();return r;
}
/* ---------- 屏幕常亮 ---------- */
// 需要 https 或 localhost；切到后台会被系统释放，回到前台或点屏幕时重新申请
let wake=null,wakeOn=true;
try{wakeOn=localStorage.getItem('lrs-wake')!=='0';}catch(e){}
async function holdWake(){
 if(!wakeOn||wake||!navigator.wakeLock||document.visibilityState!=='visible')return;
 try{
  const w=await navigator.wakeLock.request('screen');
  if(!wakeOn||wake)return w.release();
  wake=w;w.addEventListener('release',()=>{if(wake===w)wake=null;});
 }catch(e){}
}
async function togWake(){
 wakeOn=!wakeOn;try{localStorage.setItem('lrs-wake',wakeOn?'1':'0');}catch(e){}
 if(wakeOn)await holdWake();else if(wake){const w=wake;wake=null;w.release();}
 openMenu();
}
document.addEventListener('visibilitychange',holdWake);
document.addEventListener('pointerup',holdWake);
holdWake();

settle(); // 打开旧存档时也整理一次并补判胜负
/* ---------- 新版提示 ---------- */
// 新版下载完先等待，用户点了才启用并刷新；对局已存盘，刷新后接着录
function updBar(){return newSW?`<div class="winbar upd" onclick="applyUpdate()">✨ 有新版，点此更新（对局保留）</div>`:'';}
function applyUpdate(){if(!newSW)return;applying=true;save();newSW.postMessage('skip');setTimeout(()=>location.reload(),3000);}
function watchSW(reg){
 const ready=w=>{if(w&&navigator.serviceWorker.controller){newSW=w;render();}};
 const follow_=w=>w&&w.addEventListener('statechange',()=>{if(w.state==='installed')ready(w);});
 ready(reg.waiting);follow_(reg.installing);
 reg.addEventListener('updatefound',()=>follow_(reg.installing));
 let last=Date.now(); // 长时间开着时，回到前台顺便检查
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&Date.now()-last>6e5){last=Date.now();reg.update().catch(()=>{});}});
}
if('serviceWorker' in navigator){
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(applying){applying=false;location.reload();}});
 addEventListener('load',()=>navigator.serviceWorker.register('sw.js').then(watchSW).catch(()=>{}));
}
