/* Stream Saga — robust export (4× render, clean clone, opaque sRGB with 2px bleed),
   hardened remove buttons, color toggles, robust reset, demo prefills */

const el = id => document.getElementById(id);

const state = {
  name: "", nameMod: "", element: "calm", stage: "base", layout: "standard",
  youtube: "", twitch: "", instagram: "",
  abilityName: "", abilityText: "",
  attackName: "", attackValue: "", attackEffect: "",
  attack2Name: "", attack2Value: "", attack2Effect: "",
  flavour: "", numXY: "", setName: "",
  rarity: "common",
  artURL: "", prevURL: "", setIconURL: "",
  rarityColorOverride: false, rarityColor: "#c9c9c9"
};

function bindInputs(){
  const map = [
    ["name","input", v => { state.name=v; drawText(); }],
    ["nameMod","input", v => { state.nameMod=v; drawText(); }],
    ["element","change", v => { state.element=v; drawElement(); }],
    ["stage","change", v => { state.stage=v; drawStage(); }],
    ["layoutMode","change", v => { setLayout(v); }],
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
    ["numXY","input", v => { state.numXY=v; drawCredit(); }],
    ["setName","input", v => { state.setName=v; drawCredit(); }],
    ["rarity","change", v => {
      state.rarity=v;
      state.rarityColorOverride=false;
      state.rarityColor = currentRarityDefaultColor(state.rarity);
      drawCredit(); syncRarityColorSwatch();
    }],
  ];
  map.forEach(([id,ev,fn])=>{ const n=el(id); if(n) n.addEventListener(ev, e=>fn(e.target.value)); });

  // Files + remove
  el("mainImg").addEventListener("change", e => loadFile(e.target.files[0], u=>{ state.artURL=u; drawArt(); }));
  el("prevImg").addEventListener("change", e => loadFile(e.target.files[0], u=>{ state.prevURL=u; drawStage(); }));
  el("setIcon").addEventListener("change", e => loadFile(e.target.files[0], u=>{ state.setIconURL=u; drawCredit(); }));

  const wireRemove = (btnId, fileId, clearFn) => {
    const b=el(btnId), f=el(fileId);
    if(!b || !f) return;
    b.addEventListener("click", (e)=>{
      e.preventDefault(); e.stopPropagation();
      try { f.value=""; } catch(_) {}
      clearFn();
    }, {passive:false});
  };
  wireRemove("removeMainImg","mainImg", ()=>{ state.artURL=""; drawArt(); });
  wireRemove("removePrevImg","prevImg", ()=>{ state.prevURL=""; drawStage(); });
  wireRemove("removeSetIcon","setIcon", ()=>{ state.setIconURL=""; drawCredit(); });

  // Colors
  setupSwatch("bgTop","bgTopSwatch", updateBgColors);
  setupSwatch("bgBottom","bgBottomSwatch", updateBgColors);
  setupSwatch("bgBorderTop","bgBorderTopSwatch", updateBgColors);
  setupSwatch("bgBorderBottom","bgBorderBottomSwatch", updateBgColors);
  updateBgColors();
  initTextColorSwatches();

  // Rarity color override
  setupSwatch("c_rarity","c_raritySw", ()=> {
    const val = el("c_rarity").value;
    const svg = el("rarityIcon");
    state.rarityColor = val; state.rarityColorOverride = true;
    if(svg){ svg.style.fill = val; Array.from(svg.children).forEach(ch => ch.setAttribute('fill', val)); }
  });

  // Buttons
  el("resetBtn").addEventListener("click", resetForm);
  el("prefillNormalBtn").addEventListener("click", prefillNormal);
  el("prefillFullBtn").addEventListener("click", prefillFullArt);
  el("downloadBtn").addEventListener("click", downloadPNG);

  setTimeout(()=>{ drawStage(); setLayout(el("layoutMode")?.value || "standard"); },0);
}

function loadFile(file, cb){ if(!file) return; const r=new FileReader(); r.onload=()=>cb(r.result); r.readAsDataURL(file); }

