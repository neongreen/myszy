import { MOON_SVG, PAW_SVG, itemSvg } from "./art";
import {
  type Kind,
  type State,
  POINTS,
  ROUND_SECONDS,
  catchItem,
  fallSeconds,
  initialState,
  pickKind,
  spawnInterval,
  startRound,
  tick,
} from "./game";

interface Item {
  kind: Kind;
  el: HTMLElement;
  x: number;
  y: number;
  /** Pixels per second. */
  speed: number;
  wobble: number;
}

const BEST_KEY = "myszy-best";

const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;

const field = $<HTMLDivElement>("#field");
const scoreEl = $<HTMLSpanElement>("#score");
const timeEl = $<HTMLSpanElement>("#time");
const startScreen = $<HTMLDivElement>("#start");
const endScreen = $<HTMLDivElement>("#end");
const endTitle = $<HTMLHeadingElement>("#end-title");
const endText = $<HTMLParagraphElement>("#end-text");
const endBest = $<HTMLParagraphElement>("#end-best");

let state: State = initialState();
let items: Item[] = [];
let elapsed = 0;
let untilSpawn = 0;
let lastFrame = 0;

function drawSky(): void {
  const sky = $<HTMLDivElement>("#sky");
  const moon = document.createElement("div");
  moon.className = "moon";
  moon.innerHTML = MOON_SVG;
  sky.append(moon);
  for (let i = 0; i < 70; i++) {
    const s = document.createElement("div");
    s.className = "star";
    const size = Math.random() < 0.15 ? 3 : Math.random() < 0.5 ? 2 : 1.4;
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 92}%;width:${size}px;height:${size}px;animation-delay:${(Math.random() * 4).toFixed(2)}s;animation-duration:${(2.5 + Math.random() * 3).toFixed(2)}s`;
    sky.append(s);
  }
}

function drawLegend(): void {
  for (const el of document.querySelectorAll<HTMLElement>("[data-legend]")) {
    el.innerHTML = itemSvg(el.dataset.legend as Kind);
  }
}

function itemSize(): number {
  return Math.min(88, Math.max(64, window.innerWidth * 0.19));
}

function spawn(): void {
  const kind = pickKind(Math.random());
  const size = itemSize();
  const el = document.createElement("button");
  el.type = "button";
  el.className = "item";
  el.dataset.kind = kind;
  el.setAttribute("aria-label", LABELS[kind]);
  el.style.width = el.style.height = `${size}px`;
  el.innerHTML = itemSvg(kind);
  const x = Math.random() * (field.clientWidth - size);
  const height = field.clientHeight;
  const item: Item = { kind, el, x, y: -size, speed: (height + size) / fallSeconds(elapsed), wobble: Math.random() * Math.PI * 2 };
  el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    grab(item);
  });
  field.append(el);
  items.push(item);
  place(item);
}

const LABELS: Record<Kind, string> = {
  mouse: "мышка в шляпе ведьмы",
  rainbowMouse: "радужная мышка",
  rainbowHat: "мышка в радужной шляпе",
  bomb: "бомба",
  cheese: "чёрный сыр",
};

function place(item: Item): void {
  const sway = Math.sin(item.wobble + item.y / 60) * 6;
  item.el.style.transform = `translate(${item.x + sway}px, ${item.y}px)`;
}

function removeItem(item: Item): void {
  item.el.remove();
  items = items.filter((i) => i !== item);
}

function grab(item: Item): void {
  if (state.phase !== "playing" || !items.includes(item)) return;
  const size = item.el.offsetWidth;
  const cx = item.x + size / 2;
  const cy = item.y + size / 2;
  // Stop tracking the item but leave it on screen until the paw reaches it.
  items = items.filter((i) => i !== item);
  item.el.classList.add("caught");
  item.el.addEventListener("animationend", () => item.el.remove());
  swipePaw(cx, cy);
  state = catchItem(state, item.kind);
  if (item.kind === "cheese") {
    popup(cx, cy, "0", "bad");
    finish();
  } else {
    const d = POINTS[item.kind];
    popup(cx, cy, d > 0 ? `+${d}` : `−${-d}`, d > 0 ? (d >= 5 ? "big" : "good") : "bad");
  }
  render();
}

function swipePaw(cx: number, cy: number): void {
  const paw = document.createElement("div");
  paw.className = "paw";
  const reach = field.clientHeight - cy + 40;
  paw.style.left = `${cx}px`;
  paw.style.height = `${reach}px`;
  paw.innerHTML = `<div class="paw-hand">${PAW_SVG}</div><div class="paw-arm"></div>`;
  field.append(paw);
  paw.addEventListener("animationend", () => paw.remove());
}

function popup(x: number, y: number, text: string, tone: "good" | "big" | "bad"): void {
  const p = document.createElement("div");
  p.className = `popup ${tone}`;
  p.textContent = text;
  p.style.left = `${x}px`;
  p.style.top = `${y}px`;
  field.append(p);
  p.addEventListener("animationend", () => p.remove());
}

function render(): void {
  scoreEl.textContent = String(state.score);
  timeEl.textContent = String(Math.ceil(state.timeLeft));
}

// Storage can be blocked (private modes, embedded webviews); the game must still end normally.
let memoryBest = 0;

function bestScore(): number {
  try {
    return Math.max(memoryBest, Number(localStorage.getItem(BEST_KEY) ?? 0) || 0);
  } catch {
    return memoryBest;
  }
}

function saveBest(best: number): void {
  memoryBest = best;
  try {
    localStorage.setItem(BEST_KEY, String(best));
  } catch {
    // Keep the in-memory record only.
  }
}

function finish(): void {
  for (const item of [...items]) removeItem(item);
  let best = bestScore();
  if (state.phase === "timeUp" && state.score > best) {
    best = state.score;
    saveBest(best);
  }
  endScreen.dataset.result = state.phase;
  if (state.phase === "lost") {
    endTitle.textContent = "Чёрный сыр!";
    endText.textContent =
      state.lostScore === 0 ? "Игра окончена. Очков: 0." : `Все очки потеряны: было ${state.lostScore}, стало 0.`;
  } else {
    endTitle.textContent = "Время вышло!";
    endText.textContent = `Твой счёт: ${state.score}`;
  }
  endBest.textContent = `Рекорд: ${best}`;
  window.setTimeout(() => endScreen.removeAttribute("hidden"), state.phase === "lost" ? 450 : 0);
}

function frame(now: number): void {
  const dt = Math.min(0.1, (now - lastFrame) / 1000);
  lastFrame = now;
  if (state.phase === "playing") {
    elapsed += dt;
    untilSpawn -= dt;
    if (untilSpawn <= 0) {
      spawn();
      untilSpawn = spawnInterval(elapsed);
    }
    const bottom = field.clientHeight;
    for (const item of [...items]) {
      item.y += item.speed * dt;
      if (item.y > bottom) removeItem(item);
      else place(item);
    }
    state = tick(state, dt);
    if (state.phase === "timeUp") finish();
    render();
  }
  requestAnimationFrame(frame);
}

function start(): void {
  for (const item of [...items]) removeItem(item);
  state = startRound();
  elapsed = 0;
  untilSpawn = 0.3;
  startScreen.setAttribute("hidden", "");
  endScreen.setAttribute("hidden", "");
  render();
}

drawSky();
drawLegend();
timeEl.textContent = String(ROUND_SECONDS);
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-start]")) b.addEventListener("click", start);
requestAnimationFrame((t) => {
  lastFrame = t;
  requestAnimationFrame(frame);
});
