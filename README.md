# Котики ловят мышей (myszy)

Mobile browser game: black cat paws catch falling mice in witch hats under a night sky.

| Item | Score |
| --- | --- |
| Mouse in a witch hat | +1 |
| Rainbow mouse, or mouse in a rainbow hat | +5 |
| Bomb | −1 |
| Black cheese | game over, all points lost |

Tap an item and a paw reaches up to catch it. A round lasts 60 seconds.

## Development

Tools are pinned in `mise.toml`; run every command through mise shims (`export PATH="$HOME/.local/share/mise/shims:$PATH"`).

```sh
bun install
bun run typecheck   # tsgo
bun test            # scoring rules in src/game.test.ts
bun run build       # static site in dist/
```

Browser playtest (mobile Chromium, catches every item kind and checks each score rule):

```sh
bunx playwright install chromium
(cd dist && python3 -m http.server 8765 &)
node --experimental-strip-types scripts/playtest.ts http://127.0.0.1:8765/ /tmp
node --experimental-strip-types scripts/playtest-record.ts http://127.0.0.1:8765/     # time-up ending writes the record (fake clock)
node --experimental-strip-types scripts/playtest-nostorage.ts http://127.0.0.1:8765/  # game still ends with storage blocked
```

## Deploy

Cloudflare Pages project `myszy`. With `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in the environment: `bun run deploy`.
