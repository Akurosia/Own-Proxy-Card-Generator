/* Stream Saga – Card Front Generator (Repo)
   New export approach using html-to-image with dom-to-image-more fallback.
   This project is vibe coded.
*/

const el = id => document.getElementById(id);

const state = {
  name: "",
  nameMod: "",
  element: "calm",
  stage: "base",
  youtube: "", twitch: "", instagram: "",
  attackName: "", attackValue: "", attackEffect:"",
  abilityName: "", abilityText: "",
  flavour: "",
  numXY: "",
  setName: "",
  rarity: "common",
  artURL: "", prevURL: "", setIconURL: ""
};

/* --- Helpers to load libraries on demand --- */
function loadScript(src){
  return new Promise((resolve, reject)=>{
    if (document.querySelector('script[src="'+src+'"]')) return resolve();
    const s=document.createElement('script');
    s.src=src; s.async=true; s.onload=resolve; s.onerror=()=>reject(new Error('Failed to load '+src));
    document.head.appendChild(s);
  });
}
async function ensureExportLibs(){
  if(!window.htmlToImage){
    try {
        await loadScript('html-to-image.js');
    } catch{}
}
  if(!window.domtoimage){
    try {
        await loadScript('dom-to-image-more.js');
    } catch{}
  }
}


/* --- Bind inputs and draw functions --- */
function bindInputs(){
  const map = [
    ["name","input", v => { state.name=v; drawText(); }],
    ["nameMod","change", v => { state.nameMod=v; drawText(); }],
    ["element","change", v => { state.element=v; drawElement(); }],
    ["stage","change", v => { state.stage=v; drawStage(); }],
    ["abilityName","input", v => { state.abilityName=v; drawAbility(); }],
    ["abilityText","input", v => { state.abilityText=v; drawAbility(); }],
    ["attackName","input", v => { state.attackName=v; drawAttack(); }],
    ["attackValue","input", v => { state.attackValue=v; drawAttack(); }],
    ["attackEffect","input", v => { state.attackEffect=v; drawAttack(); }],
    ["flavour","input", v => { state.flavour=v; drawFlavour(); }],
    ["numXY","input", v => { state.numXY=v; drawCredit(); }],
    ["setName","input", v => { state.setName=v; drawCredit(); }],
    ["rarity","change", v => { state.rarity=v; drawCredit(); }],
    ["youtube","input", v => { state.youtube=v; drawSocials(); }],
    ["twitch","input", v => { state.twitch=v; drawSocials(); }],
    ["instagram","input", v => { state.instagram=v; drawSocials(); }],
  ];
  map.forEach(([id,ev,fn])=>{
    const n = document.getElementById(id);
    if(n) n.addEventListener(ev, e=>fn(e.target.value));
  });

  // files
  const files = [
    ["mainImg", url=>{ state.artURL=url; drawArt(); }],
    ["prevImg", url=>{ state.prevURL=url; drawStage(); }],
    ["setIcon", url=>{ state.setIconURL=url; drawCredit(); }]
  ];
  files.forEach(([id,cb])=>{
    const n=document.getElementById(id);
    if(!n) return;
    n.addEventListener("change", e => loadFile(e.target.files[0], cb));
  });

  // background colors
  const bgTop = document.getElementById("bgTop");
  const bgBottom = document.getElementById("bgBottom");
  if(bgTop) bgTop.addEventListener("input", e=>{ document.getElementById("card").style.setProperty("--bg-top", e.target.value); });
  if(bgBottom) bgBottom.addEventListener("input", e=>{ document.getElementById("card").style.setProperty("--bg-bottom", e.target.value); });

  const dl=document.getElementById("downloadBtn");
  if(dl) dl.addEventListener("click", downloadPNG);
  const reset=document.getElementById("resetBtn");
  if(reset) reset.addEventListener("click", resetForm);
}

function loadFile(file, cb){
  if(!file) return;
  const r=new FileReader();
  r.onload=()=>cb(r.result);
  r.readAsDataURL(file);
}

