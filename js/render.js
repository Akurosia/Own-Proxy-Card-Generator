import { $, el, toHex, show } from "./utils.js";
import { state, rarityDefaultColor } from "./state.js";

/* ----------- DOM drawing (keeps your live preview in sync) ----------- */

export function drawText(){
  el("titleName").textContent = state.name || " ";
  const mod = el("titleMod");
  mod.textContent = state.nameMod || "";
  mod.style.display = state.nameMod ? "inline-flex" : "none";
}

export function drawElement(){
  const b = el("elementBadge");
  b.textContent = (state.element || "").toUpperCase();
  b.className = "badge element " + state.element;
}

export function drawStage(){
  el("stageText").textContent = state.stage==="base" ? "Base" : (state.stage==="step1" ? "Step 1" : "Step 2");
  const row = el("prevImgRow");
  const t = el("prevThumb");
  const nonBase = state.stage !== "base";
  show(row, nonBase);
  if (nonBase && state.prevURL){ t.src = state.prevURL; t.style.display = "block"; }
  else { t.removeAttribute("src"); t.style.display = "none"; }
}

export function drawArt(){
  const img = el("artImg");
  if (state.artURL){ img.src = state.artURL; img.style.display = "block"; }
  else { img.removeAttribute("src"); img.style.display = "none"; }
}

export function drawSocials(){
  const pairs = [["ytName",state.youtube],["twName",state.twitch],["igName",state.instagram]];
  let any = false;
  pairs.forEach(([id,val])=>{
    const n = el(id);
    n.textContent = val || "";
    const showRow = !!(val && val.trim());
    n.parentElement.style.display = showRow ? "flex" : "none";
    if(showRow) any = true;
  });
  $(".card-socials").style.display = any ? "flex" : "none";
}

export function drawAbility(){
  const box = $(".card-ability");
  if(state.abilityName && state.abilityName.trim()){
    el("abilityTitle").textContent = state.abilityName;
    el("abilityDesc").textContent = state.abilityText || "";
    box.style.display = "block";
  } else { box.style.display = "none"; }
}

export function drawAttack1(){
  const box = $(".card-attack.attack1");
  const has = (state.attackName && state.attackName.trim()) || (state.attackEffect && state.attackEffect.trim());
  if(has){
    el("attackTitle").textContent = state.attackName || "";
    el("attackVal").textContent = state.attackValue || "";
    el("attackEffectText").textContent = state.attackEffect || "";
    box.style.display = "block";
  } else { box.style.display = "none"; }
}

export function drawAttack2(){
  const box = $(".card-attack.attack2");
  const has = (state.attack2Name && state.attack2Name.trim()) || (state.attack2Effect && state.attack2Effect.trim());
  if(has){
    el("attack2Title").textContent = state.attack2Name || "";
    el("attack2Val").textContent = state.attack2Value || "";
    el("attack2EffectText").textContent = state.attack2Effect || "";
    box.style.display = "block";
  } else { box.style.display = "none"; }
}

export function drawFlavour(){ el("flavourText").textContent = state.flavour || ""; }

export function drawCredit(){
  el("setNameText").textContent = state.setName || "";
  el("numOut").textContent = state.numXY || "";

  const icon = el("setIconImg");
  if(state.setIconURL){ icon.src = state.setIconURL; icon.style.display = "inline-block"; }
  else { icon.removeAttribute("src"); icon.style.display = "none"; }

  const wrap = $(".card-credit .rarity");
  const r = (state.rarity || "common");
  wrap.className = "rarity " + r;

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

  const fill = state.rarityColorOverride ? (state.rarityColor || rarityDefaultColor(r)) : rarityDefaultColor(r);
  ic.style.fill = fill;
  Array.from(ic.children).forEach(ch => ch.setAttribute('fill', fill));
}

/* --------- Color swatches for text targets (UI hook) --------- */
const colorTargets = [
  ["c_name","#titleName"], ["c_nameMod","#titleMod"],
  ["c_element","#elementBadge"], ["c_stage","#stageText"],
  ["c_abilityName","#abilityTitle"], ["c_abilityText","#abilityDesc"],
  ["c_attackName","#attackTitle"], ["c_attackValue","#attackVal"], ["c_attackEffect","#attackEffectText"],
  ["c_attack2Name","#attack2Title"], ["c_attack2Value","#attack2Val"], ["c_attack2Effect","#attack2EffectText"],
  ["c_flavour","#flavourText"], ["c_numXY","#numOut"], ["c_setName","#setNameText"],
  ["c_social_yt","#ytName"], ["c_social_tw","#twName"], ["c_social_ig","#igName"]
];

export function initTextColorSwatches(){
  colorTargets.forEach(([inputId, targetSel])=>{
    const input = el(inputId);
    const target = $(targetSel);
    const btn = el(inputId+"Sw");
    if(!input || !target || !btn) return;

    const cur = toHex(getComputedStyle(target).color);
    input.value = cur;
    btn.querySelector(".swatch").style.background = cur;

    btn.addEventListener("click", ()=> input.click());
    input.addEventListener("input", ()=>{
      const v = input.value;
      btn.querySelector(".swatch").style.background = v;
      target.style.color = v;
    });
  });
}
