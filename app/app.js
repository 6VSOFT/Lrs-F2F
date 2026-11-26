const VER='v35'; // 与 sw.js 的版本号一致
let newSW=null,applying=false; // 已下载、等待启用的新版
/* ---------- 图标 ---------- */
const IC={chart:'M4 20V11M10 20V5M16 20v-6M21 20H3',book:'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4ZM5 17a3 3 0 0 1 3-3h11',tv:'M3 5h18v12H3zM8 21h8M12 17v4',pic:'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 9h.01',talk:'M4 5h16v11H10l-5 4v-4H4z',vol:'M4 9v6h4l5 4V5L8 9H4ZM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11',save:'M12 4v11M7 10l5 5 5-5M5 20h14',eye:'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',eyeoff:'M3 3l18 18M10 5.2A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.7A16 16 0 0 0 2 12s3.6 7 10 7a10 10 0 0 0 5-1.3M9.9 9.9a3 3 0 0 0 4.2 4.2',
 more:'M5 12h.01M12 12h.01M19 12h.01',badge:'M12 3l2.5 5 5.5.8-4 3.9 1 5.5-5-2.7-5 2.7 1-5.5-4-3.9 5.500-.8Z',vote:'M4 11h16v9H4ZM8 11V4h8v7M9.500 15.500h5',moon:'M20 14.500A8.500 8.500 0 0 1 9.500 4 8.500 8.500 0 1 0 20 14.500Z',
 gun:'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM12 2v5M12 17v5M2 12h5M17 12h5',redo:'M4 12a8 8 0 1 0 2.600-5.900L4 8.500M4 4v4.500h4.500',edit:'M4 20l1-4.500L16 4.500l3.500 3.500L8.500 19ZM14 6.500l3.500 3.500',tag:'M4 4h8l8 8-8 8-8-8ZM8 8h.01',
 undo:'M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3',log:'M6 3h12v18H6ZM9.500 8h5M9.500 12h5M9.500 16h3',copy:'M9 9h11v11H9ZM5 15H4V4h11v1',folder:'M3 6h6l2 2h10v11H3Z',sun:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.400 1.400M17.600 17.600L19 19M5 19l1.400-1.400M17.600 6.400L19 5',
 wolf:'M12 13c-3 0-5 2.300-5 4.500S9 20 12 20s5-.3 5-2.500S15 13 12 13ZM6 10.500a1.800 1.800 0 1 0 0-.01M9.500 6.500a1.800 1.800 0 1 0 0-.01M14.500 6.500a1.800 1.800 0 1 0 0-.01M18 10.500a1.800 1.800 0 1 0 0-.01',ok:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM8 12.500l2.700 2.700L16 9.500',no:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM6 6l12 12',
 cup:'M7 4h10v6a5 5 0 0 1-10 0ZM7 6H4c0 3 1 4.500 3 5M17 6h3c0 3-1 4.500-3 5M12 15v5M8.500 20h7',star:'M12 4v16M4 12h16M6.500 6.500l11 11M17.500 6.500l-11 11',warn:'M12 4l9 16H3ZM12 10v4.500M12 17.500h.01'};
const ic=k=>`<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="${IC[k]}"/></svg>`;
/* ---------- 身份与板子 ---------- */
// c：阵营 god 神职 / villager 平民（含混血儿） / wolf 狼人
const ROLES=[
 ['seer','预言家','god'],['medium','通灵师','god'],['witch','女巫','god'],['hunter','猎人','god'],['idiot','白痴','god'],['guard','守卫','god'],
 ['knight','骑士','god'],['magician','魔术师','god'],['merchant','黑市商人','god'],['dreamer','摄梦人','god'],['grave','守墓人','god'],['witchhunter','猎魔人','god'],
 ['hybrid','混血儿','villager'],['villager','平民','villager'],
 ['wolf','狼人','wolf'],['wolfking','狼王','wolf'],['demon','恶魔','wolf'],['beauty','狼美人','wolf'],['elder','狼兄','wolf'],['younger','狼弟','wolf'],
 ['gargoyle','石像鬼','wolf'],['mechwolf','机械狼','wolf'],['nightmare','噩梦之影','wolf'],['bloodmoon','血月使徒','wolf'],
 ['wukong','孙悟空','god'],['zixia','紫霞仙子','god'],['guanyin','观音','god'],['heixiong','黑熊精','god'],['erlang','二郎神','wolf'],['tianbing','天兵','wolf']].map(([k,n,c])=>({k,n,c}));
const R=Object.fromEntries(ROLES.map(r=>[r.k,r]));
// cnt：各身份张数（合计 12）；pack：首夜一起睁眼的狼；mark：在狼人环节里单独确认的特殊狼
// n1 / n2：首夜 / 第 2 夜起的流程
const B4={seer:1,witch:1,hunter:1,villager:4,wolf:3};
const BOARDS={
 hybrid:{name:'预女猎白混',desc:'预女猎白混 + 3民 + 4狼',cnt:{seer:1,witch:1,hunter:1,idiot:1,hybrid:1,villager:3,wolf:4},pack:['wolf'],
  n1:'close hybrid wolf witch seer hunter idiot dawn',n2:'close wolf witch seer hunter dawn'},
 std:{name:'标准版 预女猎白',desc:'预女猎白 + 4民 + 4狼',cnt:{...B4,idiot:1,wolf:4},pack:['wolf'],
  n1:'close wolf witch seer hunter idiot dawn',n2:'close wolf witch seer hunter dawn'},
 wkguard:{name:'狼王守卫',desc:'预女猎守 + 4民 + 3狼 + 狼王',cnt:{...B4,guard:1,wolfking:1},pack:['wolf','wolfking'],mark:'wolfking',
  n1:'close guard wolf witch seer hunter dawn',n2:'close guard wolf witch seer hunter dawn'},
 demon:{name:'恶魔守卫',desc:'预女猎守 + 4民 + 3狼 + 恶魔',cnt:{...B4,guard:1,demon:1},pack:['wolf','demon'],
  n1:'close guard wolf witch seer hunter demon dawn',n2:'close guard wolf witch seer hunter demon dawn'},
 beauty:{name:'狼美人骑士',desc:'预女守骑 + 4民 + 3狼 + 狼美人',cnt:{seer:1,witch:1,guard:1,knight:1,villager:4,wolf:3,beauty:1},pack:['wolf','beauty'],
  n1:'close guard wolf beauty witch seer knight dawn',n2:'close guard wolf beauty witch seer dawn'},
 magician:{name:'狼王魔术师',desc:'预女猎魔术 + 4民 + 3狼 + 狼王',cnt:{...B4,magician:1,wolfking:1},pack:['wolf','wolfking'],mark:'wolfking',
  n1:'close magician wolf witch seer hunter wolfking dawn',n2:'close magician wolf witch seer hunter wolfking dawn'},
 bros:{name:'狼兄狼弟黑市商人',desc:'预女商守 + 4民 + 2狼 + 狼兄弟',cnt:{seer:1,witch:1,merchant:1,guard:1,villager:4,wolf:2,elder:1,younger:1},pack:['wolf','elder'],
  n1:'close merchant guard bros wolf witch seer lucky dawn',n2:'close merchant guard younger wolf witch seer lucky dawn'},
 wkdream:{name:'狼王摄梦人',desc:'预女猎摄 + 4民 + 3狼 + 狼王',cnt:{...B4,dreamer:1,wolfking:1},pack:['wolf','wolfking'],mark:'wolfking',
  n1:'close dreamer wolf witch seer hunter dawn',n2:'close dreamer wolf witch seer hunter dawn'},
 gargoyle:{name:'石像鬼守墓人',desc:'预女猎墓 + 4民 + 3狼 + 石像鬼',cnt:{...B4,grave:1,gargoyle:1},pack:['wolf'],
  n1:'close wolf witch gargoyleId seer hunter grave gargoyle dawn',n2:'close gargoyle wolf witch seer hunter grave dawn'},
 mech:{name:'机械狼通灵师',desc:'通女猎守 + 4民 + 3狼 + 机械狼',cnt:{medium:1,witch:1,hunter:1,guard:1,villager:4,wolf:3,mechwolf:1},pack:['wolf'],
  ids:['guard','mechwolf','wolf','witch','medium','hunter'],
  n1:'close ids guard mech wolf witch medium hunter dawn',n2:'close guard mech wolf witch medium hunter mechgun dawn'},
 nightmare:{name:'噩梦之影摄梦人',desc:'预女猎摄 + 4民 + 3狼 + 噩梦之影',cnt:{...B4,dreamer:1,nightmare:1},pack:['wolf'],
  n1:'close nightmare dreamer wolf witch seer hunter dawn',n2:'close nightmare dreamer wolf witch seer hunter dawn'},
 blood:{name:'血月使徒猎魔人',desc:'预女猎魔白 + 4民 + 3狼 + 血月',cnt:{seer:1,witch:1,witchhunter:1,idiot:1,villager:4,wolf:3,bloodmoon:1},pack:['wolf','bloodmoon'],mark:'bloodmoon',
  n1:'close wolf witch seer witchhunter idiot dawn',n2:'close wolf witch seer witchhunter dawn'},
 // 西游杀：两位领袖每晚“寻宝”，集齐三件宝物觉醒；离孙悟空最近的平民是唐僧（本人不知道）
 xiyou:{name:'西游杀',desc:'悟空紫霞观音黑熊 + 4民 + 二郎神 + 3天兵',cnt:{wukong:1,zixia:1,guanyin:1,heixiong:1,villager:4,erlang:1,tianbing:3},pack:['tianbing'],wn:'天兵',
  ids:['zixia','erlang','wukong','tianbing','guanyin','heixiong'],
  n1:'close ids zixia erlang wukong wolf guanyin heixiong dawn',n2:'close zixia erlang wukong wolf guanyin heixiong dawn'}};
for(const b of Object.values(BOARDS)){b.n1=b.n1.split(' ');b.n2=b.n2.split(' ');}
const CAUSE={exile:'放逐出局',night:'夜间阵亡',shot:'枪杀出局',duel:'决斗出局',boom:'自爆出局',love:'殉情出局'};
const SKILL={check:'查验',poison:'毒药',gun:'猎枪'};

/* ---------- 状态 ---------- */
const KEY='lrs-werewolf-v2';
const freshNight=()=>({step:0,guard:null,dream:null,fear:null,swap:null,knife:null,anti:false,poison:null,check:null,gcheck:null,dcheck:null,
 charm:null,hunt:null,bknife:null,trade:null,lcheck:null,lpoison:null,learn:null,mcheck:null,mpoison:null,mguard:null,mknife:null,
 zx:null,wkT:[],elT:[],wkB:null,elB:null,wkC:null,elC:null,wkA:null,elA:null,gyS:false,gyB:null});
// 西游杀的跨夜状态：宝物记为获得的夜数（0=没有），awake 觉醒的夜数
const freshXY=()=>({wukong:{A:0,B:0,C:0,usedB:false,awake:0},erlang:{A:0,B:0,C:0,usedB:false,awake:0},lastZx:0,bound:0,tang:0,gyUsed:false});
const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
// police 上警；out 退水；elLater 竞选延到第 2 天；v 记票草稿 {kind,round,c:PK 候选,m:{投票人:被投}}
const fresh=(board='hybrid')=>({id:newId(),board,out:[],elLater:false,v:null,names:Array(12).fill(''),police:[],day:1,night:true,hide:false,model:null,used:{anti:false,poison:false},
 lastGuard:0,lastDream:0,lastCharm:0,charmed:0,lastExile:0,swapped:[],traded:null,lucky:null,mech:null,mechUsed:{poison:false,guard:false},awakeDay:null,sealed:0,knightUsed:false,badgeDone:false,badgeLost:false,xy:freshXY(),
 n:freshNight(),d:null,talk:null,win:null,seats:Array.from({length:12},(_,i)=>({n:i+1,role:null,dead:null,at:'',badge:false,flip:false})),log:[]});
// 补齐旧存档、旧撤销记录缺少的字段
function norm(s){
  const o=Object.assign(fresh(),s);o.n=Object.assign(freshNight(),s.n);
  if(!BOARDS[o.board])o.board='hybrid'; // 旧存档默认原板子
  o.seats.forEach(x=>{if(x.flip&&!x.dead)x.dead='exile';}); // 旧存档：已翻牌的白痴补记为出局
  o.xy=Object.assign(freshXY(),s.xy||{});
  const fl=[].concat(BOARDS[o.board][o.day===1?'n1':'n2']).join(' ').split(' ');if(o.n.step>=fl.length)o.n.step=fl.length-1;
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
const inPack=s=>isWolf(s)&&(BD().pack.includes(s.role)||(s.role==='erlang'&&wokeOld('erlang'))||(s.role==='nightmare'&&S.day>1)||(s.role==='younger'&&S.awakeDay!==null&&S.awakeDay<S.day));
const XY=()=>S.xy;
const wokeOld=k=>!!S.xy[k].awake&&S.xy[k].awake<S.day; // 之前的夜晚已觉醒
const woke=k=>wokeOld(k)||(S.night&&!S.xy[k].awake&&'ABC'.split('').every(c=>owns(k,c))); // 今晚集齐也当夜觉醒
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
// 操作中途出错就整步还原，避免留下改了一半的状态
function commit(text,fn){
 snap();
 try{fn();if(text)L(text);}catch(e){S=norm(JSON.parse(undo.pop()));undoDirty='';save();render();toast('操作失败，已还原');throw e;}
 settle();
}
function upd(fn){commit('',fn);}
function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(t._t);t._t=setTimeout(()=>t.style.display='none',1400);}
// 弹层新打开时回到顶部；已打开时（如多选重绘）保持位置
function sheet(h,keep){const e=$('#sheet');e.innerHTML=h;$('#bg').classList.add('show');if(!keep)e.scrollTop=0;}
// 防连点：避免双击“下一步”时把下一个环节也跳过
let ADV=350,advAt=-1e4; // 用单调时钟，系统时间回拨也不会卡住按钮
function adv(fn){const t=performance.now();if(t-advAt<ADV)return;advAt=t;fn();}
function close_(){$('#bg').classList.remove('show');}
$('#bg').addEventListener('click',e=>{if(e.target.id==='bg')close_();});
const pristine=()=>S.day===1&&S.night&&!S.log.length&&!S.seats.some(s=>s.role||s.dead||s.badge);

/* ---------- 胜负：屠边 ---------- */
// 神职全部出局或平民（含混血儿）全部出局 → 狼人胜；狼人全部出局 → 好人胜。同时达成按狼刀在先
function judge(){
 if(S.seats.some(s=>!s.role))return null;
 const c=k=>S.seats.filter(s=>!s.dead&&R[s.role].c===k).length,g=c('god'),v=c('villager'),w=c('wolf');
 let wolf=!g||!v?{side:'wolf',why:!g&&!v?'神职、平民全体出局':!g?'神职全体出局':'平民全体出局'}:null,good=!w?{side:'good',why:'狼人全体出局'}:null;
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
 sheet(`<div class="wn ${S.win.side}"><div class="wi">${(S.board==='xiyou'?(w?['tianbing','erlang','tianbing']:['zixia','wukong','guanyin']):w?['wolf','wolfking','nightmare']:['seer','witch','hunter']).map(k=>`<img src="img/${k}.png" alt="">`).join('')}</div><h3>${w?'狼人屠边获胜':'好人阵营获胜'}</h3><p>${S.win.why}</p></div>${gun.length?note('刚有可开枪的玩家出局，请先处理开枪再宣布结果。'):''}
  <div class="opts">${gun.map(s=>`<button class="btn danger" style="grid-column:span 2" onclick="pickShot(${s.n})">${ic('gun')} ${lab(s.n)} 开枪</button>`).join('')}<button class="btn pri" style="grid-column:span 2" onclick="openLog()">${ic('log')} 查看记录</button><button class="btn" onclick="close_()">继续对局</button><button class="btn" onclick="newGame()">${ic('redo')} 新开一局</button></div>`);
}
const winBar=()=>S.win?`<div class="winbar ${S.win.side}" onclick="showWin()">${ic('cup')} ${winText()}</div>`:'';

