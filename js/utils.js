// Misc helpers shared across modules
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
export const el = id => document.getElementById(id);

export function toHex(rgb) {
  const m = rgb && rgb.match && rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!m) return "#ffffff";
  const r = (+m[1]).toString(16).padStart(2, "0");
  const g = (+m[2]).toString(16).padStart(2, "0");
  const b = (+m[3]).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}

export function loadFileAsDataURL(file) {
  return new Promise((res, rej) => {
    if (!file) return res(null);
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(r.error || new Error("readAsDataURL failed"));
    r.readAsDataURL(file);
  });
}

export function cssVarPx(name) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const m = v.match(/([\d.]+)/);
  return m ? Math.round(parseFloat(m[1])) : 0;
}

export function show(node, flag) {
  if (!node) return;
  node.style.display = flag ? "" : "none";
}

// Create a simple data image (used by demo prefills)
export function makeDataImage(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  draw(ctx, w, h);
  return c.toDataURL("image/png");
}
