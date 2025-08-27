/* Stream Saga — unchanged logic; footer fields now live in right panel */

const el = id => document.getElementById(id);

const state = {
  name: "",
  nameMod: "",
  element: "calm",
  stage: "base",
  layout: "standard",
  youtube: "", twitch: "", instagram: "",
  abilityName: "", abilityText: "",
  attackName: "", attackValue: "", attackEffect: "",
  attack2Name: "", attack2Value: "", attack2Effect: "",
  flavour: "",
  numXY: "",
  setName: "",
  rarity: "common",
  artURL: "", prevURL: "", setIconURL: ""
};

function bindInputs(){
  const map = [
    ["name","input", v => { state.name=v; drawText(); }],
    ["nameMod","change", v => { state.nameMod=v; drawText(); }],
    ["element","change", v => { state.element=v; drawElement(); }],
    ["stage","change", v => { state.stage=v; drawStage(); }],
    ["layoutMode","change", v => { setLayout(v); }],
    // footer fields (now right panel)
    ["numXY","input", v => { state.numXY=v; drawCredit(); }],
    ["setName","input", v => { state.setName=v; drawCredit(); }],
    ["rarity","change", v => { state.rarity=v; drawCredit(); }],

    ["youtube","input", v => { state.youtube=v; drawSocials(); }],
    ["twitch","input", v => { state.twitch=v; drawSocials(); }],
    ["instagram","input", v => { state.instagram=v; drawSocials(); }],

    ["abilityName","input", v => { state.abilityName=v; drawAbility(); }],
    ["abilityText","input", v => { state.abilityText=v; drawAbility(); }],

    ["attackName","input", v => { state.attackName=v; drawAttack1(); }],
    ["attackValue","input", v => { state.attackValue=v; drawAttack1(); }],
    ["attackEffect","input", v => { state.attackEffect=v; drawAttack1(); }],

    ["attack2Name","input", v => { state.attack2Name=v; drawAttack2(); }],
    ["attack2Value","input", v => { state.attack2Value=v; drawAttack2(); }],
    ["attack2Effect","input", v => { state.attack2Effect=v; drawAttack2(); }],

    ["flavour","input", v => { state.flavour=v; drawFlavour(); }],
  ];
  map.forEach(([id,ev,fn])=>{
    const n=el(id);
    if(n) n.addEventListener(ev, e=>fn(e.target.value));
  });

  // files
  el("mainImg").addEventListener("change", e => loadFile(e.target.files[0], url=>{ state.artURL=url; drawArt(); }));
  el("prevImg").addEventListener("change", e => loadFile(e.target.files[0], url=>{ state.prevURL=url; drawStage(); }));
  el("setIcon").addEventListener("change", e => loadFile(e.target.files[0], url=>{ state.setIconURL=url; drawCredit(); }));

  // background colors + swatches
  const updateColors = () => {
    const top = el("bgTop").value || "#0a0d10";
    const bot = el("bgBottom").value || "#0b0f12";
    const card = el("card");
    card.style.setProperty("--bg-top", top);
    card.style.setProperty("--bg-bottom", bot);
    const tSw = el("bgTopSwatch"); if(tSw) tSw.style.background = top;
    const bSw = el("bgBottomSwatch"); if(bSw) bSw.style.background = bot;
  };
  el("bgTop").addEventListener("input", updateColors);
  el("bgBottom").addEventListener("input", updateColors);
  updateColors();

  // buttons
  el("resetBtn").addEventListener("click", resetForm);
  el("prefillNormalBtn").addEventListener("click", prefillNormal);
  el("prefillFullBtn").addEventListener("click", prefillFullArt);
  el("downloadBtn").addEventListener("click", downloadPNG);
}

function loadFile(file, cb){
  if(!file) return;
  const r=new FileReader();
  r.onload=()=>cb(r.result);
  r.readAsDataURL(file);
}

/* Layout toggle */
function setLayout(mode){
  state.layout = mode === "full" ? "full" : "standard";
  const card = el("card");
  card.classList.toggle("fullart", state.layout === "full");
  const sel = el("layoutMode");
  if (sel && sel.value !== state.layout) sel.value = state.layout;
}

