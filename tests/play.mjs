// 真实点击 / 触控打整局并与独立计算比对
// node tests/play.mjs [--url 网址] [--round 1手机触控|2桌面鼠标] [--boards a,b] [--games 1] [--seed 1]
import fs from 'node:fs';import path from 'node:path';
import {OUT,serve,browser,sleep} from './lib.mjs';
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d;};
const round=+arg('round',1),only=arg('boards','')&&arg('boards','').split(','),GAMES=+arg('games',1);
const touch=round===1,[VW,VH]=touch?[390,844]:[1280,800];
const srv=arg('url')?null:await serve();
const URL_=arg('url')||srv.url,ORG=new URL(URL_).origin;
let seed=+arg('seed',round*7919);const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const ri=n=>Math.floor(rnd()*n),pick=a=>a[ri(a.length)],shuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=ri(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
const B_=await browser(),{cdp,ev,errs}=B_;
await cdp('Emulation.setDeviceMetricsOverride',{width:VW,height:VH,deviceScaleFactor:1,mobile:touch});
if(touch)await cdp('Emulation.setTouchEmulationEnabled',{enabled:true});
await cdp('Browser.grantPermissions',{origin:ORG,permissions:['clipboardReadWrite','clipboardSanitizedWrite']});
const nav=async()=>{for(let i=0;i<20;i++){try{if(await ev("typeof S==='object'&&typeof adv==='function'&&!!document.querySelector('#app header')"))break;}catch{}await sleep(250);}
 await ev(`window.Q={scope:()=>document.querySelector('#bg').classList.contains('show')?document.querySelector('#sheet'):document.querySelector('#app'),
 btn:t=>[...Q.scope().querySelectorAll('button')].find(b=>b.textContent.includes(t)&&!b.disabled),
 row:l=>{const rs=[...document.querySelectorAll('.side .row')];return rs.find(x=>x.querySelector('span').textContent===l)||rs.find(x=>x.querySelector('span').textContent.startsWith(l))},
 rb:l=>{const r=Q.row(l);return r&&r.querySelector('button')},
 pk:n=>[...document.querySelectorAll('.pk button')].find(b=>b.querySelector('b').textContent===String(n)),
 seat:n=>document.querySelectorAll('.seat')[n-1]}`);};
let clicks=0,last=0;
const tap=async expr=>{
 const c=await ev(`(()=>{const e=${expr};if(!e)return 'missing';if(e.disabled)return 'disabled';const r0=e.getBoundingClientRect(),bar=(document.querySelector('.stats')||{getBoundingClientRect:()=>({top:innerHeight})}).getBoundingClientRect().top;if(r0.top<60||r0.bottom>bar||document.querySelector('#bg').classList.contains('show'))e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,h=document.elementFromPoint(x,y);const o=document.documentElement.scrollWidth-innerWidth;return [x,y,!!h&&(h===e||e.contains(h)),o,r.width,r.height]})()`);
 if(typeof c==='string')throw Error(c+': '+expr);if(!c[2])throw Error('covered: '+expr);if(c[3]>0)throw Error('overflow '+c[3]);
 if(c[5]<28)throw Error('small target '+c[5]+' '+expr);
 clicks++;
 if(touch){await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:c[0],y:c[1]}]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 else{await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x:c[0],y:c[1],button:'left',clickCount:1});await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x:c[0],y:c[1],button:'left',clickCount:1});}
 await sleep(45);last=Date.now();
};
const btn=t=>tap(`Q.btn(${JSON.stringify(t)})`),rb=l=>tap(`Q.rb(${JSON.stringify(l)})`),pk=n=>tap(`Q.pk(${n})`),seatT=n=>tap(`Q.seat(${n})`);
const none=()=>tap("document.querySelector('.pkf .btn')");
const adv=async t=>{const w=390-(Date.now()-last);if(w>0)await sleep(w);await btn(t);};
const st=async()=>JSON.parse(await ev("JSON.stringify(S)"));
const en=l=>ev(`(()=>{const b=Q.rb(${JSON.stringify(l)});return !!b&&!b.disabled})()`);
const side=()=>ev("document.querySelector('.side').textContent");
const res1=()=>ev("(document.querySelector('.side .res')||{textContent:''}).textContent");
const need=(c,m)=>{if(!c)throw Error(m);};
await cdp('Page.navigate',{url:URL_});await sleep(4000);await nav();
const BOARDS=JSON.parse(await ev('JSON.stringify(BOARDS)')),R=JSON.parse(await ev('JSON.stringify(R)')),SK={check:'查验',poison:'毒药',gun:'猎枪'},CA=JSON.parse(await ev('JSON.stringify(CAUSE)'));
const W=new Set(['wolf','wolfking','demon','beauty','elder','younger','gargoyle','mechwolf','nightmare','bloodmoon','erlang','tianbing']);
const NAMES=['小明','阿强','Amy李','美玲','老王老王老王老王','Ken','张三丰','大飞','阿珍','小白','Leo','陈大文'];
const out={round,url:URL_,boards:{}};
out.ver=await ev('caches.keys().then(k=>k.join())');
// 真实键盘录 12 个名字
await btn('⋯');await btn('玩家名字');await tap("document.querySelectorAll('.nms input')[0]");
for(let i=0;i<12;i++){await cdp('Input.insertText',{text:NAMES[i]});if(i<11){await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await sleep(30);}}
await btn('保存');need((await st()).names.join()===NAMES.join(),'names '+(await st()).names.join());await sleep(1500);
const G={reload:0,undo:0,hide:0,badge:0,shot:0,revoke:0,duel:0,boom:0};
const steps=b=>d=>d===1?BOARDS[b].n1:BOARDS[b].n2;
async function reload(){const a=await ev('JSON.stringify(S)');await cdp('Page.reload');await sleep(900);await nav();const b=await ev('JSON.stringify(S)');need(a===b,'reload changed state');G.reload++;if(await ev('home')){await tap("[...document.querySelectorAll('.home .bd')].find(b=>b.firstChild.textContent===BD().name)");await sleep(1450);}}
async function undoNext(label){ // 下一步 → 撤销 → 再下一步
 const a=await ev('JSON.stringify(S)');await adv(label);if(rnd()<.5){await reload();G.undoReload=(G.undoReload||0)+1;}await btn('⋯');await btn('撤销上一步');const b=await ev('JSON.stringify(S)');need(a===b,'undo mismatch');G.undo++;await sleep(1450);}
