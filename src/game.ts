// Pure game rules. No DOM here, so the scoring is unit-testable.

export type Kind = "mouse" | "rainbowMouse" | "rainbowHat" | "bomb" | "cheese";

export const KINDS: readonly Kind[] = ["mouse", "rainbowMouse", "rainbowHat", "bomb", "cheese"];

/** Score change for catching each item. Black cheese is not a delta: it ends the game. */
export const POINTS: Record<Exclude<Kind, "cheese">, number> = {
  mouse: 1,
  rainbowMouse: 5,
  rainbowHat: 5,
  bomb: -1,
};

export const ROUND_SECONDS = 60;

export type Phase = "ready" | "playing" | "lost" | "timeUp";

export interface State {
  phase: Phase;
  score: number;
  /** Score the player had at the moment black cheese took it away. */
  lostScore: number;
  timeLeft: number;
  caught: Record<Kind, number>;
}

function emptyCaught(): Record<Kind, number> {
  return { mouse: 0, rainbowMouse: 0, rainbowHat: 0, bomb: 0, cheese: 0 };
}

export function initialState(): State {
  return { phase: "ready", score: 0, lostScore: 0, timeLeft: ROUND_SECONDS, caught: emptyCaught() };
}

export function startRound(): State {
  return { ...initialState(), phase: "playing" };
}

export function catchItem(s: State, kind: Kind): State {
  if (s.phase !== "playing") return s;
  const caught = { ...s.caught, [kind]: s.caught[kind] + 1 };
  if (kind === "cheese") {
    return { ...s, phase: "lost", lostScore: s.score, score: 0, caught };
  }
  return { ...s, score: s.score + POINTS[kind], caught };
}

export function tick(s: State, dtSeconds: number): State {
  if (s.phase !== "playing") return s;
  const timeLeft = Math.max(0, s.timeLeft - dtSeconds);
  return { ...s, timeLeft, phase: timeLeft === 0 ? "timeUp" : "playing" };
}

/** Spawn weights. Normal mice dominate; cheese is common enough to keep the player careful. */
export const WEIGHTS: Record<Kind, number> = {
  mouse: 0.58,
  rainbowMouse: 0.07,
  rainbowHat: 0.07,
  bomb: 0.16,
  cheese: 0.12,
};

/** Map a uniform random number in [0, 1) to an item kind. */
export function pickKind(r: number): Kind {
  let acc = 0;
  for (const k of KINDS) {
    acc += WEIGHTS[k];
    if (r < acc) return k;
  }
  return "mouse";
}

/** Seconds between spawns, shrinking from 0.9 s to 0.45 s over the round. */
export function spawnInterval(elapsed: number): number {
  const t = Math.min(1, Math.max(0, elapsed / ROUND_SECONDS));
  return 0.9 - 0.45 * t;
}

/** Seconds an item takes to fall the full screen height, from 4.5 s down to 2.6 s. */
export function fallSeconds(elapsed: number): number {
  const t = Math.min(1, Math.max(0, elapsed / ROUND_SECONDS));
  return 4.5 - 1.9 * t;
}
