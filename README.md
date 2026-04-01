# 🔥 SlapIt — Turn Your Mic Into Chaos

![SlapIt](./cartoon-slap-caricature-white-hand-red-text-graphic-78068638.jpg)

> “The internet didn’t need this… but now it can’t live without it.”

SlapIt is a fullscreen, viral-style web toy that listens to your mic and fires instant slap/clap reactions in real time: flash, punch, text, and audio chaos.

## ⚡ Demo

- **Live**: `https://slap-it.vercel.app/`
- **Repo**: `https://github.com/DivyKishor/slapme`

## 🧠 How It Works

- Microphone stream goes into a Web Audio analyser
- RMS + spike + loudness checks detect clap/slap transients
- Each trigger runs a reaction loop: flash + scale + random reaction text + sound
- Sounds are unlocked and preloaded early for near-instant playback
- Mobile anti-feedback guard prevents continuous self-trigger loops

## 🕹️ Current Features

- Real-time clap/slap detection tuned for quick retriggers
- Instant-feel audio engine using pre-decoded buffers from `audio/sexy/`
- Fullscreen immersive UI with live intensity meter
- Top-right Share button with:
  - native share (when supported)
  - direct links for WhatsApp / Facebook / X / Reddit
  - one-tap copy for live URL and GitHub URL
- No backend required; runs fully in the browser

## 🚀 Getting Started

```bash
git clone https://github.com/DivyKishor/slapme.git
cd slapme
npm install
npm run dev
```

## 📦 Build

```bash
npm run build
npm run preview
```

## 🔐 Permissions & Privacy

SlapIt needs microphone access.

- No recording
- No uploads
- Everything is processed locally in your browser

## 🧪 Tech Stack

- React + Vite
- TailwindCSS
- Web Audio API

## 🤝 Contributing

PRs are welcome for:

- new sound packs
- better detection tuning
- more chaotic reactions

## ⚠️ Disclaimer

Not serious. Not scientific. **Pure chaos.**
