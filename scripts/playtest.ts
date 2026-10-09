// Plays the game in a mobile Chromium: catches each item kind and checks the score rule.
import { chromium, devices } from "playwright";

const url = process.argv[2];
const out = process.argv[3] ?? "shots";
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["iPhone 13"] });
const page = await ctx.newPage();
const errors: string[] = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(url, { waitUntil: "networkidle" });
await page.screenshot({ path: `${out}/1-start.png` });
await page.tap("#start [data-start]");

const score = async () => Number(await page.textContent("#score"));
const expected: Record<string, number> = { mouse: 1, rainbowMouse: 5, rainbowHat: 5, bomb: -1 };
const done = new Set<string>();
const log: string[] = [];

async function tapKind(kind: string): Promise<boolean> {
  const el = page.locator(`.item:not(.caught)[data-kind="${kind}"]`).first();
  if ((await el.count()) === 0) return false;
  const box = await el.boundingBox();
  if (!box || box.y < 90 || box.y + box.height > 820) return false;
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  return true;
}

let shotMid = false;
const deadline = Date.now() + 170_000;
while (done.size < 4 && Date.now() < deadline) {
  if (await page.isVisible("#end")) {
    log.push("round ended, restarting");
    await page.tap("#end [data-start]");
  }
  // Keep the score positive so a bomb's -1 is observable from a non-zero base.
  for (const kind of ["rainbowMouse", "rainbowHat", "bomb", "mouse"]) {
    if (done.has(kind) && kind !== "mouse") continue;
    if (kind === "bomb" && (await score()) < 1) continue;
    const before = await score();
    if (await tapKind(kind)) {
      await page.waitForTimeout(60);
      const after = await score();
      const ok = after - before === expected[kind];
      log.push(`${kind}: ${before} -> ${after} ${ok ? "OK" : "FAIL"}`);
      if (!ok) throw new Error(log.join("\n"));
      if (!done.has(kind) && kind !== "mouse" && !shotMid) {
        await page.screenshot({ path: `${out}/2-play.png` });
        shotMid = true;
      }
      done.add(kind);
      break;
    }
  }
  await page.waitForTimeout(40);
}
if (done.size < 4) throw new Error(`not all kinds caught: ${[...done]}\n${log.join("\n")}`);

// Black cheese with points on the board: instant loss, score 0.
while ((await score()) < 1) {
  await tapKind("mouse");
  await page.waitForTimeout(80);
}
const beforeCheese = await score();
while (!(await tapKind("cheese"))) await page.waitForTimeout(40);
await page.waitForTimeout(700);
const afterCheese = await score();
const endVisible = await page.isVisible("#end");
const endText = (await page.textContent("#end-title")) + " / " + (await page.textContent("#end-text"));
const itemsLeft = await page.locator(".item:not(.caught)").count();
log.push(`cheese: ${beforeCheese} -> ${afterCheese}; end screen=${endVisible}; "${endText}"; items left=${itemsLeft}`);
await page.screenshot({ path: `${out}/3-cheese.png` });
if (afterCheese !== 0 || !endVisible || itemsLeft !== 0) throw new Error(log.join("\n"));

// Restart works and starts from zero.
await page.tap("#end [data-start]");
await page.waitForTimeout(300);
log.push(`restart: score=${await score()} endHidden=${!(await page.isVisible("#end"))}`);

console.log(log.join("\n"));
console.log("errors:", errors.length ? errors : "none");
await browser.close();
