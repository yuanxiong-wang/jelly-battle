import {createGame,moves,resolve,preview,tiles,tileCategory,tileDetails,turnSeconds,rankFor} from './engine.mjs';
const $=s=>document.querySelector(s),colors=['#54d5ed','#d98ee4','#ffad43','#cedc58'];
export function jelly(i){const c=colors[i];return `<svg viewBox="0 0 80 100" aria-hidden="true"><defs><radialGradient id="j${i}"><stop stop-color="#ffffff" stop-opacity=".8"/><stop offset=".3" stop-color="${c}"/><stop offset="1" stop-color="${c}" stop-opacity=".65"/></radialGradient></defs><ellipse cx="40" cy="91" rx="25" ry="5" fill="#000" opacity=".22"/><path d="M25 39 Q14 19 29 12 Q44 4 53 19 Q60 29 53 39 Q61 42 67 36 Q78 30 77 40 Q75 48 62 53 Q61 68 54 75 L57 85 Q57 94 48 90 L40 78 L33 89 Q25 94 24 84 L26 73 Q18 67 18 54 Q3 54 4 44 Q6 37 14 43Z" fill="url(#j${i})" stroke="${c}" stroke-width="2"/><ellipse cx="32" cy="23" rx="7" ry="4" fill="white" opacity=".3"/><ellipse cx="35" cy="32" rx="2" ry="3" fill="#163630"/><ellipse cx="47" cy="32" rx="2" ry="3" fill="#163630"/><path d="M37 39 Q42 43 47 38" fill="none" stroke="#163630" stroke-width="2"/></svg>`;}
let g=createGame(),running=false,paused=false,busy=false,selection=null,time=turnSeconds($('#difficulty').value),sound=false,audio;
const classFor=tileCategory;
function render(){const allowed=moves(g.players[0]);$('#board').innerHTML=g.board.map((row,y)=>row.map((t,x)=>{const p=g.players.findIndex(p=>p.hp>0&&p.x===x&&p.y===y),ok=allowed.some(m=>m.x===x&&m.y===y);return `<button class="key ${classFor(t)} ${running&&ok?'reachable':''} ${selection?.x===x&&selection?.y===y?'selected':''}" data-x="${x}" data-y="${y}" aria-label="Column ${x+1}, row ${y+1}: ${tiles[t][1]}. Landing: ${tiles[preview(g,{x,y})]?.[1]||'new random tile'}" ${!running||!ok||busy||paused?'disabled':''}><span class="symbol">${tiles[t][0]}</span>${p>=0?`<span class="jelly ${p===0?'you':''} ${g.players[p].invisible?'invisible':''} ${g.players[p].frozen?'frozen':''}">${jelly(p)}</span>`:''}</button>`;}).join('')).join('');
$('#players').innerHTML=g.players.map((p,i)=>`<div class="player ${p.hp<=0?'dead':''}" style="--color:${colors[i]}"><div class="avatar">${jelly(i)}</div><div class="name"><span style="color:${colors[i]}">${p.name}</span><small>${i===0?'PLAYER 01':'CPU 0'+i}</small></div><div class="health"><i style="width:${p.hp}%"></i></div><div class="hp">${p.hp} / 100 ${p.shield?' · SHIELD':''}${p.rage?' · RAGE':''}${p.jump?' · JUMP':''}${p.invisible?' · INVISIBLE':''}${p.frozen?' · FROZEN':''}${p.handbag?' · HANDBAG':''}</div></div>`).join('');$('#round').textContent=`ROUND ${String(g.round).padStart(2,'0')}`;}
function beep(f=440){if(!sound)return;audio??=new AudioContext();audio.resume();const o=audio.createOscillator(),v=audio.createGain();o.connect(v);v.connect(audio.destination);o.frequency.value=f;v.gain.setValueAtTime(.06,audio.currentTime);v.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.15);o.start();o.stop(audio.currentTime+.15);}
function start(){g=createGame();running=true;paused=false;busy=false;selection=null;time=turnSeconds($('#difficulty').value);$('#overlay').hidden=true;$('#pause').disabled=false;$('#pause').textContent='Ⅱ';$('#difficulty').disabled=true;$('#hint').textContent='Select a key · Space to jump early';$('#status').textContent=`Choose your landing · ${Math.ceil(time)}s`;$('#timebar').style.width='100%';render();beep();}
function finish(){let points=0;try{points=Number(localStorage.getItem('jelly-points'))||0;if(g.winner==='You'){points+=100;localStorage.setItem('jelly-points',String(points));}}catch{}$('#hint').textContent=`${rankFor(points)} · ${points} local points (+100 per win)`;running=false;$('#pause').disabled=true;$('#difficulty').disabled=false;$('#overlay').innerHTML=`<div class="splash"><div class="splash-jellies">${jelly(g.winner==='You'?0:1)}</div><p class="eyebrow">BATTLE COMPLETE · ${g.round-1} ROUNDS</p><h2>${g.winner==='You'?'You’re the <em>last jelly!</em>':g.winner===null?'A squishy <em>stalemate.</em>':'You’ve been <em>outbounced.</em>'}</h2><p>${g.winner==='You'?'A little strategy goes a long way.':'Try again. Keep an eye on the row above your landing.'}</p><button id="again" class="primary">PLAY AGAIN ↗</button></div>`;$('#overlay').hidden=false;$('#again').onclick=start;render();}
function jump(){
  if(!running||paused||busy)return;
  busy=true;
  $('#status').textContent='Everybody jump!';
  // Resolve once on a separate state so AI choices and collision destinations
  // are identical in the animation and the committed turn.
  const next=structuredClone(g);
  resolve(next,selection||{x:g.players[0].x,y:g.players[0].y},$('#difficulty').value);
  render();
  const board=$('#board');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration=reduced?0:650;
  g.players.forEach((p,i)=>{
    if(p.hp<=0)return;
    const destination=next.landings[i];if(destination.x<0||destination.x>=15||destination.y<0||destination.y>=5)return;
    const source=board.querySelector(`[data-x="${p.x}"][data-y="${p.y}"]`);
    const target=board.querySelector(`[data-x="${destination.x}"][data-y="${destination.y}"]`);
    const sprite=source.querySelector('.jelly');
    source.classList.add('departing');
    sprite.style.setProperty('--jump-x',`${target.offsetLeft-source.offsetLeft}px`);
    sprite.style.setProperty('--jump-y',`${target.offsetTop-source.offsetTop}px`);
    sprite.style.setProperty('--jump-height',`${Math.max(30,source.offsetHeight*.9)}px`);
  });
  board.classList.add('jumping');
  beep(620);
  setTimeout(()=>{
    // Move the icons while the jellies are airborne without replacing sprites.
    board.querySelectorAll('.key').forEach(key=>{
      const t=next.board[+key.dataset.y][+key.dataset.x];
      key.classList.remove('empty','attack','heal','mine','shield','buff','teleport');
      key.classList.add(classFor(t));
      key.querySelector('.symbol').textContent=tiles[t][0];
    });
  },duration/2);
  setTimeout(()=>{
    g=next;selection=null;board.classList.remove('jumping');busy=false;time=turnSeconds($('#difficulty').value);
    $('#hint').textContent=g.events.join(' · ');$('#hint').title=g.events.join('\n');
    render();
    if(g.over)finish();else $('#status').textContent=`Choose your landing · ${Math.ceil(time)}s`;
  },duration);
}
$('#board').addEventListener('click',e=>{const b=e.target.closest('.key');if(!b||b.disabled)return;selection={x:+b.dataset.x,y:+b.dataset.y};const t=preview(g,selection);$('#hint').textContent=`Landing on: ${tiles[t]?.[1]||'a new random tile'} · Press Space to jump`;beep(320);render();});
$('#start').onclick=start;$('#restart').onclick=()=>{if(busy)return;start();};$('#pause').onclick=()=>{if(busy||!running)return;paused=!paused;$('#pause').textContent=paused?'▶':'Ⅱ';$('#pause').setAttribute('aria-label',paused?'Resume game':'Pause game');$('#status').textContent=paused?'Paused — take your time':'Choose your landing';render();};
$('#sound').onclick=()=>{sound=!sound;$('#sound').textContent=sound?'Sound on ♫':'Sound off ♫';$('#sound').setAttribute('aria-label',sound?'Disable sound':'Enable sound');beep();};$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('.arena').requestFullscreen();}catch{$('#hint').textContent='Fullscreen is unavailable in this browser.';}};
let resumeAfterHelp=false;$('#help').onclick=()=>{resumeAfterHelp=running&&!paused;if(resumeAfterHelp)$('#pause').click();$('#helpdialog').showModal();};function closeHelp(){$('#helpdialog').close();}$('.close').onclick=closeHelp;$('.close-help').onclick=closeHelp;$('#helpdialog').addEventListener('close',()=>{if(resumeAfterHelp&&paused)$('#pause').click();});
$('#tileguide').innerHTML=Object.entries(tiles).filter(([k])=>k!=='empty').map(([k,v])=>`<div class="tile-entry ${classFor(k)}"><span>${v[0]}</span><b>${v[1]}</b><small>${tileDetails[k]}</small></div>`).join('');$('#mascots').innerHTML=[1,0,2,3].map(jelly).join('');
document.addEventListener('keydown',e=>{if(!running||paused||busy||$('#helpdialog').open||['SELECT','BUTTON'].includes(document.activeElement?.tagName)&&e.code!=='Space')return;if(e.code==='Space'){e.preventDefault();jump();}if(e.key.startsWith('Arrow')){e.preventDefault();const s=selection||g.players[0],n={x:s.x+(e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0),y:s.y+(e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0)};if(moves(g.players[0]).some(m=>m.x===n.x&&m.y===n.y)){selection=n;render();}}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused&&!busy)$('#pause').click();});setInterval(()=>{if(!running||paused||busy)return;time=Math.max(0,time-.1);$('#timebar').style.width=`${time/turnSeconds($('#difficulty').value)*100}%`;$('#status').textContent=`${selection?'Landing selected':'Choose your landing'} · ${Math.ceil(time)}s`;if(time<=0)jump();},100);render();
