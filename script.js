/* ===== Elemen ===== */
const body = document.body;
const cover = document.getElementById("cover");
const openBtn = document.getElementById("openBtn");
const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("musicBtn");
const progress = document.getElementById("progress");
const heartsContainer = document.querySelector(".hearts");
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ===== Musik ===== */
bgm.volume = 0.6;

function updateMusicUI() {
  const playing = !bgm.paused;
  musicBtn.classList.toggle("playing", playing);
  musicBtn.classList.toggle("muted", !playing);
}

function playMusic() {
  const p = bgm.play();
  if (p && p.catch) p.catch(() => updateMusicUI());
  updateMusicUI();
}

musicBtn.addEventListener("click", () => {
  if (bgm.paused) playMusic();
  else { bgm.pause(); updateMusicUI(); }
});
bgm.addEventListener("play", updateMusicUI);
bgm.addEventListener("pause", updateMusicUI);

/* ===== Buka cover ===== */
function openCover() {
  cover.classList.add("hide");
  body.classList.remove("locked");
  musicBtn.classList.add("show");
  window.scrollTo(0, 0);
  playMusic();
  if (!prefersReduced) launchConfetti();
}
openBtn.addEventListener("click", openCover);

/* ===== Scroll reveal ===== */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* Paragraf surat muncul satu per satu */
const letterLines = document.querySelectorAll(".letter-content p");
const lineObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        lineObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);
letterLines.forEach((p) => { p.classList.add("reveal-line"); lineObserver.observe(p); });

/* ===== Progress bar scroll ===== */
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

/* ===== Hati melayang (berhenti saat tab disembunyikan) ===== */
function createHeart() {
  if (document.hidden || prefersReduced) return;
  const heart = document.createElement("span");
  heart.className = "heart";
  heart.textContent = Math.random() > 0.5 ? "♥" : "♡";
  const duration = Math.random() * 7 + 8;
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.fontSize = `${Math.random() * 16 + 10}px`;
  heart.style.animationDuration = `${duration}s`;
  heartsContainer.appendChild(heart);
  setTimeout(() => heart.remove(), duration * 1000);
}
setInterval(createHeart, 1300);

/* ===== Smooth scroll tombol anchor ===== */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
    }
  });
});
document.getElementById("toTop").addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" })
);

/* ===== Lightbox foto ===== */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");

function openLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt || "";
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
}
function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
}
document.querySelectorAll(".photo-frame img").forEach((img) =>
  img.addEventListener("click", () => openLightbox(img.src, img.alt))
);
lightbox.addEventListener("click", closeLightbox);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

/* ===== Confetti sederhana (tanpa library) ===== */
function launchConfetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const colors = ["#c65f78", "#e8a8b6", "#8d3049", "#f6c177", "#fff1f3"];
  const pieces = Array.from({ length: 140 }, () => ({
    x: Math.random() * window.innerWidth,
    y: -20 - Math.random() * window.innerHeight * 0.6,
    w: Math.random() * 8 + 5,
    h: Math.random() * 10 + 6,
    vy: Math.random() * 2.5 + 2,
    vx: Math.random() * 2 - 1,
    rot: Math.random() * Math.PI,
    vr: Math.random() * 0.2 - 0.1,
    color: colors[Math.floor(Math.random() * colors.length)],
    heart: Math.random() > 0.7,
  }));

  const start = performance.now();
  (function frame(now) {
    const t = now - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    pieces.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - t / 5500);
      if (p.heart) { ctx.font = `${p.h + 8}px serif`; ctx.fillText("♥", 0, 0); }
      else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (t < 5500) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  })(start);
}
