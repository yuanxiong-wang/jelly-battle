export const COLS=15,ROWS=5;
export const turnSeconds=d=>({easy:15,medium:12,hard:8})[d]||12;
export const rankFor=points=>[[50000,"Field Marshall"],[15000,"General"],[7500,"Major"],[4000,"Captain"],[2000,"Sergeant"],[1000,"Corporal"],[0,"Private"]].find(([n])=>points>=n)[1];
export const tiles={empty:['','Empty key'],heal:['✚','Health recovery +25'],super:['♥','Super Jelly — full health'],mine:['✹','Mine −30'],handbag:['▱','Handbags'],blast:['✸','Blast'],laser:['ϟ','Laser'],air:['✈','Air Strike'],drop:['⇣','Random Drop'],nuke:['☢','Nukes'],invisible:['◌','Invisible'],cleanse:['×','De-Bonus'],shield:['⬡','Shield'],freeze:['❄','Freeze'],rage:['♨','Jelly Rage'],jump:['⇈','Triple Jump'],teleport:['◎','Teleport']};
export const tileCategory=t=>['handbag','blast','laser','air','drop','nuke'].includes(t)?'attack':['invisible','cleanse','shield','freeze','rage','jump'].includes(t)?'buff':['heal','super'].includes(t)?'heal':t;
export const tileDetails={heal:'Restore 25 HP.',super:'Restore health to 100 HP.',mine:'Take 30 damage; a shield blocks it.',handbag:'Strike all rivals within one key for 30 damage on each of the next three turns.',blast:'Deal 40 / 30 / 20 damage at distances 1 / 2 / 3.',laser:'Deal 25 damage to rivals in your row or column.',air:'Ten bombs fall on random board keys; each hit deals 30 damage. Invisible rivals are excluded.',drop:'Drop an anvil (25), metal (35), or piano (50) on a random visible rival. Hits yourself if all rivals are invisible.',nuke:'Deal 30 damage to every rival.',invisible:'Avoid targeted Handbag and Air Strike attacks for this turn and the next two. Area attacks still hit; taking damage ends invisibility.',cleanse:'Remove rivals’ existing shields, invisibility, rage and jump boosts.',shield:'Block damage for this turn and the next two turns.',freeze:'Freeze one random rival in place for their next jump. They can still collect tiles and attack.',rage:'Double weapon damage for this turn and the next two turns.',jump:'Expand jump range from two to three keys for the next four jumps.',teleport:'Move to a random unoccupied key and activate its icon.'};
const pool=['empty','empty','empty','empty','heal','heal','mine','mine','blast','laser','air','shield','jump','rage','teleport','nuke','cleanse','handbag','drop','invisible','freeze','super'];
export function randomTile(rng=Math.random){return pool[Math.floor(rng()*pool.length)];}
export function createGame(rng=Math.random){return {round:1,over:false,winner:null,board:Array.from({length:ROWS},()=>Array.from({length:COLS},()=>randomTile(rng))),players:['You','Violet','Amber','Lime'].map((name,i)=>({name,x:[2,5,9,12][i],y:2,hp:100,shield:0,jump:0,rage:0,invisible:0,frozen:0,handbag:0})),events:['Pick a landing key. Watch the row above it!']};}
export function moves(p){if(p.frozen)return [{x:p.x,y:p.y}];const a=[],range=p.jump?3:2;for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(Math.abs(x-p.x)<=range&&Math.abs(y-p.y)<=range)a.push({x,y});return a;}
export function preview(g,pos){return pos.y===0?'unknown':g.board[pos.y-1][pos.x];}
export function aiMove(g,i,difficulty='medium',rng=Math.random){const p=g.players[i],choices=moves(p);const score=m=>{const t=preview(g,m);let s=({mine:-50,heal:p.hp<80?35:2,super:p.hp<80?50:2,invisible:18,freeze:24,handbag:25,drop:20,shield:18,air:25,nuke:28,laser:16,blast:14,rage:12,jump:8,teleport:2,unknown:0})[t]||0;if(t==='laser')s+=g.players.filter(q=>q.hp>0&&q!==p&&q.y===m.y).length*12;return s+rng()*(difficulty==='easy'?100:difficulty==='hard'?8:35);};return choices.map(m=>({...m,score:score(m)})).sort((a,b)=>b.score-a.score)[0];}
export function resolve(g,target,difficulty='medium',rng=Math.random){if(g.over||!moves(g.players[0]).some(m=>m.x===target.x&&m.y===target.y))return g;
const wasFrozen=g.players.map(p=>p.frozen>0);
const orders=g.players.map((p,i)=>i===0?target:aiMove(g,i,difficulty,rng));g.events=[];

g.board=[Array.from({length:COLS},()=>randomTile(rng)),...g.board.slice(0,-1)];
const occupied=new Map();
const displaced=[];
for(let i=0;i<g.players.length;i++){const p=g.players[i];if(p.hp<=0)continue;const m=orders[i];p.x=m.x;p.y=m.y;const key=m.y*COLS+m.x;if(!occupied.has(key)){occupied.set(key,i);continue;}const j=occupied.get(key),q=g.players[j];let roll=1+Math.floor(rng()*10),other=1+Math.floor(rng()*10);const winner=roll>other?i:roll<other?j:(rng()<.5?i:j),loser=winner===i?j:i;g.events.push(`Jelly Off: ${p.name} ${roll}, ${q.name} ${other}; ${g.players[winner].name} wins.`);g.players[loser].hp=Math.max(0,g.players[loser].hp-15);g.players[loser].invisible=0;displaced.push(loser);occupied.set(key,winner);}
for(const i of displaced){const p=g.players[i];if(p.hp<=0)continue;const directions=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]],available=directions.filter(([dx,dy])=>!occupied.has((p.y+dy)*COLS+p.x+dx)||p.x+dx<0||p.x+dx>=COLS||p.y+dy<0||p.y+dy>=ROWS);const [dx,dy]=available[Math.floor(rng()*available.length)]||[-1,-1];p.x+=dx;p.y+=dy;if(p.x<0||p.x>=COLS||p.y<0||p.y>=ROWS){p.hp=0;g.events.push(`${p.name} fell off the keyboard.`);}else occupied.set(p.y*COLS+p.x,i);}
// Preserve physical landing positions before teleport tiles resolve.
g.landings=g.players.map(p=>({x:p.x,y:p.y}));
const hit=(p,n)=>{if(p.hp<=0)return;if(p.shield){g.events.push(`${p.name}'s shield blocked the hit.`);return;}p.hp=Math.max(0,p.hp-n);p.invisible=0;g.events.push(`${p.name} −${n} HP`);};
// Previously collected handbags fire before new landing effects.
const bags=[];
for(const p of g.players){if(p.hp<=0||!p.handbag)continue;for(const q of g.players)if(q!==p&&q.hp>0&&Math.max(Math.abs(p.x-q.x),Math.abs(p.y-q.y))<=1)bags.push([q,30*(p.rage?2:1)]);p.handbag--;}
for(const [q,n] of bags)hit(q,n);
for(const p of g.players){p.shield=Math.max(0,p.shield-1);p.jump=Math.max(0,p.jump-1);p.rage=Math.max(0,p.rage-1);p.invisible=Math.max(0,p.invisible-1);p.frozen=Math.max(0,p.frozen-1);}
// Teleports resolve before new defensive tiles and queued attacks.
for(const p of g.players.filter(p=>p.hp>0)){if(g.board[p.y][p.x]==='teleport'){const used=new Set(g.players.filter(q=>q!==p&&q.hp>0).map(q=>q.y*COLS+q.x));const free=Array.from({length:75},(_,n)=>n).filter(n=>!used.has(n));const n=free[Math.floor(rng()*free.length)];p.x=n%COLS;p.y=Math.floor(n/COLS);g.events.push(`${p.name} teleported.`);}}
const actions=g.players.filter(p=>p.hp>0).map(p=>({p,t:g.board[p.y][p.x]}));
for(const {p,t} of actions){if(t==='cleanse')g.players.filter(q=>q!==p).forEach(q=>{q.shield=0;q.jump=0;q.rage=0;q.invisible=0;q.handbag=0;});}
for(const {p,t} of actions){if(t==='heal'){p.hp=Math.min(100,p.hp+25);g.events.push(`${p.name} recovered 25 HP.`);}if(t==='super'){p.hp=100;g.events.push(`${p.name} became Super Jelly — full health!`);}if(t==='invisible')p.invisible=3;if(t==='freeze'){const rivals=g.players.filter(q=>q!==p&&q.hp>0);if(rivals.length)rivals[Math.floor(rng()*rivals.length)].frozen=1;g.events.push(`${p.name} froze the rivals for one jump.`);}if(t==='shield')p.shield=3;if(t==='jump')p.jump=4;if(t==='rage')p.rage=3;if(t==='mine')hit(p,30);}
const attacks=[];
const priority={handbag:0,blast:1,laser:2,nuke:3,air:4,drop:4};
for(const {p,t} of actions.sort((a,b)=>(priority[a.t]??-1)-(priority[b.t]??-1)||a.p.hp-b.p.hp||b.p.x-a.p.x)){
 if(p.hp<=0)continue;
 const enemies=g.players.filter(q=>q!==p&&q.hp>0),mult=p.rage?2:1;
 const attack=(q,n)=>attacks.push([q,n*mult]);
 if(t==='handbag')p.handbag=3;
 if(t==='blast')for(const q of enemies){const d=Math.max(Math.abs(q.x-p.x),Math.abs(q.y-p.y));if(d<=3)attack(q,[40,40,30,20][d]);}
 if(t==='laser')for(const q of enemies)if(q.y===p.y||q.x===p.x)attack(q,25);
 if(t==='nuke')for(const q of enemies)attack(q,30);
 if(t==='air'){const visible=enemies.filter(q=>!q.invisible);for(let bomb=0;bomb<10;bomb++){const x=Math.floor(rng()*COLS),y=Math.floor(rng()*ROWS);for(const q of visible)if(q.x===x&&q.y===y)attack(q,30);}g.events.push(`${p.name} called an Air Strike.`);}
 if(t==='drop'){const visible=enemies.filter(q=>!q.invisible),q=visible.length?visible[Math.floor(rng()*visible.length)]:p;const object=Math.floor(rng()*3);attack(q,[25,35,50][object]);g.events.push(`${p.name} dropped ${['an anvil','a ton of metal','a piano'][object]} on ${q.name}.`);}
 // Resolve in weapon priority order; an eliminated attacker cannot fire later.
 while(attacks.length){const [q,n]=attacks.shift();hit(q,n);}
}
g.round++;const alive=g.players.filter(p=>p.hp>0);if(alive.length<=1||g.players[0].hp<=0){g.over=true;g.winner=alive.length===1?alive[0].name:g.players[0].hp<=0?'opponents':null;}
if(!g.events.length)g.events.push('Safe landing. Plan your next jump.');return g;}