function setupSwatch(inputId, swatchBtnId, onChange){
  const input = el(inputId); const btn = el(swatchBtnId); if(!input||!btn) return;
  const box = btn.querySelector('.swatch');
  const sync = ()=>{ if(box) box.style.background = input.value || "#000"; if(onChange) onChange(); };
  btn.addEventListener('click', ()=> input.click());
  input.addEventListener('input', sync);
  if(box) box.style.background = input.value || "#000";
}

const textColorMap = [
  ["c_name","c_nameSw","#titleName"],
  ["c_nameMod","c_nameModSw","#titleMod"],
  ["c_element","c_elementSw","#elementBadge"],
  ["c_stage","c_stageSw","#stageText"],
  ["c_abilityName","c_abilityNameSw","#abilityTitle"],
  ["c_abilityText","c_abilityTextSw","#abilityDesc"],
  ["c_attackName","c_attackNameSw","#attackTitle"],
  ["c_attackValue","c_attackValueSw","#attackVal"],
  ["c_attackEffect","c_attackEffectSw","#attackEffectText"],
  ["c_attack2Name","c_attack2NameSw","#attack2Title"],
  ["c_attack2Value","c_attack2ValueSw","#attack2Val"],
  ["c_attack2Effect","c_attack2EffectSw","#attack2EffectText"],
  ["c_flavour","c_flavourSw","#flavourText"],
  ["c_numXY","c_numXYSw","#numOut"],
  ["c_setName","c_setNameSw","#setNameText"],
  ["c_social_yt","c_social_ytSw","#ytName"],
  ["c_social_tw","c_social_twSw","#twName"],
  ["c_social_ig","c_social_igSw","#igName"],
  ["c_social_x","c_social_xSw","#xName"],
  ["c_social_bs","c_social_bsSw","#bsName"],
];
function initTextColorSwatches(){
  textColorMap.forEach(([i, s, sel])=>{
    const input = el(i), sw = el(s), target = document.querySelector(sel);
    if(!input || !sw || !target) return;
    const cur = toHex(getComputedStyle(target).color);
    input.value = cur;
    const box = sw.querySelector('.swatch'); if(box) box.style.background = cur;
    sw.addEventListener('click', ()=> input.click());
    input.addEventListener('input', ()=> { const v=input.value; if(box) box.style.background=v; target.style.color=v; });
  });
}

function show(node, flag){ if(!node) return; node.style.display = flag ? "" : "none"; }

function updateBgColors(){
  const top = el("bgTop").value || "#0a0d10";
  const bottom = el("bgBottom").value || "#0b0f12";
  const card = el("card");
  card.style.setProperty("--bg-top", top);
  card.style.setProperty("--bg-bottom", bottom);
}

function setLayout(mode){
  state.layout = mode === "full" ? "full" : "standard";
  const card = el("card");
  card.classList.toggle("fullart", state.layout === "full");
  const sel = el("layoutMode"); if (sel && sel.value !== state.layout) sel.value = state.layout;
  show(el("bgTopRow"), state.layout !== "full");
  show(el("bgBottomRow"), state.layout !== "full");
  show(el("bgBorderTopRow"), state.layout !== "full");
  show(el("bgBorderBottomRow"), state.layout !== "full");
}

function drawStage(){
  el("stageText").textContent = state.stage==="base"?"Base":(state.stage==="step1"?"Step 1":"Step 2");
  const t=el("prevThumb"); const row = el("prevImgRow"); const nonBase = state.stage !== "base";
  show(row, nonBase);
  if(nonBase && state.prevURL){ t.src=state.prevURL; t.style.display="block"; } else { t.removeAttribute("src"); t.style.display="none"; }
}