/* ---------- 夜间判定 ---------- */
// 技能是否被挡：dead 出局 / fear 被恐惧 / seal 被血月封印
function blocked(k){
 const s=one(k);if(!s)return '';
 if(s.dead)return 'dead';
 if(S.n.fear===s.n&&k!=='nightmare')return 'fear';
 if(S.sealed===S.day&&R[k].c==='god')return 'seal';
 if(S.board==='xiyou'&&S.n.elC===s.n&&['guanyin','heixiong'].includes(k))return 'dog'; // 哮天犬：观音、黑熊精在二郎神之后行动；紫霞已先行动，孙悟空免疫
 return '';
}
const BLK={dead:'已出局：照常念口令，空喊流程。',fear:'今夜被噩梦之影恐惧，不能使用技能，口令照念。',seal:'今夜被血月封印，不能使用技能，口令照念。',dog:'今夜被哮天犬封印，不能使用技能，口令照念。'};
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
 const K=S.board==='xiyou'?0:mg(n.knife||0),P=mg(n.poison||0),bk=n.bknife||0; // 西游杀的刀口在 xyResolve 里结算
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
 if(S.board==='xiyou')xyResolve(die,C,N);
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


/* ---------- 西游杀 ---------- */
const TR={wukong:{A:'火眼金睛',B:'定海神针',C:'镇魔圈'},erlang:{A:'天眼',B:'三尖两刃刀',C:'哮天犬'}};
// 宝物功能（简短）
const TRF={wukong:{A:'觉醒后查验身份',B:'击杀二郎神，一次',C:'每晚护一人及左右'},erlang:{A:'觉醒后查验身份',B:'击杀孙悟空，一次',C:'每晚封印一人技能'}};
const trN=(k,c)=>`${c} ${TR[k][c]}（${TRF[k][c]}）`;
const LEAD={wukong:'孙悟空',erlang:'二郎神'};
const kindOf=s=>isWolf(s)?'A':R[s.role].c==='god'?'B':'C'; // 点到狼人 A，神职 B，平民（含唐僧）C
const owns=(k,c)=>{const t=XY()[k][c];return (!!t&&t<S.day)||(S.night&&huntRes(k).some(r=>r.got&&r.c===c));}; // 之前拿到或今晚刚寻到，当夜即可使用
// 西游杀的平民用西游风格的图
const pic=(k,b=S.board)=>k==='villager'&&b==='xiyou'?'villager-xy':k;
const ring12=x=>[x===1?12:x-1,x,x===12?1:x+1];
// 唐僧：离孙悟空座位最近的平民，两边一样近取号码大的
function findTang(){
 const w=one('wukong'),v=seatsOf('villager');if(!w||v.length!==cntOf('villager'))return 0;
 const d=x=>{const a=Math.abs(x-w.n);return Math.min(a,12-a);};
 return v.map(s=>s.n).sort((a,b)=>d(a)-d(b)||b-a)[0];
}
// 紫霞加持：点中领袖则该领袖今晚多寻宝一次；被哮天犬封印的紫霞不能再加持之后行动的孙悟空
function boosted(k){const z=one('zixia'),t=S.n.zx&&seat(S.n.zx);return !!(z&&!z.dead&&t&&t.role===k&&!(k==='wukong'&&S.n.elC===z.n));}
const picks=k=>1+(boosted(k)?1:0);
// 今晚寻宝的结果（按点的顺序）；已有的类别、点到唐僧都是“无法获取”
function huntRes(k){
 const have={...XY()[k]},T=S.n[k==='wukong'?'wkT':'elT']||[];
 return T.map(x=>{if(x===XY().tang)return {x,c:null,tang:true,got:false}; // 点到唐僧拿不到宝物
  const c=seat(x).role?kindOf(seat(x)):null;if(!c)return {x,c,got:false};const got=!have[c];if(got)have[c]=S.day;return {x,c,got};});
}
// 黑熊精：左右两侧最近的存活玩家里有没有狼；唐僧在旁边时结果反转
function bearSide(){
 const h=one('heixiong');if(!h)return null;
 const near=dir=>{for(let i=1;i<12;i++){const x=((h.n-1+dir*i)%12+12)%12+1;if(!seat(x).dead&&x!==h.n)return x;}return 0;};
 const L2=near(-1),R2=near(1),pair=[...new Set([L2,R2].filter(Boolean))];
 const wolf=pair.some(x=>isWolf(seat(x))),tang=pair.includes(XY().tang);
 return {pair,wolf,tang,say:tang?!wolf:wolf};
}
function xyResolve(die,C,N){
 const n=S.n,wk=one('wukong'),el=one('erlang'),gy=one('guanyin');
 const inv=wk&&woke('wukong'); // 觉醒的齐天大圣夜里不死
 const kill=(x,c)=>{if(!x)return;if(inv&&x===wk.n){N.push('齐天大圣已觉醒，今夜无敌。');return;}die(x,c);};
 const ring=wk&&!wk.dead&&owns('wukong','C')&&n.wkC>0?ring12(n.wkC).filter(x=>x!==wk.n):[]; // 镇魔圈不护孙悟空自己
 const K=n.knife||0;
 if(K){
  if(ring.includes(K))N.push(`${K}号 在镇魔圈内，狼刀无效。`);
  else if(n.gyS&&gy&&!gy.dead&&K!==gy.n)N.push(`观音以甘露水救下 ${K}号。`);
  else kill(K,'knife');
 }
 if(n.elB>0&&el&&!el.dead){
  const T=n.elB;
  if(woke('erlang')){if(ring.includes(T))N.push(`${T}号 在镇魔圈内，三尖两刃刀无效。`);else kill(T,'trident');}
  else if(wk&&T===wk.n)kill(T,'trident');
  else N.push('三尖两刃刀没有点中齐天大圣，无效。');
 }
 if(n.wkB>0&&wk&&!wk.dead){
  const T=n.wkB;
  if(woke('wukong'))die(T,'pin');else if(el&&T===el.n)die(T,'pin');else N.push('定海神针没有点中二郎神，无效。');
 }
 const b=XY().bound;
 if(gy&&C[gy.n]&&b&&!seat(b).dead&&!C[b]){die(b,'love');N.push(`观音出局，被收服的 ${b}号 殉情。`);}
}
function xyEnforce(){
 const n=S.n,F=freshNight(),x=XY();
 for(const k of ['wukong','erlang']){
  const f=k==='wukong'?'wk':'el',s=one(k);
  if(!s||s.dead){n[f+'T']=[];n[f+'B']=n[f+'C']=n[f+'A']=null;continue;}
  n[f+'T']=(n[f+'T']||[]).filter((t,i,a)=>t&&!seat(t).dead&&t!==s.n&&a.indexOf(t)===i).slice(0,picks(k));
  if(!owns(k,'B')||x[k].usedB)n[f+'B']=null;if(!owns(k,'C'))n[f+'C']=null;if(!woke(k))n[f+'A']=null;
  for(const g of ['B','A'])if(n[f+g]===s.n)n[f+g]=null;
 }
 const gy=one('guanyin');
 if(n.gyS&&(!(n.knife>0)||x.gyUsed||!gy||n.knife===gy.n))n.gyS=false;
 if(n.gyB&&(x.bound||gy&&n.gyB===gy.n))n.gyB=null;
 if(n.elC&&one('wukong')&&n.elC===one('wukong').n)n.elC=null; // 哮天犬对齐天大圣无效
 if(n.zx&&n.zx===x.lastZx)n.zx=null;
}
function xyDawnLog(){
 const n=S.n,x=XY(),who=k=>one(k)&&!one(k).dead;
 if(who('zixia'))L(`紫霞仙子：${n.zx>0?`加持 ${n.zx}号${boosted('erlang')||boosted('wukong')?'（领袖多寻宝一次）':''}`:'未行动'}`);
 for(const k of ['erlang','wukong']){
  if(!who(k))continue;const f=k==='wukong'?'wk':'el',nm=LEAD[k];
  if(n[f+'C']>0)L(`${nm}：${TR[k].C} ${n[f+'C']}号`);
  if(n[f+'B']>0)L(`${nm}：${TR[k].B} 击 ${n[f+'B']}号`);
  if(n[f+'A']>0)L(`${nm}查验：${n[f+'A']}号 → ${exactName(seat(n[f+'A']))}`);
  const h=huntRes(k);if(h.length)L(`${nm}寻宝：`+h.map(r=>`${r.x}号 ${r.tang?'无法获取（唐僧）':r.c?(r.got?'得 '+r.c+' '+TR[k][r.c]:'无法获取（已有 '+r.c+'）'):'未录入'}`).join('｜'));
 }
 if(who('guanyin'))L(`观音：${n.gyS?'甘露水救 '+n.knife+'号':'未用甘露水'}｜${n.gyB>0?'收服 '+n.gyB+'号':'未收服'}`);
 const b=bearSide();if(b&&who('heixiong')&&!blocked('heixiong'))L(`黑熊精：两侧 ${b.pair.join('、')}号 → ${b.say?'咆哮（报有狼）':'不咆哮（报没狼）'}${b.tang?'（唐僧在旁，结果反转）':''}`);
}
function xyCarry(){
 const n=S.n,x=XY();
 for(const k of ['erlang','wukong']){
  const f=k==='wukong'?'wk':'el',t=x[k];
  if(n[f+'B']>0)t.usedB=true;
  for(const r of huntRes(k))if(r.got)t[r.c]=S.day;
  if(!t.awake&&t.A&&t.B&&t.C){t.awake=S.day;L(`${LEAD[k]}集齐三件宝物，觉醒`);}
 }
 if(n.gyS)x.gyUsed=true;if(n.gyB>0&&!x.bound)x.bound=n.gyB; // 整局只收服一人
 x.lastZx=n.zx||0;
}
function pickHunt(k,i=0){
 const f=k==='wukong'?'wkT':'elT',me=one(k),T=S.n[f]||[],other=T.filter((x,j)=>j!==i);
 seatPicker(`${LEAD[k]}${picks(k)>1?`第 ${i+1} 次`:''}寻宝：点谁？`,{ok:s=>alive(s)&&(!me||s.n!==me.n)&&!other.includes(s.n),done:x=>upd(()=>{const a=[...(S.n[f]||[])];a[i]=x;S.n[f]=a.slice(0,i+1);})});
}
function leadStep(k){
 const s=one(k),f=k==='wukong'?'wk':'el',t=XY()[k],dead=s&&s.dead,ex=k==='wukong'?'二郎神':'齐天大圣';
 let body=idRow(k)+(dead?note(R[k].n+BLK.dead):'');
 if(s&&!dead){
  const have='ABC'.split('').filter(c=>t[c]).map(c=>trN(k,c)).join('、');
  body+=note(`之前已有：${have||'无'}${t.awake?'（已觉醒）':''}`);
  const T=S.n[f+'T']||[],h=huntRes(k),max=picks(k);
  const rs=r=>!r?'':r.tang?res(0,`${r.x}号：无法获取`):!r.c?res(0,`${r.x}号：身份未录入，请先点座位录入`):r.got?res(1,`${r.x}号：得 ${trN(k,r.c)}`):res(0,`${r.x}号：无法获取`);
  body+=(boosted(k)?note('紫霞仙子加持：今晚分开寻宝两次，先告知第 1 次结果，再点第 2 次。'):'')+
   Array.from({length:max},(_,i)=>row(max>1?`寻宝 第${i+1}次`:'寻宝',T[i]?lab(T[i]):'<i>未选</i>','选择',`pickHunt('${k}',${i})`,i>0&&!(h[i-1]&&(h[i-1].c||h[i-1].tang)))+rs(h[i])).join('')+
   note('点到狼人得 A、神职得 B、平民得 C；点到唐僧或已有的同类宝物，都显示“无法获取”；新宝物当夜即可使用，集齐三件当夜觉醒。');
  if(owns(k,'C'))body+=tgt(TR[k].C,f+'C',{none:'不使用'})+note(k==='wukong'?'保护该号码及左右共 3 人今夜不被狼刀和三尖两刃刀杀死，死者也占位；不护孙悟空自己。':'封印该号码今夜的技能：观音、黑熊精今晚不能行动；点紫霞则孙悟空今晚拿不到加持；对齐天大圣无效。');
  if(owns(k,'B')&&!t.usedB)body+=tgt(TR[k].B+'（一次）',f+'B',{none:'不使用'})+note(woke(k)?'已觉醒：可直接击杀任意一人。':`点中${ex}则其直接死亡，点错无效。`);
  if(woke(k))body+=tgt('查验身份',f+'A')+(S.n[f+'A']>0?res(1,`身份：${exactName(seat(S.n[f+'A']))}`):'');
 }
 return {t:LEAD[k],say:eye(k)+'请点人寻宝，然后使用宝物。”<br>（法官用手势告知寻宝结果）'+shut(k),body,ok:has(k)&&(!s||dead||((S.n[f+'T']||[]).length===picks(k)&&huntRes(k).every(r=>r.c||r.tang)))};
}
const XYSTEPS={
 zixia:()=>{const b=blocked('zixia');return {t:'紫霞仙子',say:eye('zixia')+'今晚你要加持谁？”<br>（比划号码）'+shut('zixia'),
  body:idRow('zixia')+blkNote('zixia')+tgt('加持','zx',{dis:b})+note(`点中孙悟空或二郎神，该领袖今晚多寻宝一次。不能连续两晚点同一人${XY().lastZx?`（昨晚点 ${XY().lastZx}号）`:''}。`),ok:has('zixia')&&(!!b||!!S.n.zx)};},
 erlang:()=>leadStep('erlang'),
 wukong:()=>leadStep('wukong'),
 guanyin:()=>{const b=blocked('guanyin'),n=S.n,g=one('guanyin'),self=g&&n.knife===g.n,ok2=!b&&!XY().gyUsed&&n.knife>0&&!self;
  return {t:'观音',say:(n.knife>0?`“观音请睁眼。昨晚<em class="k">【${n.knife}】号</em>玩家被袭击，是否使用甘露水？`:'“观音请睁眼。昨晚无人被袭击。')+(XY().bound?'”':'<br>今晚你要收服谁？”')+'<br>“观音请闭眼。”',
   body:idRow('guanyin')+blkNote('guanyin')+`<div class="row"><span>甘露水</span><b>${XY().gyUsed?'已用':n.gyS?'救 '+n.knife+'号':'可用'}</b><button class="btn ${n.gyS?'act':''}" ${ok2||n.gyS?'':'disabled'} onclick="upd(()=>S.n.gyS=!S.n.gyS)">${n.gyS?'取消':'使用'}</button></div>`+(self?note('观音不能自救。'):'')+
    (XY().bound?row('收服',`已用（${XY().bound}号${seat(XY().bound).dead?'，已出局':''}）`):tgt('收服（一次）','gyB',{none:'不收服',dis:b}))+note('整局只能收服一人。被收服的玩家投票自动跟观音；观音出局时他一同殉情。'),ok:has('guanyin')};},
 heixiong:()=>{const b=blocked('heixiong'),h=one('heixiong'),x=h&&!h.dead&&!b?bearSide():null;
  return {t:'黑熊精',say:eye('heixiong')+'”<br>（两侧有狼就“咆哮”：法官给确认手势）'+shut('heixiong'),
   body:idRow('heixiong')+blkNote('heixiong')+(x?res(!x.say,`两侧 ${x.pair.join('、')}号：${x.say?'咆哮（有狼）':'不咆哮（没狼）'}`)+(x.tang?note('唐僧在黑熊精旁边：结果已反转。'):''):''),ok:has('heixiong')};}
};

