# The Monastic World — alt colorway (monk edition)

An alternate colorway of **The Monastic World by Ryan Higgins**, built around the hand-drawn monk artwork: blush pink, deep teal, and halo gold.

## Run locally

Because browsers restrict some video behavior when an HTML file is opened directly from disk, serve the folder with a tiny local web server instead of double-clicking `index.html`.

With Python installed:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Files

- `index.html` — page structure and copy
- `styles.css` — responsive layout and visual system
- `script.js` — scroll-driven hero animation
- `assets/mobius-hero.mp4` — the exact MP4 asset retrieved from the project library
- `assets/mobius-strip.png` — poster generated from frame 0 of that MP4
- `assets/frames/` — 12 fps JPEG frame sequence used on touch devices for reliable iPhone scrolling

## Hero behavior

The hero occupies about 250 viewport-heights. Its contents stay sticky while the user scrolls. Scroll progress maps forward and backward through the visual, and the morph reaches its final frame around halfway through the scroll journey.

Desktop pointer devices scrub the MP4 directly. Touch devices use the pre-extracted frame sequence because paused-video seeking can be unreliable in mobile Safari and Chrome on iPhone. Reduced-motion users see the static poster.

## Source fidelity note

ChatGPT Sites does not expose its internal raw builder bundle through the export tools available in this conversation. This package therefore recreates the site's accessible structure and latest requested hero behavior as ordinary HTML, CSS, and JavaScript, and includes the exact retrieved MP4 asset. The platform's private generated implementation may differ in code organization or formatting.
