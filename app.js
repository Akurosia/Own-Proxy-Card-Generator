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
    el(id).addEventListener(ev, e=>fn(e.target.value));
  });

  // files
  el("mainImg").addEventListener("change", e => loadFile(e.target.files[0], url=>{ state.artURL=url; drawArt(); }));
  el("prevImg").addEventListener("change", e => loadFile(e.target.files[0], url=>{ state.prevURL=url; drawStage(); }));
  el("setIcon").addEventListener("change", e => loadFile(e.target.files[0], url=>{ state.setIconURL=url; drawCredit(); }));

  // background colors
  el("bgTop").addEventListener("input", e=>{ el("card").style.setProperty("--bg-top", e.target.value); });
  el("bgBottom").addEventListener("input", e=>{ el("card").style.setProperty("--bg-bottom", e.target.value); });

  el("downloadBtn").addEventListener("click", downloadPNG);
  el("resetBtn").addEventListener("click", resetForm);
}

function loadFile(file, cb){
  if(!file) return;
  const r=new FileReader();
  r.onload=()=>cb(r.result);
  r.readAsDataURL(file);
}

function drawText(){
  el("titleName").textContent = state.name || " ";
  el("titleMod").textContent = state.nameMod || "";
}
function drawElement(){
  const b = el("elementBadge");
  b.textContent = (state.element||"").toUpperCase();
  b.className = "badge element " + state.element;
}
function drawStage(){
  el("stageText").textContent = state.stage==="base"?"Base":(state.stage==="step1"?"Step 1":"Step 2");
  const thumb=el("prevThumb");
  if(state.stage!=="base" && state.prevURL){ thumb.src=state.prevURL; thumb.style.display="block"; }
  else{ thumb.removeAttribute("src"); thumb.style.display="none"; }
}
function drawArt(){
  const img=el("artImg");
  if(state.artURL){ img.src=state.artURL; img.style.display="block"; }
  else{ img.removeAttribute("src"); img.style.display="none"; }
}
function drawSocials(){
  const pairs=[["ytName",state.youtube],["twName",state.twitch],["igName",state.instagram]];
  let any=false;
  pairs.forEach(([id,val])=>{
    const n=el(id); n.textContent=val;
    const visible = !!val.trim();
    n.parentElement.style.display=visible?"flex":"none";
    if(visible) any=true;
  });
  const container = document.querySelector(".card-socials");
  container.style.display = any ? "flex" : "none";
}
function drawAttack(){
  const box=document.querySelector(".card-attack");
  const has = state.attackName.trim() || state.attackEffect.trim();
  if(has){
    el("attackTitle").textContent=state.attackName;
    el("attackVal").textContent=state.attackValue;
    el("attackEffectText").textContent=state.attackEffect||"";
    box.style.display="block";
  } else {
    box.style.display="none";
  }
}
function drawAbility(){
  const box=document.querySelector(".card-ability");
  if(state.abilityName.trim()){
    el("abilityTitle").textContent=state.abilityName;
    el("abilityDesc").textContent=state.abilityText;
    box.style.display="block";
  } else {
    box.style.display="none";
  }
}
function drawFlavour(){
  el("flavourText").textContent=state.flavour||"";
}
function drawCredit(){
  el("setNameText").textContent=state.setName||"";
  el("numOut").textContent=state.numXY||"";

  const icon=document.getElementById("setIconImg");
  if(state.setIconURL){ icon.src=state.setIconURL; icon.style.display="inline-block"; }
  else { icon.removeAttribute("src"); icon.style.display="none"; }

  // rarity
  const rarityBox=document.querySelector(".card-credit .rarity");
  rarityBox.className="rarity "+(state.rarity||"common");
  const svg=document.getElementById("rarityIcon");
  svg.innerHTML='<path d="M12 .9l3 6.1 6.7 1-4.9 4.8 1.2 6.7L12 16.9 6 19.5l1.2-6.7L2.3 8l6.7-1L12 .9z"/>';
}

/* Robust export with fallback */
async function downloadPNG(){
  const node=el("card");

  // wait for fonts
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  // ensure images loaded
  const img = el("artImg");
  if (img && img.src && !img.complete) {
    await new Promise(res=>img.addEventListener("load", res, {once:true}));
  }

  // compute and stamp resolved background into clone so CSS vars don't break
  const cs = getComputedStyle(node);
  const resolvedBg = cs.backgroundImage || cs.background;

  async function tryRender(options){
    const rect = node.getBoundingClientRect();
    return html2canvas(node, Object.assign({
      backgroundColor: null,
      scale: 2,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false,
      removeContainer: true,
      scrollX: 0,
      scrollY: 0,
      onclone: (doc) => {
        const clonedCard = doc.getElementById("card");
        if (clonedCard) {
          clonedCard.style.backgroundImage = resolvedBg;
          // also ensure inner panel exists with same styles
          const inner = clonedCard.querySelector(".card-inner");
          if(inner){
            inner.style.opacity = "0.25";
          }
        }
      }
    }, options));
  }

  let canvas = await tryRender({foreignObjectRendering:false}).catch(()=>null);
  // fallback attempt
  if (!canvas || canvas.width===0 || canvas.height===0) {
    canvas = await tryRender({foreignObjectRendering:true}).catch(()=>null);
  }
  // safety: if canvas still blank or tainted, notify
  if (!canvas) {
    alert("Export failed. Try adding an image and try again.");
    return;
  }

  try{
    const ctx = canvas.getContext("2d");
    const sample = ctx.getImageData(0,0,1,1).data;
    // if fully transparent, try the other mode once more
    if(sample[3]===0){
      canvas = await tryRender({foreignObjectRendering:!false}).catch(()=>canvas);
    }
  }catch(e){ /* ignore */ }

  const link=document.createElement("a");
  link.download=(state.name||"card")+".png";
  link.href=canvas.toDataURL("image/png");
  link.click();
}

function resetForm(){
  Object.keys(state).forEach(k=>state[k]="");
  state.element="calm"; state.stage="base"; state.rarity="common";
  drawText(); drawElement(); drawStage(); drawArt(); drawSocials(); drawAttack(); drawAbility(); drawFlavour(); drawCredit();
}

/* init */
bindInputs();
drawText(); drawElement(); drawStage(); drawArt(); drawSocials(); drawAttack(); drawAbility(); drawFlavour(); drawCredit();
