# Stream Saga — Card Front Generator

> **vibe coded** ⭐

A lightweight, static web app to design and export **Stream Saga** TCG-style **front-side cards**.  
Created by **Akurosia Kamo** & **Evidiya** (credit appears on the card).

## ✨ Features
- Clean, cyberpunk-leaning frame with blue/red accents and elegant dark theme
- Element, Stage (Base/Step1/Step2), Name + Name Modifier (EX/MAX/etc)
- Previous stage thumbnail (for Step1/Step2)
- Main artwork upload
- Social bar (YouTube / Twitch / Instagram)
- Ability (with a highlighted “ABILITY” flag) and Attack (with optional Effect + Value)
- Flavour text (bottom-aligned, centered)
- Footer/credit bar: Set Icon + Set Name (left), Card Number + Rarity (right), **Created by** text centered
- **Export to PNG** (using **html-to-image** with **dom-to-image-more** fallback for reliable rendering)

## 🚀 Quick Start
1. Clone or download this repo
2. Open `index.html` in your browser (no build step needed)
3. Fill in fields, drop in your art, set colors, and hit **Download PNG**

> If the export looks blank: make sure you uploaded an image and try again. We wait for fonts and images, and inline CSS gradient variables before exporting.

## 🧩 Tech
- Pure HTML/CSS/JS — **no framework**
- **html-to-image** for export, **dom-to-image-more** as a fallback
- Google Fonts: Rubik (UI) & Rajdhani (display)

## 🌈 Customization
- Card background uses CSS variables `--bg-top` & `--bg-bottom` (color pickers in the panel).
- Corner accents are blue/red with **26px** rounded active corners.
- You can tweak sizes, fonts, and color tokens in `styles.css`.

## 📦 Repo Structure
```
.
├── index.html
├── styles.css
├── app.js
├── LICENSE
└── .gitignore
```

## 📄 License
MIT © 2025 — do cool things and keep the header.  
This project is **vibe coded**. 😎