function drawText(){ el("titleName").textContent = state.name || " "; const m=el("titleMod"); m.textContent=state.nameMod||""; m.style.display = state.nameMod ? "inline-flex":"none"; }
function drawElement(){ const b=el("elementBadge"); b.textContent=(state.element||"").toUpperCase(); b.className="badge element "+state.element; }
function drawArt(){ const img=el("artImg"); if(state.artURL){ img.src=state.artURL; img.style.display="block"; } else { img.removeAttribute("src"); img.style.display="none"; } }
function drawSocials(){
  const pairs=[["ytName",state.youtube],["twName",state.twitch],["igName",state.instagram],["bsName",state.bluesky]];
  let any=false;
  pairs.forEach(([id,val])=>{ const n=el(id); n.textContent=val||""; const showRow=!!(val && val.trim()); n.parentElement.style.display=showRow?"flex":"none"; if(showRow) any=true; });
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
  if(has){ el("attackTitle").textContent=state.attackName||""; el("attackVal").textContent=state.attackValue||""; el("attackEffectText").textContent=state.attackEffect||""; box.style.display="block"; }
  else { box.style.display="none"; }
}
function drawAttack2(){
  const box=document.querySelector(".card-attack.attack2");
  const has = (state.attack2Name && state.attack2Name.trim()) || (state.attack2Effect && state.attack2Effect.trim());
  if(has){ el("attack2Title").textContent=state.attack2Name||""; el("attack2Val").textContent=state.attack2Value||""; el("attack2EffectText").textContent=state.attack2Effect||""; box.style.display="block"; }
  else { box.style.display="none"; }
}
function drawFlavour(){ el("flavourText").textContent=state.flavour || ""; }

function drawCredit(){
  el("setNameText").textContent=state.setName||""; el("numOut").textContent=state.numXY||"";
  const icon=el("setIconImg");
  if(state.setIconURL){ icon.src=state.setIconURL; icon.style.display="inline-block"; } else { icon.removeAttribute("src"); icon.style.display="none"; }
  const wrap=document.querySelector(".card-credit .rarity"); const r=(state.rarity||"common");
  wrap.className="rarity "+r;
  const ic = el("rarityIcon");
  let svg="";
  switch(r){
    case "common":   svg='<circle cx="12" cy="12" r="7.5"/>'; break;
    case "uncommon": svg='<path d="M12 3l7 9-7 9-7-9 7-9z"/>'; break;
    case "rare":     svg='<path d="M12 2.5l3.1 6.3 7 1-5.1 5 1.2 7-6.2-3.3-6.2 3.3 1.2-7-5.1-5 7-1L12 2.5z"/>'; break;
    case "ultra":    svg='<path d="M3 17h18v2H3v-2zM3 9l4 3 5-6 5 6 4-3v7H3V9z"/>'; break;
    case "epic":     svg='<path d="M12 2l7 4v8l-7 4-7-4V6z"/>'; break;
    case "mythic":   svg='<path d="M12 3l9 16H3z"/>'; break;
    case "secret":   svg='<path d="M12 5c-5 0-9 7-9 7s4 7 9 7 9-7 9-7-4-7-9-7zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>'; break;
    default:         svg='<circle cx="12" cy="12" r="7.5"/>';
  }
  ic.innerHTML = svg;
  const fill = state.rarityColorOverride ? (state.rarityColor || currentRarityDefaultColor(r)) : currentRarityDefaultColor(r);
  ic.style.fill = fill; Array.from(ic.children).forEach(ch => ch.setAttribute('fill', fill));
}

function currentRarityDefaultColor(r){
  return ({ common:"#c9c9c9", uncommon:"#8cd6ff", rare:"#ffd700", ultra:"#ff3b3b", epic:"#b388ff", mythic:"#ff9f43", secret:"#2fd2c9" }[r] || "#c9c9c9");
}