/* ---------- 夜间流程 ---------- */
const stepsOf=()=>S.day===1?BD().n1:BD().n2;
const row=(a,b,btn,fn,dis)=>`<div class="row"><span>${a}</span><b>${b}</b>${btn?`<button class="btn" ${dis?'disabled':''} onclick="${fn}">${btn}</button>`:''}</div>`;
const say=t=>`<div class="say">${t}</div>`;
const note=t=>`<div class="note">${t}</div>`;
const val=(n,none)=>n?lab(n):n===0?(none||'不使用'):'<i>未选</i>';
const res=(good,t)=>`<div class="res ${good?'good':'bad'}">${t}</div>`;
const eye=k=>`“${R[k].n}请睁眼。`, shut=k=>`<br>“${R[k].n}请闭眼。”`;
// 首夜录入身份的一行
const idRow1=k=>row(R[k].n,val(one(k)&&one(k).n),'选择',`pickOne('${k}')`);
const idRow=k=>S.day===1&&!BD().ids?row(R[k].n,val(one(k)&&one(k).n),'选择',`pickOne('${k}')`):'';
const has=k=>S.day>1||!!one(k);
// 选目标的一行：field 为 S.n 里的字段
const tgt=(label,field,o={})=>row(label,val(S.n[field],o.none),'选择',`pickT('${field}')`,o.dis);
const gun=(k,x)=>{const s=x||one(k);if(!s)return '';if(s.dead)return `<div class="res">${R[k].n}已出局 · 空喊约 5 秒</div>`;const w=noShoot(s.n);return w?res(0,`${ic('no')} 今晚${w} · 不可开枪（倒拇指/摇手）`):res(1,''+ic('ok')+' 可以开枪（大拇指）');};
const STEPS={
 close:()=>({t:'天黑',say:'“天黑请闭眼。”',body:note('确认所有玩家已闭眼。'+(S.day>1?'即使神职已出局，后续每个环节也要照常念完口令（空喊），防止场外信息泄露。':''))+
  (S.sealed===S.day?note(''+ic('moon')+' 血月之夜：所有神职技能今夜被封印。'):'')+
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
  const alive=S.seats.some(s=>inPack(s)&&!s.dead),solo=S.seats.filter(s=>isWolf(s)&&!inPack(s)&&!s.dead&&s.role!=='younger'&&s.role!=='erlang');
  const wn=BD().wn||'狼人';
  return {t:wn,say:(S.day===1&&!BD().ids?'“狼人请睁眼，请确认彼此身份。'+(mk?R[mk].n+'请举手示意。':'')+'今晚你们要袭击谁？请统一意见。”<br>（狼人比划号码，法官确认落刀目标）':`“${wn}请睁眼。今晚袭击谁？”`)+`<br>“${wn}请闭眼。”`,
   body:(S.day===1&&!BD().ids?row(`狼人 ${ws.length}/${wt}`,ws.length?ws.join('、')+'号':'<i>未录入</i>','选择','pickWolves()')+(mk?row(R[mk].n,val(m&&m.n),'选择',`pickOne('${mk}')`,ws.length!==wt):''):'')+
    (S.board==='xiyou'&&!alive&&S.day>1?note('天兵已全部出局，二郎神觉醒前不能刀人：选“空刀”。'):S.day>1&&!alive?note(solo.length?`狼队已全部出局，${solo.map(s=>R[s.role].n).join('、')}带刀（比划手势告知）。`:'狼队已全部出局，选“空刀”。'):'')+
    (S.board==='xiyou'&&wokeOld('erlang')?note('二郎神已觉醒，与天兵一起商量刀人。'):'')+note(S.board==='xiyou'?'天庭阵营全局不能自爆。':'').replace('<div class="note"></div>','')+(pf?note('狼队有人被恐惧，今夜不能刀人。'):'')+tgt('刀口','knife',{none:'空刀',dis:pf}),
   ok:S.n.knife!==null&&(S.day>1||!!BD().ids||(ws.length===wt&&(!mk||!!m)))};},
 beauty:()=>{const b=blocked('beauty');return {t:'狼美人',say:eye('beauty')+'今晚你要魅惑谁？”<br>（比划号码）'+shut('beauty'),
  body:idRow('beauty')+blkNote('beauty')+tgt('魅惑','charm',{none:'不魅惑',dis:b})+note(`狼美人出局时，被魅惑者一同殉情且不能发动技能；被骑士决斗出局则不触发。不能连续两夜魅惑同一人${S.lastCharm?`（昨夜魅惑 ${S.lastCharm}号）`:''}，不能自刀、自爆。`),ok:has('beauty')&&(!!b||S.n.charm!==null)};},
 witch:()=>{
  const n=S.n,w=one('witch'),b=blocked('witch'),self=w&&n.knife===w.n;
  const antiOk=(S.day>1||w)&&!S.used.anti&&!b&&n.knife>0&&!n.poison&&!self,poiOk=!S.used.poison&&!b&&!n.anti;
  return {t:'女巫',say:(n.knife>0?`“女巫请睁眼。昨晚<em class="k">【${n.knife}】号</em>玩家被袭击，你有一瓶解药，是否使用？（使用请比大拇指，不使用请摇手）”`:'“女巫请睁眼。昨晚无人被袭击。”')+'<br>“你有一瓶毒药，是否使用？（使用请比毒杀号码，不使用请摇手）”<br>“女巫请闭眼。”',
   body:idRow('witch')+blkNote('witch')+
    `<div class="row"><span>解药</span><b>${S.used.anti?'已用':n.anti?'救 '+n.knife+'号':'可用'}</b><button class="btn ${n.anti?'act':''}" ${antiOk||n.anti?'':'disabled'} onclick="upd(()=>S.n.anti=!S.n.anti)">${n.anti?'取消使用':'使用解药'}</button></div>`+
    (self?note('女巫全程不可自救。'):'')+row('毒药',S.used.poison?'已用':n.poison?'毒 '+lab(n.poison):'不使用','选择',"pickT('poison')",!poiOk)+note('同一夜女巫不能同时使用解药和毒药。'),ok:has('witch')};},
 seer:()=>{const b=blocked('seer'),c=S.n.check,t=c&&seat(mg(c));return {t:'预言家',say:eye('seer')+'今晚你要查验谁的身份？”<br>（大拇指=好人；摇手/倒拇指=狼人）'+shut('seer'),
  body:idRow('seer')+blkNote('seer')+tgt('查验','check',{dis:b})+(t?(mg(c)!==c?note(`魔术师交换：实际查验 ${mg(c)}号。`):'')+(seerWolf(t)?res(0,''+ic('wolf')+' 狼人 · 倒拇指/摇手'):res(1,''+ic('ok')+' 好人 · 大拇指'+(t.role==='hybrid'?'（混血儿永远是好人）':''))):''),ok:has('seer')&&(!!b||!!t)};},
 mediumId:()=>({t:'通灵师',say:'“通灵师请睁眼，请确认你的身份。”<br>“通灵师请闭眼。”',body:idRow('medium')+note('查验放在机械狼学习之后。'),ok:!!one('medium')}),
 medium:()=>{const b=blocked('medium'),t=S.n.check&&seat(S.n.check);return {t:'通灵师查验',say:eye('medium')+'今晚你要查验谁的具体身份？”<br>（告知具体身份）'+shut('medium'),
  body:blkNote('medium')+tgt('查验','check',{dis:b})+(t?res(!isWolf(t)||exactName(t)!==(t.role&&R[t.role].n),`身份：${exactName(t)}`):'')+note('查验已学习的机械狼，显示它学到的身份。'),ok:!!b||!!t};},
 hunter:()=>({t:'猎人',say:'“猎人请睁眼，请确认你的开枪状态。”<br>（大拇指=今晚可以开枪；倒拇指/摇手=不可开枪）<br>“猎人请闭眼。”',body:idRow('hunter')+(one('hunter')?gun('hunter'):''),ok:has('hunter')}),
 wolfking:()=>({t:'狼王',say:'“狼王请睁眼，请确认你的开枪状态。”<br>（大拇指=可以开枪；倒拇指/摇手=不可开枪）<br>“狼王请闭眼。”',body:gun('wolfking')}),
 idiot:()=>({t:'白痴',say:'“白痴请睁眼，请确认你的身份。”<br>“白痴请闭眼。”',body:idRow('idiot')+note('白痴从第 2 夜起不再睁眼。'),ok:!!one('idiot')}),
 knight:()=>({t:'骑士',say:'“骑士请睁眼，请确认你的身份。”<br>“骑士请闭眼。”',body:idRow('knight')+note('白天可翻牌决斗一名玩家，整局一次（在白天面板操作）。'),ok:!!one('knight')}),
 demon:()=>{const b=blocked('demon'),t=S.n.dcheck&&seat(S.n.dcheck);return {t:'恶魔',say:eye('demon')+'今晚你要查验谁？”<br>（大拇指=神职；摇手=不是神职）'+shut('demon'),
  body:idRow('demon')+blkNote('demon')+tgt('查验','dcheck',{dis:b})+(t?(t.role&&R[t.role].c==='god'?res(0,''+ic('star')+' 是神职 · 大拇指'):res(1,'不是神职 · 摇手')):'')+note('恶魔夜间免死：狼刀、毒药对其无效。'),ok:has('demon')&&(!!b||!!t)};},
 gargoyleId:()=>({t:'石像鬼',say:'“石像鬼请睁眼，请确认你的身份。”<br>“石像鬼请闭眼。”',body:idRow('gargoyle')+note('石像鬼不与狼队相认；查验放在其他身份录完之后。'),ok:!!one('gargoyle')}),
 gargoyle:()=>{const b=blocked('gargoyle'),t=S.n.gcheck&&seat(S.n.gcheck);return {t:'石像鬼查验',say:eye('gargoyle')+'今晚你要查验谁的具体身份？”<br>（告知具体身份）'+shut('gargoyle'),
  body:blkNote('gargoyle')+tgt('查验','gcheck',{dis:b})+(t?res(!isWolf(t),`身份：${exactName(t)}`):'')+(S.day>1&&!b?note(S.seats.some(s=>inPack(s)&&!s.dead)?'其他狼人仍在场：未带刀。':'其他狼人已全部出局：石像鬼带刀，在狼人环节录刀口。'):''),ok:!!b||!!t};},
 grave:()=>{const e=S.lastExile&&seat(S.lastExile),b=blocked('grave');return {t:'守墓人',say:eye('grave')+(S.day>1?'昨天被放逐的玩家是——”<br>（大拇指=好人；倒拇指=狼人；无人放逐则摇手）':'请确认你的身份。”')+shut('grave'),
  body:idRow('grave')+blkNote('grave')+(S.day===1?note('首夜没有技能。'):b?'':!e?`<div class="res">昨天无人被放逐 · 摇手</div>`:isWolf(e)?res(0,`${lab(e.n)}：${ic('wolf')} 狼人 · 倒拇指`):res(1,`${lab(e.n)}：${ic('ok')} 好人 · 大拇指`)),ok:has('grave')};},
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
   if(ok2&&lu.skill==='check')x+=tgt('查验','lcheck',{none:'不使用'})+(t?(seerWolf(t)?res(0,''+ic('wolf')+' 狼人'):res(1,''+ic('ok')+' 好人')):'');
   if(ok2&&lu.skill==='poison')x+=tgt('毒药','lpoison',{none:'不使用'});
   if(ok2&&lu.skill==='gun')x+=note('猎枪在白天使用：天亮后在白天面板点“开枪”。');}
  return {t:'幸运儿',say:S.day===1?'“被拍到的玩家是幸运儿。”<br>（绕场一圈，交易成功则轻拍幸运儿）':'“幸运儿请睁眼，是否使用技能？”<br>“幸运儿请闭眼。”',body:x||note('没有幸运儿：空喊流程。')};},
 sheriff:()=>({t:'警长',say:'“要竞选警长的玩家请举手。”<br>（记录上警号码）<br>“请放下。”',body:row('上警',S.police.length?S.police.join('、')+'号':'<i>未录入</i>','选择','pickPolice()')+note('可不录入，天亮后在白天面板继续：退水、投票、当选。')}),
 ...XYSTEPS,
 ids:()=>{const bd=BD(),wn=bd.wn||'狼人',pk=k=>bd.pack.includes(k),ws=S.seats.filter(s=>pk(s.role)).map(s=>s.n),wt=packWant(),t=S.board==='xiyou'&&XY().tang,nv=cntOf('villager');
  return {t:'第一轮：确认身份',say:'“第一轮，确认身份。”'+bd.ids.map(k=>`<span class="ln" data-sp="${k}">${spkBtn(k)}${pk(k)?`“${wn}请睁眼，互相确认。”……“请闭眼。”`:`${eye(k)}”……“请闭眼。”`}</span>`).join(''),
   body:bd.ids.map(k=>pk(k)?row(`${wn} ${ws.length}/${wt}`,ws.length?ws.join('、')+'号':'<i>未录入</i>','选择','pickWolves()'):idRow1(k)).join('')+
    (t?note(`唐僧是 ${t}号（离孙悟空最近的平民，本人不知道）。`):'')+note(`先录全部身份，其余 ${nv} 人自动记为平民；第二轮再按顺序发动技能。`),
   ok:ws.length===wt&&bd.ids.every(k=>pk(k)||!!one(k))};},
 dawn:()=>{
  const r=resolve(),nd=nightDead(r),unk=S.seats.filter(s=>!s.role).length,guns=r.D.filter(d=>gunTonight(seat(d)));
  return {t:'天亮结算',say:'“天亮了，请睁眼。”<br>（若有警长竞选，先进行上警环节，再公布死讯）',
   body:res(!nd.length,nd.length?'昨夜死亡：'+nd.map(snv).join('、'):'平安夜')+r.N.map(note).join('')+
    guns.map(d=>note(`${S.hide?lab(d):gunName(seat(d))}${noShoot(d)?noShoot(d)+'，不可开枪。':'夜间死亡，可以开枪。'}`)).join('')+
    (r.D.some(d=>seat(d).role==='idiot')?note('白痴夜间死亡，直接出局，不能翻牌。'):'')+(unk?note(`${ic('warn')} 还有 ${unk} 个座位未录入身份。`):'')};}
};
function wizard(){
 const st=stepsOf(),total=st.length;if(S.n.step>=total)S.n.step=total-1;
 const key=st[S.n.step],x=STEPS[key](),ok=x.ok===undefined||x.ok;
 const dots=st.map((k,i)=>`<i class="${i<S.n.step?'d':i===S.n.step?'c':''}"></i>`).join('');
 return `<div class="wiz ${S.hide&&key!=='close'&&key!=='sheriff'?'mask':''}"><div class="wh"><span class="lbl"><small>${label()} · ${S.n.step+1}/${total}<span class="sr"> · </span></small><b>${x.t}</b></span><div class="dots">${dots}</div></div>
  ${say(x.say)}${TTS?`<div class="spk">${spkBtn('step','口令')}</div>`:''}${x.body}
  <div class="wf"><button class="btn" ${S.n.step?'':'disabled'} onclick="upd(()=>S.n.step--)">← 上一步</button>
  ${key==='dawn'?`<button class="btn pri" style="flex:2" onclick="adv(confirmDawn)">确认 · 天亮 →</button>`:`<button class="btn pri" style="flex:2" ${ok?'':'disabled'} onclick="adv(()=>upd(()=>S.n.step++))">下一步 →</button>`}</div></div>`;
}

/* ---------- 选座 ---------- */
function seatPicker(title,o){window._pk={cur:new Set(o.sel||[]),o};drawPk(title);}
function drawPk(title){
 const {cur,o}=window._pk;window._pkTitle=title||window._pkTitle;
 sheet(`<h2>${window._pkTitle}</h2><div class="pk ${S.hide?'hide':''}">${S.seats.map(s=>{const r=s.role&&R[s.role];
  return `<button class="${cur.has(s.n)?'cur':''} ${s.dead?'dd':''}" ${!o.ok||o.ok(s)||(S.hide&&!s.dead)?'':'disabled'} onclick="pkTap(${s.n})">${r&&!S.hide?`<img src="img/${pic(r.k)}.png" alt="">`:''}<b>${s.n}</b><small>${S.names[s.n-1]||(r&&!S.hide?r.n:'')}</small></button>`;}).join('')}</div>
  <div class="pkf">${o.none?`<button class="btn" onclick="pkNone()">${o.none.label}</button>`:''}${o.multi?`<button class="btn pri" ${o.min&&cur.size<o.min?'disabled':''} onclick="pkOk()">确定（${cur.size}${o.max?'/'+o.max:''}）</button>`:''}</div>`,!title);
}
function pkTap(n){const {cur,o}=window._pk;
 if(o.ok&&!o.ok(seat(n)))return toast('该玩家不能选'); // 隐藏模式下不置灰，免得露出身份
 if(o.multi){if(cur.has(n))cur.delete(n);else{if(o.max&&cur.size>=o.max)return toast(`最多 ${o.max} 个`);cur.add(n);}drawPk();}
 else{advAt=performance.now();close_();o.done(n);}}