/* Drawers */
function drawText(){ el("titleName").textContent = state.name || " "; el("titleMod").textContent = state.nameMod || ""; }
function drawElement(){ const b=el("elementBadge"); b.textContent=(state.element||"").toUpperCase(); b.className="badge element "+state.element; }
function drawStage(){
  el("stageText").textContent = state.stage==="base"?"Base":(state.stage==="step1"?"Step 1":"Step 2");
  const t=el("prevThumb");
  if(state.stage!=="base" && state.prevURL){ t.src=state.prevURL; t.style.display="block"; } else { t.removeAttribute("src"); t.style.display="none"; }
}
function drawArt(){ const img=el("artImg"); if(state.artURL){ img.src=state.artURL; img.style.display="block"; } else { img.removeAttribute("src"); img.style.display="none"; } }
function drawSocials(){
  const pairs=[["ytName",state.youtube],["twName",state.twitch],["igName",state.instagram]];
  let any=false;
  pairs.forEach(([id,val])=>{
    const n=el(id); n.textContent=val||"";
    const show=!!(val && val.trim()); n.parentElement.style.display=show?"flex":"none"; if(show) any=true;
  });
  document.querySelector(".card-socials").style.display = any ? "flex" : "none";
}
function drawAbility(){
  const box=document.querySelector(".card-ability");
  if(state.abilityName && state.abilityName.trim()){
    el("abilityTitle").textContent=state.abilityName;
    el("abilityDesc").textContent=state.abilityText||"";
    box.style.display="block";
  } else { box.style.display="none"; }
}
function drawAttack1(){
  const box=document.querySelector(".card-attack.attack1");
  const has = (state.attackName && state.attackName.trim()) || (state.attackEffect && state.attackEffect.trim());
  if(has){
    el("attackTitle").textContent=state.attackName||"";
    el("attackVal").textContent=state.attackValue||"";
    el("attackEffectText").textContent=state.attackEffect||"";
    box.style.display="block";
  } else { box.style.display="none"; }
}
function drawAttack2(){
  const box=document.querySelector(".card-attack.attack2");
  const has = (state.attack2Name && state.attack2Name.trim()) || (state.attack2Effect && state.attack2Effect.trim());
  if(has){
    el("attack2Title").textContent=state.attack2Name||"";
    el("attack2Val").textContent=state.attack2Value||"";
    el("attack2EffectText").textContent=state.attack2Effect||"";
    box.style.display="block";
  } else { box.style.display="none"; }
}
function drawFlavour(){ el("flavourText").textContent=state.flavour || ""; }
function drawCredit(){
  el("setNameText").textContent=state.setName||""; el("numOut").textContent=state.numXY||"";
  const icon=el("setIconImg");
  if(state.setIconURL){ icon.src=state.setIconURL; icon.style.display="inline-block"; } else { icon.removeAttribute("src"); icon.style.display="none"; }
  const rb=document.querySelector(".card-credit .rarity");
  rb.className="rarity "+(state.rarity||"common");
  el("rarityIcon").innerHTML='<path d="M12 .9l3 6.1 6.7 1-4.9 4.8 1.2 6.7L12 16.9 6 19.5l1.2-6.7L2.3 8l6.7-1L12 .9z"/>';
}

