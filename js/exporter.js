// js/exporter.js
// Two exporters:
//  - exportCardPNGExact: outputs EXACT --card-w × --card-h (no bleed, no resample)
//  - exportCardPNGCompat: high-compat mode (3× render, 2px bleed) if you need it

import { cssVarPx } from "./utils.js";

/* -------- script loader (only dom-to-image-more needed) -------- */
function loadScript(src){
  return new Promise((res,rej)=>{
    if(document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = res; s.onerror = () => rej(new Error("Failed to load "+src));
    document.head.appendChild(s);
  });
}
async function ensureExportLibs(){
  if(!window.domtoimage) await loadScript('dom-to-image-more.js');
}

/* -------- utilities -------- */
function makeGradient(ctx, w, h, top, bottom){
  const g = ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0, top); g.addColorStop(1, bottom);
  return g;
}

function cleanClone(root){
  const inner = root.querySelector('.card-inner'); if(inner) inner.remove();
  root.querySelectorAll('*').forEach(n=>{
    n.style.boxShadow = 'none';
    n.style.textShadow = 'none';
    n.style.filter = 'none';
    n.style.backdropFilter = 'none';
  });
  root.style.borderRadius = '0';
  root.style.background = 'transparent';
}

/** Blob → data: URL */
function blobToDataURL(blob){
  return new Promise((res,rej)=>{
    const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=()=>rej(r.error||new Error("blob->dataURL failed")); r.readAsDataURL(blob);
  });
}
/** raw SVG text → data: URL */
function svgTextToDataURL(text){
  const b64 = btoa(unescape(encodeURIComponent(text)));
  return `data:image/svg+xml;base64,${b64}`;
}
/** Fetch any image (same-origin or CORS-enabled) → data URL */
async function fetchToDataURL(src){
  try{
    const abs = new URL(src, window.location.href).toString();
    const resp = await fetch(abs, { cache:'no-store', mode:'cors' });
    if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const ct = (resp.headers.get('content-type')||'').toLowerCase();
    if(ct.includes('svg')){
      const text = await resp.text();
      return { ok:true, dataURL: svgTextToDataURL(text) };
    }
    const blob = await resp.blob();
    const dataURL = await blobToDataURL(blob);
    return { ok:true, dataURL };
  }catch(err){
    return { ok:false, error: `${src} (${err?.message || 'fetch failed'})` };
  }
}
/** Inline every <img> as data URL; return failing URLs (if any) */
async function inlineAllImages(root){
  const imgs = Array.from(root.querySelectorAll('img'));
  const failures = [];
  for(const img of imgs){
    const src = img.getAttribute('src');
    if(!src) continue;
    if(/^data:/i.test(src)) continue; // already safe
    const res = await fetchToDataURL(src);
    if(res.ok){ img.setAttribute('src', res.dataURL); }
    else { failures.push(res.error); }
  }
  return failures;
}