function drawText(){
  const tn=el("titleName"); if(tn) tn.textContent = state.name || " ";
  const tm=el("titleMod"); if(tm) tm.textContent = state.nameMod || "";
}
function drawElement(){
  const b = el("elementBadge");
  if(!b) return;
  b.textContent = (state.element||"").toUpperCase();
  b.className = "badge element " + state.element;
}
function drawStage(){
  const st=el("stageText"); if(st) st.textContent = state.stage==="base"?"Base":(state.stage==="step1"?"Step 1":"Step 2");
  const thumb=el("prevThumb");
  if(!thumb) return;
  if(state.stage!=="base" && state.prevURL){ thumb.src=state.prevURL; thumb.style.display="block"; }
  else{ thumb.removeAttribute("src"); thumb.style.display="none"; }
}
function drawArt(){
  const img=el("artImg");
  if(!img) return;
  if(state.artURL){ img.src=state.artURL; img.style.display="block"; }
  else{ img.removeAttribute("src"); img.style.display="none"; }
}
function drawSocials(){
  const pairs=[["ytName",state.youtube],["twName",state.twitch],["igName",state.instagram]];
  let any=false;
  pairs.forEach(([id,val])=>{
    const n=el(id); if(!n) return;
    n.textContent=val;
    const visible = !!(val && val.trim());
    const parent = n.parentElement;
    if(parent) parent.style.display=visible?"flex":"none";
    if(visible) any=true;
  });
  const container = document.querySelector(".card-socials");
  if(container) container.style.display = any ? "flex" : "none";
}
function drawAttack(){
  const box=document.querySelector(".card-attack");
  if(!box) return;
  const has = (state.attackName && state.attackName.trim()) || (state.attackEffect && state.attackEffect.trim());
  if(has){
    const t=el("attackTitle"); if(t) t.textContent=state.attackName||"";
    const v=el("attackVal"); if(v) v.textContent=state.attackValue||"";
    const e=el("attackEffectText"); if(e) e.textContent=state.attackEffect||"";
    box.style.display="block";
  } else {
    box.style.display="none";
  }
}
function drawAbility(){
  const box=document.querySelector(".card-ability");
  if(!box) return;
  if(state.abilityName && state.abilityName.trim()){
    const t=el("abilityTitle"); if(t) t.textContent=state.abilityName;
    const d=el("abilityDesc"); if(d) d.textContent=state.abilityText||"";
    box.style.display="block";
  } else {
    box.style.display="none";
  }
}
function drawFlavour(){ const f=el("flavourText"); if(f) f.textContent=state.flavour||""; }
function drawCredit(){
  const setN=el("setNameText"); if(setN) setN.textContent=state.setName||"";
  const num=el("numOut"); if(num) num.textContent=state.numXY||"";

  const icon=document.getElementById("setIconImg");
  if(icon){
    if(state.setIconURL){ icon.src=state.setIconURL; icon.style.display="inline-block"; }
    else { icon.removeAttribute("src"); icon.style.display="none"; }
  }

  const rarityBox=document.querySelector(".card-credit .rarity");
  if(rarityBox) rarityBox.className="rarity "+(state.rarity||"common");
  const svg=document.getElementById("rarityIcon");
  if(svg) svg.innerHTML='<path d="M12 .9l3 6.1 6.7 1-4.9 4.8 1.2 6.7L12 16.9 6 19.5l1.2-6.7L2.3 8l6.7-1L12 .9z"/>';
}

/* --- New export approach: html-to-image with fallback --- */
async function downloadPNG(){
  const card = el("card");
  if(!card) return;

  await ensureExportLibs();

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  const imgs = [el("artImg"), el("prevThumb"), el("setIconImg")].filter(Boolean);
  await Promise.all(imgs.map(img => {
    if (img.src && !img.complete) {
      return new Promise(res=>img.addEventListener("load", res, {once:true}));
    }
  }));

  // inline CSS vars / gradient in case the library loses them
  const cs = getComputedStyle(card);
  const top = (cs.getPropertyValue("--bg-top") || "#0a0d10").trim();
  const bottom = (cs.getPropertyValue("--bg-bottom") || "#0b0f12").trim();
  card.style.setProperty("--bg-top", top);
  card.style.setProperty("--bg-bottom", bottom);
  card.style.backgroundImage = `linear-gradient(180deg, ${top}, ${bottom})`;

  const filename = (state.name || "card") + ".png";

  try{
    const dataUrl = await window.htmlToImage.toPng(card, {
      pixelRatio: 2,
      backgroundColor: null,
      cacheBust: true
    });
    triggerDownload(dataUrl, filename);
  } catch(err){
    console.warn("html-to-image failed, falling back:", err);
    try{
      const dataUrl2 = await window.domtoimage.toPng(card, {
        quality: 1,
        bgcolor: "transparent",
        height: card.offsetHeight,
        width: card.offsetWidth,
        style: {
          "--bg-top": top,
          "--bg-bottom": bottom,
          "backgroundImage": `linear-gradient(180deg, ${top}, ${bottom})`
        }
      });
      triggerDownload(dataUrl2, filename);
    }catch(err2){
      console.error("Fallback export failed:", err2);
      alert("Export failed. Try adding an image, then click Download again.");
    }
  } finally {
    // don't need to revert inline vars for a static page, but we could
  }
}

function triggerDownload(dataUrl, filename){
  const link=document.createElement("a");
  link.download=filename;
  link.href=dataUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/* reset */
function resetForm(){
  Object.keys(state).forEach(k=>state[k]="");
  state.element="calm"; state.stage="base"; state.rarity="common";
  drawText(); drawElement(); drawStage(); drawArt(); drawSocials(); drawAttack(); drawAbility(); drawFlavour(); drawCredit();
}

/* init */
bindInputs();
drawText(); drawElement(); drawStage(); drawArt(); drawSocials(); drawAttack(); drawAbility(); drawFlavour(); drawCredit();