function pkOk(){const {cur,o}=window._pk;advAt=performance.now();close_();o.done([...cur].sort((a,b)=>a-b));}
function pkNone(){const {o}=window._pk;advAt=performance.now();close_();o.done(o.none.value);}
const alive=s=>!s.dead, notMe=(s,k)=>!one(k)||s.n!==one(k).n;
// 夜间目标：标题、可选范围、不选的文案
const TG={
 guard:['守护谁？',s=>alive(s)&&s.n!==S.lastGuard,'空守'],dream:['摄梦谁？',s=>alive(s)&&notMe(s,'dreamer')],fear:['恐惧谁？',s=>alive(s)&&notMe(s,'nightmare'),'不恐惧'],
 knife:['刀口（狼人袭击谁）',s=>alive(s)&&s.role!=='beauty','空刀'],charm:['魅惑谁？',s=>alive(s)&&notMe(s,'beauty')&&s.n!==S.lastCharm,'不魅惑'],
 poison:['女巫毒谁？',alive,'不使用毒药'],check:[()=>`${cntOf('medium')?'通灵师':'预言家'}查验谁？`,s=>alive(s)&&notMe(s,cntOf('medium')?'medium':'seer')],
 dcheck:['恶魔查验谁？',s=>alive(s)&&notMe(s,'demon')],gcheck:['石像鬼查验谁？',s=>alive(s)&&notMe(s,'gargoyle')],hunt:['猎魔人狩猎谁？',s=>alive(s)&&notMe(s,'witchhunter'),'不狩猎'],
 bknife:['狼弟袭击谁？',alive],learn:['机械狼学习谁？',s=>alive(s)&&notMe(s,'mechwolf'),'不学习'],mcheck:['机械狼查验谁？',s=>alive(s)&&notMe(s,'mechwolf')],
 mpoison:['机械狼毒谁？',alive,'不使用'],mguard:['机械狼守护谁？',alive,'不使用'],mknife:['机械狼多刀谁？',alive,'不使用'],

 zx:['紫霞加持谁？',s=>alive(s)&&s.n!==XY().lastZx],gyB:['观音收服谁？',s=>alive(s)&&notMe(s,'guanyin'),'不收服'],
 wkB:['定海神针击谁？',s=>alive(s)&&notMe(s,'wukong'),'不使用'],elB:['三尖两刃刀击谁？',s=>alive(s)&&notMe(s,'erlang'),'不使用'],
 wkC:['镇魔圈护谁？（含左右）',()=>true,'不使用'],elC:['哮天犬封印谁？',s=>alive(s)&&notMe(s,'wukong')&&notMe(s,'erlang'),'不使用'],
 wkA:['齐天大圣查验谁？',s=>alive(s)&&notMe(s,'wukong')],elA:['二郎神查验谁？',s=>alive(s)&&notMe(s,'erlang')],
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
  done:l=>upd(()=>S.seats.forEach(s=>{if(l.includes(s.n)){if(!mine(s))s.role=pk[0];}else if(mine(s))s.role=null;}))});
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
   L('身份：'+['zixia','tianbing','erlang','wukong','guanyin','heixiong','hybrid','magician','merchant','dreamer','guard','nightmare','wolf','wolfking','demon','beauty','elder','younger','gargoyle','mechwolf','bloodmoon','witch','seer','medium','hunter','witchhunter','idiot','knight','grave']
    .filter(cntOf).map(k=>`${R[k].n}${idn(k)}号${k==='hybrid'?`（榜样${S.model||'—'}号）`:''}`).join('｜')+(S.board==='xiyou'&&XY().tang?`｜唐僧${XY().tang}号（平民）`:''));
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
  if(S.board==='xiyou')xyDawnLog();
  r.N.forEach(x=>L(x.replace(/。$/,'')));
  r.D.filter(d=>gunTonight(seat(d))).forEach(d=>{const g=seat(d).ng=noShoot(d);if(g)L(`${gunName(seat(d))}${g}，不可开枪`);}); // ng：不可开枪的原因
  if(n.learn>0&&!S.mech&&seat(n.learn).role==='hunter'&&one('mechwolf')&&r.D.includes(one('mechwolf').n)){one('mechwolf').ng='当夜刚学习';L('机械狼当夜刚学习，不可开枪');}
  if(n.trade&&n.trade.skill==='gun'&&!isWolf(seat(n.trade.n))&&r.D.includes(n.trade.n)){seat(n.trade.n).ng='当夜刚获得猎枪';L('幸运儿当夜刚获得猎枪，不可开枪');}
  // 记录跨夜状态（须在标记死亡之前）
  if(S.board==='xiyou')xyCarry();
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
 commit('',()=>{S.lastExile=S.d.n||0;S.v=null;tmReset();S.day++;S.night=true;S.n=freshNight();S.d=null;S.talk=null;L('—— 天黑 ——');});
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
  if(no){body+=note(`${ic('no')} ${w}${no}，不可开枪。`);return;}
  if(!h||!h.t)body+=note(!x.dead?`${ic('gun')} ${w} 有猎枪，白天可以开枪。`:x.dead!=='night'?`${ic('gun')} ${w} ${x.dead==='exile'?'被放逐':'出局'}，可以开枪。`:x.ng===''?`${ic('gun')} ${w} 昨夜死亡，可以开枪。`:`${w} 昨夜死亡，可以开枪；被毒杀则不可开枪。`);
  body+=row('开枪',`${lab(x.n)}：${!h?'<i>未选</i>':h.t?'带走 '+lab(h.t):'不开枪'}`,h&&h.t?'更正':'开枪',h&&h.t?`revokeShot(${x.n})`:`pickShot(${x.n})`);
 });
 if(S.board==='xiyou'){const g=one('guanyin'),b=XY().bound;if(g&&!g.dead&&b&&!seat(b).dead)body+=note(`法官宣布：观音收服了 ${lab(b)}，他的投票自动跟观音。`);}
 if(S.badgeLost)body+=note(''+ic('badge')+' 警徽已流失，本局没有警长。');
 const ex=S.seats.find(x=>x.badge&&x.dead);
 if(ex)body+=note(''+ic('badge')+' 警长已出局，请移交或撕毁警徽。')+row('警徽',lab(ex.n),'处理','passBadge()');
 return `<div class="wiz"><div class="wh"><span class="lbl"><small>白天</small><b>${label()}</b></span></div>
  ${body}${talkBox()}${timerHTML()}
  <div class="wf"><button class="btn pri" ${d?'':'disabled'} onclick="adv(nextNight)">天黑了 →</button></div></div>`;
}
// 狼美人白天出局：带走被魅惑者（决斗除外）
function follow(x){
 const t=seat(x).role==='beauty'&&S.charmed?seat(S.charmed):seat(x).role==='guanyin'&&S.board==='xiyou'&&XY().bound?seat(XY().bound):null;
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
 return say('“警长竞选，要竞选警长的玩家请举手。”<br>（先记录上警号码，再发言、退水、警下投票；选出警长后再公布死讯）')+row('上警',nums(S.police),'选择','pickPolice()')+row('退水',S.out.length?nums(S.out):'无','选择','pickOut()',!S.police.length)+
  row('警长投票',voteState('sheriff'),'记票',"openVote('sheriff')",!runners().length)+row('警长','<i>未选</i>','选择','pickSheriff()');
}
function pickSheriff(){seatPicker('谁当选警长？',{ok:s=>S.police.length?runners().includes(s.n):present(s),none:{label:'警徽流失',value:0},done:n=>commit('',()=>sheriff_(n))});}
function sheriff_(n){
 L(`警长竞选：上警 ${S.police.length?S.police.join('、')+'号':'—'}${S.out.length?`，退水 ${S.out.join('、')}号`:''} → ${n?lab(n)+' 当选警长':'警徽流失'}`);
 S.seats.forEach(s=>s.badge=s.n===n);S.v=null;S.elLater=false;S.talk=null; // 选完警长重新安排发言
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
const weight=n=>(S.v.kind==='exile'&&seat(n).badge?1.5:1)+(S.board==='xiyou'&&XY().tang===n?.5:0); // 唐僧多 0.5 票（本人不知道）
// 观音收服的玩家：投票自动跟观音
const boundTo=n=>{if(S.board!=='xiyou')return 0;const g=one('guanyin'),b=XY().bound;return g&&b===n&&!g.dead&&!seat(b).dead&&g.n!==n?g.n:0;};
const voteOf=n=>boundTo(n)?S.v.m[boundTo(n)]:S.v.m[n];
function tally(){
 const c=cands(),vs=voters(),by={};let cast=0;
 vs.forEach(n=>{const t=voteOf(n);if(c.includes(t)){cast++;(by[t]=by[t]||[]).push(n);}});
 const t=c.filter(n=>by[n]).map(n=>({n,who:by[n],k:by[n].reduce((a,x)=>a+weight(x),0)})).sort((a,b)=>b.k-a.k||a.n-b.n);
 return {t,cast,top:t.filter(x=>x.k===t[0].k).map(x=>x.n),none:vs.filter(n=>!c.includes(voteOf(n)))};
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
 sheet(`<h2>${ic('vote')} ${VN[S.v.kind]}${S.v.round>1?' · PK':''}</h2>${note('先点被投的玩家，再点投给他的人；不点算弃票。'+(S.v.kind==='exile'&&S.seats.some(s=>s.badge&&!s.dead)?'警长 '+ic('badge')+' 算 1.5 票。':''))}
  <div class="lbl" style="margin-top:12px">被投的玩家</div><div class="pk vc">${c.map(n=>`<button class="${n===window._vc?'cur':''}" onclick="voteFor(${n})"><b>${n}</b><small>${S.names[n-1]||''}</small><small class="vk">${of(n)?of(n).k+' 票':'0'}</small></button>`).join('')}</div>
  <div class="lbl" style="margin-top:12px">投票的玩家</div><div class="pk vv">${vs.map(n=>{const t=voteOf(n),o=c.includes(t);return `<button class="${o&&t===window._vc?'cur':''}" onclick="voteBy(${n})"><b>${n}${seat(n).badge?''+ic('badge')+'':''}</b><small>${S.names[n-1]||''}</small><small class="vk">${o?'→ '+t+'号':'弃票'}</small></button>`;}).join('')}</div>
  <div class="pkf"><button class="btn" onclick="voteClear()">清空</button><button class="btn pri" style="flex:2" onclick="adv(voteOk)">${res.t}</button></div>`,keep);
}
function voteFor(n){window._vc=n;drawVote(true);}
function voteBy(n){
 if(boundTo(n))return toast('被观音收服：自动跟观音投票');
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
const canBoom=s=>isWolf(s)&&!['beauty','gargoyle','mechwolf','erlang','tianbing'].includes(s.role); // 狼美人、石像鬼、机械狼不能自爆
function pickBoom(){seatPicker('哪位狼人自爆？',{ok:s=>alive(s)&&(S.hide||canBoom(s)),done:n=>canBoom(seat(n))?askBoom(n):toast('该玩家不能自爆')});}
// 警长还没选出的竞选日，问清是否在竞选中自爆
function askBoom(n){
 if(S.d)return toast('今天已有结果，需先更正');
 if(!electing())return boom(n,'');
 sheet(`<h2>${ic('star')} ${lab(n)} 自爆</h2>${note('自爆后直接入夜。是否发生在警长竞选阶段？')}<div class="opts" style="margin-top:12px">
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
 sheet(`<h2>${ic('gun')} 谁带走 ${lab(t)}？</h2><div class="opts">${g.map(s=>`<button class="btn" onclick="shoot(${s.n},${t})">${S.hide?lab(s.n):lab(s.n)+' '+gunName(s)}</button>`).join('')}</div>`);
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
 if(S.board==='xiyou'&&S.day===1&&S.night)XY().tang=findTang(); // 开局时确定，之后不变
 const h=one('hybrid');if(h&&S.model===h.n)S.model=null;
 if(S.mech&&seat(S.mech.n).role)S.mech.role=seat(S.mech.n).role;
}
// 改选身份后，清掉因此变得不合规则的夜间录入
const ACT={zixia:['zx'],guanyin:['gyS','gyB'],seer:['check'],medium:['check'],witch:['anti','poison'],guard:['guard'],dreamer:['dream'],magician:['swap'],merchant:['trade'],beauty:['charm'],demon:['dcheck'],gargoyle:['gcheck'],
 witchhunter:['hunt'],younger:['bknife'],mechwolf:['learn','mcheck','mpoison','mguard','mknife'],nightmare:['fear']};
function enforce(){
 if(!S.night)return;
 const n=S.n,w=one('witch'),F=freshNight();
 for(const k in ACT)if(cntOf(k)&&blocked(k))ACT[k].forEach(f=>{n[f]=F[f];});
 // 目标已被标记出局的录入作废（刀口按空刀）
 for(const f of Object.keys(TG))if(f!=='wkC'&&n[f]>0&&seat(n[f]).dead)n[f]=f==='knife'?0:F[f]; // 镇魔圈中心可以是死者（占位）
 if(n.swap&&n.swap.some(x=>seat(x).dead))n.swap=F.swap;
 if(n.trade&&seat(n.trade.n).dead)n.trade=null;
 if(packFeared())n.knife=0;
 if(n.anti&&(!(n.knife>0)||n.poison||(w&&w.n===n.knife)))n.anti=false;
 for(const [k,f] of [['seer','check'],['medium','check'],['dreamer','dream'],['demon','dcheck'],['gargoyle','gcheck'],['mechwolf','learn'],['beauty','charm'],['nightmare','fear'],['witchhunter','hunt']])if(n[f]&&one(k)&&n[f]===one(k).n)n[f]=null;
 if(n.trade&&one('merchant')&&n.trade.n===one('merchant').n)n.trade=null;
 if(S.board==='xiyou')xyEnforce();
}
// 首页选板子：没有进行中的对局时打开就是它
let home=false;
function homeHTML(){
 const nm=S.names.filter(x=>x).length;
 return `<main class="home" id="top" tabindex="-1">${updBar()}<h2>选择板子</h2><p>选好后直接进入第 1 夜。</p><div class="bds">${boardsHTML()}</div>
  <div class="opts"><button class="btn" onclick="openNames()">${ic('tag')} 玩家名字<small>${nm?`已录 ${nm}/12`:'可不录'}</small></button><button class="btn" onclick="openHistory()">${ic('folder')} 历史对局<small>${loadHist().length} 局</small></button><button class="btn" onclick="openGuide('hybrid')">${ic('book')} 身份速查<small>各板技能说明</small></button><button class="btn" onclick="openStats()">${ic('chart')} 对局统计<small>胜率、玩家</small></button></div></main>`;
}
function render(){
 if(pubOn)return pubRender();
 document.documentElement.classList.remove('pubm');
 let h=`<header><a class="skip-link" href="#top">跳到内容</a><h1>狼人杀法官记录<small>${home?`12 人板，${Object.keys(BOARDS).length} 个板子`:`${BD().name}，${BD().desc}`}</small></h1>
  ${home?'':`${S.hide?`<button class="ib" data-peek title="按住查看">按住看</button>`:''}<button class="ib ${S.hide?'on':''}" onclick="togHide()" title="${S.hide?'显示身份':'隐藏身份'}" aria-label="${S.hide?'显示身份':'隐藏身份'}">${ic(S.hide?'eyeoff':'eye')}</button>`}
  <button class="ib" onclick="openMenu()" title="菜单" aria-label="菜单">${ic('more')}<span class="sr">⋯</span></button></header>`;
 if(home)h+=homeHTML();else{
 h+=`<main class="lay" id="top" tabindex="-1"><section class="side">${updBar()}${winBar()}${S.night?wizard():dayPanel()}${S.board==='xiyou'?xyPanel():''}</section><section class="seatsec"><div class="lbl"><strong>座位</strong>点座位标记状态</div><div class="grid ${S.hide?'hide':''}">${S.seats.map(seatHTML).join('')}</div></section></main>`;
 const al=S.seats.filter(s=>!s.dead),c=k=>S.hide?'?':al.filter(s=>s.role&&R[s.role].c===k).length;
 h+=`<div class="stats"><div class="in"><div class="st w"><b>${c('wolf')}</b>狼人</div><div class="st g"><b>${c('god')}</b>神职</div><div class="st v"><b>${c('villager')}</b>平民</div><div class="st"><b>${al.length}</b>存活</div><button class="btn" onclick="openLog()">记录</button></div></div>`;
 }
 $('#app').innerHTML=h;
 document.documentElement.classList.toggle('dim',dimOn&&S.night&&!home);document.documentElement.classList.toggle('day',!S.night);
 $('meta[name=theme-color]').content=S.night?'#2b2216':'#e9e1d2';
 autoSpeak();
}
function seatHTML(s){
 const r=s.role&&R[s.role],tags=[],n=S.n,nt=(c,t)=>tags.push(`<span class="tag nt ${c}">${t}</span>`);
 if(s.badge)tags.push(`<span class="tag badge ${s.dead?'off':''}">警长</span>`);
 if(s.flip)tags.push(`<span class="tag flip">已翻牌</span>`);
 if(s.role==='hybrid'&&S.model)tags.push(`<span class="tag mdl">榜样→${S.model}</span>`);
 if(s.role==='mechwolf'&&S.mech)tags.push(`<span class="tag mdl">学→${S.mech.n}</span>`);
 if(S.board==='xiyou'){const x=XY();if(x.tang===s.n)tags.push('<span class="tag mdl">唐僧</span>');if(x.bound===s.n&&!s.dead)tags.push('<span class="tag mdl">被收服</span>');if(s.role==='wukong'||s.role==='erlang'){const t=x[s.role],h='ABC'.split('').filter(c=>t[c]);if(h.length)tags.push(`<span class="tag mdl">${t.awake?'觉醒':'宝 '+h.join('')}</span>`);}}
 if(S.lucky&&S.lucky.n===s.n)tags.push(`<span class="tag mdl">幸运儿·${SKILL[S.lucky.skill]}</span>`);
 if((S.day===1||electing())&&S.police.includes(s.n))tags.push(`<span class="tag pol">${S.out.includes(s.n)?'退水':'上警'}</span>`);
 if(!S.night&&talkCur()===s.n)tags.push('<span class="tag spk2">发言</span>');
 if(!S.night&&S.charmed===s.n&&one('beauty')&&!one('beauty').dead&&!s.dead)tags.push('<span class="tag mdl">被魅惑</span>');
 if(S.night){
  if(n.swap&&n.swap.includes(s.n))nt('p','换');if(n.fear===s.n)nt('p','惧');if(n.dream===s.n)nt('g','梦');if(n.guard===s.n||n.mguard===s.n)nt('g','守');
  if(n.knife===s.n)nt('k',n.anti?'刀·救':'刀口');if(n.bknife===s.n||n.mknife===s.n)nt('k','刀');if(n.charm===s.n)nt('p','魅');
  if([n.poison,n.lpoison,n.mpoison].includes(s.n))nt('p','毒');if(n.elC===s.n)nt('p','封');if(n.wkB===s.n||n.elB===s.n)nt('k','击');if(n.gyB===s.n)nt('p','收');if(n.zx===s.n)nt('g','霞');if((n.wkT||[]).includes(s.n)||(n.elT||[]).includes(s.n))nt('c','宝');if(n.hunt===s.n)nt('k','猎');if([n.check,n.gcheck,n.dcheck,n.lcheck,n.mcheck].includes(s.n))nt('c','验');
 }
 return `<div class="seat ${r?r.c:''} ${s.dead?'dead':''}" role="button" tabindex="0" aria-label="${lab(s.n)}${s.dead?'，'+CAUSE[s.dead]:''}" onclick="tapSeat(${s.n-1})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();tapSeat(${s.n-1})}">
  <span class="no">${s.n}</span><div class="tags">${tags.join('')}</div>
  ${r?`<img src="img/${pic(r.k)}.png" alt=""><div class="rn"><span>${r.n}</span></div>`:`<div class="empty">?</div><div class="rn un"><span>未录入</span></div>`}
  ${S.names[s.n-1]?`<div class="nm">${S.names[s.n-1]}</div>`:''}
  ${s.dead?`<div class="stamp ${s.dead}">${CAUSE[s.dead]}</div>`:''}</div>`;
}
function tapSeat(i){
 const s=S.seats[i],r=s.role&&R[s.role];
 let o=`<h2>${r&&!S.hide?`<img src="img/${pic(r.k)}.png" alt="">`:''}${lab(s.n)}${S.hide?'':` · ${r?r.n:'未录入'}`}</h2>${r&&!S.hide?note(roleInfo(r.k)):''}<div class="opts">`;
 o+=`<button class="btn ${s.badge?'act':''}" onclick="doBadge(${i})">${ic('badge')} ${s.badge?'撤销警徽':'警徽'}<small>${s.badge?'误操作更正':S.badgeLost?'警徽已流失':'授予/移交'}</small></button>`;
 if(s.badge)o+=`<button class="btn" onclick="close_();passBadge()">${ic('badge')} 移交 / 撕毁警徽<small>警长出局时</small></button>`;
 if(!s.dead){
  o+=`<button class="btn danger" ${S.night||S.d?'disabled':''} onclick="doExile(${s.n})">${ic('vote')} 放逐出局<small>${S.night?'仅白天':S.d?'今天已放逐':!S.hide&&s.role==='idiot'&&!s.flip?'白痴翻牌，视为出局':'白天投票'}</small></button>`;
  o+=`<button class="btn danger" onclick="doDie(${i},'night')">${ic('moon')} 夜间阵亡<small>被刀/毒等</small></button>`;
  const g=shooters(s.n);
  o+=`<button class="btn danger" ${g.length?'':'disabled'} onclick="shotAt(${s.n})">${ic('gun')} 被枪带走<small>${g.length?g.map(x=>x.n+'号').join('、')+'开枪':'现在无人可开枪'}</small></button>`;
 }else o+=`<button class="btn" onclick="doRevive(${i})">${ic('redo')} 恢复存活<small>误操作更正</small></button>`;
 if(gunners().includes(s)){const no=noGun(s),h=s.shot&&s.shot.t;o+=`<button class="btn danger" ${no||h?'disabled':''} onclick="pickShot(${s.n})">${ic('gun')} 开枪<small>${no?no+'，不可开枪':h?'已带走 '+h+'号':'带走一名玩家'}</small></button>`;}
 o+=`<button class="btn" onclick="pickRole(${i})">${ic('edit')} ${r?'修改身份':'录入身份'}<small>底牌</small></button><button class="btn" onclick="openNames(${i})">${ic('tag')} 玩家名字<small>${S.names[i]||'未录入'}</small></button></div>`;
 sheet(o);
}
function pickRole(i){
 const s=S.seats[i];
 sheet(`<h2>${lab(s.n)} · 身份底牌</h2><div class="rp">${ROLES.filter(r=>cntOf(r.k)).map(r=>`<button class="${s.role===r.k?'cur':''}" ${left(r.k)<=0&&s.role!==r.k?'disabled':''} onclick="setRole(${i},'${r.k}')"><img src="img/${pic(r.k)}.png" alt="">${r.n}<div class="c">剩 ${Math.max(0,left(r.k))}</div></button>`).join('')}</div>${s.role?`<button class="btn" style="width:100%;margin-top:10px" onclick="setRole(${i},null)">清除身份</button>`:''}`);
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

// 隐藏模式：按住才显示，松手、切走立即遮住
function peek(on){document.documentElement.classList.toggle('peek',!!on&&S.hide);}
document.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('[data-peek]')){e.preventDefault();peek(true);}});
['pointerup','pointercancel','blur','pagehide'].forEach(k=>addEventListener(k,()=>peek(false)));
document.addEventListener('visibilitychange',()=>peek(false));
document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('[data-peek]'))e.preventDefault();});

/* ---------- 玩家名字 ---------- */
// 名字会直接拼进界面，只保留安全字符
const cleanName=v=>[...v.replace(/[<>&"'`\\]/g,'').trim()].slice(0,8).join('');
function openNames(i){
 sheet(`<h2 class="lh"><span>${ic('tag')} 玩家名字</span><button class="btn pri" onclick="saveNames()">保存</button></h2><div class="nms">${S.names.map((v,k)=>`<label><b>${k+1}</b><input maxlength="8" value="${v}" placeholder="${k+1}号玩家" enterkeyhint="next" onkeydown="nameKey(event,${k})"></label>`).join('')}</div>
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
 sheet(`<h2>${ic('folder')} 历史对局</h2><button class="btn pk1" onclick="openStats()">${ic('chart')} 对局统计</button>${bkDue()?`<div class="res bad">${ic('warn')} 已存 ${a.length} 局，${bkAt()?'超过 7 天':'还从来'}没有导出备份。<button class="btn" onclick="openBackup()">去备份</button></div>`:''}${a.length?`<div class="hs">${a.map(g=>`<button class="btn" onclick="openHist('${g.id}')"><b>${bdName(g)}</b><small>${when(g)} · ${g.day} 天</small><small class="${g.win?g.win.side:''}">${g.win?winText(g.win):'未分胜负'}</small></button>`).join('')}</div>`:note('还没有历史对局。新开一局时，上一局会自动存到这里。')}${note(`最多保留最近 ${HMAX} 局，只存在本机。`)}`);
}
function openHist(id){
 const g=hist(id);if(!g)return openHistory();
 sheet(`<h2 class="lh"><span>${ic('folder')} ${bdName(g)}</span><button class="btn pri" onclick="copyLog('${id}')">${ic('copy')} 复制</button></h2>${note(when(g))}${g.win?`<div class="winbar ${g.win.side}" style="margin-top:8px;cursor:default">${ic('cup')} ${winText(g.win)}</div>`:''}${rosterHTML(g,false)}${logHTML(g)}
  <div class="pkf"><button class="btn" onclick="openHistory()">← 返回</button><button class="btn" onclick="makeImage('${id}')">${ic('pic')} 长图</button><button class="btn danger" onclick="askDelHist('${id}')">删除这一局</button></div>`);
}
function askDelHist(id){const g=hist(id);if(!g)return;sheet(`<h2>删除这一局？</h2>${note(`${bdName(g)} · ${when(g)}，删除后无法恢复。`)}<div class="pkf"><button class="btn" onclick="openHist('${id}')">取消</button><button class="btn danger" onclick="delHist('${id}')">确认删除</button></div>`);}
function delHist(id){saveHist(loadHist().filter(g=>g.id!==id));openHistory();toast('已删除');}

/* ---------- 菜单 ---------- */
// 记录顶部：12 位玩家的身份与状态（隐藏模式下不显示身份）
function rosterHTML(g=S,hide=S.hide){return `<div class="ros">${g.seats.map(s=>{const r=s.role&&R[s.role];
 return `<div class="${s.dead?'out ':''}${r&&!hide?r.c:''}"><b>${s.n}</b>${r&&!hide?`<img src="img/${pic(r.k,g.board)}.png" alt="">`:''}<span>${hide?'???':r?r.n:'未录入'}${s.badge?' '+ic('badge')+'':''}${g.names[s.n-1]?`<em>${g.names[s.n-1]}</em>`:''}${s.dead?`<small class="${s.dead}">${s.at}${CAUSE[s.dead]}</small>`:''}</span></div>`;}).join('')}</div>`;}
function openLog(){sheet(`<h2 class="lh"><span>${ic('log')} 对局记录</span><button class="btn pri" onclick="copyLog()">${ic('copy')} 复制</button></h2>${winBar()}<button class="btn pk1" onclick="askImage()">${ic('pic')} 生成复盘长图</button>${S.hide?'<button class="btn pk1" data-peek>'+ic('eye')+' 按住查看过程</button>':''}${rosterHTML()}${S.hide?`<div class="mask">${logHTML()}</div>`:logHTML()}`);}
// 记录里的“｜”换行显示
const logLine=x=>x.split('｜').join('<br>').replace(/🎖/g,ic('badge')).replace(/🏆/g,ic('cup'));
// 记录按“第N夜 / 第N天”分段；号码加粗，身份按阵营上色，死亡、查验、警徽等按类别标色
const RN=[...ROLES.map(r=>[r.n,r.c]),['好人','villager'],['神职','god'],['唐僧','villager']].sort((a,b)=>b[0].length-a[0].length),RNM=Object.fromEntries(RN);
const RRE=new RegExp(`(${RN.map(x=>x[0]).join('|')})|(\\d+(?:、\\d+)*号)`,'g');
const hl=t=>t.replace(RRE,(m,r,n)=>r?`<em class="r ${RNM[r]}">${r}</em>`:`<em class="no">${n}</em>`);
const logKind=x=>/^\u{1F3C6}/u.test(x)?'win':/^更正/.test(x)?'fix':/平安夜/.test(x)?'safe':/死亡|出局|阵亡|带走|自爆|殉情|放逐：/.test(x)?'dead':/警长|警徽|上警/.test(x)?'badge':/查验/.test(x)?'chk':/狼刀|刀 \d|毒 \d/.test(x)?'knife':'';
// 记票明细：每个被投的人一行，票数条、票数、投票人；弃票单列
function voteItem(x){const m=x.match(/^(放逐投票|警长投票)(（PK）)?：([\s\S]*)$/);if(!m)return '';
 const rows=[],none=[];let max=0;
 m[3].split('｜').forEach(t=>{const a=t.match(/^(\d+)号 ([\d.]+)票（(.*)）$/),b=t.match(/^弃票 (.*)$/);if(a){rows.push({n:a[1],k:+a[2],w:a[3]});max=Math.max(max,+a[2]);}else if(b)none.push(b[1]);});
 const body=rows.length?rows.map((r,i)=>`<span class="vr ${i===0&&(rows.length===1||rows[1].k<r.k)?'top':''}"><em class="no">${r.n}号</em><i class="vb"><i style="width:${max?Math.round(r.k*100/max):0}%"></i></i><b>${r.k} 票</b><small>${r.w.replace(/\u{1F396}/gu,'(警长)')}</small></span>`).join('')+(none.length?`<span class="vr vn">弃票 ${none.join('')}</span>`:''):'<span class="vr vn">无人投票</span>';
 return `<li class="vote ${m[1]==='警长投票'?'badge':''}"><span><b class="lk">${m[1]}${m[2]?'<small>PK</small>':''}</b><span class="lb vt">${body}</span></span></li>`;}
function logItem(x){const v=voteItem(x);if(v)return v;const m=x.match(/^([^：｜\d]{1,8})：([\s\S]*)$/),body=(m?m[2]:x).split('｜').map(hl).join('<br>');
 return `<li class="${logKind(x)}"><span>${m?`<b class="lk">${m[1]}</b>`:''}<span class="lb">${body.replace(/\u{1F396}/gu,ic('badge')).replace(/\u{1F3C6}\s*/gu,ic('cup')+' ')}</span></span></li>`;}
function logHTML(g=S){if(!g.log.length)return '<ul class="log"><li>暂无记录</li></ul>';
 const ps=[];let cur=null;
 g.log.forEach(l=>{if(/^—— 天[亮黑] ——$/.test(l.x))return;if(!cur||cur.t!==l.t){cur={t:l.t,a:[]};ps.push(cur);}cur.a.push(l.x);});
 return ps.map(p=>{const n=p.t.includes('夜');return `<div class="lgp ${n?'n':'d'}"><div class="lgh">${ic(n?'moon':'sun')} ${p.t}</div><ul class="log">${p.a.map(logItem).join('')}</ul></div>`;}).join('');}
function openMenu(){
 sheet(`<h2>菜单</h2><div class="opts">
  <button class="btn" ${undo.length?'':'disabled'} onclick="doUndo()">${ic('undo')} 撤销上一步<small>含夜间录入</small></button>
  <button class="btn" onclick="openLog()">${ic('log')} 对局记录</button>
  <button class="btn" onclick="openNames()">${ic('tag')} 玩家名字<small>已录 ${S.names.filter(x=>x).length}/12</small></button>
  <button class="btn" onclick="copyLog()">${ic('copy')} 复制复盘文本</button>
  <button class="btn" onclick="openHistory()">${ic('folder')} 历史对局<small>${loadHist().length} 局</small></button>
  <button class="btn" ${navigator.wakeLock?'':'disabled'} onclick="togWake()">${ic('sun')} 屏幕常亮<small>${!navigator.wakeLock?'此浏览器不支持':!wakeOn?'已关闭':wake?'已开启':'未生效，请关省电模式'}</small></button>
  <button class="btn" onclick="togDim()">${ic('moon')} 夜间调暗、口令大字<small>${dimOn?'已开启':'已关闭'}</small></button>
  <button class="btn" onclick="openBackup()">${ic('save')} 备份与恢复<small>${bkAt()?'上次导出 '+when({end:bkAt()}).slice(5):'从未导出'}</small></button>
  <button class="btn" ${TTS?'':'disabled'} onclick="togVoice()">${ic('vol')} 口令语音播报<small>${!TTS?'此浏览器不支持':voiceOn?'已开启，换步自动朗读':'已关闭'}</small></button>
  <button class="btn" ${TTS?'':'disabled'} onclick="voiceRateNext()">${ic('vol')} 播报语速<small>${voiceRate}×</small></button>
  <button class="btn" onclick="openGuide()">${ic('book')} 身份速查<small>本板技能说明</small></button>
  <button class="btn" onclick="openStats()">${ic('chart')} 对局统计<small>胜率、玩家</small></button>
  <button class="btn" onclick="askImage()">${ic('pic')} 复盘长图<small>生成图片分享</small></button>
  <button class="btn" onclick="openPub()">${ic('tv')} 大屏公开模式<small>给玩家看，不显示身份</small></button>
  <button class="btn danger" onclick="newGame()" style="grid-column:span 2">${ic('redo')} 新开一局 / 换板子</button></div>${note('版本 '+VER)}`);
}
function doUndo(){if(!undo.length)return;const {hide,names,id}=S;S=norm(JSON.parse(undo.pop()));undoDirty='pop';home=false;S.hide=hide;S.names=names;
 if(S.id!==id)saveHist(loadHist().filter(g=>g.id!==S.id)); // 撤销“新开一局”：这一局又在进行，从历史移出
 save();close_();render();toast('已撤销');}
function newGame(){sheet(`<h2>${ic('redo')} 选择板子</h2>${pristine()?'':note(S.log.length?'当前对局会存入历史对局。':'当前录入将清空。')}<div class="bds">${boardsHTML()}</div>`);}
const boardsHTML=()=>`${Object.entries(BOARDS).map(([k,b])=>`<button class="btn bd ${S.board===k?'act':''}" onclick="startGame('${k}')">${b.name}<small>${b.desc}</small><span class="bi">${Object.keys(b.cnt).filter(x=>x!=='villager'&&x!=='wolf').slice(-4).map(x=>`<img src="img/${x}.png" alt="">`).join('')}</span></button>`).join('')}`;
// 误点可从菜单“撤销上一步”找回
function startGame(k){const {hide,names}=S;close_();archive();tmReset();home=false;snap();S=Object.assign(fresh(k),{hide,names});save();render();toast('已开新局：'+BD().name);}
function copyLog(id){
 const g=id?hist(id):S;if(!g)return;
 const t=[`【狼人杀法官记录】${bdName(g)}${id?' '+when(g):''}`,...(g.win?['结果：'+winText(g.win)]:[]),...g.seats.map(s=>`${s.n}号${g.names[s.n-1]?' '+g.names[s.n-1]:''} ${s.role?R[s.role].n:'-'}${s.badge?' 🎖':''}${s.dead?`（${s.at}${CAUSE[s.dead]}）`:''}`),'','过程：',...g.log.map(l=>`[${l.t}] ${l.x.split('｜').join('\n　　　　')}`)].join('\n');
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
/* ---------- 发言计时 ---------- */
// end 是到点的时间戳（0=未在走），切到后台或刷新后仍然准
const TDS=[60,90,120,180,300];
// 两个计时器，默认 2:00 和 1:30；同一时间只走一个，开始一个会暂停另一个
let tms=[{dur:120,left:120e3,end:0},{dur:90,left:90e3,end:0}],tmInt=0,audio=null;
const TML=['警长发言','玩家发言']; // 第 1 个给警长（默认 120 秒），第 2 个给其他玩家（默认 90 秒）
const tmLeft=t=>t.end?Math.max(0,t.end-Date.now()):t.left;
const tmText=ms=>{const s=Math.ceil(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
function tmSave(){try{localStorage.setItem('lrs-timer',JSON.stringify(tms));}catch(e){}}
const timerHTML=()=>tmOne(tms[1],1)+tmOne(tms[0],0); // 玩家发言在上
function tmOne(t,i){
 const l=tmLeft(t),run=!!t.end&&l>0;
 return `<div class="tm ${l<=0?'over':l<=1e4?'low':''}" id="tm${i}"><span>${TML[i]}</span><b>${l<=0?'时间到':tmText(l)}</b><button class="btn" onclick="tmDur(${i})">${t.dur}秒</button><div class="tb"><button class="btn" onclick="tmReset(${i});tmDraw()">重置</button><button class="btn" onclick="tmReset(${i});tmGo(${i})">重置后开始</button><button class="btn ${run?'':'act'}" onclick="tmGo(${i})">${run?'暂停':l<=0?'下一位':'开始'}</button></div></div>`;
}
function tmDraw(){tms.forEach((t,i)=>{const e=$('#tm'+i);if(e)e.outerHTML=tmOne(t,i);});}
function tmTickOn(){clearInterval(tmInt);tmInt=setInterval(tmTick,200);}
function tmTick(){
 const i=tms.findIndex(t=>t.end),t=tms[i];
 if(!t){clearInterval(tmInt);return;}
 const l=tmLeft(t);
 if(l<=0){t.end=0;t.left=0;clearInterval(tmInt);tmSave();tmDraw();if(!S.night)tmAlarm();return;}
 const e=$('#tm'+i);if(e){e.querySelector('b').textContent=tmText(l);e.classList.toggle('low',l<=1e4);}
}
function tmGo(i){
 if(!S.night&&tmLeft(tms[i])<=0&&talkCur())return talkStep(1); // 时间到点“下一位”：换到下一个发言人
 try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();audio.resume();}catch(e){} // 手机须在点击时启用声音
 const t=tms[i],l=tmLeft(t),go=!(t.end&&l>0);
 tms.forEach(x=>{if(x.end){x.left=tmLeft(x);x.end=0;}});
 if(go){t.end=Date.now()+(l>0?l:t.dur*1e3);tmTickOn();}
 tmSave();tmDraw();
}
// 不带参数则全部重置
function tmReset(i){tms.forEach((t,k)=>{if(i===undefined||k===i){t.end=0;t.left=t.dur*1e3;}});tmSave();}
function tmDur(i){const t=tms[i];t.dur=TDS[(TDS.indexOf(t.dur)+1)%TDS.length];tmReset(i);tmDraw();}
// 震动 + 三声提示；iPhone 不支持震动，只有声音
function tmAlarm(){
 try{navigator.vibrate&&navigator.vibrate([300,150,300,150,300]);}catch(e){}
 try{[0,.35,.7].forEach(t=>{const o=audio.createOscillator(),g=audio.createGain(),a=audio.currentTime+t;o.frequency.value=880;g.gain.setValueAtTime(.25,a);g.gain.exponentialRampToValueAtTime(.001,a+.28);o.connect(g);g.connect(audio.destination);o.start(a);o.stop(a+.3);});}catch(e){}
}
try{
 const a=JSON.parse(localStorage.getItem('lrs-timer')); // v24 只存了一个计时器
 (Array.isArray(a)?a:[a]).slice(0,2).forEach((t,i)=>{
  if(!t||!TDS.includes(t.dur)||!(t.left>=0)||!(t.end>=0))return;
  const x=tms[i]={dur:t.dur,left:Math.min(t.left,t.dur*1e3),end:0};
  if(t.end&&t.end<=Date.now())x.left=0;else if(t.end&&t.end-Date.now()<=t.dur*1e3)x.end=t.end;
 });
 if(tms.some(t=>t.end))tmTickOn();
}catch(e){}

/* ---------- 夜间调暗大字 ---------- */
let dimOn=true;
try{dimOn=localStorage.getItem('lrs-dim')!=='0';}catch(e){}
function togDim(){dimOn=!dimOn;try{localStorage.setItem('lrs-dim',dimOn?'1':'0');}catch(e){}render();openMenu();}

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

/* ---------- 备份与恢复 ---------- */
// 导出的文件保存在本机（下载或“存储到文件”），不上传到任何地方
const BK='lrs-backup-at',SETK=['lrs-dim','lrs-wake','lrs-voice','lrs-voice-rate'];
const bkAt=()=>{try{return +localStorage.getItem(BK)||0;}catch(e){return 0;}};
const bkDue=()=>loadHist().length>=15&&Date.now()-bkAt()>7*864e5;
function bkData(){const set={};SETK.forEach(k=>{try{const v=localStorage.getItem(k);if(v!==null)set[k]=v;}catch(e){}});
 return {app:'lrs-werewolf',v:1,ver:VER,at:Date.now(),game:S,history:loadHist(),settings:set};}
function bkName(){const d=new Date(),p=x=>String(x).padStart(2,'0');return `狼人杀备份-${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.json`;}
async function exportBackup(){
 const name=bkName(),text=JSON.stringify(bkData()),done=()=>{try{localStorage.setItem(BK,String(Date.now()));}catch(e){}openBackup();toast('已导出：'+name);};
 // 手机上用系统分享面板（可“存储到文件”），电脑上直接下载
 try{const f=new File([text],name,{type:'application/json'});
  if(matchMedia('(pointer:coarse)').matches&&navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:name});return done();}
 }catch(e){if(e&&e.name==='AbortError')return;}
 const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');
 a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);done();
}
function openBackup(){const t=bkAt();
 sheet(`<h2>${ic('save')} 备份与恢复</h2>${note('对局、历史对局、玩家名字和设置只存在这台设备的浏览器里，清除浏览器数据就没了。导出的备份文件也只存在本机，不会上传。')}
  ${row('上次导出',t?when({end:t}):'<i>从未导出</i>')}${row('历史对局',loadHist().length+' 局')}
  <div class="opts" style="margin-top:12px"><button class="btn pri" onclick="exportBackup()">${ic('save')} 导出备份文件</button><button class="btn" onclick="pickBackup()">${ic('folder')} 从文件导入</button></div>
  ${note('导入：当前对局先存入历史对局，再换成备份里的对局；历史对局按局合并，保留最近 20 局。导入后可用“撤销上一步”回到导入前。')}`);}
function pickBackup(){const i=document.createElement('input');i.type='file';i.accept='.json,application/json';
 i.onchange=()=>{const f=i.files&&i.files[0];if(!f)return;const r=new FileReader();r.onload=()=>askImport(String(r.result));r.onerror=()=>toast('读取失败');r.readAsText(f);};i.click();}
function parseBackup(t){try{const d=JSON.parse(t),g=d&&d.game;
 if(!d||d.app!=='lrs-werewolf'||!g||!Array.isArray(g.seats)||g.seats.length!==12||!BOARDS[g.board]||!Array.isArray(g.log))return null;
 d.history=(Array.isArray(d.history)?d.history:[]).filter(h=>h&&h.id&&Array.isArray(h.seats)&&Array.isArray(h.log)&&Array.isArray(h.names));return d;}catch(e){return null;}}
function askImport(t){const d=parseBackup(t);
 if(!d)return sheet(`<h2>无法导入</h2>${note('这不是本应用导出的备份文件，或者文件已损坏。')}<div class="pkf"><button class="btn" onclick="openBackup()">返回</button></div>`);
 window._bk=d;const g=d.game;
 sheet(`<h2>导入这份备份？</h2>${row('导出时间',when({end:d.at}))}${row('对局',`${bdName(g)} · 第${g.day}${g.night?'夜':'天'}`)}${row('历史对局',d.history.length+' 局')}
  ${note('当前对局会先存入历史对局；导入后可用“撤销上一步”回到导入前。')}<div class="pkf"><button class="btn" onclick="openBackup()">取消</button><button class="btn pri" onclick="doImport()">确认导入</button></div>`);}
function doImport(){const d=window._bk;if(!d)return;window._bk=null;
 const {hide}=S;archive();snap();
 const seen=new Set(),all=[...d.history,...loadHist()].filter(g=>!seen.has(g.id)&&seen.add(g.id)).sort((a,b)=>(b.end||0)-(a.end||0));
 S=norm(JSON.parse(JSON.stringify(d.game)));S.hide=hide;
 saveHist(all.filter(g=>g.id!==S.id));
 Object.entries(d.settings||{}).forEach(([k,v])=>{if(SETK.includes(k)&&typeof v==='string')try{localStorage.setItem(k,v);}catch(e){}});
 loadPrefs();home=false;close_();settle();toast('已导入备份');}

/* ---------- 口令语音播报 ---------- */
// 用设备自带的语音（断网可用）；刀口等号码不念，由法官比划
const TTS=!!(window.speechSynthesis&&window.SpeechSynthesisUtterance),RATES=[.8,1,1.2,1.4];
let voiceOn=false,voiceRate=1,spoke='',booted=false;
function loadPrefs(){try{dimOn=localStorage.getItem('lrs-dim')!=='0';wakeOn=localStorage.getItem('lrs-wake')!=='0';voiceOn=localStorage.getItem('lrs-voice')==='1';const r=+localStorage.getItem('lrs-voice-rate');voiceRate=RATES.includes(r)?r:1;}catch(e){}}
// 朗读：按一次播放，再按一次暂停，再按继续。暂停用“记住念到哪、停掉、从那里接着念”，各家浏览器都可靠
let sp={key:'',text:'',pos:0,state:'idle',u:null};
function spText(key){const e=key==='step'?$('.wiz .say'):$(`.wiz .say [data-sp="${key}"]`);if(!e)return '';const c=e.cloneNode(true);
 c.querySelectorAll('button').forEach(b=>b.remove());if(key==='step')c.querySelectorAll('.ln').forEach(l=>l.append('\n'));
 c.querySelectorAll('em.k').forEach(x=>x.textContent='这名');c.querySelectorAll('br').forEach(b=>b.replaceWith('\n'));
 return c.textContent.replace(/（[^）]*）/g,'').replace(/[“”]/g,'').replace(/……/g,'，').replace(/\s+/g,' ').trim();}
const sayText=()=>spText('step');
const spkLbl=key=>sp.key===key&&sp.state==='playing'?'暂停':sp.key===key&&sp.state==='paused'?'继续':'朗读';
function spkBtn(key,what){if(!TTS)return '';const l=spkLbl(key);return `<button class="btn sb ${l!=='朗读'?'on':''}" data-spk="${key}" onclick="spkTap('${key}')" aria-label="${l}${what||R[key]?.n||''}">${ic('vol')} ${l}${what&&l==='朗读'?what:''}</button>`;}
function drawSpk(){document.querySelectorAll('[data-spk]').forEach(b=>{const k=b.dataset.spk,l=spkLbl(k),w=k==='step'?'口令':'';b.innerHTML=`${ic('vol')} ${l}${w&&l==='朗读'?w:''}`;b.classList.toggle('on',l!=='朗读');});}
function spPlay(t,base){const old=sp.u;sp.u=null;if(old||speechSynthesis.speaking)speechSynthesis.cancel();if(!t){sp.state='idle';return drawSpk();}
 const vs=speechSynthesis.getVoices(),v=vs.find(x=>/^zh[-_](CN|Hans)/i.test(x.lang))||vs.find(x=>/^zh/i.test(x.lang)),u=new SpeechSynthesisUtterance(t);
 u.lang='zh-CN';u.rate=voiceRate;if(v)u.voice=v;
 u.onboundary=e=>{if(sp.u===u)sp.pos=base+(e.charIndex||0);};
 u.onend=u.onerror=()=>{if(sp.u===u){sp.u=null;sp.state='idle';sp.pos=0;drawSpk();}};
 sp.u=u;sp.state='playing';window._said=t;speechSynthesis.speak(u);drawSpk();}
function spStop(){const u=sp.u;sp.u=null;sp.state='idle';sp.pos=0;if(u)speechSynthesis.cancel();drawSpk();}
function spkTap(key){if(!TTS)return;
 if(sp.key===key&&sp.state==='playing'){const u=sp.u;sp.u=null;sp.state='paused';if(u)speechSynthesis.cancel();return drawSpk();}
 if(sp.key===key&&sp.state==='paused')return spPlay(sp.text.slice(sp.pos),sp.pos);
 sp.key=key;sp.text=spText(key);sp.pos=0;spPlay(sp.text,0);}
function speak(){if(!TTS)return;sp.key='step';sp.text=sayText();sp.pos=0;spPlay(sp.text,0);}
// 换到新的一步：先停掉上一步的朗读；开启自动播报时念新的一步（刚打开页面不自动念，浏览器也不允许）
function autoSpeak(){if(home||!S.night){if(sp.state!=='idle'&&TTS)spStop();return;}const k=S.id+'|'+S.day+'|'+S.n.step;if(k===spoke)return;spoke=k;if(!TTS)return;if(booted&&voiceOn)speak();else if(sp.state!=='idle')spStop();}
function togVoice(){voiceOn=!voiceOn;try{localStorage.setItem('lrs-voice',voiceOn?'1':'0');}catch(e){}if(TTS&&!voiceOn)spStop();openMenu();if(voiceOn)toast('已开启：每到新的一步自动朗读');}
function voiceRateNext(){voiceRate=RATES[(RATES.indexOf(voiceRate)+1)%RATES.length];try{localStorage.setItem('lrs-voice-rate',String(voiceRate));}catch(e){}openMenu();}

/* ---------- 西游杀状态面板 ---------- */
function xyPanel(){const x=XY(),now=k=>S.night?huntRes(k).filter(r=>r.got).map(r=>r.c):[];
 const line=k=>{const t=x[k],s=one(k),nw=now(k),aw=t.awake||(S.night&&woke(k));
  return `<div class="xr"><b>${LEAD[k]}${s&&s.dead?'<small>已出局</small>':''}</b>${'ABC'.split('').map(c=>{const on=!!t[c]||nw.includes(c),sub=c==='B'&&t.usedB?'已用':t[c]?`第${t[c]}夜得`:nw.includes(c)?'今晚得':'未得';
   return `<span class="${on?'on':''} ${c==='B'&&t.usedB?'used':''}">${c} ${TR[k][c]}<small class="f">${TRF[k][c]}</small><small>${sub}</small></span>`;}).join('')}<span class="${aw?'on':''}">觉醒<small>${t.awake?`第${t.awake}夜`:aw?'今晚':'未觉醒'}</small></span></div>`;};
 const b=x.bound;
 return `<div class="xyp ${S.hide?'mask':''}"><div class="lbl"><strong>西游状态</strong></div>${line('wukong')}${line('erlang')}
  <div class="xi"><span>唐僧<small>${x.tang?x.tang+'号':'未定'}</small></span><span>甘露水<small>${x.gyUsed?'已用':'未用'}</small></span><span>收服<small>${b?b+'号'+(seat(b).dead?' 已出局':''):'未用'}</small></span><span>紫霞上次<small>${x.lastZx?x.lastZx+'号':'—'}</small></span></div></div>`;}

/* ---------- 发言顺序 ---------- */
// S.talk：{k:'day' 白天 | 'police' 警上, dir:1 号码递增 | -1 递减, st:起点, last:警长最后发言, o:顺序, i:当前第几位, day}
// 轮到警长用“警长发言”计时（默认 120 秒），其他人用“玩家发言”（默认 90 秒）
const talkTm=n=>n&&n===chief()?0:1;
function talkTime(){const n=talkCur();if(!n)return;const k=talkTm(n);tmReset(k);tmGo(k);}
const talkPool=k=>(k==='police'?runners():S.seats.filter(s=>!s.dead).map(s=>s.n)).sort((a,b)=>a-b);
const chief=()=>{const c=S.seats.find(s=>s.badge&&!s.dead);return c?c.n:0;};
const talkChief=d=>d.k==='day'?chief():0; // 有警长时警长固定最后发言
// 从 st 起按方向排一圈；st 不在名单里时，从它下一个（按方向）开始
function talkFrom(a,st,dir){if(!a.length)return [];let i=a.indexOf(st);
 if(i<0){i=dir>0?a.findIndex(x=>x>st):a.length-1-[...a].reverse().findIndex(x=>x<st);if(i<0||i>=a.length)i=dir>0?0:a.length-1;}
 return a.map((_,k)=>a[((i+dir*k)%a.length+a.length)%a.length]);}
function talkOrder(d){const a=talkPool(d.k),c=talkChief(d),b=a.filter(x=>x!==c);return c&&a.includes(c)?[...talkFrom(b,d.st,d.dir),c]:talkFrom(a,d.st,d.dir);}
const talkOn=()=>!S.night&&!!S.talk&&S.talk.day===S.day&&S.talk.o.length>0;
const talkGone=n=>S.talk.k==='police'?!present(seat(n)):!!seat(n).dead;
const talkCur=()=>talkOn()&&S.talk.i<S.talk.o.length?S.talk.o[S.talk.i]:0;
const talkNext=()=>{if(!talkOn())return 0;const t=S.talk;for(let j=t.i+1;j<t.o.length;j++)if(!talkGone(t.o[j]))return t.o[j];return 0;};
function talkDefault(){const d=window._tk,c=talkChief(d),a=talkPool(d.k).filter(x=>x!==c);
 d.st=c?(d.dir>0?a.find(x=>x>c)||a[0]:[...a].reverse().find(x=>x<c)||a.at(-1))||0:a.includes(d.st)?d.st:a[0]||0;}
function openTalk(){const t=S.talk&&S.talk.day===S.day?S.talk:null,pol=electing()&&runners().length>0;
 window._tk={k:t&&(t.k==='day'||pol)?t.k:pol?'police':'day',dir:t?t.dir:1,st:t?t.st:0,last:t?t.last:true};
 if(!t||talkChief(window._tk)||!talkPool(window._tk.k).includes(window._tk.st))talkDefault();drawTalk();}
function drawTalk(keep){const d=window._tk,c=talkChief(d),o=talkOrder(d),pol=electing()&&runners().length>0;
 sheet(`<h2>${ic('talk')} 发言顺序</h2>
  <div class="seg">${pol?`<button class="btn ${d.k==='police'?'act':''}" onclick="talkSet('k','police')">警上发言</button>`:''}<button class="btn ${d.k==='day'?'act':''}" onclick="talkSet('k','day')">${pol?'全体发言':'白天发言'}</button></div>
  <div class="seg"><button class="btn ${d.dir>0?'act':''}" onclick="talkSet('dir',1)">号码递增 →</button><button class="btn ${d.dir<0?'act':''}" onclick="talkSet('dir',-1)">← 号码递减</button></div>
  ${c?note(`警长 ${c}号 最后发言（归票）：号码递增从 ${c}号 的下一位开始，号码递减从 ${c}号 的上一位开始。`):`<div class="lbl"><strong>起点</strong>点号码选第一个发言的人</div>
  <div class="pk">${talkPool(d.k).map(n=>`<button class="${n===d.st?'cur':''}" onclick="talkSet('st',${n})"><b>${n}</b><small>${S.names[n-1]||'&nbsp;'}</small></button>`).join('')}</div>
  <button class="btn" style="width:100%;margin-top:8px" onclick="talkRand()">随机起点</button>`}
  <div class="lbl"><strong>顺序</strong>${o.length} 人</div><div class="tko">${o.map(n=>`<span>${n}</span>`).join('')||'<i>没有可发言的玩家</i>'}</div>
  <div class="pkf"><button class="btn" onclick="close_()">取消</button><button class="btn pri" ${o.length?'':'disabled'} onclick="talkGo()">开始发言</button></div>`,keep);}
function talkSet(f,v){const d=window._tk;d[f]=v;if(f==='k'||(f==='dir'&&talkChief(d)))talkDefault();drawTalk(true);}
function talkRand(){const d=window._tk,c=talkChief(d),a=talkPool(d.k).filter(x=>x!==c);if(a.length)d.st=a[Math.floor(Math.random()*a.length)];drawTalk(true);}
function talkGo(){const d=window._tk,o=talkOrder(d);if(!o.length)return;S.talk={...d,o,i:0,day:S.day};close_();save();talkTime();render();toast(`${o[0]}号 先发言`);}
function talkStep(dl){if(!talkOn())return;const t=S.talk;let i=t.i;do i+=dl;while(i>=0&&i<t.o.length&&talkGone(t.o[i]));
 if(i<0)return;t.i=Math.min(i,t.o.length);save();
 if(t.i<t.o.length)talkTime();else{tms.forEach(x=>{if(x.end){x.left=tmLeft(x);x.end=0;}});tmSave();}
 render();}
function talkBox(){if(!talkOn())return row('发言顺序','<i>未安排</i>','安排','openTalk()');
 const t=S.talk,cur=talkCur(),nx=talkNext();
 return `<div class="tk"><div class="tkh"><span>${t.k==='police'?'警上发言':'发言顺序'}</span><button class="btn" onclick="openTalk()">重排</button></div>
  <div class="tko">${t.o.map((x,j)=>`<span class="${j<t.i?'done':j===t.i?'cur':''} ${talkGone(x)?'dd':''}">${x}</span>`).join('')}</div>
  <div class="tkn">${cur?`<b>${lab(cur)} 发言</b><small>${TML[talkTm(cur)]} ${tms[talkTm(cur)].dur} 秒 · 第 ${t.i+1}/${t.o.length} 位${nx?`，下一位 ${nx}号`:'，最后一位'}</small>`:'<b>发言结束</b>'}</div>
  <div class="tkb"><button class="btn" ${t.i>0?'':'disabled'} onclick="talkStep(-1)">上一位</button><button class="btn pri" ${cur?'':'disabled'} onclick="talkStep(1)">${nx?'下一位并计时':'结束发言'}</button></div></div>`;}

/* ---------- 身份技能速查 ---------- */
const RI={seer:'每晚查验一名玩家：好人还是狼人。',
 medium:'每晚查验一名玩家的具体身份；验到已学习的机械狼，显示它学到的身份。',
 witch:'有一瓶解药、一瓶毒药，各用一次。全程不能自救，同一夜不能同时用两瓶。',
 hunter:'出局时可以开枪带走一名玩家；被毒杀、殉情等情况不能开枪。',
 idiot:'白天被投票放逐时翻牌，视为出局但可继续发言，失去投票权；夜间死亡不能翻牌。',
 guard:'每晚守护一名玩家免受狼刀，可以守自己，不能连续两夜守同一人。同守同救则死亡，挡不住毒药。',
 knight:'白天可翻牌与一名玩家决斗，整局一次：对方是狼人则其出局并直接入夜；对方是好人则骑士出局。',
 magician:'每晚可交换两名玩家的号码，当夜狼刀、毒药、查验作用到交换后的玩家；每个号码整局只能被交换一次。',
 merchant:'整局可交易一次，把查验、毒药或猎枪交给一名玩家：交给好人则其成为幸运儿；交给狼人则黑市商人死亡。',
 dreamer:'每晚必须摄梦一名玩家，梦游者当夜免疫狼刀和毒药；连续两夜摄同一人则其死亡；摄梦人夜间死亡，梦游者一同死亡。',
 grave:'从第 2 夜起，得知前一天被放逐的玩家是好人还是狼人。',
 witchhunter:'从第 2 夜起可狩猎一名玩家：是狼人则其天亮死亡，是好人则猎魔人死亡。免疫女巫的毒药。',
 hybrid:'首夜选一名玩家做榜样。属平民阵营，被预言家查验永远是好人。',
 villager:'没有技能，靠发言和投票找出狼人。',
 villagerXY:'没有技能。离孙悟空最近的平民是唐僧（本人不知道）：查验显示平民，投票多算 0.5 票，寻宝点到唐僧无法获取宝物。',
 wolf:'每晚和狼队一起刀一名玩家；白天可以自爆，直接进入黑夜。',
 wolfking:'狼人。出局时可以开枪带走一名玩家；被毒杀等情况不能开枪。',
 demon:'狼人。每晚查验一名玩家是不是神职；夜间免死，狼刀和毒药对其无效。',
 beauty:'狼人。每晚魅惑一名玩家，狼美人出局时被魅惑者一同殉情（被骑士决斗出局不触发）；不能连续两夜魅惑同一人，不能自爆。',
 elder:'狼人，首夜和狼弟互相确认。狼兄出局前，狼弟被查验是好人。',
 younger:'狼人。首夜不入狼窝、不参与狼刀；狼兄出局的当夜觉醒，单独刀一人，之后加入狼队。觉醒前被查验是好人。',
 gargoyle:'狼人，不与狼队相认。每晚查验一名玩家的具体身份；其他狼人全部出局后带刀。不能自爆。',
 mechwolf:'狼人，不入狼窝。整局可学习一名玩家的身份并获得其技能（下一夜起可用）；其他狼人全部出局后带刀。不能自爆。',
 nightmare:'狼人，首夜不与狼队相认。每晚恐惧一名玩家，使其当夜不能使用技能；恐惧到狼人则狼队当夜不能刀人。',
 bloodmoon:'狼人。白天自爆后，当夜所有神职的技能被封印。',
 wukong:'好人领袖。每晚点人寻宝（点到狼人得 A、神职得 B、平民得 C）：A 火眼金睛（觉醒后查验身份）、B 定海神针（击杀二郎神，一次）、C 镇魔圈（每晚护一人及左右）。集齐三件当夜觉醒，觉醒后夜里不死。',
 zixia:'每晚加持一名玩家；加持到孙悟空或二郎神，其当晚分开寻宝两次。不能连续两晚加持同一人。',
 guanyin:'甘露水整局一次，救当晚的刀口（不能自救）；整局只能收服一人，被收服者投票跟观音，观音出局时一同殉情。',
 heixiong:'每晚得知左右两侧最近的存活玩家里有没有狼；唐僧在旁边时结果反转。',
 erlang:'天庭领袖。每晚点人寻宝（点到狼人得 A、神职得 B、平民得 C）：A 天眼（觉醒后查验身份）、B 三尖两刃刀（击杀孙悟空，一次）、C 哮天犬（每晚封印一人技能）。集齐三件当夜觉醒，下一夜起和天兵一起刀人。',
 tianbing:'天庭阵营，每晚一起刀一名玩家。不能自爆。'};
const CAMP={god:'神职',villager:'平民阵营',wolf:'狼人阵营'};
const roleInfo=(k,b=S.board)=>b==='xiyou'&&k==='villager'?RI.villagerXY:RI[k]||'';
function openGuide(b=S.board){const bd=BOARDS[b]||BD();
 sheet(`<h2>${ic('book')} 身份速查</h2><div class="gb">${Object.entries(BOARDS).map(([k,x])=>`<button class="btn ${k===b?'act':''}" onclick="openGuide('${k}')">${x.name}</button>`).join('')}</div>
  <div class="lbl"><strong>${bd.name}</strong>${bd.desc}</div>
  <div class="rg">${Object.keys(bd.cnt).map(k=>{const r=R[k];return `<div class="${r.c}"><img src="img/${pic(k,b)}.png" alt=""><div><b>${r.n}${bd.cnt[k]>1?` ×${bd.cnt[k]}`:''}<small>${CAMP[r.c]}</small></b><p>${roleInfo(k,b)}</p></div></div>`;}).join('')}</div>
  ${note(b==='xiyou'?'胜负（屠边）：孙悟空、紫霞仙子、观音、黑熊精全体出局，或平民（含唐僧）全体出局，天庭获胜；二郎神和天兵全体出局，好人获胜。':'胜负（屠边）：神职全体出局或平民全体出局，狼人获胜；狼人全体出局，好人获胜。')}`);}

/* ---------- 对局统计 ---------- */
// 只用本机的历史对局（和当前对局）计算
function statGames(){const h=loadHist();return S.log.length&&!h.some(g=>g.id===S.id)?[{id:S.id,end:Date.now(),board:S.board,day:S.day,win:S.win,names:S.names,seats:S.seats,log:S.log},...h]:h;}
const sideOf=s=>s.role&&R[s.role]&&R[s.role].c==='wolf'?'wolf':'good';
const pct=(a,b)=>b?Math.round(a*100/b)+'%':'—';
const avgDay=a=>a.length?(a.reduce((x,g)=>x+(+g.day||0),0)/a.length).toFixed(1):'—';
const bar2=(g,w)=>`<div class="sb2">${g+w?`<i class="g" style="flex:${g}"></i><i class="w" style="flex:${w}"></i>`:''}</div>`;
function statsOf(gs){const fin=gs.filter(g=>g.win&&g.win.side),good=fin.filter(g=>g.win.side==='good').length,by={},P={};
 gs.forEach(g=>(by[g.board]=by[g.board]||[]).push(g));
 fin.forEach(g=>g.seats.forEach(s=>{const n=cleanName(String(g.names[s.n-1]||''));if(!n||!s.role)return;const p=P[n]=P[n]||{n:0,w:0,wolf:0,ww:0};const sd=sideOf(s),won=sd===g.win.side;p.n++;if(won)p.w++;if(sd==='wolf'){p.wolf++;if(won)p.ww++;}}));
 return {gs,fin,good,wolf:fin.length-good,by,P};}
function openStats(){const t=statsOf(statGames());
 sheet(`<h2>${ic('chart')} 对局统计</h2>${t.gs.length?`
  <div class="sx"><span><b>${t.gs.length}</b>局</span><span><b>${t.fin.length}</b>已分胜负</span><span class="g"><b>${pct(t.good,t.fin.length)}</b>好人胜</span><span class="w"><b>${pct(t.wolf,t.fin.length)}</b>狼人胜</span><span><b>${avgDay(t.fin)}</b>平均天数</span></div>${bar2(t.good,t.wolf)}
  <div class="lbl"><strong>各板子</strong>绿色好人胜，红色狼人胜</div>
  <div class="st2">${Object.entries(t.by).sort((a,b)=>b[1].length-a[1].length).map(([k,a])=>{const f=a.filter(g=>g.win&&g.win.side),g=f.filter(x=>x.win.side==='good').length;
   return `<div><b>${bdName({board:k})}</b><small>${a.length} 局 · 好人 ${g} 胜 · 狼人 ${f.length-g} 胜 · 平均 ${avgDay(f)} 天</small>${bar2(g,f.length-g)}</div>`;}).join('')}</div>
  <div class="lbl"><strong>玩家</strong>按名字统计已分胜负的对局</div>
  ${Object.keys(t.P).length?`<div class="st2">${Object.entries(t.P).sort((a,b)=>b[1].n-a[1].n||b[1].w/b[1].n-a[1].w/a[1].n).map(([n,p])=>{const gn=p.n-p.wolf,gw=p.w-p.ww;return `<div class="pl"><b>${n}<small>${p.n} 局</small></b><div class="pr"><span><b>${pct(p.w,p.n)}</b>总胜率<small>${p.w}/${p.n}</small></span><span class="g"><b>${pct(gw,gn)}</b>神民胜率<small>${gw}/${gn}</small></span><span class="w"><b>${pct(p.ww,p.wolf)}</b>狼人胜率<small>${p.ww}/${p.wolf}</small></span></div></div>`;}).join('')}</div>`:note('录了玩家名字的对局才会统计到人。')}`
  :note('还没有对局。新开一局时，上一局会存入历史对局并计入统计。')}${note(`统计本机保存的最近 ${HMAX} 局历史对局${S.log.length?'和当前对局':''}，不上传。`)}
  <div class="pkf"><button class="btn" onclick="openHistory()">← 历史对局</button></div>`);}

/* ---------- 复盘长图 ---------- */
// 在本机画成 PNG，手机上用系统分享（可存相册），电脑上直接下载
const PAL={bg:'#2b2216',card:'#382d1e',ink:'#e4e2da',muted:'#b3aa9a',line:'#55493a',wolf:'#f2a08c',god:'#a9c8ea',villager:'#b9d39a',accent:'#bda38b'};
const imgName=g=>{const d=new Date(g.end||Date.now()),p=x=>String(x).padStart(2,'0');return `狼人杀复盘-${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.png`;};
const loadImg=src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src;});
function wrapText(c,t,w){const out=[];let line='';for(const ch of [...t]){if(line&&c.measureText(line+ch).width>w){out.push(line);line=ch;}else line+=ch;}out.push(line);return out;}
function fitText(c,t,w){if(c.measureText(t).width<=w)return t;let s=[...t];while(s.length&&c.measureText(s.join('')+'…').width>w)s.pop();return s.join('')+'…';}
function rrect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
const imgLine=x=>x.replace(/\u{1F396}/gu,'(警长)').replace(/\u{1F3C6}\s*/gu,'');
async function drawReview(g){
 const W=1080,P=56,F=getComputedStyle(document.body).fontFamily,f=(s,b)=>`${b?600:400} ${s}px ${F}`,ks=[...new Set(g.seats.filter(s=>s.role).map(s=>s.role))],im={};
 await Promise.all(ks.map(async k=>{im[k]=await loadImg(`img/${pic(k,g.board)}.png`);}));
 const cv=document.createElement('canvas'),c=cv.getContext('2d'),TX=P+150,TW=W-TX-P,LH=42;
 c.font=f(28);const logs=g.log.map(l=>({t:l.t,ls:imgLine(l.x).split('｜').flatMap(x=>wrapText(c,x,TW))}));
 const cw=(W-P*2-16)/2,ch=100,H=P+74+60+(g.win?96:0)+20+6*(ch+12)+40+60+logs.reduce((a,l)=>a+l.ls.length*LH+20,0)+90;
 cv.width=W;cv.height=H;c.textBaseline='top';c.fillStyle=PAL.bg;c.fillRect(0,0,W,H);
 let y=P;c.fillStyle=PAL.ink;c.font=f(52,1);c.fillText('狼人杀 · 对局复盘',P,y);y+=74;
 c.fillStyle=PAL.muted;c.font=f(30);c.fillText(fitText(c,`${bdName(g)} · ${when({end:g.end||Date.now()})} · ${g.day} 天`,W-P*2),P,y);y+=60;
 if(g.win){const k=g.win.side==='wolf'?'wolf':'villager';c.fillStyle=k==='wolf'?'#4e2c22':'#34432a';rrect(c,P,y,W-P*2,76,16);c.fill();c.fillStyle=PAL[k];c.font=f(34,1);c.fillText(fitText(c,winText(g.win),W-P*2-56),P+28,y+19);y+=96;}
 y+=20;c.imageSmoothingEnabled=false;
 g.seats.forEach((s,i)=>{const x=P+(i%2)*(cw+16),yy=y+Math.floor(i/2)*(ch+12),r=s.role&&R[s.role];
  rrect(c,x,yy,cw,ch,14);if(s.dead){c.setLineDash([8,6]);c.strokeStyle=PAL.line;c.lineWidth=2;c.stroke();c.setLineDash([]);}else{c.fillStyle=PAL.card;c.fill();}
  if(r&&im[r.k]){c.globalAlpha=s.dead?.4:1;c.drawImage(im[r.k],x+14,yy+14,72,72);c.globalAlpha=1;}
  const tx=x+100,tw=cw-114;c.font=f(30,1);c.fillStyle=s.dead?PAL.muted:PAL.ink;const no=`${s.n}号`;c.fillText(no,tx,yy+14);let nx=tx+c.measureText(no).width+10;
  const nm=cleanName(String(g.names[s.n-1]||''));if(nm){c.font=f(26);c.fillStyle=PAL.muted;const t=fitText(c,nm,tw-(nx-tx)-(s.badge?80:0));c.fillText(t,nx,yy+18);nx+=c.measureText(t).width+10;}
  if(s.badge){c.font=f(24,1);c.fillStyle=PAL.accent;c.fillText('警长',nx,yy+19);}
  c.font=f(28,1);c.fillStyle=r?PAL[r.c]:PAL.muted;const rn=r?r.n:'未录入';c.fillText(rn,tx,yy+56);
  if(s.dead){const w0=c.measureText(rn).width+12;c.font=f(24);c.fillStyle=PAL.muted;c.fillText(fitText(c,`${s.at}${CAUSE[s.dead]||''}`,tw-w0),tx+w0,yy+60);}});
 y+=6*(ch+12)+40;c.fillStyle=PAL.ink;c.font=f(34,1);c.fillText('过程',P,y);y+=60;
 logs.forEach(l=>{c.font=f(26);c.fillStyle=PAL.muted;c.fillText(l.t,P,y+2);c.font=f(28);c.fillStyle=PAL.ink;l.ls.forEach((t,j)=>c.fillText(t,TX,y+j*LH));y+=l.ls.length*LH+20;
  c.fillStyle=PAL.line;c.fillRect(P,y-10,W-P*2,1);});
 c.font=f(24);c.fillStyle=PAL.muted;c.fillText('狼人杀法官记录 · 本机生成',P,H-P-10);
 return cv;}
let lastImg=null; // {name,blob,url}
function askImage(){if(S.hide&&!S.win)return sheet(`<h2>${ic('pic')} 复盘长图</h2>${note('长图会显示全部玩家的身份。对局还没结束，确定现在生成吗？')}<div class="pkf"><button class="btn" onclick="openLog()">取消</button><button class="btn pri" onclick="makeImage()">仍然生成</button></div>`);makeImage();}
async function makeImage(id){const g=id?hist(id):S;if(!g)return;
 sheet(`<h2>${ic('pic')} 复盘长图</h2>${note('正在生成…')}`);
 try{const cv=await drawReview(g),blob=await new Promise(r=>cv.toBlob(r,'image/png'));if(!blob)throw Error('toBlob');
  if(lastImg)URL.revokeObjectURL(lastImg.url);lastImg={name:imgName(g),blob,url:URL.createObjectURL(blob),id:id||''};
  sheet(`<h2>${ic('pic')} 复盘长图</h2><img class="lp" src="${lastImg.url}" alt="复盘长图预览">${note('手机上也可以长按图片保存。图片只在本机生成。')}
   <div class="pkf"><button class="btn" onclick="${id?`openHist('${id}')`:'openLog()'}">← 返回</button><button class="btn pri" onclick="saveImage()">${ic('save')} 保存 / 分享</button></div>`);
 }catch(e){sheet(`<h2>${ic('pic')} 复盘长图</h2>${note('生成失败，可以改用“复制复盘文本”。')}<div class="pkf"><button class="btn" onclick="close_()">关闭</button></div>`);}}
async function saveImage(){const m=lastImg;if(!m)return;
 try{const f=new File([m.blob],m.name,{type:'image/png'});
  if(matchMedia('(pointer:coarse)').matches&&navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:m.name});return toast('已分享');}
 }catch(e){if(e&&e.name==='AbortError')return;}
 const a=document.createElement('a');a.href=m.url;a.download=m.name;document.body.appendChild(a);a.click();a.remove();toast('已保存：'+m.name);}

/* ---------- 大屏公开模式 ---------- */
// 只显示公开信息：号码、名字、存活、警长、阶段、发言人、计时；不显示任何身份
const SCREEN=location.hash==='#screen'; // 新窗口打开的大屏，只读不写
let pubOn=SCREEN,pubInt=0;
function openPub(){sheet(`<h2>${ic('tv')} 大屏公开模式</h2>${note('给玩家看的画面：只显示号码、名字、存活与出局、警长、当前阶段、发言人和计时，不显示任何身份。昨夜死讯在公布前不会显示。')}
 <div class="opts" style="margin-top:12px"><button class="btn pri" onclick="pubEnter()">${ic('tv')} 本机全屏显示<small>点“返回法官界面”回来</small></button><button class="btn" onclick="pubWindow()">${ic('tv')} 新窗口打开<small>拖到投屏或外接屏</small></button></div>
 ${note('新窗口跟着本机的对局自动更新。数据只存在本机，其他手机或平板无法同步。')}`);}
function pubEnter(){close_();pubOn=true;render();try{document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen().catch(()=>{});}catch(e){}}
function pubExit(){pubOn=false;clearInterval(pubInt);pubInt=0;try{document.fullscreenElement&&document.exitFullscreen();}catch(e){}render();}
function pubWindow(){close_();const w=window.open(location.pathname+'#screen','lrs-screen');if(!w)toast('浏览器拦截了新窗口');}
// 已公布的出局：当夜（及第 1 天竞选时）的夜间死亡还没宣布
const pubDead=s=>!!s.dead&&!(s.dead==='night'&&s.at===`第${S.day}夜`&&(S.night||electing()));
const PUBC={exile:'放逐',boom:'自爆',duel:'决斗'};
function pubTimer(){const run=tms.find(t=>t.end&&tmLeft(t)>0),t=run||tms.find(t=>t.left<t.dur*1e3);return t?{l:tmLeft(t),run:!!run,n:TML[tms.indexOf(t)]}:null;}
function pubTimerHTML(){const t=pubTimer();return t?`<div class="ptm ${t.l<=0?'over':t.l<=1e4?'low':''}" id="ptm"><small>${t.n}</small><b>${t.l<=0?'时间到':tmText(t.l)}</b></div>`:'<div class="ptm" id="ptm"></div>';}
function pubHTML(){
 const cur=talkCur(),nx=talkNext(),al=S.seats.filter(s=>!pubDead(s)).length,el=!S.night&&electing();
 const ph=S.win?winText():S.night?'天黑请闭眼':el?'警长竞选':S.d?'今天的放逐已完成':'发言与投票';
 return `<main class="pub" id="top"><div class="ph"><div><small>${BD().name}</small><b>${label()}</b><span>${ph}</span></div>${pubTimerHTML()}</div>
  ${cur?`<div class="pnow">${lab(cur)} 发言中${nx?`<small>下一位 ${nx}号</small>`:''}</div>`:''}
  <div class="pg">${S.seats.map(s=>{const d=pubDead(s),t=[];if(s.badge)t.push('警长');if(s.flip)t.push('已翻牌');if(el&&S.police.includes(s.n))t.push(S.out.includes(s.n)?'退水':'上警');
   return `<div class="ps ${d?'out':''} ${cur===s.n?'now':''} ${nx===s.n?'nx':''}"><b>${s.n}</b><span>${S.names[s.n-1]||'&nbsp;'}</span><em>${d?PUBC[s.dead]||'出局':cur===s.n?'发言中':nx===s.n?'下一位':''}</em>${t.length?`<i>${t.join(' · ')}</i>`:''}</div>`;}).join('')}</div>
  <div class="pf"><span>存活 <b>${al}</b> 人</span>${SCREEN?'':'<button class="btn" onclick="pubExit()">返回法官界面</button>'}</div></main>`;}
function pubRender(){$('#app').innerHTML=pubHTML();const d=document.documentElement;d.classList.add('pubm');d.classList.remove('dim');d.classList.toggle('day',!S.night);
 if(!pubInt)pubInt=setInterval(()=>{if(!pubOn){clearInterval(pubInt);pubInt=0;return;}const e=$('#ptm');if(e)e.outerHTML=pubTimerHTML();},250);}
function pubSync(e){if(!SCREEN)return;
 if(e.key===KEY){S=load();render();}
 if(e.key==='lrs-timer'){try{const a=JSON.parse(e.newValue);if(Array.isArray(a))a.slice(0,2).forEach((t,i)=>{if(t&&TDS.includes(t.dur))tms[i]={dur:t.dur,left:+t.left||0,end:+t.end||0};});}catch(x){}}}
addEventListener('storage',pubSync);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&pubOn&&!SCREEN)pubExit();});

loadPrefs();
home=pristine()&&!S.n.step; // 走过一步就算已开局，刷新后留在对局
if(SCREEN)render();else settle(); // 打开旧存档时也整理一次并补判胜负；大屏窗口只读
booted=true;
/* ---------- 新版提示 ---------- */
// 新版下载完先等待，用户点了才启用并刷新；对局已存盘，刷新后接着录
function updBar(){return newSW?`<div class="winbar upd" onclick="applyUpdate()">${ic('star')} 有新版，点此更新（对局保留）</div>`:'';}
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
