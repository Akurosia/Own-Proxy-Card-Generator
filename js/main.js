import { $, el, loadFileAsDataURL, toHex } from "./utils.js";
import { state, rarityDefaultColor } from "./state.js";
import { drawText, drawElement, drawStage, drawArt, drawSocials,
         drawAbility, drawAttack1, drawAttack2, drawFlavour, drawCredit,
         initTextColorSwatches } from "./render.js";
import { prefillNormal, prefillFullArt, prefillStandardBG, setLayout, drawAll } from "./templates.js";
import { exportCardPNGExact, exportCardPNGCompat } from "./exporter.js";

/* ---------- INPUT BINDINGS ---------- */
function bindInputs(){
  const map = [
    ["name","input", v => { state.name=v; drawText(); }],
    ["nameMod","input", v => { state.nameMod=v; drawText(); }],
    ["x","input", v => { state.x=v; drawSocials(); }],
    ["bluesky","input", v => { state.bluesky=v; drawSocials(); }],
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
      state.rarityColor = rarityDefaultColor(state.rarity);
      drawCredit(); syncRarityColorSwatch();
    }],
  ];
  map.forEach(([id,ev,fn])=>{
    const n=el(id); if(n) n.addEventListener(ev, e=>fn(e.target.value));
  });

  // Files + remove
  el("mainImg")?.addEventListener("change", async e => {
    state.artURL = await loadFileAsDataURL(e.target.files[0]); drawArt();
  });
  el("prevImg")?.addEventListener("change", async e => {
    state.prevURL = await loadFileAsDataURL(e.target.files[0]); drawStage();
  });
  el("setIcon")?.addEventListener("change", async e => {
    state.setIconURL = await loadFileAsDataURL(e.target.files[0]); drawCredit();
  });
  el("bgStandard")?.addEventListener("change", async e => {
    state.bgStandardURL = await loadFileAsDataURL(e.target.files[0]); drawAll();
  });
  el("nameModImg")?.addEventListener("change", async e => {
    state.nameModURL = await loadFileAsDataURL(e.target.files[0]); drawText();
  });

  const wireRemove = (btnId, fileId, clearFn) => {
    const b=el(btnId), f=el(fileId);
    if(!b||!f) return;
    b.addEventListener("click",(e)=>{ e.preventDefault(); e.stopPropagation(); try{ f.value=""; }catch(_){ } clearFn(); });
  };
  wireRemove("removeMainImg","mainImg", ()=>{ state.artURL=""; drawArt(); });
  wireRemove("removePrevImg","prevImg", ()=>{ state.prevURL=""; drawStage(); });
  wireRemove("removeSetIcon","setIcon", ()=>{ state.setIconURL=""; drawCredit(); });
  wireRemove("removeBgStandard","bgStandard", ()=>{ state.bgStandardURL=""; drawAll(); });
  wireRemove("removeNameModImg","nameModImg", ()=>{ state.nameModURL=""; drawText(); });
  // Colors
  setupSwatch("bgTop","bgTopSwatch", updateBgColors);
  setupSwatch("bgBottom","bgBottomSwatch", updateBgColors);
  setupSwatch("bgBorderTop","bgBorderTopSwatch", updateBgColors);
  setupSwatch("bgBorderBottom","bgBorderBottomSwatch", updateBgColors);
  updateBgColors();
  initTextColorSwatches();

  // Rarity color override swatch
  const rarityInput = el("c_rarity");
  const rarityBtn = el("c_raritySw");
  if (rarityInput && rarityBtn){
    rarityBtn.addEventListener("click", ()=> rarityInput.click());
    rarityInput.addEventListener("input", ()=>{
      state.rarityColor = rarityInput.value;
      state.rarityColorOverride = true;
      drawCredit();
      syncRarityColorSwatch();
    });
  }

  // Buttons
  el("prefillNormalBtn")?.addEventListener("click", prefillNormal);
  el("prefillFullBtn")?.addEventListener("click", prefillFullArt);
  el("prefillStandardBgBtn")?.addEventListener("click", prefillStandardBG);
  el("resetBtn")?.addEventListener("click", resetForm);
  // Use EXACT-SIZE exporter for the Download button
  el("downloadBtn")?.addEventListener("click", () =>
    exportCardPNGExact({ fileName: (state.name || "card") + ".png" })
  );
  // (Optional) If you add another button with id="downloadCompatBtn", wire it like:
  // el("downloadCompatBtn")?.addEventListener("click", () =>
  //   exportCardPNGCompat({ fileName: (state.name || "card") + "_compat.png" })
  // );
}
el("toggleFrameBtn")?.addEventListener("click", () => {
  el("card").classList.toggle("no-frame");
});


function setupSwatch(inputId, swatchBtnId, onChange){
  const input = el(inputId); const btn = el(swatchBtnId); if(!input||!btn) return;
  const box = btn.querySelector('.swatch');
  const sync = ()=>{ if(box) box.style.background = input.value || "#000"; if(onChange) onChange(); };
  btn.addEventListener('click', ()=> input.click());
  input.addEventListener('input', sync);
  if(box) box.style.background = input.value || "#000";

}function updateBgColors(){
  const top = el("bgTop").value || "#0a0d10";
  const bottom = el("bgBottom").value || "#0b0f12";
  const top_border = el("bgBorderTop").value || "#9a9a9a";
  const bottom_border = el("bgBorderBottom").value || "#4b4b4b";
  const card = el("card");
  card.style.setProperty("--bg-top", top);
  card.style.setProperty("--bg-bottom", bottom);
  card.style.setProperty("--bg-top-border", top_border);
  card.style.setProperty("--bg-bottom-border", bottom_border);
}

/* ---- Color swatch helper for rarity ---- */
function syncRarityColorSwatch(){
  const input = el("c_rarity");
  const sw = el("c_raritySw")?.querySelector(".swatch");
  if(!input || !sw) return;
  const color = state.rarityColorOverride ? state.rarityColor : rarityDefaultColor(state.rarity);
  input.value = color; sw.style.background = color;
}

/* ---- Reset ---- */
function resetForm(){
  document.querySelectorAll('input[type="text"],input[type="url"],input[type="number"]').forEach(i=> i.value="");
  document.querySelectorAll('textarea').forEach(t=> t.value="");
  document.querySelectorAll('select').forEach(s=> s.selectedIndex = 0);
  document.querySelectorAll('input[type="file"]').forEach(f=> f.value="");

  Object.assign(state, {
    name:"", nameMod:"", element: el("element")?.value || "calm",
    stage: el("stage")?.value || "base",
    layout: el("layoutMode")?.value || "standard",
    youtube:"", twitch:"", instagram:"", x:"", bluesky:"",
    abilityName:"", abilityText:"",
    attackName:"", attackValue:"", attackEffect:"",
    attack2Name:"", attack2Value:"", attack2Effect:"",
    flavour:"", numXY:"", setName:"",
    rarity: el("rarity")?.value || "common",
    artURL:"", prevURL:"", setIconURL:"", bgStandardURL: "", nameModURL: "",
    rarityColorOverride:false,
    rarityColor: rarityDefaultColor(el("rarity")?.value || "common")
  });

  setLayout(state.layout);
  drawAll();
  syncRarityColorSwatch();
}

/* ---- Bootstrap ---- */
bindInputs();
setLayout("standard");
drawAll();
syncRarityColorSwatch();