async function hideCheck(){await tap("document.querySelector('header .ib[onclick^=togHide]')");const t=await ev(`(()=>{const v=[...document.querySelectorAll('.seat')].some(s=>[...s.querySelectorAll('img,.rn span')].some(x=>{const c=getComputedStyle(x);return c.display!=='none'&&c.visibility!=='hidden'}));const b=new Set([...document.querySelectorAll('.seat:not(.dead)')].map(s=>getComputedStyle(s).borderTopColor)).size;return [v,b]})()`);need(!t[0]&&t[1]<=1,'hide leak '+t);await tap("document.querySelector('header .ib[onclick^=togHide]')");G.hide++;await sleep(1450);}
async function shot(n){const r=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(OUT,n),Buffer.from(r.result.data,'base64'));}
async function game(bd){
 await ev('close_()');const prevG=JSON.parse(await ev('JSON.stringify([S.id,S.log.length])'));await btn('⋯');await btn('新开一局');await tap(`[...document.querySelectorAll('#sheet .bd')].find(b=>b.firstChild.textContent===${JSON.stringify(BOARDS[bd].name)})`);
 let s=await st();{const h=JSON.parse(await ev('JSON.stringify(loadHist().slice(0,1).map(g=>[g.id,g.log.length,!!g.win]))'));need(!prevG||!prevG[1]||(h[0]&&h[0][0]===prevG[0]&&h[0][1]===prevG[1]),'history '+JSON.stringify(h)+' exp '+JSON.stringify(prevG));need(await ev('loadHist().length<=20'),'hist max');if(prevG&&prevG[1])G.hist=(G.hist||0)+1;}
 need(s.board===bd&&s.day===1&&s.night&&!s.log.length&&s.seats.every(x=>!x.role),'new game');await sleep(1450);
 const base=[];for(const[k,c]of Object.entries(BOARDS[bd].cnt))for(let i=0;i<c;i++)base.push(k);
 const deck=shuf(base),at=k=>deck.indexOf(k)+1,isW=n=>W.has(deck[n-1]),packR=BOARDS[bd].pack;
 const alive=new Set(Array.from({length:12},(_,i)=>i+1));let win=null,badge=0,d,X0=null,L0=null;const NG=new Set(),SH=new Map();let luckyUsed=0,hadBadge=0,lost=0,later=0;
 const elect=()=>!hadBadge&&!lost&&(d===1||(d===2&&later));
 const lk=x=>{const l=X.lucky||L0;return !!l&&l.sk==='gun'&&l.n===x;};
 const gunNow=x=>['hunter','wolfking'].includes(deck[x-1])||(deck[x-1]==='mechwolf'&&(X.learn||X0)&&(X.learn||X0).role==='hunter')||(lk(x)&&(!luckyUsed||SH.has(x)&&SH.get(x)[1]===d));
 const gName=x=>lk(x)?'幸运儿':R[deck[x-1]].n;
 const today=x=>how[x]&&[`第${d}天`,`第${d}夜`].includes(how[x][1]);
 const bad=x=>NG.has(x)||(how[x]&&['love','boom'].includes(how[x][0]));
 const open_=()=>Object.keys(how).map(Number).filter(x=>today(x)&&gunNow(x)&&!bad(x)&&!(SH.has(x)&&SH.get(x)[0]));
 const pend_=()=>open_().filter(x=>!SH.has(x));
 const X={lg:0,ld:0,lc:0,sw:[],awake:null,sealed:0,lastEx:0,polled:[]};const how={};let nights=0;
 const XY=bd==='xiyou',XM={wukong:{A:0,B:0,C:0,used:false,awake:0},erlang:{A:0,B:0,C:0,used:false,awake:0},lastZx:0,bound:0,gyUsed:false};
 const dist=(a,b)=>{const q=Math.abs(a-b);return Math.min(q,12-q);};
 const tang=XY?deck.map((k,i)=>k==='villager'?i+1:0).filter(Boolean).sort((a,b)=>dist(a,at('wukong'))-dist(b,at('wukong'))||b-a)[0]:0;
 const kindOf=x=>isW(x)?'A':['wukong','zixia','guanyin','heixiong'].includes(deck[x-1])?'B':'C';
 const TRN={wukong:{A:'火眼金睛',B:'定海神针',C:'镇魔圈'},erlang:{A:'天眼',B:'三尖两刃刀',C:'哮天犬'}};
 const bindOn=()=>XY&&XM.bound&&alive.has(XM.bound)&&alive.has(at('guanyin'))&&XM.bound!==at('guanyin');
 const sortA=()=>[...alive].sort((a,b)=>a-b);
 const chk=async w=>{
  s=await st();const a=s.seats.filter(x=>!x.dead).map(x=>x.n).join();need(a===sortA().join(),`${w} alive ${a} exp ${sortA()}`);
  const al=sortA(),nw=al.filter(isW).length,nv=al.filter(x=>['villager','hybrid'].includes(deck[x-1])).length,ng=al.length-nw-nv;
  const bar=await ev("[...document.querySelectorAll('.st b')].map(x=>+x.textContent).join()");need(bar===[nw,ng,nv,al.length].join(),w+' stats '+bar);
  need(await ev('localStorage.getItem(KEY)===JSON.stringify(S)'),w+' persist');
  const lw=false,lg=false;
  if(win==='wolf'&&!(!ng||!nv||lw)||win==='good'&&!(!nw||lg))win=null;
  if(!win)win=(!ng||!nv||lw)?'wolf':(!nw||lg)?'good':null;
  need((s.win?s.win.side:null)===win,`${w} win ${JSON.stringify(s.win)} exp ${win}`);
  if(win){const h=await ev("document.querySelector('#bg').classList.contains('show')&&(document.querySelector('#sheet h3')||{}).textContent");need(h===(win==='wolf'?'狼人屠边获胜':'好人阵营获胜'),w+' win popup '+h);const gx=pend_().length>0;need((await ev("document.querySelector('#sheet').textContent.includes('处理开枪')"))===gx,w+' gun prompt exp '+gx);G.prompt=(G.prompt||0)+(gx?1:0);}
  else need(!await ev("document.querySelector('#bg').classList.contains('show')"),w+' stray sheet');
  const t=await ev("document.body.innerText");need(!/undefined|NaN|null|\[object/.test(t),w+' bad text');
 };
 const kill=(x,c,day)=>{alive.delete(x);how[x]=[c,day];};
 const badgeCare=async()=>{if(badge&&!alive.has(badge)&&!win){need((await side()).includes('警长已出局'),'no badge reminder');await rb('警徽');
  if(rnd()<.2){await none();lost=1;badge=0;s=await st();need(s.badgeLost&&!s.seats.some(x=>x.badge),'tear');G.tear=(G.tear||0)+1;return;}
  const t=pick(sortA());await pk(t);badge=t;s=await st();need(s.seats.filter(x=>x.badge).map(x=>x.n).join()===''+t,'badge move');G.badge++;}};
 // 记票：随机投票，独立计票，平票进 PK；返回胜出座位或 0
 const ballot=async(kind,cs,vs0)=>{
  await rb(kind==='exile'?'投票明细':'警长投票');
  for(let rd=1;;rd++){
   const tied=cs;let vs=vs0(rd===1?null:tied);
   const got=await ev("[...document.querySelectorAll('.vc b')].map(e=>e.textContent).join()+'|'+[...document.querySelectorAll('.vv b')].map(e=>parseInt(e.textContent)).join()");
   need(got===cs.join()+'|'+vs.join(),`${kind} ballot ${got} exp ${cs}|${vs}`);
   const tops=shuf(cs).slice(0,Math.min(cs.length,rnd()<.4?2:3)),m={};
   if(rnd()<.93)for(const c of tops){const l=vs.filter(v=>!m[v]&&rnd()<.5&&!(bindOn()&&v===XM.bound));if(!l.length)continue;await tap(`[...document.querySelectorAll('.vc button')].find(b=>parseInt(b.querySelector('b').textContent)===${c})`);for(const v of l){m[v]=c;await tap(`[...document.querySelectorAll('.vv button')].find(b=>parseInt(b.querySelector('b').textContent)===${v})`);}}
   if(bindOn()&&vs.includes(XM.bound)){if(m[at('guanyin')])m[XM.bound]=m[at('guanyin')];else delete m[XM.bound];}
   const k={};for(const v in m)k[m[v]]=(k[m[v]]||0)+(kind==='exile'&&+v===badge?1.5:1)+(XY&&+v===tang?.5:0);
   const mx=Math.max(0,...Object.values(k)),top=Object.keys(k).filter(c=>k[c]===mx).map(Number).sort((a,b)=>a-b);
   if(rnd()<.2){await reload();await rb(kind==='exile'?'投票明细':'警长投票');}
   const bt=await ev("document.querySelector('#sheet .pkf .pri').textContent");
   const w=kind==='exile'?'放逐':'当选',fl=kind==='exile'?'无人放逐':'警徽流失';
   const exp=!top.length?'无人投票：'+fl:top.length===1?`${w} ${top[0]}号 ${NAMES[top[0]-1]}`:rd===1?`平票 PK：${top.join('、')}号`:'再次平票：'+fl;
   need(bt===exp,`ballot result "${bt}" exp "${exp}" ${JSON.stringify(m)}`);
   const z=390-(Date.now()-last);if(z>0)await sleep(z);await tap("document.querySelector('#sheet .pkf .pri')");G.ballot=(G.ballot||0)+1;
   if(top.length>1&&rd===1){cs=top;G.pk=(G.pk||0)+1;continue;}
   const lg=(await st()).log.map(l=>l.x);need(lg.some(x=>x.startsWith((kind==='exile'?'放逐投票':'警长投票')+(rd>1?'（PK）':'')+'：')),'ballot log');
   return top.length===1?top[0]:0;
  }};
 const election=async()=>{
  if(!elect())return;need((await side()).includes('警长竞选'),'no election');
  const u=rnd(),pres=Array.from({length:12},(_,i)=>i+1).filter(x=>alive.has(x)||(how[x]&&how[x][0]==='night'&&how[x][1]===`第${d}夜`));
  if(u<.12)return;
  if(u<.22){await rb('警长');await none();lost=1;s=await st();need(s.badgeLost,'lost');return;}
  if(u<.3){badge=pick(sortA());await seatT(badge);await btn('警徽');hadBadge=1;s=await st();need(s.seats[badge-1].badge,'badge');G.badge++;return;}
  let po=[...X.polled].sort((a,b)=>a-b);let outs=[];
  if(po.length>1&&rnd()<.4){outs=[pick(po)];await rb('退水');await pk(outs[0]);await btn('确定');G.out=(G.out||0)+1;}
  const run=po.filter(x=>pres.includes(x)&&!outs.includes(x));if(!run.length)return;
  let w;if(rnd()<.6)w=await ballot('sheriff',run,()=>pres.filter(x=>!po.includes(x)));else{w=pick(run);await rb('警长');await pk(w);}
  s=await st();if(w){hadBadge=1;badge=w;need(s.seats.filter(x=>x.badge).map(x=>x.n).join()===''+w&&s.log.at(-1).x.endsWith('当选警长'),'sheriff');G.sheriff=(G.sheriff||0)+1;}else{lost=1;need(s.badgeLost,'lost2');}
  need(!(await side()).includes('警长竞选。'),'election stays');
 };
 for(d=1;d<=9&&!win;d++){nights++;const n={},A=sortA(),up=k=>alive.has(at(k)),has=k=>deck.includes(k);
  const can=k=>up(k)&&!(n.fear&&n.fear===at(k))&&!(X.sealed===d&&!W.has(k));
  const mg=x=>n.swap&&n.swap.length?(x===n.swap[0]?n.swap[1]:x===n.swap[1]?n.swap[0]:x):x;
  const deaths=()=>{if(XY)return xyDeaths();const D=new Map(),add=(x,c)=>{if(x&&!D.has(x)&&deck[x-1]!=='demon')D.set(x,c);},safe=x=>n.dream===x||n.mguard===x;
   for(const x of [n.poison?mg(n.poison):0,n.lpoison])if(x&&!safe(x)&&deck[x-1]!=='witchhunter')add(x,'poison');
   if(n.mpoison&&n.dream!==n.mpoison)add(n.mpoison,'poison');
   const K=n.knife>0?mg(n.knife):0,both=K&&n.bknife===K;
   if(K&&!safe(K)){const g=n.guard===K;if(both||g===!!n.anti)add(K,'knife');}
   if(n.bknife&&!safe(n.bknife)&&(both||n.guard!==n.bknife))add(n.bknife,'knife');
   if(n.mknife&&!safe(n.mknife)&&n.guard!==n.mknife)add(n.mknife,'knife');
   if(n.hunt)add(isW(n.hunt)?n.hunt:at('witchhunter'),'hunt');if(n.trade&&isW(n.trade.n))add(at('merchant'),'trade');
   if(n.dream&&n.dream===X.ld)add(n.dream,'dream');if(has('dreamer')&&n.dream&&D.has(at('dreamer')))add(n.dream,'dream');if(has('beauty')&&n.charm&&D.has(at('beauty')))add(n.charm,'love');return D;};
  const xyDeaths=()=>{const D=new Map(),wk=at('wukong'),el=at('erlang'),gy=at('guanyin'),woke=k=>n[(k==='wukong'?'wk':'el')+'W']!==undefined?n[(k==='wukong'?'wk':'el')+'W']:!!XM[k].awake&&XM[k].awake<d,inv=woke('wukong');
   const add=x=>{if(x&&alive.has(x)&&!D.has(x)&&!(inv&&x===wk))D.set(x,'xy');};
   const ring=alive.has(wk)&&n.wkH&&n.wkH.C&&n.wkC?[n.wkC===1?12:n.wkC-1,n.wkC,n.wkC===12?1:n.wkC+1].filter(x=>x!==wk):[];
   if(n.knife>0&&!ring.includes(n.knife)&&!(n.gyS&&alive.has(gy)&&n.knife!==gy))add(n.knife);
   if(n.elB&&alive.has(el)){if(woke('erlang')){if(!ring.includes(n.elB))add(n.elB);}else if(n.elB===wk)add(wk);}
   if(n.wkB&&alive.has(wk)){if(woke('wukong')){if(n.wkB!==wk)D.set(n.wkB,'xy');}else if(n.wkB===el)D.set(el,'xy');}
   if(D.has(gy)&&XM.bound&&alive.has(XM.bound))D.set(XM.bound,'love');return D;};
  const noGun=x=>{const c=deaths().get(x);return c==='poison'?'被毒杀':c==='dream'?'死于梦中':c==='love'?'殉情':n.fear===x?'被恐惧':X.sealed===d&&!isW(x)?'被血月封印':'';};
  const T2=async(label,f,list,o={})=>{need(await en(label),'closed row '+label);await rb(label);if(!list.length||(o.none&&rnd()<(o.p||.25))){await none();n[f]=0;}else{n[f]=pick(list);await pk(n[f]);}
   need((await st()).n[f]===n[f],'record '+f);};
  const gunCheck=async k=>{const t=await res1();if(!up(k))need(t.includes('已出局'),'gun dead '+t);else{const w=noGun(at(k));need(w?t.includes(w)&&t.includes('不可开枪'):t.includes('可以开枪'),`gun ${k} "${t}" exp ${w}`);}};
  const list=steps(bd)(d);
  for(let i=0;i<list.length;i++){const key=list[i];
   const head=await ev("document.querySelector('.wh .lbl').textContent");need(head.includes(`${i+1}/${list.length}`),'step '+head);
   const ident=async k=>{if(d===1&&!BOARDS[bd].ids){await rb(R[k].n);await pk(at(k));}};
   if(key==='dawn')break;
   if(key==='ids'){const B0=BOARDS[bd],wn=B0.wn||'狼人';for(const k of B0.ids){need(!await ev("!!Q.btn('下一步')"),'ids next');if(B0.pack.includes(k)){await rb(wn+' ');for(let j=0;j<12;j++)if(B0.pack.includes(deck[j]))await pk(j+1);await btn('确定');}else{await rb(R[k].n);await pk(at(k));}}need(!!await ev("!!Q.btn('下一步')"),'ids done');if(XY)need((await ev('document.querySelector(".side").textContent')).includes(`唐僧是 ${tang}号`),'tang note');G.ids=(G.ids||0)+1;}
   if(key==='hybrid'){await ident('hybrid');await rb('榜样');await pk(pick(A.filter(x=>x!==at('hybrid'))));}
   if(key==='guard'){await ident('guard');if(can('guard'))await T2('守护','guard',A.filter(x=>x!==X.lg),{none:1});else need(!await en('守护'),'guard open');}
   if(key==='dreamer'){await ident('dreamer');if(can('dreamer'))await T2('摄梦','dream',A.filter(x=>x!==at('dreamer')));else need(!await en('摄梦'),'dream open');}
   if(key==='nightmare'){await ident('nightmare');if(up('nightmare'))await T2('恐惧','fear',A.filter(x=>x!==at('nightmare')),{none:1});}
   if(key==='magician'){await ident('magician');if(can('magician')){const l=shuf(A.filter(x=>!X.sw.includes(x)));await rb('交换');if(l.length<2||rnd()<.3){await none();n.swap=[];}else{await pk(l[0]);await pk(l[1]);await btn('确定');n.swap=l.slice(0,2);}}}
   if(key==='merchant'){await ident('merchant');if(can('merchant')&&!X.traded&&rnd()<.7){await rb('交易');const t=pick(A.filter(x=>x!==at('merchant')));await pk(t);const sk=pick(['check','poison','gun']);await btn(SK[sk]);n.trade={n:t,sk};}}
   if(key==='bros'){await ident('elder');await ident('younger');}
   if(key==='younger'){const aw=!alive.has(at('elder'))&&up('younger')&&X.awake===null;if(aw){await T2('狼弟刀','bknife',A);n.aw=1;}else need(!await ev("!!Q.rb('狼弟刀')"),'younger open');}
   if(key==='wolf'){
    if(d===1&&!BOARDS[bd].ids){await rb('狼人 ');for(let j=0;j<12;j++)if(packR.includes(deck[j])&&!await ev(`Q.pk(${j+1}).classList.contains('cur')`))await pk(j+1);await btn('确定');const m=BOARDS[bd].mark;if(m)await ident(m);}
    const pf=n.fear&&(packR.includes(deck[n.fear-1])||(d>1&&deck[n.fear-1]==='nightmare'));
    if(pf){need(!await en('刀口'),'fear pack open');n.knife=0;}else await T2('刀口','knife',A.filter(x=>deck[x-1]!=='beauty'),{none:1,p:.08});}
   if(key==='beauty'){await ident('beauty');if(up('beauty'))await T2('魅惑','charm',A.filter(x=>x!==at('beauty')&&x!==X.lc),{none:1});}
   if(key==='witch'){await ident('witch');const c=can('witch'),a=c&&!X.uA&&n.knife>0&&n.knife!==at('witch'),po=c&&!X.uP;
    need(!!(await ev("!!Q.btn('使用解药')"))===!!a,'anti button exp '+a);need(await en('毒药')===!!po,'poison exp '+po);
    const t=await ev("document.querySelector('.say').textContent");need(up('witch')||1,'');need(n.knife>0?t.includes(`【${n.knife}】号`):t.includes('无人被袭击'),'witch say '+t);
    if(n.knife===at('witch'))need((await side()).includes('女巫全程不可自救'),'self note');
    const r=rnd();if(a&&r<.45){await btn('使用解药');n.anti=1;need(!await en('毒药'),'both potions');}else if(po&&r<.75){await rb('毒药');n.poison=pick(A);await pk(n.poison);}}
   const sw=x=>isW(x)&&!(deck[x-1]==='younger'&&X.awake===null&&!n.aw);
   if(key==='seer'){await ident('seer');if(can('seer')){await T2('查验','check',A.filter(x=>x!==at('seer')));need((await res1()).includes('狼人')===sw(mg(n.check)),'seer result '+deck[mg(n.check)-1]);}else need(!await en('查验'),'seer open');}
   if(key==='mediumId')await ident('medium');
   const exact=x=>{const k=deck[x-1],l=X.learn||(n.learn?{role:deck[n.learn-1]}:null);return R[k==='mechwolf'&&l?l.role:k].n;};
   if(key==='medium'&&can('medium')){await T2('查验','check',A.filter(x=>x!==at('medium')));need((await res1()).endsWith('：'+exact(n.check)),'medium');}
   if(key==='hunter'){await ident('hunter');await gunCheck('hunter');}
   if(key==='wolfking')await gunCheck('wolfking');
   if(key==='mechgun'&&X.learn&&X.learn.role==='hunter')await gunCheck('mechwolf');
   if(key==='idiot')await ident('idiot');if(key==='knight')await ident('knight');
   if(key==='demon'){await ident('demon');if(up('demon')){await T2('查验','dcheck',A.filter(x=>x!==at('demon')));need((await res1()).includes('不是神职')===(R[deck[n.dcheck-1]].c!=='god'),'demon');}}
   if(key==='gargoyleId')await ident('gargoyle');
   if(key==='gargoyle'&&up('gargoyle')){await T2('查验','gcheck',A.filter(x=>x!==at('gargoyle')));need((await res1()).endsWith('：'+R[deck[n.gcheck-1]].n),'gargoyle');if(d>1)need((await side()).includes(A.some(x=>deck[x-1]==='wolf')?'未带刀':'带刀'),'garg knife');}
   if(key==='grave'){await ident('grave');if(d>1&&can('grave')){const t=await res1(),e=X.lastEx;need(!e?t.includes('无人'):t.includes('狼人')===isW(e),'grave '+t);}}
   if(key==='witchhunter'){await ident('witchhunter');if(d>1){if(can('witchhunter'))await T2('狩猎','hunt',A.filter(x=>x!==at('witchhunter')),{none:1,p:.4});else need(!await en('狩猎'),'hunt open');}else need(!await ev("!!Q.rb('狩猎')"),'hunt n1');}
   if(key==='mech'){await ident('mechwolf');if(d===1)await T2('学习','learn',A.filter(x=>x!==at('mechwolf')),{none:1,p:.1});
    else if(up('mechwolf')){if(!X.learn){if(rnd()<.5)await T2('学习','learn',A.filter(x=>x!==at('mechwolf')));}
     else{const k=X.learn.role;if(k==='witch'&&!X.mp&&rnd()<.6)await T2('毒药','mpoison',A);if(k==='guard'&&!X.mgd&&rnd()<.6)await T2('守护','mguard',A);if(k==='medium'){await T2('查验','mcheck',A.filter(x=>x!==at('mechwolf')));need((await res1()).endsWith('：'+exact(n.mcheck)),'mcheck');}if(k==='wolf'&&!A.some(x=>deck[x-1]==='wolf'))await T2('多刀','mknife',A,{none:1});}}}
   if(key==='lucky'){if(d===1&&n.trade)need((await side()).includes(isW(n.trade.n)?'不拍':'轻拍幸运儿'),'lucky note');if(d>1&&X.lucky&&!X.lucky.used&&alive.has(X.lucky.n)&&X.lucky.sk!=='gun'){X.lucky.sk==='check'?await T2('查验','lcheck',A.filter(x=>x!==X.lucky.n),{none:1}):await T2('毒药','lpoison',A,{none:1});}}
   if(XY){
    const woke=k=>!!XM[k].awake&&XM[k].awake<d,owns=(k,c)=>!!XM[k][c]&&XM[k][c]<d;
    const boost=k=>up('zixia')&&n.zx===at(k)&&!(k==='wukong'&&n.elC===at('zixia'));
    if(key==='zixia'){await ident('zixia');if(up('zixia'))await T2('加持','zx',A.filter(x=>x!==XM.lastZx));}
    for(const k of ['erlang','wukong'])if(key===k){
     await ident(k);const f=k==='wukong'?'wk':'el',me=at(k);
     if(up(k)){
      const mx=1+(boost(k)?1:0),ts=shuf(A.filter(x=>x!==me)).slice(0,mx).sort((a,b)=>a-b);await rb('寻宝');for(const x of ts)await pk(x);await btn('确定');n[f+'T']=ts;
      for(const x of ts)if(!(await st()).seats[x-1].role){need(!await ev("!!Q.btn('下一步')"),'unrecorded next');await seatT(x);await btn('录入身份');await tap(`[...document.querySelectorAll('.rp button')].find(b=>b.textContent.includes(${JSON.stringify(R[deck[x-1]].n)}))`);G.xyRec=(G.xyRec||0)+1;}
      const have={...XM[k]},exp=ts.map(x=>{const c=kindOf(x),got=!have[c];if(got)have[c]=d;return `${x}号：${got?'得 '+c:'已有 '+c}`;});
      const shown=(await ev("[...document.querySelectorAll('.side .res')].map(e=>e.textContent).filter(t=>/号：(得|已有)/.test(t)).join('|')")).split('|').filter(Boolean).map(t=>t.replace(/(得 [ABC]|已有 [ABC]).*/,'$1'));
      need(shown.join()===exp.join(),`hunt ${shown} exp ${exp}`);G.hunt=(G.hunt||0)+ts.length;
      const wk2=woke(k)||(!XM[k].awake&&!!(have.A&&have.B&&have.C));n[f+'H']=have;n[f+'W']=wk2;
      need(!!have.C===!!(await ev(`!!Q.row(${JSON.stringify(TRN[k].C)})`)),'C row '+k);
      if(!!have.C&&rnd()<.6){if(k==='wukong'){await rb(TRN[k].C);n.wkC=1+ri(12);await pk(n.wkC);}else await T2(TRN[k].C,'elC',A.filter(x=>x!==me&&x!==at('wukong')),{none:1});}
      need((!!have.B&&!XM[k].used)===!!(await ev(`!!Q.row(${JSON.stringify(TRN[k].B)})`)),'B row '+k);
      if(!!have.B&&!XM[k].used&&rnd()<.5)await T2(TRN[k].B,f+'B',A.filter(x=>x!==me));
      if(wk2){await T2('查验身份',f+'A',A.filter(x=>x!==me));need((await ev("[...document.querySelectorAll('.side .res')].map(e=>e.textContent).join('|')")).includes('身份：'+R[deck[n[f+'A']-1]].n),'awake check');}
     }
    }
    if(key==='guanyin'){await ident('guanyin');const gy=at('guanyin');if(up('guanyin')&&n.elC!==gy){const cn=!XM.gyUsed&&n.knife>0&&n.knife!==gy;need(!!(await ev("!!Q.btn('使用')"))===cn,'gy save btn');if(cn&&rnd()<.5){await btn('使用');n.gyS=1;}if(XM.bound)need(!await ev("!!(Q.row('收服')&&Q.row('收服').querySelector('button'))"),'bind once');else if(rnd()<.6)await T2('收服','gyB',A.filter(x=>x!==gy));}}
    if(key==='heixiong'){await ident('heixiong');const h=at('heixiong');if(up('heixiong')&&n.elC!==h){const near=dir=>{for(let i=1;i<12;i++){const x=((h-1+dir*i)%12+12)%12+1;if(alive.has(x)&&x!==h)return x;}return 0;};const pair=[...new Set([near(-1),near(1)].filter(Boolean))],wf=pair.some(isW),t2=pair.includes(tang),say=t2?!wf:wf;const t=await res1();need(t.includes('咆哮（有狼）')===say&&t.includes(pair.join('、')),'bear '+t+' exp '+say);if(t2)G.bearFlip=(G.bearFlip||0)+1;}}
   }
   if(key==='sheriff'){X.polled=shuf(A).slice(0,2+ri(3));await rb('上警');for(const x of X.polled)await pk(x);await btn('确定');need((await st()).police.join()===[...X.polled].sort((a,b)=>a-b).join(),'police');}
   if(d===1&&key==='wolf')await shot(`live-${round}-${bd}-n.png`);
   if(rnd()<.06)await reload();else if(rnd()<.05)await undoNext('下一步');else if(rnd()<.04)await hideCheck();
   await adv('下一步');
  }
  if(d===1)need((await st()).seats.map(x=>x.role).join()===deck.join(),'roles');
  const D=deaths(),dl=[...D.keys()].sort((a,b)=>a-b);const dt=await side();
  need(dl.length?dt.includes('昨夜死亡：'+dl.map(x=>`${x}号 ${NAMES[x-1]}·${R[deck[x-1]].n}`).join('、')):dt.includes('平安夜'),'dawn text '+dt+' exp '+dl);
  const gunK=x=>['hunter','wolfking'].includes(deck[x-1])||(deck[x-1]==='mechwolf'&&X.learn&&X.learn.role==='hunter')||(!!X.lucky&&X.lucky.sk==='gun'&&X.lucky.n===x&&!luckyUsed);
  for(const x of dl.filter(gunK))need(dt.includes(noGun(x)?noGun(x)+'，不可开枪':'夜间死亡，可以开枪'),'dawn gun');
  if(d===1)await shot(`live-${round}-${bd}-d.png`);
  for(const x of dl)if(gunK(x)&&noGun(x))NG.add(x);if(n.learn&&!X.learn){X0={role:deck[n.learn-1]};if(X0.role==='hunter'&&D.has(at('mechwolf')))NG.add(at('mechwolf'));}if(n.trade&&!isW(n.trade.n)){L0={n:n.trade.n,sk:n.trade.sk};if(L0.sk==='gun'&&D.has(L0.n))NG.add(L0.n);}
  await adv('确认');for(const x of dl)kill(x,'night',`第${d}夜`);
  await chk('dawn');if(rnd()<.2)await reload().then(async()=>{if(win)await ev('0');});
  if(XY){for(const k of ['erlang','wukong']){const f=k==='wukong'?'wk':'el';if(n[f+'B'])XM[k].used=true;for(const x of n[f+'T']||[]){const c=kindOf(x);if(!XM[k][c])XM[k][c]=d;}if(!XM[k].awake&&XM[k].A&&XM[k].B&&XM[k].C){XM[k].awake=d;G.awake=(G.awake||0)+1;}const sx=(await st()).xy[k];need(JSON.stringify([sx.A,sx.B,sx.C,sx.usedB,sx.awake])===JSON.stringify([XM[k].A,XM[k].B,XM[k].C,XM[k].used,XM[k].awake]),'treasure '+k);}if(n.gyS)XM.gyUsed=true;if(n.gyB&&!XM.bound)XM.bound=n.gyB;XM.lastZx=n.zx||0;if(d===1)need((await st()).xy.tang===tang,'tang');}
  X.lg=n.guard||0;X.ld=n.dream||0;X.lc=n.charm||0;if(n.swap)X.sw.push(...n.swap);if(n.anti)X.uA=1;if(n.poison)X.uP=1;if(n.aw)X.awake=d;
  if(n.trade){X.traded=1;if(!isW(n.trade.n))X.lucky={n:n.trade.n,sk:n.trade.sk,used:0};}if(X.lucky&&(n.lcheck||n.lpoison))X.lucky.used=1;if(n.learn&&!X.learn)X.learn={role:deck[n.learn-1]};if(n.mpoison)X.mp=1;if(n.mguard)X.mgd=1;
  if(win)break;
  {const t=await side();for(const x of dl)if(gunNow(x)){const w=`${x}号 ${NAMES[x-1]} ${gName(x)}`;need(t.includes(NG.has(x)?w:w+' 昨夜死亡，可以开枪')&&(!NG.has(x)||new RegExp(w+'[^。]*不可开枪').test(t)),'day gun '+t);G.dayGun=(G.dayGun||0)+1;if(NG.has(x))G.dayNoGun=(G.dayNoGun||0)+1;}}
  need(await ev("[...document.querySelectorAll('.wf .pri')][0].disabled"),'day ungated');
  const ask=async()=>{const q=await ev("!!Q.btn('不是竞选阶段')");need(q===!!elect(),'ask exp '+q);if(q){const k=pick(d===1?['不是竞选阶段','警徽流失','竞选延到明天']:['不是竞选阶段','警徽流失']);await btn(k);if(k==='竞选延到明天')later=1;if(k==='警徽流失'){lost=1;need((await st()).badgeLost,'lost');}}};
  const follow=x=>{if(XY&&x===at('guanyin')&&XM.bound&&alive.has(XM.bound)){kill(XM.bound,'love',`第${d}天`);return XM.bound;}if(deck[x-1]==='beauty'&&n.charm&&alive.has(n.charm)){kill(n.charm,'love',`第${d}天`);return n.charm;}return 0;};
  const fire=async x=>{ // 真实点击开枪：一半走白天面板，一半走目标座位
   const t=pick(sortA().filter(v=>v!==x));
   if(rnd()<.5){await tap(`[...document.querySelectorAll('.side .row')].filter(r=>r.querySelector('span').textContent==='开枪').find(r=>r.querySelector('b').textContent.startsWith('${x}号')).querySelector('button')`);
    if(!SH.has(x)&&how[x]&&rnd()<.15){await none();SH.set(x,[0,d]);need((await st()).seats[x-1].shot.t===0,'no shot');return;}
    await pk(t);}
   else{const all=[...open_(),...sortA().filter(v=>gunNow(v)&&lk(v)&&!luckyUsed)].filter((v,i,a)=>a.indexOf(v)===i&&v!==t);await seatT(t);await btn('被枪带走');if(all.length>1)await tap(`[...document.querySelectorAll('#sheet button')].find(b=>b.textContent.startsWith('${x}号'))`);}
   SH.set(x,[t,d]);if(lk(x))luckyUsed=1;kill(t,'shot',`第${d}天`);follow(t);G.shot++;await chk('shot');
   need((await st()).log.some(l=>l.x.startsWith(`${gName(x)} ${x}号 ${NAMES[x-1]} 开枪带走 ${t}号`)),'shot log');
   if(!win&&rnd()<.25){await tap(`[...document.querySelectorAll('.side .row')].filter(r=>r.querySelector('span').textContent==='开枪').find(r=>r.querySelector('b').textContent.startsWith('${x}号')).querySelector('button')`);SH.delete(x);if(lk(x))luckyUsed=0;alive.add(t);delete how[t];await chk('unshot');G.unshot=(G.unshot||0)+1;return;}
   if(!win)await badgeCare();};
  const shoots=async()=>{for(let k=0;k<4&&!win;k++){const l=[...pend_(),...sortA().filter(v=>gunNow(v)&&lk(v)&&!luckyUsed&&rnd()<.3)];if(!l.length||alive.size<2)break;if(rnd()<.12)break;await fire(pick(l));}
   if(!win&&!open_().length&&!sortA().some(v=>lk(v)&&gunNow(v)&&!luckyUsed)){await seatT(pick(sortA()));need(await ev("[...document.querySelectorAll('#sheet button')].find(b=>b.textContent.includes('被枪带走')).disabled"),'gun not locked');await ev('close_()');G.locked=(G.locked||0)+1;}};
  await election();
  await badgeCare();
  for(const x of dl)if(gunNow(x)&&NG.has(x))need(!await ev(`[...document.querySelectorAll('.side .row')].some(r=>r.querySelector('span').textContent==='开枪'&&r.querySelector('b').textContent.startsWith('${x}号'))`),'ng row');
  await shoots();
  if(win)break;
  let skip=0;
  if(has('knight')&&!X.kn&&up('knight')&&rnd()<.5){X.kn=1;await rb('骑士决斗');const t=pick(sortA().filter(x=>x!==at('knight')));await pk(t);if(isW(t)){kill(t,'duel',`第${d}天`);skip=1;}else kill(at('knight'),'duel',`第${d}天`);G.duel++;await chk('duel');if(win)break;await badgeCare();}
  if(!skip&&has('bloodmoon')&&up('bloodmoon')&&rnd()<.35){await rb('血月使徒');await ask();kill(at('bloodmoon'),'boom',`第${d}天`);X.sealed=d+1;skip=1;G.boom++;await chk('boom');if(win)break;await badgeCare();}
  {const bw=sortA().filter(x=>isW(x)&&!['beauty','gargoyle','mechwolf','erlang','tianbing'].includes(deck[x-1]));need(!!(await ev("!!Q.rb('狼人自爆')"))===(!skip&&bw.length>0),'boom row');
   if(!skip&&bw.length&&rnd()<.22){await rb('狼人自爆');const t=pick(bw);for(const z of ['beauty','gargoyle','mechwolf']){const bt=at(z);if(bt&&alive.has(bt))need(await ev(`Q.pk(${bt}).disabled`),z+' boom');}await pk(t);await ask();kill(t,'boom',`第${d}天`);if(deck[t-1]==='bloodmoon')X.sealed=d+1;skip=1;G.wboom=(G.wboom||0)+1;await chk('wboom');if(win)break;if(deck[t-1]==='wolfking')need((await side()).includes('自爆，不可开枪'),'wk boom gun');need((await side()).includes('自爆，直接入夜'),'boom text');await badgeCare();}}
  if(skip)X.lastEx=0;
  else{
   const vote=async e=>{if(rnd()<.45){e=await ballot('exile',sortA(),c=>{const a=sortA();if(!c)return a;const b=a.filter(x=>!c.includes(x));return b.length?b:a;});cur=e;if(!e){X.lastEx=0;return 0;}}else{await rb('放逐');if(!e){await none();X.lastEx=0;return 0;}await pk(e);}kill(e,'exile',`第${d}天`);X.lastEx=e;return follow(e);};
   let cur,e=rnd()<.08?0:pick(sortA());const prev=new Set(alive);cur=e;let al=await vote(e);e=cur;await chk('exile');
   if(!win&&e&&rnd()<.2){await btn('更正');for(const x of prev)if(!alive.has(x)){alive.add(x);delete how[x];}await chk('revoke');G.revoke++;e=pick(sortA());cur=e;al=await vote(e);e=cur;await chk('exile2');}
   if(win)break;
   const t=await side();if(e){need(t.includes(deck[e-1]==='idiot'?'翻牌，视为出局':'被放逐出局'),'exile text');if(deck[e-1]==='idiot'){need(await ev(`!!Q.seat(${e}).querySelector('.tag.flip')`),'flip tag');}if(gunNow(e)&&!SH.has(e)){need(t.includes('被放逐，可以开枪'),'exile gun note');}}
   await badgeCare();await shoots();if(win)break;
  }
  if(rnd()<.15)await reload();
  await adv('天黑了');s=await st();need(s.night&&s.day===d+1&&s.n.step===0,'next night');
 }
 // 终局记录
 await ev('close_()');await btn('记录');
 const ros=await ev("[...document.querySelectorAll('.ros>div')].map(e=>e.textContent.replace(/ 🎖/,'')).join('|')");
 const exp=deck.map((k,i)=>`${i+1}${R[k].n}${NAMES[i]}${how[i+1]?how[i+1][1]+CA[how[i+1][0]]:''}`).join('|');need(ros.replace(/ /g,'')===exp.replace(/ /g,''),'roster '+ros+' exp '+exp);
 const logOk=await ev("(()=>{const o=S.log.map(l=>{const m=l.t.match(/第(\\d+)(夜|天)/);return m[1]*2+(m[2]==='天'?1:0)});return o.every((x,i)=>!i||o[i-1]<=x)&&S.log[0].t==='第1夜'})()");need(logOk,'log order');
 await btn('复制');await sleep(250);const clip=await ev('navigator.clipboard.readText()');
 need(deck.every((k,i)=>clip.includes(`${i+1}号 ${NAMES[i]} ${R[k].n}`))&&clip.includes(BOARDS[bd].name)&&(!win||clip.includes('结果：'+(win==='wolf'?'狼人屠边获胜':'好人阵营获胜')))&&clip.includes('过程：'),'clipboard');
 await btn('记录').catch(()=>{});await ev('close_()');await sleep(1500);
 return {nights,win:win||'未分胜负'};
}
let failed=0;
for(const bd of Object.keys(BOARDS)){if(only&&!only.includes(bd))continue;const c0=clicks,t0=Date.now();
 out.boards[bd]='';
 for(let g=0;g<GAMES;g++){const s1=seed;try{const r=await game(bd);out.boards[bd]+=`ok ${r.nights}夜${r.win} `;}
 catch(e){failed++;out.boards[bd]+=`FAIL ${e.message.slice(0,500)} (seed ${s1}) `;try{out.boards[bd]+=await ev("S.day+(S.night?'夜':'天')+' '+(S.night?stepsOf()[S.n.step]:'')")}catch{};await shot(`fail-${round}-${bd}.png`);await B_.reload();await nav();}}
 out.boards[bd]+=`${clicks-c0}次操作 ${Math.round((Date.now()-t0)/1000)}s`;console.log(bd,out.boards[bd]);
}
out.clicks=clicks;out.did=G;out.errs=errs;console.log(JSON.stringify(out));
await B_.close();if(srv)await srv.stop();process.exit(failed||errs.length?1:0);