/* Inline external SVGs so the exporter captures them */
async function inlineSocialSVGIcons(root){
  const imgs = Array.from(root.querySelectorAll("img.icon"));
  const svgImgs = imgs.filter(img => /\.svg(\?.*)?$/i.test(img.getAttribute("src") || ""));
  await Promise.all(svgImgs.map(async img => {
    try{
      const res = await fetch(img.src, {cache:"no-store"}); const text = await res.text();
      const doc = new DOMParser().parseFromString(text, "image/svg+xml"); const svg = doc.documentElement;
      if(!svg || svg.nodeName.toLowerCase() !== "svg") return;
      svg.removeAttribute("width"); svg.removeAttribute("height"); svg.setAttribute("preserveAspectRatio","xMidYMid meet");
      svg.setAttribute("class", ((img.getAttribute("class")||"") + " svg-inline").trim());
      const alt = img.getAttribute("alt") || ""; if(alt){ svg.setAttribute("role","img"); svg.setAttribute("aria-label", alt); }
      svg.style.width = getComputedStyle(img).width || "18px";
      svg.style.height = getComputedStyle(img).height || "18px";
      svg.style.display = "block";
      img.replaceWith(svg);
    }catch(e){ console.warn("Inline SVG failed for", img.src, e); }
  }));
}

function toHex(rgb){
  const m = rgb && rgb.match && rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if(!m) return "#ffffff";
  const r = (+m[1]).toString(16).padStart(2,"0");
  const g = (+m[2]).toString(16).padStart(2,"0");
  const b = (+m[3]).toString(16).padStart(2,"0");
  return `#${r}${g}${b}`;
}
function syncRarityColorSwatch(){
  const input = el("c_rarity"); const swBtn = el("c_raritySw"); if(!input || !swBtn) return;
  const color = state.rarityColorOverride ? (state.rarityColor || currentRarityDefaultColor(state.rarity)) : currentRarityDefaultColor(state.rarity);
  input.value = color; const box = swBtn.querySelector('.swatch'); if(box) box.style.background = color;
}

/* --- Export helpers --- */
function loadScript(src){
  return new Promise((res,rej)=>{
    if(document.querySelector('script[src="'+src+'"]')) return res();
    const s=document.createElement('script'); s.src=src; s.async=true; s.onload=res; s.onerror=()=>rej(new Error('Failed to load '+src));
    document.head.appendChild(s);
  });
}
async function ensureExportLibs(){ if(!window.htmlToImage) await loadScript('html-to-image.js'); if(!window.domtoimage) await loadScript('dom-to-image-more.js'); }

function cssVarPx(name){
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const m = v.match(/([\d.]+)/); return m ? Math.round(parseFloat(m[1])) : 0;
}
function makeGradient(ctx, w, h, top, bottom){
  const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0, top); g.addColorStop(1, bottom); return g;
}

/* Remove decorative & costly effects from clone to avoid tiling seams */
function cleanCloneForExport(root){
  const inner = root.querySelector('.card-inner'); if(inner) inner.remove();
  root.querySelectorAll('*').forEach(n=>{
    n.style.boxShadow = 'none';
    n.style.textShadow = 'none';
    n.style.filter = 'none';
    n.style.backdropFilter = 'none';
  });
}

