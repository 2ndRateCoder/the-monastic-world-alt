(() => {
  "use strict";

  const hero = document.querySelector(".hero-scroll");
  const video = document.getElementById("hero-video");
  const frame = document.getElementById("hero-frame");
  if (!hero || !video || !frame) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)");
  const FRAME_COUNT = 25;
  const COMPLETE_AT = 1;
  const frameUrls = Array.from(
    { length: FRAME_COUNT },
    (_, i) => `./assets/frames/frame-${String(i + 1).padStart(3, "0")}.jpg`
  );

  let duration = 0;
  let raf = 0;
  let lastFrame = -1;
  let videoReady = false;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function scrollProgress() {
    const rect = hero.getBoundingClientRect();
    const viewport = window.innerHeight || document.documentElement.clientHeight;
    const travel = Math.max(1, hero.offsetHeight - viewport);
    return clamp(-rect.top / travel, 0, 1);
  }

  function morphProgress() {
    return clamp(scrollProgress() / COMPLETE_AT, 0, 1);
  }

  function showPoster() {
    video.style.display = "none";
    frame.style.display = "block";
    frame.src = "./assets/monk-poster.jpg";
  }

  function renderFrameSequence(progress) {
    const index = Math.round(progress * (FRAME_COUNT - 1));
    if (index === lastFrame) return;
    lastFrame = index;
    frame.src = frameUrls[index];
  }

  function render() {
    raf = 0;
    if (reducedMotion.matches) {
      showPoster();
      return;
    }

    const progress = morphProgress();

    if (coarsePointer.matches) {
      video.style.display = "none";
      frame.style.display = "block";
      renderFrameSequence(progress);
      return;
    }

    frame.style.display = "none";
    video.style.display = "block";
    if (!videoReady || !Number.isFinite(duration) || duration <= 0) return;

    // The video morphs one way (praying monk -> many arms -> the eye),
    // so scrub the full duration and settle on the eye close-up.
    const targetTime = progress * duration;
    if (Math.abs(video.currentTime - targetTime) > 0.016) {
      try { video.currentTime = targetTime; } catch (_) {}
    }
  }

  function requestRender() {
    if (!raf) raf = requestAnimationFrame(render);
  }

  function preloadFrames() {
    if (!coarsePointer.matches || reducedMotion.matches) return;
    frameUrls.forEach((url) => {
      const image = new Image();
      image.decoding = "async";
      image.src = url;
    });
  }

  video.addEventListener("loadedmetadata", () => {
    duration = video.duration || 0;
    videoReady = duration > 0;
    requestRender();
  }, { once: true });

  video.addEventListener("durationchange", () => {
    duration = video.duration || duration;
    videoReady = duration > 0;
    requestRender();
  });

  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener("resize", requestRender, { passive: true });
  window.addEventListener("orientationchange", requestRender, { passive: true });
  reducedMotion.addEventListener?.("change", requestRender);
  coarsePointer.addEventListener?.("change", () => {
    preloadFrames();
    requestRender();
  });

  video.pause();
  video.removeAttribute("autoplay");
  preloadFrames();
  requestRender();
})();

(function initTyper() {
  var wordEl = document.getElementById("typer-word");
  if (!wordEl) return;
  var words = ["Ryan.", "a Seeker.", "a Creative.", "a Contemplative."];
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    wordEl.textContent = words[0];
    return;
  }
  var TYPE_MS = 80, HOLD_MS = 1700, DELETE_MS = 40, GAP_MS = 400;
  var wi = 0, timer = null;

  function schedule(fn, ms) {
    clearTimeout(timer);
    if (document.hidden) {
      var onVisible = function () {
        document.removeEventListener("visibilitychange", onVisible);
        schedule(fn, ms);
      };
      document.addEventListener("visibilitychange", onVisible);
      return;
    }
    timer = setTimeout(fn, ms);
  }

  function typeWord(word, i) {
    wordEl.textContent = word.slice(0, i);
    if (i <= word.length) {
      schedule(function () { typeWord(word, i + 1); }, TYPE_MS);
    } else {
      schedule(function () { deleteWord(word, word.length); }, HOLD_MS);
    }
  }

  function deleteWord(word, i) {
    wordEl.textContent = word.slice(0, i);
    if (i > 0) {
      schedule(function () { deleteWord(word, i - 1); }, DELETE_MS);
    } else {
      wi = (wi + 1) % words.length;
      schedule(function () { typeWord(words[wi], 1); }, GAP_MS);
    }
  }

  function start() {
    // Retype from the first word so the visitor sees the full effect.
    wi = 0;
    wordEl.textContent = "";
    schedule(function () { typeWord(words[wi], 1); }, GAP_MS);
  }

  if ("IntersectionObserver" in window) {
    var seen = false;
    var io = new IntersectionObserver(function (entries) {
      if (!seen && entries[0].isIntersecting) {
        seen = true;
        io.disconnect();
        start();
      }
    }, { threshold: 0.4 });
    io.observe(wordEl);
  } else {
    start();
  }
})();
