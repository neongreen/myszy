import { chromium, devices } from "playwright";
const b = await chromium.launch(); const c = await b.newContext({ ...devices["iPhone 13"] }); const p = await c.newPage();
const errs: string[] = []; p.on("pageerror", e => errs.push(String(e)));
await p.clock.install();
await p.goto(process.argv[2]); await p.tap("#start [data-start]");
let caught = 0;
while (caught < 2) {
  await p.clock.runFor(100);
  const el = p.locator('.item:not(.caught)[data-kind="mouse"]').first();
  const bx = (await el.count()) ? await el.boundingBox() : null;
  if (bx && bx.y > 90 && bx.y < 700) { await p.touchscreen.tap(bx.x + bx.width/2, bx.y + bx.height/2); caught++; }
}
const score = await p.textContent("#score");
for (let i = 0; i < 700 && !(await p.isVisible("#end")); i++) await p.clock.runFor(100);
console.log("score", score, "|", await p.textContent("#end-title"), await p.textContent("#end-text"), await p.textContent("#end-best"),
  "| stored:", await p.evaluate(() => localStorage.getItem("myszy-best")), "| errors:", errs.length ? errs : "none");
await b.close();