/* —— Export: render @4x → flatten to opaque sRGB at exact size with 2px bleed —— */
async function downloadPNG(){
  const card = el("card"); if(!card) return;
  await ensureExportLibs(); if(document.fonts && document.fonts.ready) await document.fonts.ready;

  const w = cssVarPx("--card-w") || card.offsetWidth;
  const h = cssVarPx("--card-h") || card.offsetHeight;

  const clone = card.cloneNode(true);
  const cs = getComputedStyle(card);
  const top = (cs.getPropertyValue('--bg-top')||'#0a0d10').trim();
  const bottom = (cs.getPropertyValue('--bg-bottom')||'#0b0f12').trim();

  Object.assign(clone.style, {
    position:"fixed", left:"-10000px", top:"0",
    transform:"none", width:w+"px", height:h+"px",
    borderRadius:"0",
    background:"transparent",           // make base transparent
    backgroundImage:"none",             // rely on our painted gradient
    outline:"none"
  });
  clone.style.setProperty("--bg-top", top);
  clone.style.setProperty("--bg-bottom", bottom);
  document.body.appendChild(clone);

  cleanCloneForExport(clone);
  await inlineSocialSVGIcons(clone);

  const imgs = Array.from(clone.querySelectorAll("img")).filter(i=>i.src && !i.complete);
  await Promise.all(imgs.map(i=> new Promise(r=> i.addEventListener("load", r, {once:true}))));

  try{
    const SCALE = 4; // oversample strongly
    const bigCanvas = await window.htmlToImage.toCanvas(clone, {
      width: w * SCALE, height: h * SCALE, pixelRatio: SCALE,
      cacheBust: true,
      style: { transform:"none", width:w+"px", height:h+"px", borderRadius:"0" }
    });

    // Flatten to opaque sRGB @ exact size
    const out = document.createElement('canvas'); out.width = w; out.height = h;
    const ctx = out.getContext('2d', { alpha:false, colorSpace:'srgb' }) || out.getContext('2d');
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = makeGradient(ctx, w, h, top, bottom); ctx.fillRect(0,0,w,h);

    // 2px BLEED to ensure no edge transparency survives resamplers
    ctx.drawImage(bigCanvas, -2, -2, w + 4, h + 4);

    triggerDownload(out.toDataURL('image/png'), (state.name || 'card') + '.png');
  }catch(e1){
    try{
      const dataUrl2 = await window.domtoimage.toPng(clone, {
        quality:1, bgcolor:null, width:w, height:h,
        style:{ transform:"none", width:w+"px", height:h+"px", borderRadius:"0" }
      });
      const img = new Image(); await new Promise((res,rej)=>{ img.onload=res; img.onerror=rej; img.src=dataUrl2; });

      const out = document.createElement('canvas'); out.width = w; out.height = h;
      const ctx = out.getContext('2d', { alpha:false, colorSpace:'srgb' }) || out.getContext('2d');
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.fillStyle = makeGradient(ctx, w, h, top, bottom); ctx.fillRect(0,0,w,h);
      ctx.drawImage(img, -2, -2, w + 4, h + 4); // same bleed on fallback
      triggerDownload(out.toDataURL('image/png'), (state.name || 'card') + '.png');
    }catch(e2){
      alert('Export failed. Ensure html-to-image.js and dom-to-image-more.js are present.');
      console.error(e1, e2);
    }
  } finally { clone.remove(); }
}

function triggerDownload(dataUrl, filename){ const a=document.createElement('a'); a.download=filename; a.href=dataUrl; document.body.appendChild(a); a.click(); a.remove(); }

/* Reset all fields */
function resetForm(){
  document.querySelectorAll('input[type="text"],input[type="url"],input[type="number"]').forEach(i=> i.value="");
  document.querySelectorAll('textarea').forEach(t=> t.value="");
  document.querySelectorAll('select').forEach(s=> s.selectedIndex = 0);
  document.querySelectorAll('input[type="file"]').forEach(f=> f.value="");

  Object.assign(state, {
    name:"", nameMod:"", element: el("element")?.value || "calm",
    stage: el("stage")?.value || "base", layout: el("layoutMode")?.value || "standard",
    youtube:"", twitch:"", instagram:"",
    abilityName:"", abilityText:"",
    attackName:"", attackValue:"", attackEffect:"",
    attack2Name:"", attack2Value:"", attack2Effect:"",
    flavour:"", numXY:"", setName:"",
    rarity: el("rarity")?.value || "common",
    artURL:"", prevURL:"", setIconURL:"",
    rarityColorOverride:false,
    rarityColor: currentRarityDefaultColor(el("rarity")?.value || "common")
  });

  setLayout(state.layout); updateBgColors();
  drawText(); drawElement(); drawStage(); drawArt(); drawSocials(); drawAbility(); drawAttack1(); drawAttack2(); drawFlavour(); drawCredit();
  initTextColorSwatches(); syncRarityColorSwatch();
}

/* ---------- Demo prefills ---------- */
function makeDataImage(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; const ctx=c.getContext('2d'); draw(ctx,w,h); return c.toDataURL('image/png'); }

