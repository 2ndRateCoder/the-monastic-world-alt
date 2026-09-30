(() => {
  "use strict";

  const hero = document.querySelector(".hero-scroll");
  const video = document.getElementById("hero-video");
  const frame = document.getElementById("hero-frame");
  if (!hero || !video || !frame) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)");
  const FRAME_COUNT = 30;
  const COMPLETE_AT = 0.5;
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
    frame.src = "./assets/hero-poster.jpg";
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

    // The video ping-pongs (hand-drawn -> geometric -> hand-drawn) so it loops
    // seamlessly; the morph peak is at the halfway point. Scrub only the
    // first half so scrolling settles on the geometric version.
    const targetTime = progress * (duration / 2);
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
