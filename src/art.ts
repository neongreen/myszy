// Hand-drawn SVG art. Every item uses a 100x100 viewBox.
import type { Kind } from "./game";

const RAINBOW_STOPS = ["#ff4d6d", "#ff9f1c", "#ffe066", "#4ade80", "#38bdf8", "#a78bfa"]
  .map((c, i, a) => `<stop offset="${(i / (a.length - 1)) * 100}%" stop-color="${c}"/>`)
  .join("");

function rainbowDef(id: string): string {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">${RAINBOW_STOPS}</linearGradient>`;
}

let uid = 0;

function witchHat(fill: string, band: string): string {
  return `
    <g transform="rotate(-12 50 30)">
      <path d="M50 2 C56 14 60 24 66 36 L34 36 C40 24 45 12 50 2 Z" fill="${fill}" stroke="#c4b5fd" stroke-width="1.5" stroke-linejoin="round"/>
      <rect x="35" y="29" width="30" height="6" rx="2" fill="${band}"/>
      <rect x="47" y="29" width="6" height="6" rx="1" fill="#fcd34d"/>
      <ellipse cx="50" cy="37" rx="27" ry="5" fill="${fill}" stroke="#c4b5fd" stroke-width="1.5"/>
    </g>`;
}

function mouse(body: string, hat: string, defs = ""): string {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>${defs}</defs>
    <path d="M78 78 C92 82 96 66 88 60" fill="none" stroke="#f9a8d4" stroke-width="3" stroke-linecap="round"/>
    <circle cx="30" cy="46" r="11" fill="${body}"/>
    <circle cx="70" cy="46" r="11" fill="${body}"/>
    <circle cx="30" cy="46" r="6" fill="#f9a8d4"/>
    <circle cx="70" cy="46" r="6" fill="#f9a8d4"/>
    <ellipse cx="50" cy="70" rx="30" ry="22" fill="${body}"/>
    <circle cx="40" cy="64" r="3.6" fill="#111"/>
    <circle cx="60" cy="64" r="3.6" fill="#111"/>
    <circle cx="41.2" cy="62.8" r="1.2" fill="#fff"/>
    <circle cx="61.2" cy="62.8" r="1.2" fill="#fff"/>
    <ellipse cx="50" cy="74" rx="4" ry="3" fill="#f472b6"/>
    <path d="M44 74 L28 71 M44 76 L28 78 M56 74 L72 71 M56 76 L72 78" stroke="#e5e7eb" stroke-width="1" stroke-linecap="round"/>
    ${hat}
  </svg>`;
}

function bomb(): string {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M62 30 C68 20 74 18 80 14" fill="none" stroke="#a16207" stroke-width="4" stroke-linecap="round"/>
    <circle cx="82" cy="12" r="7" fill="#fb923c"/>
    <circle cx="82" cy="12" r="3.5" fill="#fde68a"/>
    <rect x="52" y="26" width="16" height="12" rx="3" transform="rotate(35 60 32)" fill="#374151" stroke="#9ca3af" stroke-width="1.5"/>
    <circle cx="46" cy="60" r="30" fill="#0b0b10" stroke="#9ca3af" stroke-width="2"/>
    <ellipse cx="35" cy="48" rx="8" ry="5" transform="rotate(-35 35 48)" fill="#4b5563"/>
  </svg>`;
}

function cheese(): string {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10 70 L84 34 L92 70 Z" fill="#141418" stroke="#d1d5db" stroke-width="2" stroke-linejoin="round"/>
    <path d="M10 70 L92 70 L92 84 L10 84 Z" fill="#0a0a0d" stroke="#d1d5db" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="62" cy="56" r="6" fill="#2d2d36"/>
    <circle cx="78" cy="60" r="3.5" fill="#2d2d36"/>
    <circle cx="40" cy="64" r="3" fill="#2d2d36"/>
    <circle cx="30" cy="77" r="3.5" fill="#2d2d36"/>
    <circle cx="70" cy="77" r="4.5" fill="#2d2d36"/>
  </svg>`;
}

export function itemSvg(kind: Kind): string {
  const id = `rb${uid++}`;
  switch (kind) {
    case "mouse":
      return mouse("#b8b8c8", witchHat("#2e1065", "#7c3aed"));
    case "rainbowMouse":
      return mouse(`url(#${id})`, witchHat("#2e1065", "#7c3aed"), rainbowDef(id));
    case "rainbowHat":
      return mouse("#b8b8c8", witchHat(`url(#${id})`, "#2e1065"), rainbowDef(id));
    case "bomb":
      return bomb();
    case "cheese":
      return cheese();
  }
}

/** Black cat paw at the top of an arm. Width 100, the arm stretches below. */
export const PAW_SVG = `<svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <ellipse cx="50" cy="56" rx="34" ry="30" fill="#050507" stroke="#c4b5fd" stroke-width="2"/>
  <ellipse cx="22" cy="26" rx="11" ry="13" fill="#050507" stroke="#c4b5fd" stroke-width="2"/>
  <ellipse cx="40" cy="14" rx="11" ry="13" fill="#050507" stroke="#c4b5fd" stroke-width="2"/>
  <ellipse cx="60" cy="14" rx="11" ry="13" fill="#050507" stroke="#c4b5fd" stroke-width="2"/>
  <ellipse cx="78" cy="26" rx="11" ry="13" fill="#050507" stroke="#c4b5fd" stroke-width="2"/>
  <ellipse cx="22" cy="27" rx="5" ry="6" fill="#f9a8d4"/>
  <ellipse cx="40" cy="15" rx="5" ry="6" fill="#f9a8d4"/>
  <ellipse cx="60" cy="15" rx="5" ry="6" fill="#f9a8d4"/>
  <ellipse cx="78" cy="27" rx="5" ry="6" fill="#f9a8d4"/>
  <path d="M30 60 C30 44 70 44 70 60 C70 74 30 74 30 60 Z" fill="#f9a8d4"/>
</svg>`;

export const MOON_SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs><mask id="moon-cut"><rect width="100" height="100" fill="#fff"/><circle cx="66" cy="38" r="38" fill="#000"/></mask></defs>
  <circle cx="50" cy="50" r="40" fill="#fef3c7" mask="url(#moon-cut)"/>
</svg>`;