function prefillNormal(){
  setLayout("standard");
  state.name="Neon Duck"; state.nameMod="EX"; state.element="chaotic"; state.stage="step1";
  state.youtube="NeonDuckYT"; state.twitch="NeonDuckLive"; state.instagram="neon.duck";
  state.numXY="12/99"; state.setName="Night Circuit"; state.rarity="rare"; state.rarityColorOverride=false;
  state.rarityColor = currentRarityDefaultColor(state.rarity);

  state.abilityName="Overclock Aura"; state.abilityText="Once per turn, your next attack deals +20 if you changed a setting.";
  state.attackName="Circuit Peck"; state.attackValue="70"; state.attackEffect="Flip a coin. If heads, the target is stunned next turn.";
  state.attack2Name="Neon Burst"; state.attack2Value="90"; state.attack2Effect="Discard 1 card at random from your hand.";
  state.flavour="Raised on city neon and late-night streams, this duck quacks in binary and dreams in blue-and-red.";

  ["name","nameMod","element","stage","youtube","twitch","instagram","numXY","setName","rarity","abilityName","abilityText","attackName","attackValue","attackEffect","attack2Name","attack2Value","attack2Effect","flavour"]
    .forEach(id=>el(id)&& (el(id).value=state[id] ?? ""));

  state.artURL = makeDataImage(1200,800,(ctx,w,h)=>{ const g=ctx.createLinearGradient(0,0,w,h); g.addColorStop(0,'#0a0d10'); g.addColorStop(1,'#243f66'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.globalAlpha=.25; ctx.strokeStyle='#39b8ff'; ctx.lineWidth=40; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(w,h); ctx.moveTo(w,0); ctx.lineTo(0,h); ctx.stroke(); ctx.globalAlpha=1; });
  state.setIconURL = makeDataImage(128,128,(ctx,w,h)=>{ ctx.fillStyle='#12171c'; ctx.fillRect(0,0,w,h); ctx.strokeStyle='#39b8ff'; ctx.lineWidth=10; ctx.strokeRect(14,14,w-28,h-28); ctx.strokeStyle='#ff3b3b'; ctx.beginPath(); ctx.moveTo(28,28); ctx.lineTo(w-28,h-28); ctx.moveTo(w-28,28); ctx.lineTo(28,h-28); ctx.stroke(); });
  state.prevURL = makeDataImage(256,256,(ctx,w,h)=>{ const g=ctx.createLinearGradient(0,0,w,0); g.addColorStop(0,'#111b24'); g.addColorStop(1,'#2a1a1a'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); });

  drawText(); drawElement(); drawStage(); drawArt(); drawSocials(); drawAbility(); drawAttack1(); drawAttack2(); drawFlavour(); drawCredit();
  initTextColorSwatches(); syncRarityColorSwatch();
}

function prefillFullArt(){
  setLayout("full");
  state.name="Skyline Duck"; state.nameMod="MAX"; state.element="friendly"; state.stage="base";
  state.youtube="SkylineStreams"; state.twitch="SkylineDuck"; state.instagram="sky.duck";
  state.numXY="01/45"; state.setName="City Lights"; state.rarity="ultra"; state.rarityColorOverride=false;
  state.rarityColor = currentRarityDefaultColor(state.rarity);

  state.abilityName="City Sync"; state.abilityText="While this card is Active, your attacks cost 1 less energy if you streamed this turn.";
  state.attackName="Billboard Bash"; state.attackValue="110"; state.attackEffect="If you have more followers than your opponent, draw a card.";
  state.attack2Name="Overtime Glow"; state.attack2Value="60"; state.attack2Effect="Heal 20 damage from one of your benched allies.";
  state.flavour="Lit by the skyline, boosted by chat—this duck never logs off.";

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
  initTextColorSwatches(); syncRarityColorSwatch();
}

/* Init */
bindInputs(); setLayout("standard");
state.rarityColor = currentRarityDefaultColor(state.rarity);
drawText(); drawElement(); drawStage(); drawArt(); drawSocials(); drawAbility(); drawAttack1(); drawAttack2(); drawFlavour(); drawCredit();
syncRarityColorSwatch();
