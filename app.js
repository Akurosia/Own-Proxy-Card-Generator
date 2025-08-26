const el = id => document.getElementById(id);

const state = {
  name: "",
  nameMod: "",
  element: "calm",
  stage: "base",
  youtube: "", twitch: "", instagram: "",
  attackName: "", attackValue: "", attackText:"",
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
    ["attackName","input", v => { state.attackName=v; drawAttack(); }],
    ["attackValue","input", v => { state.attackValue=v; drawAttack(); }],
    ["abilityName","input", v => { state.abilityName=v; drawAbility(); }],
    ["abilityText","input", v => { state.abilityText=v; drawAbility(); }],
    ["flavour","input", v => { state.flavour=v; drawFlavour(); }],
    ["numXY","input", v => { state.numXY=v; drawFooter(); }],
    ["setName","input", v => { state.setName=v; drawFooter(); }],
    ["rarity","change", v => { state.rarity=v; drawFooter(); }],
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
  el("setIcon").addEventListener("change", e => loadFile(e.target.files[0], url=>{ state.setIconURL=url; drawFooter(); }));

  // background colors
  el("bgTop").addEventListener("input", e=>{ document.getElementById("card").style.setProperty("--bg-top", e.target.value); });
  el("bgBottom").addEventListener("input", e=>{ document.getElementById("card").style.setProperty("--bg-bottom", e.target.value); });

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
  if(state.attackName.trim()){
    el("attackTitle").textContent=state.attackName;
    el("attackVal").textContent=state.attackValue;
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

function drawFooter(){
  el("setNameText").textContent=state.setName||"";
  el("numOut").textContent=state.numXY||"";

  const icon=el("setIconImg");
  if(state.setIconURL){ icon.src=state.setIconURL; icon.style.display="inline-block"; }
  else { icon.removeAttribute("src"); icon.style.display="none"; }

  // rarity
  const rarityBox=document.querySelector(".rarity");
  rarityBox.className="rarity "+(state.rarity||"common");
  const svg=el("rarityIcon");
  // star icon
  svg.innerHTML='<path d="M12 .9l3 6.1 6.7 1-4.9 4.8 1.2 6.7L12 16.9 6 19.5l1.2-6.7L2.3 8l6.7-1L12 .9z"/>';
}

function downloadPNG(){
  const node=el("card");
  html2canvas(node,{backgroundColor:null,scale:2,width:node.offsetWidth,height:node.offsetHeight})
    .then(canvas=>{
      const link=document.createElement("a");
      link.download=(state.name||"card")+".png";
      link.href=canvas.toDataURL("image/png");
      link.click();
    });
}
function resetForm(){
  Object.keys(state).forEach(k=>state[k]="");
  state.element="calm"; state.stage="base"; state.rarity="common";
  drawText(); drawElement(); drawStage(); drawArt(); drawSocials(); drawAttack(); drawAbility(); drawFlavour(); drawFooter();
}

/* init */
bindInputs();
drawText(); drawElement(); drawStage(); drawArt(); drawSocials(); drawAttack(); drawAbility(); drawFlavour(); drawFooter();
