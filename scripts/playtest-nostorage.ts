import { chromium, devices } from "playwright";
const b = await chromium.launch(); const c = await b.newContext({ ...devices["iPhone 13"] }); const p = await c.newPage();
await p.addInitScript(() => Object.defineProperty(window, "localStorage", { get() { throw new DOMException("blocked", "SecurityError"); } }));
const errs: string[] = []; p.on("pageerror", e => errs.push(String(e)));
await p.goto(process.argv[2]); await p.tap("#start [data-start]");
for (;;) { const el = p.locator('.item:not(.caught)[data-kind="cheese"]').first(); const bx = (await el.count()) ? await el.boundingBox() : null;
  if (bx && bx.y > 90 && bx.y < 700) { await p.touchscreen.tap(bx.x + bx.width/2, bx.y + bx.height/2); break; } await p.waitForTimeout(40); }
await p.waitForTimeout(700);
console.log("end visible:", await p.isVisible("#end"), "|", await p.textContent("#end-best"), "| errors:", errs.length ? errs : "none");
await b.close();