/* -------- EXACT SIZE EXPORT (745×1040) -------- */
export async function exportCardPNGExact({ fileName = "card.png" } = {}){
  const card = document.getElementById("card"); if(!card) return;

  await ensureExportLibs();
  if(document.fonts && document.fonts.ready) await document.fonts.ready;

  // Strictly read CSS pixel size (not scaled viewport)
  const w = cssVarPx("--card-w") || card.offsetWidth;
  const h = cssVarPx("--card-h") || card.offsetHeight;

  // read gradient from the live node
  const cs = getComputedStyle(card);
  const top = (cs.getPropertyValue('--bg-top')||'#0a0d10').trim();
  const bottom = (cs.getPropertyValue('--bg-bottom')||'#0b0f12').trim();

  // offscreen clone at exact size
  const clone = card.cloneNode(true);
  Object.assign(clone.style, {
    position:"fixed", left:"-10000px", top:"0",
    width:w+"px", height:h+"px", transform:"none", borderRadius:"0", background:"transparent"
  });
  document.body.appendChild(clone);

  try{
    cleanClone(clone);

    // Inline all <img> to avoid CORS taint
    const failures = await inlineAllImages(clone);
    if(failures.length){
      alert(
        "Export blocked by cross-origin images.\n\n" +
        "Please upload those images via the file pickers or host them with CORS enabled:\n\n" +
        failures.join("\n")
      );
      return;
    }

    // Ensure inline images are loaded
    const pending = Array.from(clone.querySelectorAll('img')).filter(i=>i.src && !i.complete);
    await Promise.all(pending.map(i=> new Promise(r=> i.addEventListener('load', r, {once:true}))));

    // Render at EXACT node size (no oversample, no bleed)
    const dataUrl = await window.domtoimage.toPng(clone, {
      width: w,
      height: h,
      style: { transform:"none", width:w+"px", height:h+"px", borderRadius:"0", background:"transparent" },
      quality: 1,
      cacheBust: true
    });

    // Flatten onto opaque sRGB canvas at the same exact size
    const srcImg = new Image();
    await new Promise((res,rej)=>{ srcImg.onload=res; srcImg.onerror=rej; srcImg.src=dataUrl; });

    const out = document.createElement('canvas'); out.width = w; out.height = h;
    const ctx = out.getContext('2d', { alpha:false, colorSpace:'srgb' }) || out.getContext('2d');

    // Bake background gradient, then draw image exactly (no bleed)
    ctx.fillStyle = makeGradient(ctx, w, h, top, bottom);
    ctx.fillRect(0,0,w,h);
    ctx.drawImage(srcImg, 0, 0, w, h);

    // Download
    const a = document.createElement('a');
    a.download = fileName;
    a.href = out.toDataURL('image/png'); // safe: source was a data URL
    document.body.appendChild(a); a.click(); a.remove();

  }catch(err){
    console.error("Exact-size export failed:", err);
    alert("Export failed. Make sure all images are local or CORS-enabled. (SVG/PNG/JPG are auto-inlined.)");
  }finally{
    clone.remove();
  }
}

/* -------- COMPAT MODE (oversample + bleed to avoid seams) -------- */
export async function exportCardPNGCompat({ fileName = "card.png" } = {}){
  const card = document.getElementById("card"); if(!card) return;

  await ensureExportLibs();
  if(document.fonts && document.fonts.ready) await document.fonts.ready;

  const w = cssVarPx("--card-w") || card.offsetWidth;
  const h = cssVarPx("--card-h") || card.offsetHeight;

  const cs = getComputedStyle(card);
  const top = (cs.getPropertyValue('--bg-top')||'#0a0d10').trim();
  const bottom = (cs.getPropertyValue('--bg-bottom')||'#0b0f12').trim();

  const clone = card.cloneNode(true);
  Object.assign(clone.style, {
    position:"fixed", left:"-10000px", top:"0",
    width:w+"px", height:h+"px", transform:"none", borderRadius:"0", background:"transparent"
  });
  document.body.appendChild(clone);

  try{
    cleanClone(clone);

    const failures = await inlineAllImages(clone);
    if(failures.length){
      alert(
        "Export blocked by cross-origin images.\n\n" +
        failures.join("\n")
      );
      return;
    }

    const pending = Array.from(clone.querySelectorAll('img')).filter(i=>i.src && !i.complete);
    await Promise.all(pending.map(i=> new Promise(r=> i.addEventListener('load', r, {once:true}))));

    const SCALE = 3;
    const dataUrl = await window.domtoimage.toPng(clone, {
      width: w * SCALE,
      height: h * SCALE,
      style: { transform:"none", width:w+"px", height:h+"px", borderRadius:"0", background:"transparent" },
      quality: 1,
      cacheBust: true
    });

    const srcImg = new Image();
    await new Promise((res,rej)=>{ srcImg.onload=res; srcImg.onerror=rej; srcImg.src=dataUrl; });

    const out = document.createElement('canvas'); out.width = w; out.height = h;
    const ctx = out.getContext('2d', { alpha:false, colorSpace:'srgb' }) || out.getContext('2d');
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = makeGradient(ctx, w, h, top, bottom);
    ctx.fillRect(0,0,w,h);
    ctx.drawImage(srcImg, -2, -2, w + 4, h + 4);

    const a = document.createElement('a');
    a.download = fileName;
    a.href = out.toDataURL('image/png');
    document.body.appendChild(a); a.click(); a.remove();

  }catch(err){
    console.error("Compat export failed:", err);
    alert("Export failed. Make sure all images are local or CORS-enabled.");
  }finally{
    clone.remove();
  }
}