/* Demo helpers */
function makeDataImage(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; const ctx=c.getContext('2d'); draw(ctx,w,h); return c.toDataURL('image/png'); }
function prefillNormal(){
  const set=(id,val)=>{ const n=el(id); if(n) n.value=val; };

  setLayout("standard");
  state.name="Neon Duck"; state.nameMod="EX"; state.element="chaotic"; state.stage="step1";
  state.youtube="NeonDuckYT"; state.twitch="NeonDuckLive"; state.instagram="neon.duck";
  state.numXY="12/99"; state.setName="Night Circuit"; state.rarity="rare";

  state.abilityName="Overclock Aura"; state.abilityText="Once per turn, your next attack deals +20 if you changed a setting.";
  state.attackName="Circuit Peck"; state.attackValue="70"; state.attackEffect="Flip a coin. If heads, the target is stunned next turn.";
  state.attack2Name="Neon Burst"; state.attack2Value="90"; state.attack2Effect="Discard 1 card at random from your hand.";
  state.flavour="Raised on city neon and late-night streams, this duck quacks in binary and dreams in blue-and-red.";

  set("layoutMode","standard");
  ["name","nameMod","element","stage","youtube","twitch","instagram","numXY","setName","rarity","abilityName","abilityText","attackName","attackValue","attackEffect","attack2Name","attack2Value","attack2Effect","flavour"]
    .forEach(id=>el(id)&& (el(id).value=state[id] ?? ""));

  state.artURL = makeDataImage(1200,800,(ctx,w,h)=>{ const g=ctx.createLinearGradient(0,0,w,h); g.addColorStop(0,'#0a0d10'); g.addColorStop(1,'#243f66'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.globalAlpha=.25; ctx.strokeStyle='#39b8ff'; ctx.lineWidth=40; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(w,h); ctx.moveTo(w,0); ctx.lineTo(0,h); ctx.stroke(); ctx.globalAlpha=1; });
  state.setIconURL = makeDataImage(128,128,(ctx,w,h)=>{ ctx.fillStyle='#12171c'; ctx.fillRect(0,0,w,h); ctx.strokeStyle='#39b8ff'; ctx.lineWidth=10; ctx.strokeRect(14,14,w-28,h-28); ctx.strokeStyle='#ff3b3b'; ctx.beginPath(); ctx.moveTo(28,28); ctx.lineTo(w-28,h-28); ctx.moveTo(w-28,28); ctx.lineTo(28,h-28); ctx.stroke(); });
  state.prevURL = makeDataImage(256,256,(ctx,w,h)=>{ const g=ctx.createLinearGradient(0,0,w,0); g.addColorStop(0,'#111b24'); g.addColorStop(1,'#2a1a1a'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); });

  drawText(); drawElement(); drawStage(); drawArt(); drawSocials(); drawAbility(); drawAttack1(); drawAttack2(); drawFlavour(); drawCredit();
}

function prefillFullArt(){
  const set=(id,val)=>{ const n=el(id); if(n) n.value=val; };

  setLayout("full");
  state.name="Skyline Duck"; state.nameMod="MAX"; state.element="friendly"; state.stage="base";
  state.youtube="SkylineStreams"; state.twitch="SkylineDuck"; state.instagram="sky.duck";
  state.numXY="01/45"; state.setName="City Lights"; state.rarity="ultra";

  state.abilityName="City Sync"; state.abilityText="While this card is Active, your attacks cost 1 less energy if you streamed this turn.";
  state.attackName="Billboard Bash"; state.attackValue="110"; state.attackEffect="If you have more followers than your opponent, draw a card.";
  state.attack2Name="Overtime Glow"; state.attack2Value="60"; state.attack2Effect="Heal 20 damage from one of your benched allies.";
  state.flavour="Lit by the skyline, boosted by chat—this duck never logs off.";

  set("layoutMode","full");
  ["name","nameMod","element","stage","youtube","twitch","instagram","numXY","setName","rarity","abilityName","abilityText","attackName","attackValue","attackEffect","attack2Name","attack2Value","attack2Effect","flavour"]
    .forEach(id=>el(id)&& (el(id).value=state[id] ?? ""));

  state.artURL = makeDataImage(1400,1000,(ctx,w,h)=>{
    const g=ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0,'#0a0d10'); g.addColorStop(.45,'#123a64'); g.addColorStop(1,'#3b0f18');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    ctx.globalAlpha=.2; ctx.fillStyle='#39b8ff'; for(let i=0;i<50;i++){ ctx.fillRect(Math.random()*w, Math.random()*h, 2, Math.random()*40+10); }
    ctx.globalAlpha=.12; ctx.fillStyle='#ff3b3b'; for(let i=0;i<40;i++){ ctx.fillRect(Math.random()*w, Math.random()*h, 2, Math.random()*30+10); }
    ctx.globalAlpha=1;
  });
  state.setIconURL = makeDataImage(128,128,(ctx,w,h)=>{ ctx.fillStyle='#0e1419'; ctx.fillRect(0,0,w,h); ctx.strokeStyle='#8cd6ff'; ctx.lineWidth=8; ctx.beginPath(); ctx.arc(w/2,h/2,40,0,Math.PI*2); ctx.stroke(); ctx.strokeStyle='#ff6b6b'; ctx.beginPath(); ctx.moveTo(20,20); ctx.lineTo(w-20,h-20); ctx.moveTo(w-20,20); ctx.lineTo(20,h-20); ctx.stroke(); });
  state.prevURL = "";

  drawText(); drawElement(); drawStage(); drawArt(); drawSocials(); drawAbility(); drawAttack1(); drawAttack2(); drawFlavour(); drawCredit();
}

