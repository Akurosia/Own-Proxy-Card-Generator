// js/templates.js
import { el, show, makeDataImage } from "./utils.js";
import { state, rarityDefaultColor } from "./state.js";
import { drawAbility, drawArt, drawAttack1, drawAttack2, drawBgStandard, drawCredit, drawElement, drawFlavour, drawSocials, drawStage, drawText, initTextColorSwatches } from "./render.js";

/* Demo prefills (templates) */

export function prefillNormal(){
  setLayout("standard");
  Object.assign(state, {
    name:"Neon Duck", nameMod:"EX", element:"chaotic", stage:"step1",
    youtube:"NeonDuckYT", twitch:"NeonDuckLive", instagram:"neon.duck", x:"@neonduck", bluesky:"@neonduck.bsky.social",
    numXY:"12/99", setName:"Night Circuit", rarity:"rare",
    abilityName:"Overclock Aura",
    abilityText:"Once per turn, your next attack deals +20 if you changed a setting.",
    attackName:"Circuit Peck", attackValue:"70",
    attackEffect:"Flip a coin. If heads, the target is stunned next turn.",
    attack2Name:"Neon Burst", attack2Value:"90",
    attack2Effect:"Discard 1 card at random from your hand.",
    flavour:"Raised on city neon and late-night streams, this duck quacks in binary and dreams in blue-and-red.",
    rarityColorOverride:false,
    rarityColor: rarityDefaultColor("rare")
  });

  // mirror into inputs
  ["name","nameMod","element","stage","youtube","twitch","instagram","x","bluesky","numXY","setName","rarity",
   "abilityName","abilityText","attackName","attackValue","attackEffect","attack2Name","attack2Value","attack2Effect","flavour"]
   .forEach(id => el(id) && (el(id).value = state[id] ?? ""));

  state.artURL = makeDataImage(1200,800,(ctx,w,h)=>{
    const g=ctx.createLinearGradient(0,0,w,h); g.addColorStop(0,'#0a0d10'); g.addColorStop(1,'#243f66');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    ctx.globalAlpha=.25; ctx.strokeStyle='#39b8ff'; ctx.lineWidth=40;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(w,h); ctx.moveTo(w,0); ctx.lineTo(0,h); ctx.stroke(); ctx.globalAlpha=1;
  });
  state.setIconURL = makeDataImage(128,128,(ctx,w,h)=>{
    ctx.fillStyle='#12171c'; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#39b8ff'; ctx.lineWidth=10; ctx.strokeRect(14,14,w-28,h-28);
    ctx.strokeStyle='#ff3b3b'; ctx.beginPath(); ctx.moveTo(28,28); ctx.lineTo(w-28,h-28);
    ctx.moveTo(w-28,28); ctx.lineTo(28,h-28); ctx.stroke();
  });
  state.prevURL = makeDataImage(256,256,(ctx,w,h)=>{
    const g=ctx.createLinearGradient(0,0,w,0); g.addColorStop(0,'#111b24'); g.addColorStop(1,'#2a1a1a');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  });

  drawAll();
}

export function prefillFullArt(){
  setLayout("full");
  Object.assign(state, {
    name:"Skyline Duck", nameMod:"MAX", element:"friendly", stage:"base",
    youtube:"SkylineStreams", twitch:"SkylineDuck", instagram:"sky.duck", x:"@skylineduck", bluesky:"@skyduck.bsky.social",
    numXY:"01/45", setName:"City Lights", rarity:"ultra",
    abilityName:"City Sync",
    abilityText:"While this card is Active, your attacks cost 1 less energy if you streamed this turn.",
    attackName:"Billboard Bash", attackValue:"110",
    attackEffect:"If you have more followers than your opponent, draw a card.",
    attack2Name:"Overtime Glow", attack2Value:"60",
    attack2Effect:"Heal 20 damage from one of your benched allies.",
    flavour:"Lit by the skyline, boosted by chat—this duck never logs off.",
    rarityColorOverride:false,
    rarityColor: rarityDefaultColor("ultra")
  });

  ["name","nameMod","element","stage","youtube","twitch","instagram","x","bluesky","numXY","setName","rarity",
   "abilityName","abilityText","attackName","attackValue","attackEffect","attack2Name","attack2Value","attack2Effect","flavour"]
   .forEach(id => el(id) && (el(id).value = state[id] ?? ""));

  state.artURL = makeDataImage(1400,1000,(ctx,w,h)=>{
    const g=ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0,'#0a0d10'); g.addColorStop(.45,'#123a64'); g.addColorStop(1,'#3b0f18');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    ctx.globalAlpha=.2; ctx.fillStyle='#39b8ff';
    for(let i=0;i<50;i++) ctx.fillRect(Math.random()*w, Math.random()*h, 2, Math.random()*40+10);
    ctx.globalAlpha=.12; ctx.fillStyle='#ff3b3b';
    for(let i=0;i<40;i++) ctx.fillRect(Math.random()*w, Math.random()*h, 2, Math.random()*30+10);
    ctx.globalAlpha=1;
  });
  state.setIconURL = makeDataImage(128,128,(ctx,w,h)=>{
    ctx.fillStyle='#0e1419'; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#8cd6ff'; ctx.lineWidth=8; ctx.beginPath();
    ctx.arc(w/2,h/2,40,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle='#ff6b6b'; ctx.beginPath();
    ctx.moveTo(20,20); ctx.lineTo(w-20,h-20); ctx.moveTo(w-20,20); ctx.lineTo(20,h-20); ctx.stroke();
  });
  state.prevURL = "";

  drawAll();
}

