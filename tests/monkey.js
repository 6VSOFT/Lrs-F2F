(() => {
const _adv=ADV;ADV=0;
const ri=n=>Math.floor(Math.random()*n),pick=a=>a[ri(a.length)];
const bad={};const note=(k,d)=>{(bad[k]=bad[k]||{n:0,eg:d}).n++;};
const onerr=e=>note('exception',e.message+' '+(e.filename||'')+':'+(e.lineno||''));addEventListener('error',onerr);
const roleNames=ROLES.map(r=>r.n).filter(n=>n!=='平民'||true);
const vis=e=>e.offsetParent!==null||getComputedStyle(e).position==='fixed';
const oc=navigator.clipboard&&navigator.clipboard.writeText;if(navigator.clipboard)navigator.clipboard.writeText=()=>Promise.resolve();
let clicks=0,wins=0,days=0;const stuck={};
for(const bd of Object.keys(BOARDS)){for(let run=0;run<6;run++){
 startGame(bd);S.hide=run%2===1;S.names=run%3?Array(12).fill(''):['小明','阿强','J$&','美玲','老王','小李','Amy','大飞','阿珍','Ken','小白','Leo'];save();render();
 let lastLog=0,same=0,lastSig='';
 for(let i=0;i<450;i++){
  const open=document.querySelector('#bg').classList.contains('show');
  let els=[...(open?document.querySelector('#sheet'):document.querySelector('#app')).querySelectorAll('button,.seat,.winbar')].filter(e=>!e.disabled);
  // avoid ending the run
  els=els.filter(e=>!/新开一局|换板子|清空全部|确认删除|删除这一局|新版/.test(e.textContent)&&!e.classList.contains('bd')&&!/copyLog/.test(e.getAttribute('onclick')||''));
  if(!open&&Math.random()<.75){const s=els.filter(e=>e.closest('.side')&&!/上一步/.test(e.textContent));if(s.length)els=s;}
  if(!open&&!els.length){note('dead end '+bd,JSON.stringify(S.n));break;}
  if(open&&(Math.random()<.06||!els.length)){close_();continue;}
  const e=pick(els);clicks++;
  const before=JSON.stringify(S);
  try{e.click();}catch(x){note('throw',x.message);}
  // invariants
  if(localStorage.getItem(KEY)!==JSON.stringify(S))note('not persisted',(e.textContent||'').trim().slice(0,30));
  const n=S.n,w=one('witch');
  for(const r of ROLES){const u=used(r.k);if(u>cntOf(r.k)&&!(r.k==='wolf'&&u<=packWant()))note('role over count '+bd,r.k+u);}
  if(S.seats.filter(s=>s.badge).length>1)note('two badges');
  if(S.night&&n.anti&&w&&w.n===n.knife)note('self save');
  if(S.night&&n.anti&&n.poison)note('both potions');
  if(S.night&&n.knife>0&&seat(n.knife).dead)note('knife dead seat '+bd,(e.textContent||'').trim().slice(0,30));
  if(S.night)for(const f of ['poison','check','guard','dream','charm','hunt','bknife','dcheck','gcheck','fear','learn','lpoison','lcheck','mpoison','mguard','mknife'])if(n[f]>0&&seat(n[f]).dead)note('target dead '+f,bd+' '+(e.textContent||'').trim().slice(0,20));
  if(S.night&&one('nightmare')&&n.fear===one('nightmare').n)note('nightmare fears self');
  if(S.model&&one('hybrid')&&S.model===one('hybrid').n)note('model self');
  if(!S.night&&S.d&&S.d.n&&!seat(S.d.n).dead)note('exiled but alive',(e.textContent||'').trim().slice(0,30));
  if(S.seats.some(s=>s.flip&&!s.dead))note('flip alive',(e.textContent||'').trim().slice(0,30));
  if(S.seats.some(s=>s.dead&&!CAUSE[s.dead]))note('bad cause');
  const et=(e.textContent||'').trim().slice(0,30);
  for(const s of S.seats){if(s.shot&&s.shot.t&&seat(s.shot.t).dead!=='shot')note('shot target alive '+bd,et);if(s.dead==='shot'&&S.seats.filter(x=>x.shot&&x.shot.t===s.n).length!==1)note('shot without shooter '+bd,et);if(s.shot&&s.shot.t&&s.shot.d&&!s.dead)note('shooter alive '+bd,et);if(s.shot&&s.shot.t&&noGun(s))note('nogun shot '+bd,et);}
  if(S.lucky&&S.lucky.skill==='gun'&&(!!(seat(S.lucky.n).shot&&seat(S.lucky.n).shot.t))!==S.lucky.used)note('lucky used mismatch',et);
  if(S.seats.some(x=>x.dead==='boom'&&['beauty','gargoyle','mechwolf'].includes(x.role))&&/自爆|竞选/.test(et)&&!/"dead":"boom"/.test(before))note('bad boom '+bd,et);
  if(S.d&&S.v)note('draft after result',et);if(S.night&&S.v)note('draft at night',et);if(S.badgeLost&&S.seats.some(x=>x.badge))note('lost but badge',et);
  if(undo.length&&uCnt&&localStorage.getItem('lrs-u'+uTop%UN)!==undo.at(-1))note('undo not saved',et);
  if(!S.night&&S.d&&S.d.skip==='boom'&&seat(S.d.boom).dead!=='boom')note('boom but alive',et);
  if(S.win){const j=judge();if(!j||j.side!==S.win.side)note('stale win',bd+' '+(e.textContent||'').trim().slice(0,30));}else if(judge())note('missed win',bd+' '+(e.textContent||'').trim().slice(0,30));
  if(/undefined|NaN|null号|\[object/.test(document.querySelector('#app').textContent+(document.querySelector('#bg').classList.contains('show')?document.querySelector('#sheet').textContent:'')))note('bad text',(document.querySelector('#app').textContent+document.querySelector('#sheet').textContent).match(/.{15}(undefined|NaN|null号|\[object).{10}/)?.[0]);
  if(S.log.some(l=>/undefined|NaN|null/.test(l.x)))note('bad log',S.log.find(l=>/undefined|NaN|null/.test(l.x)).x);
  // JSON round trip through load()
  if(i%40===0){const a=JSON.stringify(S);const b=JSON.stringify(load());if(a!==b)note('load roundtrip',bd);}
  // hide leak: seats, pickers, seat sheet
  if(S.hide){const leak=[...document.querySelectorAll('.seat .rn span,.seat img,.tag.mdl,.tag.nt')].some(x=>getComputedStyle(x).display!=='none'&&getComputedStyle(x).visibility!=='hidden'&&x.offsetParent!==null);if(leak)note('hide leak seat');
   if(document.querySelector('#bg').classList.contains('show')){const t=document.querySelector('#sheet');if(!t.textContent.includes('删除这一局')&&t.querySelector('.pk img,.ros img,.sheet h2 img'))note('hide leak img');}}
  if(S.night&&!open){const b=[...document.querySelectorAll('.wf .pri')][0];}
  if(S.win)wins++;
 }
 days+=S.day;
 // undo everything
 let g=0;while(undo.length&&g++<400){doUndo();if(/undefined|NaN/.test(document.querySelector('#app').textContent))note('undo bad text');}
}}
removeEventListener('error',onerr);
ADV=_adv;return JSON.stringify({clicks,days,wins:wins>0,bad});
})()