/* Export libs — local files */
function loadScript(src){
  return new Promise((res,rej)=>{
    if(document.querySelector('script[src="'+src+'"]')) return res();
    const s=document.createElement('script'); s.src=src; s.async=true;
    s.onload=res; s.onerror=()=>rej(new Error('Failed to load '+src));
    document.head.appendChild(s);
  });
}
async function ensureExportLibs(){
  if(!window.htmlToImage) await loadScript('html-to-image.js');
  if(!window.domtoimage) await loadScript('dom-to-image-more.js');
}

/* Export */
async function downloadPNG(){
  const card = el("card");
  if(!card) return;

  await ensureExportLibs();
  if(document.fonts && document.fonts.ready) await document.fonts.ready;

  const imgs=[el("artImg"), el("prevThumb"), el("setIconImg"), ...document.querySelectorAll(".card-socials .icon")].filter(Boolean);
  await Promise.all(imgs.map(i=> i && i.src && !i.complete ? new Promise(r=>i.addEventListener("load",r,{once:true})) : Promise.resolve()));

  const cs=getComputedStyle(card); const top=(cs.getPropertyValue('--bg-top')||'#0a0d10').trim(); const bottom=(cs.getPropertyValue('--bg-bottom')||'#0b0f12').trim();
  card.style.setProperty('--bg-top', top); card.style.setProperty('--bg-bottom', bottom); card.style.backgroundImage=`linear-gradient(180deg, ${top}, ${bottom})`;

  const filename=(state.name||'card')+'.png';
  const viewportCard = document.querySelector(".card-viewport > .card") || card;
  const prevTransform = viewportCard.style.transform;
  viewportCard.style.transform = "none";

  try{
    const dataUrl = await window.htmlToImage.toPng(card,{pixelRatio:2,backgroundColor:null,cacheBust:true});
    triggerDownload(dataUrl, filename);
  }catch(e1){
    try{
      const dataUrl2 = await window.domtoimage.toPng(card,{quality:1,bgcolor:'transparent',height:card.offsetHeight,width:card.offsetWidth,style:{'--bg-top':top,'--bg-bottom':bottom,'backgroundImage':`linear-gradient(180deg, ${top}, ${bottom})`}});
      triggerDownload(dataUrl2, filename);
    }catch(e2){
      alert('Export failed. Ensure html-to-image.js and dom-to-image-more.js are present.');
      console.error(e1, e2);
    }
  } finally {
    viewportCard.style.transform = prevTransform;
  }
}
function triggerDownload(dataUrl, filename){ const a=document.createElement('a'); a.download=filename; a.href=dataUrl; document.body.appendChild(a); a.click(); a.remove(); }

/* Reset */
function resetForm(){
  Object.keys(state).forEach(k=>state[k]="");
  state.element="calm"; state.stage="base"; state.rarity="common"; state.layout="standard";
  setLayout("standard");
  drawText(); drawElement(); drawStage(); drawArt(); drawSocials(); drawAbility(); drawAttack1(); drawAttack2(); drawFlavour(); drawCredit();

  const t=el("bgTop"), b=el("bgBottom");
  if(t) t.value="#0a0d10"; if(b) b.value="#0b0f12";
  const tSw = el("bgTopSwatch"); if(tSw) tSw.style.background = t.value;
  const bSw = el("bgBottomSwatch"); if(bSw) bSw.style.background = b.value;
}

/* Init */
bindInputs();
setLayout("standard");
drawText(); drawElement(); drawStage(); drawArt(); drawSocials(); drawAbility(); drawAttack1(); drawAttack2(); drawFlavour(); drawCredit();
