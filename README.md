# Speech Fun Games (PWA)

Two kid-friendly mini-games in one page:

* **B or V?** — distinguishes /b/ vs /v/, with a mystery prompt, speakers for each option, treats, and a puppy that barks when fed.
* **Clock vs Snake** — “good” *tsss* (clock) vs “slushy sss” (snake), with a spinning hand / flicking tongue, treats, and the same puppy jar.

This repo is set up to be a simple **static site** that also works **offline** (via `service-worker.js`) and can be **installed** to a device’s home screen (via `manifest.json`).

---

## Folder structure

```
index.html
README.md
service-worker.js
manifest.json

audio/          # put your WAV files here
  best.wav
  vest.wav
  boat.wav
  vote.wav
  ban.wav
  van.wav
  bee.wav
  vee.wav
  good.wav
  bad.wav
  bark.wav
  bark1.wav
  bark2.wav
  bark3.wav
  clock.wav     # “tsss”
  snake.wav     # “slushy sss”

images/
  best.png
  vest.png
  boat.png
  vote.png
  ban.png
  van.png
  bee.png
  vee.png
  clock.png
  clock_hand.png
  snake.png
  snake_with_tongue.png
  puppy1.png
  puppy2.png
  puppy3.png

icons/          # app icons + speaker icons
  app-icon-192.png
  app-icon-512.png
  speaker_darkpink_32px.png
  speaker_darkpink_48px.png
  speaker_darkpink_64px.png
```

> **Tip:** If any puppy images don’t exist, the app automatically skips them when cycling.

---

## Run locally

Just open `index.html` directly, **or** serve the folder (recommended for service worker testing):

```bash
# Python 3
python -m http.server 8080
# then visit http://localhost:8080
```

> Service workers only run on `http(s)` origins (or `localhost`). If you open the file directly (file://), the PWA features are inactive.

---

## Deploy on GitHub Pages

1. Commit + push to a repository.
2. In **Settings → Pages**, choose:

   * **Branch**: `main` (or your default branch)
   * **Folder**: `/ (root)`
3. Save. Your site will be available at `https://<user>.github.io/<repo>/`.

If you deploy to a **subfolder** (e.g. `/docs`), make sure all paths are relative (they already are), and the service worker’s `scope` (in `manifest.json`) stays `./`.

---

## PWA / Offline

* `manifest.json` enables “Add to Home Screen”.
* `service-worker.js`:

  * Pre-caches core files so the app loads offline.
  * Uses **cache-first** for images/icons and **stale-while-revalidate** for audio.
  * Falls back to `index.html` for navigation (single-page app).

### Update the service worker

Bump the version string in `service-worker.js`:

```js
const SW_VERSION = 'v1.0.1'; // ← change this when you update files
```

When you reload, the new worker installs, takes control, and refreshes cached assets.

---

## Audio permissions on iOS/Android

Mobile browsers often require a **user gesture** (tap) before they allow audio. The app already ties sounds to taps; if something is muted at first load, tap any interactive tile once to “unlock” audio.

---

## Troubleshooting

* **Puppy stuck on 3**: check your `images/puppy1.png` and `images/puppy2.png` exist; the app skips missing files automatically.
* **Sounds not playing**: confirm the file names & paths under `/audio` match those used in `index.html`.
* **Offline not updating**: bump `SW_VERSION` and hard-refresh (or “Empty cache and hard reload”).
