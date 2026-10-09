import { describe, expect, test } from "bun:test";
import { KINDS, WEIGHTS, catchItem, initialState, pickKind, startRound, tick } from "./game";

describe("scoring", () => {
  test("normal witch-hat mouse gives +1", () => {
    expect(catchItem(startRound(), "mouse").score).toBe(1);
  });

  test("rainbow mouse gives +5", () => {
    expect(catchItem(startRound(), "rainbowMouse").score).toBe(5);
  });

  test("mouse in a rainbow hat gives +5", () => {
    expect(catchItem(startRound(), "rainbowHat").score).toBe(5);
  });

  test("bomb gives -1", () => {
    let s = startRound();
    s = catchItem(s, "mouse");
    s = catchItem(s, "mouse");
    s = catchItem(s, "bomb");
    expect(s.score).toBe(1);
  });

  test("black cheese ends the game and loses all points", () => {
    let s = startRound();
    s = catchItem(s, "rainbowMouse");
    s = catchItem(s, "mouse");
    s = catchItem(s, "cheese");
    expect(s.phase).toBe("lost");
    expect(s.score).toBe(0);
    expect(s.lostScore).toBe(6);
  });

  test("nothing scores after the game is lost", () => {
    let s = catchItem(startRound(), "cheese");
    s = catchItem(s, "rainbowMouse");
    expect(s.score).toBe(0);
    expect(s.phase).toBe("lost");
  });

  test("catching before the round starts does nothing", () => {
    expect(catchItem(initialState(), "mouse").score).toBe(0);
  });

  test("a new round starts from zero", () => {
    const s = startRound();
    expect(s.score).toBe(0);
    expect(s.phase).toBe("playing");
  });
});

describe("round timer", () => {
  test("round ends when time runs out and keeps the score", () => {
    let s = catchItem(startRound(), "mouse");
    s = tick(s, 59);
    expect(s.phase).toBe("playing");
    s = tick(s, 2);
    expect(s.phase).toBe("timeUp");
    expect(s.timeLeft).toBe(0);
    expect(s.score).toBe(1);
  });
});

describe("spawning", () => {
  test("weights sum to 1", () => {
    const sum = KINDS.reduce((a, k) => a + WEIGHTS[k], 0);
    expect(Math.abs(sum - 1)).toBeLessThan(1e-9);
  });

  test("every kind can spawn", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i++) seen.add(pickKind(i / 1000));
    expect([...seen].sort()).toEqual([...KINDS].sort());
  });
});
