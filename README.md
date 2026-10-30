# Jelly Battle — HTML5

An unofficial browser remake of the classic 20:20 Flash game, built with vanilla JavaScript and original SVG character artwork.

[Play Jelly Battle](https://jelly-battle.agreeable-answer.workers.dev)

## Play

You are blue. Outlast three AI opponents on a 15 × 5 keyboard arena. Choose a key within two squares, then press **Space** or wait for the countdown. Everyone jumps together while the icons shift down one row: aim below the icon you want.

- Click a highlighted key or use the arrow keys to select a landing.
- Easy / Medium / Hard give you 15 / 12 / 8 seconds per turn.
- Landing clashes trigger a Jelly Off: roll 1–10; the loser takes damage and is displaced.
- Pause, sound effects, fullscreen, replay and an in-game field manual are included.
- Ranks and points are stored locally in your browser. Single-player with three AI rivals; online multiplayer is not implemented.

| Color | Tiles |
| --- | --- |
| Pink — weapons | Handbags, Blast, Laser, Air Strike, Random Drop, Nukes |
| Blue — buffs | Invisible, De-Bonus, Shield, Freeze, Jelly Rage, Triple Jump |
| Yellow — utility | Teleport |
| Red — traps | Mines |
| Green — healing | Health recovery, Super Jelly (full health) |

See [the rules reference](docs/rules.md) for damage, durations, resolution order and implementation assumptions. Some original mechanics remain unverified; this remake does not claim exact source-code equivalence.

## Run locally

Requires a current Node.js release. The local game server needs no package installation:

```sh
npm run dev
```

Open http://127.0.0.1:4173.

```sh
npm test       # Gameplay engine tests
npm run build # Write deployable browser assets to dist/
```

## Deploy to Cloudflare

Install the pinned deployment dependencies, authenticate with your own Cloudflare account, then deploy:

```sh
npm ci
npx wrangler login
npm test
npm run deploy
```

If you have multiple accounts, set `CLOUDFLARE_ACCOUNT_ID` in your local environment or deployment settings. Keep tokens and account configuration outside Git. The Worker name in `wrangler.jsonc` can be changed for your own deployment.

The build publishes only `index.html`, `src/app.mjs`, `src/engine.mjs`, and `src/style.css`. Tests, documentation and the local server are excluded. Automatic Git deployment is not configured in this repository.

## Project structure

- `src/engine.mjs` — gameplay and AI
- `src/app.mjs` — rendering, jump animation and controls
- `src/style.css` — responsive interface
- `src/engine.test.mjs` — engine checks
- `scripts/build.mjs` — static asset packaging
- `server.mjs` — local preview server

Google Fonts are optional network resources with local font fallbacks. Gameplay has no backend dependency. The page is marked `noindex`.

## Credits

The original Jelly Battle was created by **20:20**. This is an unofficial remake using new artwork, without an emulator or the original Flash binary.

- [Original game on Flash Museum](https://flashmuseum.net/game/jelly-battle-1xk/)
- [Historical review and player discussion](https://games.jayisgames.com/review/jelly-battle.php)