/* Layout toggle (used by prefills and UI) */
export function setLayout(mode){
  state.layout = mode === "full" ? "full" : "standard";
  el("card").classList.toggle("fullart", state.layout === "full");
  const sel = el("layoutMode");
  if (sel && sel.value !== state.layout) sel.value = state.layout;
  // BG color rows visible only in standard
  show(el("bgTopRow"), state.layout !== "full");
  show(el("bgBottomRow"), state.layout !== "full");
  show(el("bgBorderTopRow"), state.layout !== "full");
  show(el("bgBorderBottomRow"), state.layout !== "full");
  show(el("bgStdRow"), state.layout !== "full");

}

/* Re-draw everything */
export function drawAll(){
  drawText(); drawElement(); drawStage(); drawArt(); drawSocials();
  drawAbility(); drawAttack1(); drawAttack2(); drawFlavour(); drawCredit(); drawBgStandard();
  initTextColorSwatches();
}


export function prefillStandardBG(){
  setLayout("standard");
  Object.assign(state, {
    name:"Cyber Duck", nameMod:"",
    element:"busy", stage:"step2",
    youtube:"CyberDuck", twitch:"CyberDuckLive", instagram:"cy.duck", x:"@cyberduck", bluesky:"@cy.duck",
    numXY:"25/88", setName:"Wireframe Nights", rarity:"epic",
    abilityName:"Latency Shield",
    abilityText:"Reduce damage taken by 20 during your opponent's next turn.",
    attackName:"Packet Flood", attackValue:"80",
    attackEffect:"If you changed a setting this turn, draw 1 card.",
    attack2Name:"Mux Surge", attack2Value:"110",
    attack2Effect:"Discard the top card of your deck.",
    flavour:"Streams, beams, and cyber dreams.",
    rarityColorOverride:false,
    rarityColor: rarityDefaultColor("epic")
  });
  ["name","nameMod","element","stage","youtube","twitch","instagram","x","bluesky","numXY","setName","rarity",
   "abilityName","abilityText","attackName","attackValue","attackEffect","attack2Name","attack2Value","attack2Effect","flavour"]
   .forEach(id => el(id) && (el(id).value = state[id] ?? ""));

  // Generate a subtle background image
  state.bgStandardURL = makeDataImage(744,1040,(ctx,w,h)=>{
    const g=ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0,'#0a0d10'); g.addColorStop(.5,'#0f2438'); g.addColorStop(1,'#1a0e12');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    // blue lines
    ctx.globalAlpha=.15; ctx.fillStyle='#39b8ff';
    for(let i=0;i<55;i++) ctx.fillRect(Math.random()*w, Math.random()*h, 2, Math.random()*44+10);
    // red lines
    ctx.globalAlpha=.10; ctx.fillStyle='#ff3b3b';
    for(let i=0;i<45;i++) ctx.fillRect(Math.random()*w, Math.random()*h, 2, Math.random()*36+10);
    ctx.globalAlpha=1;
  });

  // Modifier badge as image (simple capsule)
  state.nameModURL = makeDataImage(150,40,(ctx,w,h)=>{
    ctx.fillStyle="#0e1419"; ctx.strokeStyle="#8cd6ff"; ctx.lineWidth=3;
    ctx.beginPath(); const r=18;
    ctx.moveTo(r,0); ctx.arcTo(w,0,w,h,r); ctx.arcTo(w,h,0,h,r); ctx.arcTo(0,h,0,0,r); ctx.arcTo(0,0,w,0,r); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.font="bold 20px system-ui, sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillStyle="#8cd6ff";
    ctx.fillText("SPECIAL", w/2, h/2);
  });

  drawAll();
}
