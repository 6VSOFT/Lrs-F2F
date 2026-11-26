(() => {
ADV=0;
const _r=render;window.render=render=function(){autoVillagers();enforce();_r();};
const T=[];const ok=(n,c)=>{if(!c)T.push('FAIL '+n);else T.pass=(T.pass||0)+1;};
const Any=(t,r=document)=>[...r.querySelectorAll('button')].find(b=>b.textContent.includes(t));
const B=(t,r=document)=>{const b=Any(t,r);return b&&!b.disabled?b:null};
const pkb=n=>[...document.querySelectorAll('.pk button')].find(x=>x.querySelector('b').textContent==String(n));
const tap=n=>{const b=pkb(n);if(b.disabled)throw Error('disabled '+n+' '+window._pkTitle);b.click();};
const rowOf=l=>{const rs=[...document.querySelectorAll('.side .row')];return rs.find(x=>x.querySelector('span').textContent===l)||rs.find(x=>x.querySelector('span').textContent.startsWith(l));};
const rb=l=>{const r=rowOf(l);return r&&r.querySelector('button');};
const none=()=>document.querySelector('.pkf .btn').click();
const ri=n=>Math.floor(Math.random()*n),pick=a=>a[ri(a.length)];
const next=()=>{const b=B('下一步');if(!b)throw Error('stuck at '+stepsOf()[S.n.step]+' d'+S.day);b.click();};
const FLOW={hybrid:['天黑 混血儿 狼人 女巫 预言家 猎人 白痴 天亮结算','天黑 狼人 女巫 预言家 猎人 天亮结算'],std:['天黑 狼人 女巫 预言家 猎人 白痴 天亮结算','天黑 狼人 女巫 预言家 猎人 天亮结算'],
wkguard:['天黑 守卫 狼人 女巫 预言家 猎人 天亮结算','天黑 守卫 狼人 女巫 预言家 猎人 天亮结算'],demon:['天黑 守卫 狼人 女巫 预言家 猎人 恶魔 天亮结算','天黑 守卫 狼人 女巫 预言家 猎人 恶魔 天亮结算'],
beauty:['天黑 守卫 狼人 狼美人 女巫 预言家 骑士 天亮结算','天黑 守卫 狼人 狼美人 女巫 预言家 天亮结算'],magician:['天黑 魔术师 狼人 女巫 预言家 猎人 狼王 天亮结算','天黑 魔术师 狼人 女巫 预言家 猎人 狼王 天亮结算'],
bros:['天黑 黑市商人 守卫 狼兄狼弟 狼人 女巫 预言家 幸运儿 天亮结算','天黑 黑市商人 守卫 狼弟 狼人 女巫 预言家 幸运儿 天亮结算'],wkdream:['天黑 摄梦人 狼人 女巫 预言家 猎人 天亮结算','天黑 摄梦人 狼人 女巫 预言家 猎人 天亮结算'],
gargoyle:['天黑 狼人 女巫 石像鬼 预言家 猎人 守墓人 石像鬼查验 天亮结算','天黑 石像鬼查验 狼人 女巫 预言家 猎人 守墓人 天亮结算'],mech:['天黑 第一轮：确认身份 守卫 机械狼 狼人 女巫 通灵师查验 猎人 天亮结算','天黑 守卫 机械狼 狼人 女巫 通灵师查验 猎人 机械狼状态 天亮结算'],
nightmare:['天黑 噩梦之影 摄梦人 狼人 女巫 预言家 猎人 天亮结算','天黑 噩梦之影 摄梦人 狼人 女巫 预言家 猎人 天亮结算'],blood:['天黑 狼人 女巫 预言家 猎魔人 白痴 天亮结算','天黑 狼人 女巫 预言家 猎魔人 天亮结算']};
const W=['wolf','wolfking','demon','beauty','elder','younger','gargoyle','mechwolf','nightmare','bloodmoon'];
const out={};
for(const bd of Object.keys(FLOW)){
 const bad=[];let nights=0;
 const base=[];for(const [k,c] of Object.entries(BOARDS[bd].cnt))for(let i=0;i<c;i++)base.push(k);
 if(base.length!==12){bad.push('count '+base.length);}
 for(let g=0;g<60&&bad.length<3;g++){try{
  startGame(bd);undo=[];const deck=[...base].sort(()=>Math.random()-.5),at=k=>deck.indexOf(k)+1,isW=n=>W.includes(deck[n-1]);
  const alive=new Set([1,2,3,4,5,6,7,8,9,10,11,12]);const X={uA:0,uP:0,lg:0,ld:0,lc:0,sw:[],awake:null,lucky:null,traded:0,learn:null,mp:0,mgd:0,sealed:0,lastEx:0,elderDead:0};
  const packR=BOARDS[bd].pack;
  for(let d=1;d<=5&&alive.size>2;d++){nights++;const n={};const A=[...alive];const up=k=>alive.has(at(k));
   const fearOn=k=>n.fear&&n.fear===at(k);const can=k=>up(k)&&!fearOn(k)&&!(X.sealed===d&&!W.includes(k));
   const seen=[];
   for(const key of stepsOf()){
    seen.push(document.querySelector('.wh .lbl').textContent.split('·').pop().trim());
    const id=k=>{if(d===1&&!BOARDS[bd].ids){rb(R[k].n).click();tap(at(k));}};
    if(key==='ids'){const B0=BOARDS[bd];for(const k of B0.ids){if(B('下一步'))throw Error('ids next');if(B0.pack.includes(k)){rb((B0.wn||'狼人')+' ').click();deck.forEach((x,i)=>{if(B0.pack.includes(x))tap(i+1);});B('确定').click();}else{rb(R[k].n).click();tap(at(k));}}if(!B('下一步'))throw Error('ids done');}
    const T2=(label,field,list,o={})=>{const b=rb(label);if(!b||b.disabled)throw Error('no row '+label+' '+key);b.click();if(o.none&&Math.random()<(o.p||.3)){none();n[field]=0;}else{n[field]=pick(list);tap(n[field]);}};
    if(key==='dawn')break;
    if(key==='hybrid'){id('hybrid');rb('榜样').click();tap(pick(A.filter(x=>x!==at('hybrid'))));}
    if(key==='guard'){id('guard');if(can('guard'))T2('守护','guard',A.filter(x=>x!==X.lg),{none:1});else if(!rb('守护').disabled)throw Error('guard open');}
    if(key==='dreamer'){id('dreamer');if(can('dreamer'))T2('摄梦','dream',A.filter(x=>x!==at('dreamer')));else if(!rb('摄梦').disabled)throw Error('dream open');}
    if(key==='nightmare'){id('nightmare');if(up('nightmare'))T2('恐惧','fear',A.filter(x=>x!==at('nightmare')),{none:1});}
    if(key==='magician'){id('magician');if(can('magician')){const l=A.filter(x=>!X.sw.includes(x));rb('交换').click();if(l.length<2||Math.random()<.4){none();n.swap=[];}else{l.sort(()=>Math.random()-.5);tap(l[0]);tap(l[1]);B('确定').click();n.swap=l.slice(0,2);}}}
    if(key==='merchant'){id('merchant');if(can('merchant')&&!X.traded&&Math.random()<.6){rb('交易').click();const t=pick(A.filter(x=>x!==at('merchant')));tap(t);const sk=pick(['check','poison','gun']);B(SKILL[sk],document.querySelector('#sheet')).click();n.trade={n:t,sk};}}
    if(key==='bros'){id('elder');id('younger');}
    if(key==='younger'){const aw=!alive.has(at('elder'))&&up('younger')&&X.awake===null;if(aw){T2('狼弟刀','bknife',A);n.aw=1;}else if(rb('狼弟刀'))throw Error('younger open');}
    if(key==='wolf'){
     if(d===1&&!BOARDS[bd].ids){rb('狼人 ').click();deck.forEach((k,i)=>{if(packR.includes(k)){const b=pkb(i+1);if(!b.classList.contains('cur'))tap(i+1);}});B('确定').click();const m=BOARDS[bd].mark;if(m)id(m);}
     const pf=n.fear&&(packR.includes(deck[n.fear-1])||(d>1&&deck[n.fear-1]==='nightmare'));
     if(pf){if(!rb('刀口').disabled)throw Error('fear pack open');n.knife=0;}else T2('刀口','knife',A.filter(x=>deck[x-1]!=='beauty'),{none:1,p:.1});}
    if(key==='beauty'){id('beauty');if(up('beauty'))T2('魅惑','charm',A.filter(x=>x!==at('beauty')&&x!==X.lc),{none:1});}
    if(key==='witch'){id('witch');const c=can('witch'),a=c&&!X.uA&&n.knife>0&&n.knife!==at('witch'),p=c&&!X.uP;
     if(!!B('使用解药')!==!!a)throw Error('anti '+!!a);if(!rb('毒药').disabled!==!!p)throw Error('poison');
     const r=Math.random();if(a&&r<.4){B('使用解药').click();n.anti=1;}else if(p&&r<.75){rb('毒药').click();n.poison=pick(A);tap(n.poison);}}
    const mg=x=>n.swap&&n.swap.length?(x===n.swap[0]?n.swap[1]:x===n.swap[1]?n.swap[0]:x):x;n.mg=mg;
    const sw=x=>isW(x)&&!(deck[x-1]==='younger'&&X.awake===null&&!n.aw);
    if(key==='seer'){id('seer');if(can('seer')){T2('查验','check',A.filter(x=>x!==at('seer')));const t=document.querySelector('.side .res').textContent;if(t.includes('狼人')!==sw(mg(n.check)))throw Error('seer '+deck[mg(n.check)-1]);}else if(!rb('查验').disabled)throw Error('seer open');}
    if(key==='mediumId')id('medium');
    const exact=x=>{const k=deck[x-1];const l=X.learn||(n.learn?{role:deck[n.learn-1]}:null);return R[k==='mechwolf'&&l?l.role:k].n;};
    if(key==='medium'&&can('medium')){T2('查验','check',A.filter(x=>x!==at('medium')));if(!document.querySelector('.side .res').textContent.endsWith('：'+exact(n.check)))throw Error('medium '+document.querySelector('.side .res').textContent+' vs '+exact(n.check));}
    if(key==='hunter'){id('hunter');}
    if(key==='idiot')id('idiot');if(key==='knight')id('knight');
    if(key==='demon'){id('demon');if(up('demon')){T2('查验','dcheck',A.filter(x=>x!==at('demon')));const god=R[deck[n.dcheck-1]].c==='god';if(document.querySelector('.side .res').textContent.includes('不是神职')===god)throw Error('demon');}}
    if(key==='gargoyleId')id('gargoyle');
    if(key==='gargoyle'&&up('gargoyle')){T2('查验','gcheck',A.filter(x=>x!==at('gargoyle')));if(!document.querySelector('.side .res').textContent.endsWith('：'+R[deck[n.gcheck-1]].n))throw Error('garg');}
    if(key==='grave'){id('grave');if(d>1&&can('grave')){const t=document.querySelector('.side .res').textContent;const e=X.lastEx;if(!e?!t.includes('无人'):t.includes('狼人')!==isW(e))throw Error('grave '+t);}}
    if(key==='witchhunter'){id('witchhunter');if(d>1){if(can('witchhunter'))T2('狩猎','hunt',A.filter(x=>x!==at('witchhunter')),{none:1,p:.5});else if(!rb('狩猎').disabled)throw Error('hunt open');}else if(rb('狩猎'))throw Error('hunt n1');}
    if(key==='mech'){id('mechwolf');if(d===1){T2('学习','learn',A.filter(x=>x!==at('mechwolf')),{none:1,p:.1});}
     else if(up('mechwolf')){if(!X.learn){if(Math.random()<.5&&rb('学习')){T2('学习','learn',A.filter(x=>x!==at('mechwolf')));}}
      else{const k=X.learn.role;if(k==='witch'&&!X.mp&&Math.random()<.5)T2('毒药','mpoison',A);if(k==='guard'&&!X.mgd&&Math.random()<.5)T2('守护','mguard',A);if(k==='medium')T2('查验','mcheck',A.filter(x=>x!==at('mechwolf')));
       if(k==='wolf'&&!A.some(x=>deck[x-1]==='wolf'))T2('多刀','mknife',A,{none:1});}}}
    if(key==='lucky'&&d>1&&X.lucky&&!X.lucky.used&&alive.has(X.lucky.n)&&X.lucky.sk!=='gun'){X.lucky.sk==='check'?T2('查验','lcheck',A.filter(x=>x!==X.lucky.n),{none:1}):T2('毒药','lpoison',A,{none:1});}
    next();
   }
   if(seen.join(' ')!==FLOW[bd][d===1?0:1])throw Error('flow '+seen.join(' '));
   if(d===1&&S.seats.map(s=>s.role).join()!==deck.join())throw Error('roles '+S.seats.map(s=>s.role).join());
   // independent death oracle
   const mg=n.mg,D=new Set(),P=new Set();const safe=x=>n.dream===x||n.mguard===x;
   const kills=[];if(n.knife>0)kills.push(mg(n.knife));
   const pois=[n.poison?mg(n.poison):0,n.lpoison].filter(Boolean);
   for(const x of pois)if(!safe(x)&&deck[x-1]!=='witchhunter'){D.add(x);P.add(x);}
   if(n.mpoison&&n.dream!==n.mpoison){D.add(n.mpoison);P.add(n.mpoison);}
   const both=n.bknife&&kills[0]===n.bknife;
   for(const x of kills)if(!safe(x)){const gd=n.guard===x;if(both||(gd&&n.anti)||(!gd&&!n.anti))D.add(x);}
   if(n.bknife&&!safe(n.bknife)&&(both||n.guard!==n.bknife))D.add(n.bknife);
   if(n.mknife>0&&!safe(n.mknife)&&n.guard!==n.mknife)D.add(n.mknife);
   if(n.hunt)D.add(isW(n.hunt)?n.hunt:at('witchhunter'));
   if(n.trade&&isW(n.trade.n))D.add(at('merchant'));
   if(n.dream&&n.dream===X.ld)D.add(n.dream);
   if(n.dream&&D.has(at('dreamer')))D.add(n.dream);
   if(n.charm&&D.has(at('beauty')))D.add(n.charm);
   D.delete(deck.indexOf('demon')+1);
   B('确认').click();
   D.forEach(x=>alive.delete(x));
   const chk=w=>{const a=S.seats.filter(s=>!s.dead).map(s=>s.n).join(),e=[...alive].sort((x,y)=>x-y).join();if(a!==e)throw Error(w+' alive '+a+' exp '+e+' '+JSON.stringify(n)+' '+deck.join());const b=[...document.querySelectorAll('.st b')].map(x=>+x.textContent);if(b[0]!==[...alive].filter(isW).length||b[b.length-1]!==alive.size)throw Error('stats');if(localStorage.getItem(KEY)!==JSON.stringify(S))throw Error('persist');const cc=f=>[...alive].filter(f).length,nw=cc(isW),nv=cc(x=>['villager','hybrid'].includes(deck[x-1])),ng=alive.size-nw-nv;const wf=!ng||!nv,gd=!nw;if(X.win==='wolf'&&!wf||X.win==='good'&&!gd)X.win=null;if(!X.win)X.win=wf?'wolf':gd?'good':null;if((S.win?S.win.side:null)!==X.win)throw Error(w+' win '+JSON.stringify(S.win)+' exp '+X.win);if(X.win){out._w=out._w||{};out._w[X.win]=(out._w[X.win]||0)+1;}};
   chk('dawn');
   X.lg=n.guard||0;X.ld=n.dream||0;X.lc=n.charm||0;if(n.swap)X.sw.push(...n.swap);if(n.anti)X.uA=1;if(n.poison)X.uP=1;if(n.aw)X.awake=d;
   if(n.trade){X.traded=1;if(!isW(n.trade.n))X.lucky={n:n.trade.n,sk:n.trade.sk,used:0};}
   if(X.lucky&&(n.lcheck||n.lpoison))X.lucky.used=1;if(n.learn&&!X.learn)X.learn={role:deck[n.learn-1]};if(n.mpoison)X.mp=1;if(n.mguard)X.mgd=1;
   if(Any('天黑了')&&!Any('天黑了').disabled)throw Error('day ungated');
   let skip=0;
   if(alive.size&&rb('骑士决斗')&&Math.random()<.4){rb('骑士决斗').click();const t=pick([...alive].filter(x=>x!==at('knight')));tap(t);if(isW(t)){alive.delete(t);skip=1;X.lastEx=0;}else alive.delete(at('knight'));chk('duel');}
   if(!skip&&rb('血月使徒')&&Math.random()<.3){rb('血月使徒').click();if(B('不是竞选阶段'))B('不是竞选阶段').click();alive.delete(at('bloodmoon'));X.sealed=d+1;skip=1;X.lastEx=0;chk('boom');}
   const bw=[...alive].filter(x=>isW(x)&&!['beauty','gargoyle','mechwolf'].includes(deck[x-1]));
   if(!skip&&!!rb('狼人自爆')!==!!bw.length)throw Error('boom row');
   if(!skip&&bw.length&&Math.random()<.12){rb('狼人自爆').click();const t=pick(bw);for(const z of ['beauty','gargoyle','mechwolf']){const bt=at(z);if(bt&&alive.has(bt)&&!pkb(bt).disabled)throw Error(z+' boom');}tap(t);const a=B('不是竞选阶段');if(!!a!==(d===1))throw Error('boom ask d'+d);if(a)a.click();alive.delete(t);if(deck[t-1]==='bloodmoon')X.sealed=d+1;skip=1;X.lastEx=0;chk('wboom');}
   if(!skip&&alive.size){rb('放逐').click();if(Math.random()<.1){none();X.lastEx=0;}else{const e=pick([...alive]);tap(e);alive.delete(e);X.lastEx=e;if(deck[e-1]==='beauty'&&n.charm)alive.delete(n.charm);}
    chk('exile');if(X.lastEx&&Math.random()<.2){const also=deck[X.lastEx-1]==='beauty'&&n.charm&&!D.has(n.charm)&&S.d.also.length?n.charm:0;B('更正').click();alive.add(X.lastEx);if(also)alive.add(also);chk('revoke');rb('放逐').click();none();X.lastEx=0;}}
   else if(!skip){rb('放逐').click();none();X.lastEx=0;}
   B('天黑了').click();
  }}catch(e){bad.push('g'+g+' '+e.message);}
 }
 out[bd]=nights+' nights'+(bad.length?' BAD '+bad.join(' | '):' ok');
}
// scenarios
const setup=(bd,deck)=>{startGame(bd);deck.forEach((k,i)=>S.seats[i].role=k);render();};
const end=o=>{Object.assign(S.n,o);S.n.step=stepsOf().length-1;render();};
try{
const WK=['seer','witch','hunter','guard','wolfking','wolf','wolf','wolf','villager','villager','villager','villager'];
setup('wkguard',WK);end({knife:9,guard:9,anti:true});ok('同守同救',resolve().D.join()==='9'&&document.querySelector('.side').textContent.includes('同守同救'));
end({knife:9,guard:9,anti:false});ok('守住',resolve().D.length===0);end({knife:5,guard:0,poison:5});ok('狼王毒不可开枪',document.querySelector('.side').textContent.includes('被毒杀，不可开枪'));
end({knife:3,guard:0,poison:null});ok('猎人被刀可开枪',document.querySelector('.side').textContent.includes('可以开枪'));
setup('magician',['seer','witch','hunter','magician','wolfking','wolf','wolf','wolf','villager','villager','villager','villager']);end({swap:[1,6],knife:1});ok('换刀',resolve().D.join()==='6');end({swap:[1,6],knife:1,anti:true});ok('换后解药',resolve().D.length===0);end({swap:[1,6],knife:0,anti:false,poison:6});ok('换毒',resolve().D.join()==='1');
setup('wkdream',['seer','witch','hunter','dreamer','wolfking','wolf','wolf','wolf','villager','villager','villager','villager']);end({dream:9,knife:9,poison:9});ok('梦游免疫',resolve().D.length===0);end({dream:9,knife:4,poison:null});ok('摄梦人带走',resolve().D.join()==='4,9');S.lastDream=3;end({dream:3,knife:0});ok('连续摄梦猎人不可开枪',resolve().D.join()==='3'&&document.querySelector('.side').textContent.includes('死于梦中'));
setup('nightmare',['seer','witch','hunter','dreamer','nightmare','wolf','wolf','wolf','villager','villager','villager','villager']);end({fear:6,knife:9});ok('恐惧狼不能刀',S.n.knife===0);end({fear:3,knife:3});ok('被恐惧猎人',document.querySelector('.side').textContent.includes('被恐惧，不可开枪'));end({fear:1,knife:9,check:6});ok('恐惧预言家清查验',S.n.check===null);
const BR=['seer','witch','merchant','guard','elder','younger','wolf','wolf','villager','villager','villager','villager'];
setup('bros',BR);end({trade:{n:6,skill:'poison'},knife:0});ok('交易狼弟商人死',resolve().D.join()==='3');
setup('bros',BR);S.n.step=6;S.n.check=6;render();ok('狼弟验好人',document.querySelector('.side .res').textContent.includes('好人'));S.day=2;S.seats[4].dead='exile';S.n=freshNight();S.n.step=3;render();ok('狼弟觉醒必刀',document.querySelector('.wf .pri').disabled);S.n.bknife=9;S.n.knife=9;S.n.guard=9;S.n.step=6;S.n.check=6;render();ok('觉醒验狼',document.querySelector('.side .res').textContent.includes('狼人'));ok('双刀守不住',resolve().D.join()==='9');
setup('beauty',['seer','witch','knight','guard','beauty','wolf','wolf','wolf','villager','villager','villager','villager']);end({charm:9,knife:0,poison:5});ok('狼美人夜死殉情',resolve().D.join()==='5,9');end({charm:9,knife:0,poison:null});confirmDawn();pickDuel();tap(5);ok('决斗不殉情',S.seats[4].dead==='duel'&&!S.seats[8].dead&&B('天黑了'));doUndo();doExile(5);ok('放逐殉情',S.seats[8].dead==='love');revokeExile();ok('更正殉情',!S.seats[8].dead&&!S.seats[4].dead);doDie(4,'shot');ok('枪杀殉情',S.seats[8].dead==='love');
setup('beauty',['seer','witch','knight','guard','beauty','wolf','wolf','wolf','villager','villager','villager','villager']);S.n.knife=0;confirmDawn();pickDuel();tap(9);ok('决斗好人骑士死',S.seats[2].dead==='duel'&&!S.d&&!rb('骑士决斗'));
setup('blood',['seer','witch','witchhunter','idiot','bloodmoon','wolf','wolf','wolf','villager','villager','villager','villager']);end({knife:0,poison:3});ok('猎魔人免毒',resolve().D.length===0);end({poison:null,knife:0});confirmDawn();boom(one('bloodmoon').n,'');B('天黑了').click();S.n.step=3;render();ok('封印预言家',rb('查验').disabled);end({hunt:null,knife:9});ok('封印夜狼可刀',resolve().D.join()==='9');
S.day=3;S.sealed=0;end({hunt:9,knife:0});ok('狩猎好人',resolve().D.join()==='3');end({hunt:6});ok('狩猎狼',resolve().D.join()==='6');
setup('mech',['medium','witch','hunter','guard','mechwolf','wolf','wolf','wolf','villager','villager','villager','villager']);S.mech={n:2,role:'witch',day:1};S.day=2;end({mpoison:9,guard:9});ok('机械毒穿盾',resolve().D.join()==='9');S.n.step=5;S.n.check=5;render();ok('通灵验机械狼=女巫',document.querySelector('.side .res').textContent.includes('女巫'));
setup('demon',['seer','witch','hunter','guard','demon','wolf','wolf','wolf','villager','villager','villager','villager']);end({knife:5});ok('恶魔自刀不死',resolve().D.length===0&&document.querySelector('.side').textContent.includes('恶魔夜间免死'));end({knife:9,poison:5});ok('恶魔毒不死',resolve().D.join()==='9');end({knife:5,poison:null});confirmDawn();ok('恶魔天亮存活',!S.seats[4].dead&&S.log.some(l=>l.x==='恶魔夜间免死'));doExile(5);ok('恶魔可放逐',S.seats[4].dead==='exile');
setup('hybrid',['hybrid','wolf','wolf','wolf','wolf','seer','hunter','idiot','witch','villager','villager','villager']);ok('混血计平民',[...document.querySelectorAll('.st')].map(e=>e.textContent).join()==='4狼人,4神职,4平民,12存活');S.n.knife=0;S.model=2;end({});confirmDawn();doExile(1);ok('混血出局减平民',document.querySelectorAll('.st b')[2].textContent==='3');
setup('std',['seer','witch','hunter','idiot','wolf','wolf','wolf','wolf','villager','villager','villager','villager']);S.names[4]='老王';S.n.knife=9;end({});confirmDawn();doExile(5);openLog();{const q=[...document.querySelectorAll('.ros>div')].map(e=>e.textContent);ok('roster 12',q.length===12);ok('roster text',q[4]==='5狼人老王第1天放逐出局'&&q[8]==='9平民第1夜夜间阵亡'&&q[0]==='1预言家');S.hide=true;openLog();ok('roster hide',!/狼人|预言家/.test(document.querySelector('.ros').textContent)&&!document.querySelector('.ros img'));S.hide=false;S.names=Array(12).fill('');close_();}
const STD=['seer','witch','hunter','idiot','wolf','wolf','wolf','wolf','villager','villager','villager','villager'];
const kill=(bd,deck,l)=>{setup(bd,deck);S.n.knife=0;end({});confirmDawn();close_();l.forEach(x=>{seat(x).dead='night';seat(x).at='第0夜';});render();};
kill('std',STD,[1,2,3]);ok('未结束',!S.win);doExile(4);ok('白痴翻牌后神职全出局=狼胜',S.win.side==='wolf'&&S.win.why==='神职全体出局'&&document.querySelector('#sheet h3').textContent==='狼人屠边获胜'&&document.querySelector('#bg').classList.contains('show')&&document.querySelector('.side .winbar'));ok('胜利进记录',S.log.at(-1).x==='🏆 狼人屠边获胜（神职全体出局）');ok('无枪不提醒',!document.querySelector('#sheet').textContent.includes('处理开枪'));
close_();revokeExile();ok('更正取消胜负',!S.win&&!document.querySelector('.winbar')&&S.log.at(-1).x==='更正：胜负结果取消');
kill('std',STD,[9,10,11]);doExile(12);ok('平民全出局',S.win.why==='平民全体出局');doUndo();ok('撤销胜负',!S.win);
kill('std',STD,[5,6,7]);doExile(8);ok('好人胜',S.win.side==='good'&&document.querySelector('#sheet h3').textContent==='好人阵营获胜');
kill('hybrid',['hybrid','wolf','wolf','wolf','wolf','seer','hunter','idiot','witch','villager','villager','villager'],[10,11]);doExile(12);ok('混血儿在场未屠民',!S.win);doDie(0,'shot');ok('混血儿出局屠民',S.win.side==='wolf');
kill('std',STD,[9,10,11,5,6,7]);doExile(0);nextNight();end({knife:12,poison:8});confirmDawn();ok('同时达成狼刀在先',S.win.side==='wolf');
kill('std',STD,[1,2,4]);doExile(3);ok('猎人出局提醒开枪',document.querySelector('#sheet').textContent.includes('处理开枪'));close_();
startGame('std');S.seats.forEach((s,i)=>{if(i<4)s.dead='night';});doBadge(0);ok('身份未录全不判',!S.win);close_();
startGame('std');STD.forEach((k,i)=>S.seats[i].role=k);S.day=3;S.n.knife=2;S.n.step=2;render();ok('第3夜不可自救',!B('使用解药')&&document.querySelector('.side').textContent.includes('女巫全程不可自救'));S.n.knife=9;render();ok('可救他人',!!B('使用解药'));B('使用解药').click();S.n.knife=2;render();ok('改刀女巫清解药',!S.n.anti);openMenu();ok('菜单无自救开关',!document.querySelector('#sheet').textContent.includes('自救'));close_();
setup('std',STD);S.n.knife=9;S.n.check=10;S.n.poison=11;save();doDie(8,'night');ok('出局刀口作废',S.n.knife===0);doDie(9,'night');doDie(10,'shot');ok('出局目标作废',S.n.check===null&&S.n.poison===null&&localStorage.getItem(KEY)===JSON.stringify(S));close_();
startGame('std');STD.forEach((k,i)=>{if(i!==3)S.seats[i].role=k;});[1,2,3].forEach(x=>{seat(x).dead='night';});S.seats.forEach(s=>{if(s.role==='villager')s.role=null;});seat(4).dead='night';pickOne('idiot');tap(4);
ok('录完即判胜负',S.win&&S.win.side==='wolf'&&S.seats[8].role==='villager'&&localStorage.getItem(KEY)===JSON.stringify(S));close_();
for(const [bd,role] of [['wkguard','wolfking'],['magician','wolfking'],['wkdream','wolfking'],['wkguard','hunter']]){
const dk=[];for(const [k,c] of Object.entries(BOARDS[bd].cnt))for(let i=0;i<c;i++)dk.push(k);const g=dk.indexOf(role)+1,vs=dk.map((k,i)=>k==='villager'?i+1:0).filter(Boolean);
setup(bd,dk);end({knife:0,poison:g});ok(bd+role+' 天亮毒不可开枪',document.querySelector('.side').textContent.includes(R[role].n+'被毒杀，不可开枪'));confirmDawn();
ok(bd+role+' 白天毒不可开枪',document.querySelector('.side').textContent.includes(`${g}号 ${R[role].n}被毒杀，不可开枪`)&&!document.querySelector('.side').textContent.includes('可以开枪'));ok(bd+role+' 日志',S.log.some(l=>l.x===R[role].n+'被毒杀，不可开枪'));
doRevive(g-1);ok('复活清标记',seat(g).ng===undefined);
setup(bd,dk);end({knife:g,poison:null});confirmDawn();ok(bd+role+' 被刀可开枪',document.querySelector('.side').textContent.includes('昨夜死亡，可以开枪'));
// 毒死触发胜利时不提示开枪
setup(bd,dk);S.day=2;S.n=freshNight();const ot=role==='wolfking'?dk.map((k,i)=>W.includes(k)&&k!==role?i+1:0):dk.map((k,i)=>R[k].c==='god'&&k!==role&&k!=='witch'?i+1:0);ot.filter(Boolean).forEach(x=>{seat(x).dead='exile';seat(x).at='第1天';});
if(role==='hunter'){seat(dk.indexOf('witch')+1).role='witch';}
end({knife:role==='hunter'?dk.indexOf('witch')+1:0,poison:g});confirmDawn();ok(bd+role+' 毒杀胜利',!!S.win);ok(bd+role+' 胜利弹窗不提示开枪',!document.querySelector('#sheet').textContent.includes('处理开枪'));close_();}
setup('mech',['medium','witch','hunter','guard','mechwolf','wolf','wolf','wolf','villager','villager','villager','villager']);end({learn:3,knife:5});confirmDawn();ok('机械狼刚学不可开枪',document.querySelector('.side').textContent.includes('机械狼当夜刚学习，不可开枪'));
setup('wkguard',WK);S.hide=true;end({knife:0,poison:5});confirmDawn();ok('隐藏不露狼王',!document.querySelector('.side').textContent.includes('狼王')&&document.querySelector('.side').textContent.includes('被毒杀，不可开枪'));S.hide=false;
// ---- v22 自爆 / 开枪 / 常亮
{const SD=()=>document.querySelector('.side').textContent,SH=()=>document.querySelector('#sheet').textContent;
const day=(bd,dk,o={})=>{close_();setup(bd,dk);end({knife:0,guard:0,dream:9,...o});confirmDawn();close_();};
day('wkguard',WK);pickBoom();ok('自爆只能选狼',[...document.querySelectorAll('.pk button')].filter(b=>!b.disabled).length===4);tap(6);ok('首日问竞选',SH().includes('竞选阶段'));B('警徽流失').click();ok('自爆直接入夜',S.seats[5].dead==='boom'&&S.d.skip==='boom'&&S.badgeLost&&SD().includes('6号·狼人 自爆，直接入夜')&&SD().includes('警徽已流失')&&!!B('天黑了')&&!rb('放逐')&&!S.sealed);ok('自爆日志',S.log.some(l=>l.x==='狼人自爆：6号·狼人，直接入夜')&&S.log.some(l=>l.x==='警长竞选中自爆：警徽流失'));
doRevive(5);ok('自爆更正',!S.d&&!S.badgeLost&&!S.seats[5].dead&&!!rb('狼人自爆'));
askBoom(6);B('竞选延到明天').click();ok('竞选延后',!S.badgeLost&&S.log.at(-1).x==='警长竞选中自爆：竞选延到明天');nextNight();end({knife:0,guard:0});confirmDawn();askBoom(7);ok('延后第2天仍问',SH().includes('竞选阶段')&&!B('竞选延到明天',document.querySelector('#sheet'))&&SH().includes('已延过一次'));B('不是竞选').click();ok('非竞选不流失',!S.badgeLost);
day('wkguard',WK);doBadge(0);askBoom(6);ok('有警长不问',S.d&&S.d.boom===6);
day('wkguard',WK);boom(6,'lost');doBadge(0);ok('更正授徽清流失',!S.badgeLost);
day('wkguard',WK);boom(5,'');ok('狼王自爆不可开枪',SD().includes('狼王自爆，不可开枪')&&!rb('开枪'));
day('beauty',['seer','witch','knight','guard','beauty','wolf','wolf','wolf','villager','villager','villager','villager']);pickBoom();ok('狼美人不能自爆',pkb(5).disabled);close_();S.hide=true;render();pickBoom();ok('隐藏不露狼',[...document.querySelectorAll('.pk button')].every(b=>!b.disabled));tap(1);ok('隐藏选好人被拒',!S.d&&!S.seats[0].dead);S.hide=false;
day('blood',['seer','witch','witchhunter','idiot','bloodmoon','wolf','wolf','wolf','villager','villager','villager','villager']);boom(6,'');ok('普通狼自爆不封印',!SD().includes('封印')&&!S.sealed);doRevive(5);boom(5,'');ok('血月自爆封印',SD().includes('封印')&&S.sealed===2);
day('bros',['seer','witch','merchant','guard','elder','younger','wolf','wolf','villager','villager','villager','villager']);boom(5,'');nextNight();S.n.step=3;render();ok('狼兄自爆狼弟觉醒',SD().includes('觉醒'));
// 开枪
day('wkguard',WK,{knife:3});ok('夜死猎人有开枪行',!!rb('开枪')&&SD().includes('猎人 昨夜死亡，可以开枪'));rb('开枪').click();ok('不能带走自己和死人',pkb(3).disabled);tap(6);ok('开枪记录',S.seats[5].dead==='shot'&&S.seats[5].at==='第1天'&&S.log.at(-1).x==='猎人 3号 开枪带走 6号·狼人'&&SD().includes('带走 6号')&&localStorage.getItem(KEY)===JSON.stringify(S));
tapSeat(8);ok('开过枪后锁住',[...document.querySelectorAll('#sheet button')].find(b=>b.textContent.includes('被枪带走')).disabled&&SH().includes('现在无人可开枪'));close_();
B('更正').click();ok('更正开枪',!S.seats[5].dead&&!S.seats[2].shot&&S.log.at(-1).x==='更正：取消 3号 的开枪');
rb('开枪').click();none();ok('不开枪',S.seats[2].shot.t===0&&S.log.at(-1).x==='猎人 3号 不开枪');shotAt(7);ok('不开枪后可改',S.seats[6].dead==='shot'&&S.seats[2].shot.t===7);doRevive(6);ok('恢复被带走者撤销开枪',!S.seats[2].shot&&!S.seats[6].dead);
shotAt(7);doRevive(2);ok('恢复猎人连同开枪撤销',!S.seats[2].dead&&!S.seats[6].dead&&!S.seats[2].shot);
day('wkguard',WK,{poison:5});ok('毒狼王无按钮',!rb('开枪')&&SD().includes('狼王被毒杀，不可开枪'));tapSeat(4);{const b=[...document.querySelectorAll('#sheet button')].find(b=>b.textContent.trim().startsWith('开枪'));ok('毒狼王按钮锁住',b.disabled&&b.textContent.includes('被毒杀'));}close_();pickShot(5);ok('毒狼王直接调用也拒',!document.querySelector('#bg').classList.contains('show')&&!S.seats[4].shot);shotAt(9);ok('毒狼王不能带人',!S.seats[8].dead);
day('wkguard',WK);tapSeat(8);ok('无人可开枪锁住',[...document.querySelectorAll('#sheet button')].find(b=>b.textContent.includes('被枪带走')).disabled);close_();
doExile(3);ok('放逐猎人可开枪',!!rb('开枪')&&SD().includes('猎人 被放逐，可以开枪'));shotAt(5);ok('带走狼王后狼王可开枪',SD().includes('狼王 出局，可以开枪'));shotAt(9);ok('连环枪',S.seats[8].dead==='shot'&&S.seats[4].shot.t===9&&S.log.at(-1).x==='狼王 5号 开枪带走 9号·平民');revokeExile();ok('更正放逐连环撤销',[2,4,8].every(i=>!S.seats[i].dead&&!S.seats[i].shot)&&!S.d);
day('wkguard',WK,{knife:3});doExile(5);close_();tapSeat(8);ok('两人可开枪',SH().includes('3号、5号开枪'));close_();shotAt(9);ok('问谁带走',SH().includes('谁带走')&&!S.seats[8].dead);B('狼王').click();ok('指定开枪者',S.seats[4].shot.t===9&&!S.seats[2].shot);
nextNight();shotAt(10);ok('天黑后补记',S.seats[9].dead==='shot'&&S.seats[9].at==='第1天'&&S.seats[2].shot.t===10);end({knife:0,guard:0});confirmDawn();ok('隔天不可再开',!rb('开枪'));
kill('std',STD,[1,2,4]);doExile(3);ok('胜利弹窗可开枪',SH().includes('3号 开枪'));B('3号 开枪',document.querySelector('#sheet')).click();tap(5);ok('弹窗开枪',S.seats[4].dead==='shot');showWin();ok('开过枪不再提示',!SH().includes('处理开枪'));close_();
// 幸运儿
const BRS=['seer','witch','merchant','guard','elder','younger','wolf','wolf','villager','villager','villager','villager'];
day('bros',BRS,{trade:{n:9,skill:'gun'}});ok('幸运儿白天可开枪',!!rb('开枪')&&SD().includes('9号 幸运儿 有猎枪'));rb('开枪').click();ok('活人无不开枪',!B('不开枪'));tap(7);ok('幸运儿开枪',S.lucky.used&&S.seats[6].dead==='shot'&&S.log.at(-1).x==='幸运儿 9号 开枪带走 7号·狼人');B('更正').click();ok('幸运儿更正',!S.lucky.used&&!S.seats[6].dead);shotAt(7);doExile(0);nextNight();end({knife:0,guard:0});S.n.step=stepsOf().indexOf('lucky');render();ok('幸运儿已用',SD().includes('已用'));S.n.step=stepsOf().length-1;confirmDawn();ok('次日无枪',!rb('开枪'));
day('bros',BRS,{trade:{n:9,skill:'gun'}});shotAt(7);doExile(0);nextNight();end({knife:0,guard:0});confirmDawn();doExile(9);close_();ok('用过枪的幸运儿出局无枪',!rb('开枪')&&!SD().includes('可以开枪'));
day('bros',BRS,{trade:{n:9,skill:'gun'},knife:9,dream:null});ok('当夜获枪即死',SD().includes('幸运儿当夜刚获得猎枪，不可开枪')&&!rb('开枪'));
day('bros',BRS,{trade:{n:9,skill:'gun'}});doExile(0);nextNight();end({knife:0,guard:0,poison:9});confirmDawn();ok('幸运儿毒死',SD().includes('幸运儿被毒杀，不可开枪'));
day('bros',BRS,{trade:{n:9,skill:'gun'}});shotAt(7);doExile(0);nextNight();end({knife:9,guard:0});ok('用过枪夜死不提示',!SD().includes('开枪'));confirmDawn();ok('用过枪夜死白天无枪',!SD().includes('开枪'));
day('bros',BRS,{trade:{n:9,skill:'check'}});ok('查验幸运儿无枪',!rb('开枪'));
day('wkguard',WK,{knife:3});S.hide=true;render();ok('隐藏不露猎人',!SD().includes('猎人')&&!!rb('开枪'));S.hide=false;render();
openMenu();ok('常亮菜单',SH().includes('屏幕常亮'));close_();}
// ---- v23
{const SD=()=>document.querySelector('.side').textContent,SH=()=>document.querySelector('#sheet').textContent,sh=()=>document.querySelector('#sheet');
const day=(bd,dk,o={})=>{close_();setup(bd,dk);end({knife:0,guard:0,...o});confirmDawn();close_();};
const vc=n=>[...document.querySelectorAll('.vc button')].find(b=>b.querySelector('b').textContent===String(n)),vv=n=>[...document.querySelectorAll('.vv button')].find(b=>b.querySelector('b').textContent.replace('🎖','')===String(n));
const votes=o=>{for(const [c,l] of Object.entries(o)){vc(c).click();l.forEach(n=>vv(n).click());}},vok=()=>{const b=document.querySelector('#sheet .pkf .pri');b.click();};
const GG=['seer','witch','hunter','grave','gargoyle','wolf','wolf','wolf','villager','villager','villager','villager'],MM=['medium','witch','hunter','guard','mechwolf','wolf','wolf','wolf','villager','villager','villager','villager'];
day('gargoyle',GG);pickBoom();ok('石像鬼不能自爆',pkb(5).disabled&&!pkb(6).disabled);close_();[6,7,8].forEach(x=>{seat(x).dead='exile';seat(x).at='第0天';});settle();ok('只剩石像鬼无自爆行',!rb('狼人自爆'));
day('mech',MM);pickBoom();ok('机械狼不能自爆',pkb(5).disabled&&!pkb(6).disabled);close_();
// 警长
day('wkguard',WK,{knife:9});ok('第1天竞选面板',SD().includes('警长竞选')&&rb('警长投票').disabled&&rb('退水').disabled);
rb('上警').click();[1,5,9].forEach(tap);B('确定').click();rb('退水').click();ok('退水只能选上警者',!pkb(5).disabled&&pkb(2).disabled);tap(5);B('确定').click();ok('退水标签',document.querySelectorAll('.seat')[4].textContent.includes('退水'));
rb('警长投票').click();ok('警长候选与警下',[...document.querySelectorAll('.vc b')].map(e=>e.textContent).join()==='1,9'&&[...document.querySelectorAll('.vv b')].map(e=>e.textContent).join()==='2,3,4,6,7,8,10,11,12');
votes({1:[2,3],9:[4,6]});ok('平票提示',SH().includes('平票 PK：1、9号'));vok();ok('进入PK',S.v.round===2&&SH().includes('PK')&&S.log.at(-1).x==='平票 PK：1、9号'&&S.log.at(-2).x==='警长投票：1号 2票（2、3）｜9号 2票（4、6）｜弃票 7、8、10、11、12号');
votes({1:[2,3,4]});vok();ok('当选警长',S.seats[0].badge&&S.badgeDone&&S.log.at(-1).x==='警长竞选：上警 1、5、9号，退水 5号 → 1号 当选警长'&&!SD().includes('警长竞选')&&!S.v);
// 放逐记票 1.5
rb('投票明细').click();ok('死者不在票里',!vc(9)&&!vv(9));votes({6:[1,2],7:[3,4,5]});ok('1.5 票',SH().includes('2.5 票')&&SH().includes('放逐 7号'));vv(5).click();vc(6).click();ok('改票前',S.v.m[5]===undefined);vv(5).click();ok('改投',SH().includes('放逐 6号'));
const sv=JSON.stringify(S);ok('草稿已存',localStorage.getItem(KEY)===sv&&JSON.stringify(load())===sv);close_();ok('面板显示票数',SD().includes('已记 5/11 票'));rb('投票明细').click();vok();ok('记票放逐',S.seats[5].dead==='exile'&&S.d.n===6&&!S.v&&S.log.at(-2).x==='放逐投票：6号 3.5票（1🎖、2、5）｜7号 2票（3、4）｜弃票 6、7、8、10、11、12号'&&S.log.at(-1).x==='投票放逐：6号·狼人');
revokeExile();ok('更正后可重投',!S.seats[5].dead&&!!rb('投票明细'));
rb('投票明细').click();votes({6:[2],7:[3]});vok();ok('PK 台上不投',!vv(6)&&!vv(7)&&!!vv(1)&&[...document.querySelectorAll('.vc b')].map(e=>e.textContent).join()==='6,7');votes({6:[2],7:[3]});ok('再次平票',SH().includes('再次平票：无人放逐'));vok();ok('再次平票无人放逐',S.d&&S.d.n===0&&S.log.at(-1).x==='今天无人放逐'&&S.log.at(-2).x.startsWith('放逐投票（PK）：'));
day('wkguard',WK);rb('投票明细').click();ok('未选被投先提示',(vv(1).click(),S.v.m[1]===undefined));ok('无人投票',SH().includes('无人投票：无人放逐'));vok();ok('无人投票结果',S.d.n===0&&S.log.at(-2).x==='放逐投票：无人投票');
day('wkguard',WK);rb('投票明细').click();votes({3:[1,2,3]});doDie(1,'night');rb('投票明细').click();ok('出局者的票作废',SH().includes('放逐 3号')&&vc(3).textContent.includes('2 票')&&!vv(2));voteClear();ok('清空',!Object.keys(S.v.m).length);close_();boom(6,'');ok('自爆清草稿',!S.v);
day('beauty',['seer','witch','knight','guard','beauty','wolf','wolf','wolf','villager','villager','villager','villager'],{charm:9});rb('投票明细').click();votes({5:[1,2]});vok();ok('记票放逐狼美人殉情',S.seats[8].dead==='love'&&S.d.also.join()==='9');revokeExile();ok('更正',!S.seats[8].dead);
day('std',STD);rb('投票明细').click();votes({4:[1]});vok();ok('记票放逐白痴翻牌',S.seats[3].flip&&S.d.flip);
day('wkguard',WK);rb('警长').click();none();ok('警徽流失',S.badgeLost&&SD().includes('警徽已流失')&&!SD().includes('警长竞选')&&S.log.at(-1).x==='警长竞选：上警 — → 警徽流失');
day('wkguard',WK);rb('警长').click();tap(3);ok('未录上警也可选警长',S.seats[2].badge);doExile(3);ok('警长出局处理行',!!rb('警徽'));rb('警徽').click();ok('不能交给自己',pkb(3).disabled);tap(4);ok('移交',S.seats[3].badge&&!S.seats[2].badge&&S.log.at(-1).x==='警徽移交：3号 → 4号');
doDie(3,'night');rb('警徽').click();none();ok('撕毁',S.badgeLost&&!S.seats.some(x=>x.badge)&&S.log.at(-1).x==='4号 撕毁警徽');
day('wkguard',WK);doExile(0);nextNight();end({knife:0,guard:0});confirmDawn();ok('第2天无竞选',!SD().includes('警长竞选'));
day('wkguard',WK);askBoom(6);B('竞选延到明天').click();nextNight();end({knife:0,guard:0});confirmDawn();ok('延后第2天有竞选',SD().includes('警长竞选'));doRevive(5);
day('wkguard',WK);boom(6,'later');doRevive(5);ok('恢复清延后',!S.elLater);
// 撤销存盘
const lu=()=>{const a=uTop,b=uCnt,r=loadUndo();uTop=a;uCnt=b;return r;};
startGame('std');clearUndo();undo=[];setRole(0,'seer');setRole(1,'witch');ok('撤销已存盘',undo.length===2&&lu().join('|')===undo.join('|'));doUndo();ok('撤销后存盘同步',lu().length===1&&lu()[0]===undo[0]&&!S.seats[1].role);
for(let i=0;i<70;i++)upd(()=>S.n.step=i%2);ok('存盘最多50步',lu().length===50&&lu().join()===undo.slice(-50).join());doUndo();doUndo();ok('环形撤销',lu().join()===undo.slice(-48).join());setRole(2,'wolf');ok('撤销后再做',lu().join()===undo.slice(-49).join());
{const o=JSON.parse(undo.at(-1));delete o.id;delete o.v;delete o.out;undo[undo.length-1]=JSON.stringify(o);doUndo();ok('旧撤销补字段',Array.isArray(S.out)&&S.v===null&&!!S.id);}
{const os=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(/^lrs-u\d/.test(k))throw new DOMException('q','QuotaExceededError');return os.call(this,k,v);};let e='';try{upd(()=>S.n.step=0);}catch(x){e=x.name;}Storage.prototype.setItem=os;ok('撤销存不下不影响对局',!e&&localStorage.getItem(KEY)===JSON.stringify(S)&&lu().length===0);upd(()=>S.n.step=1);ok('恢复后继续存',lu().length===1);}
localStorage.setItem(UK,'{bad');ok('坏撤销不崩',lu().length===0);localStorage.setItem(UK,'{"t":3,"c":3}');localStorage.setItem('lrs-u2','xx');ok('坏格不崩',Array.isArray(lu()));clearUndo();undo=[];
setup('mech',MM);S.n.learn=3;S.n.knife=5;S.n.step=stepsOf().length-1;settle();setRole(4,null);confirmDawn();ok('清除机械狼身份后仍可天亮',!S.night);close_();
{startGame('std');setRole(0,'seer');const b=JSON.stringify(S),u=undo.length;let threw=0;try{commit('x',()=>{S.day=9;S.seats[0].role=null;throw Error('测试');});}catch(e){threw=1;}ok('出错整步还原',threw&&JSON.stringify(S)===b&&undo.length===u&&localStorage.getItem(KEY)===b&&lu().length===Math.min(50,u));doUndo();ok('还原后撤销正常',!S.seats[0].role);}
// 历史
close_();startGame('std');localStorage.removeItem(HK);startGame('std');ok('空局不入历史',loadHist().length===0);S.names[0]='小明';day('wkguard',WK);S.names[0]='小明';doExile(6);const gid=S.id,lg=S.log.length;startGame('demon');let h=loadHist();ok('入历史',h.length===1&&h[0].id===gid&&h[0].board==='wkguard'&&h[0].log.length===lg&&S.id!==gid);
openMenu();ok('菜单历史 1 局',SH().includes('历史对局1 局')&&SH().includes('版本 '+VER));openHistory();ok('历史列表',SH().includes('狼王守卫')&&SH().includes('未分胜负'));sh().querySelector('.hs .btn').click();ok('历史详情',document.querySelectorAll('#sheet .ros>div').length===12&&SH().includes('投票放逐6号·狼人')&&SH().includes('小明'));
let ct='';const oc=navigator.clipboard.writeText;navigator.clipboard.writeText=t=>{ct=t;return Promise.resolve();};copyLog(gid);navigator.clipboard.writeText=oc;ok('历史复制',ct.startsWith('【狼人杀法官记录】狼王守卫 20')&&ct.includes('1号 小明 预言家')&&ct.includes('过程：'));
B('删除这一局').click();ok('删除要确认',loadHist().length===1&&SH().includes('无法恢复'));B('取消',sh()).click();ok('取消回详情',SH().includes('复制'));B('删除这一局').click();B('确认删除').click();ok('删除',loadHist().length===0&&SH().includes('还没有历史'));close_();
day('wkguard',WK);const g2=S.id;startGame('std');ok('再入历史',loadHist().some(g=>g.id===g2));doUndo();ok('撤销新开局移出历史',S.id===g2&&!loadHist().some(g=>g.id===g2)&&S.board==='wkguard');
localStorage.removeItem(HK);for(let i=0;i<23;i++){day('wkguard',WK);startGame('std');}ok('最多20局',loadHist().length===20);ok('历史大小',localStorage.getItem(HK).length<3e5);localStorage.setItem(HK,'oops');ok('坏历史不崩',loadHist().length===0);openHistory();close_();localStorage.removeItem(HK);
kill('std',STD,[5,6,7]);doExile(8);close_();startGame('std');openHistory();ok('历史胜负',SH().includes('好人阵营获胜'));close_();localStorage.removeItem(HK);S.names=Array(12).fill('');
ok('无新版不显示',!SD().includes('有新版'));}
// names
startGame('std');openNames(2);const ins=document.querySelectorAll('.nms input');ok('12 inputs',ins.length===12);ins[2].value=' 小明<b>"\' ';ins[11].value='阿强';saveNames();ok('name clean',S.names[2]==='小明b'&&S.names[11]==='阿强');ok('name shown',[...document.querySelectorAll('.seat .nm')].map(e=>e.textContent).join()==='小明b,阿强');
S.seats[2].role='wolf';S.seats[2].dead=null;doBadge(2);ok('name in log',S.log.at(-1).x==='警徽授予 3号 小明b');doUndo();ok('name kept on undo',S.names[2]==='小明b');startGame('demon');ok('name kept on new game',S.names[11]==='阿强');pickT('guard');ok('name in picker',pkb(12).textContent.includes('阿强'));close_();
openNames();B('清空全部').click();saveNames();ok('names cleared',S.names.every(x=>!x));
// board chooser
newGame();ok('boards listed',document.querySelectorAll('#sheet .bd').length===Object.keys(BOARDS).length);close_();
for(const b of Object.keys(BOARDS)){startGame(b);pickRole(0);ok('imgs '+b,document.querySelectorAll('.rp img').length===Object.keys(BOARDS[b].cnt).length);}close_();
// hide: no role names in seats
setup('demon',['seer','witch','hunter','guard','demon','wolf','wolf','wolf','villager','villager','villager','villager']);S.hide=true;render();ok('hide uniform',new Set([...document.querySelectorAll('.seat')].map(e=>getComputedStyle(e).borderTopColor)).size===1);tapSeat(4);ok('hide sheet',!document.querySelector('#sheet').textContent.includes('恶魔'));close_();S.hide=false;
}catch(e){T.push('ERROR '+e.stack)}
return JSON.stringify({pass:T.pass,fails:[...T],out});
})()
